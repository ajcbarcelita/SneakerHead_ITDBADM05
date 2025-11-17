import Order from "../models/Order.js";

export const metrics = async (req, res) => {
  try {
    const knex = Order.knex();
    const { period = "daily", branch = "All Branches" } = req.query;

    let salesData = await directQuery(period, branch, knex);

    // Generate date ranges based on the actual data period
    let dateRanges = [];
    // Get current date
    const currentDate = new Date();

    switch (period) {
      case "daily":
        // For daily, use the last 7 days including today
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const label = formatDailyLabel(date, currentDate);
          dateRanges.push({ date: dateStr, label });
        }
        break;

      case "monthly":
        // For monthly, generate last 12 months based on current date
        for (let i = 11; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const periodKey = `${year}-${String(month).padStart(2, "0")}`;
          const label = formatMonthlyLabel(date);
          dateRanges.push({ year, month, periodKey, label });
        }
        break;

      case "yearly":
        // For yearly, generate last 5 years based on current date
        for (let i = 4; i >= 0; i--) {
          const year = currentDate.getFullYear() - i;
          const label = year.toString();
          dateRanges.push({ year, label });
        }
        break;
    }

    // Map fetched sales data
    const dataMap = new Map();
    
    salesData.forEach((item) => {
      if (!item) return;

      try {
        let key;
        let dataItem = {};

        switch (period) {
          case "daily":
            if (item.sale_date) {
              const dbDate = new Date(item.sale_date);
              key = dbDate.toISOString().split("T")[0];
              
              dataItem = {
                sales: parseFloat(item.total_sales || 0),
                orders: parseInt(item.order_count || 0),
                promo_orders: parseInt(item.orders_with_promo || 0),
                promo_rate: parseFloat(item.promo_usage_rate || 0),
                active_promo_codes: parseInt(item.active_promo_codes || 0),
                branch: item.branch_name || 'All Branches',
              };
            }
            break;

          case "monthly":
            if (item.year && item.month) {
              key = `${item.year}-${String(item.month).padStart(2, "0")}`;
              dataItem = {
                sales: parseFloat(item.total_sales || 0),
                orders: parseInt(item.order_count || 0),
                promo_orders: parseInt(item.orders_with_promo || 0),
                promo_rate: parseFloat(item.promo_usage_rate || 0),
                active_promo_codes: parseInt(item.active_promo_codes || 0),
                branch: item.branch_name || 'All Branches',
              };
            }
            break;

          case "yearly":
            if (item.year) {
              key = item.year.toString();
              dataItem = {
                sales: parseFloat(item.total_sales || 0),
                orders: parseInt(item.order_count || 0),
                promo_orders: parseInt(item.orders_with_promo || 0),
                promo_rate: parseFloat(item.promo_usage_rate || 0),
                active_promo_codes: parseInt(item.active_promo_codes || 0),
                branch: item.branch_name || 'All Branches',
              };
            }
            break;
        }

        if (key) {
          dataMap.set(key, dataItem);
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // Fill chart data with zeros for missing periods
    const filledChartData = dateRanges.map((range) => {
      let key, data;

      switch (period) {
        case "daily":
          key = range.date;
          data = dataMap.get(key) || { sales: 0, orders: 0, promo_orders: 0, promo_rate: 0, active_promo_codes: 0, branch };
          return { period: range.label, ...data };

        case "monthly":
          key = range.periodKey;
          data = dataMap.get(key) || { sales: 0, orders: 0, promo_orders: 0, promo_rate: 0, active_promo_codes: 0, branch };
          return { period: range.label, ...data };

        case "yearly":
          key = range.label;
          data = dataMap.get(key) || { sales: 0, orders: 0, promo_orders: 0, promo_rate: 0, active_promo_codes: 0, branch };
          return { period: range.label, ...data };

        default:
          return { period: range.label, sales: 0, orders: 0, promo_orders: 0, promo_rate: 0, active_promo_codes: 0, branch };
      }
    });

    // Calculate metrics for CURRENT PERIOD only
    let totalSales = 0;
    let newOrders = 0;
    let currentPromoCodes = 0;

    if (filledChartData.length > 0) {
      const currentPeriodData = filledChartData[filledChartData.length - 1];
      totalSales = currentPeriodData.sales || 0;
      newOrders = currentPeriodData.orders || 0;
      currentPromoCodes = currentPeriodData.active_promo_codes || 0;
    }

    // Get leaders - use current date for consistency
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDateStr = currentDate.toISOString().split("T")[0];

    let monthLeader, dailyLeader;
    try {
      if (branch === "All Branches") {
        monthLeader = await knex("branch_monthly_sales_view")
          .select("branch_name", "total_sales")
          .where("year", currentYear)
          .andWhere("month", currentMonth)
          .orderBy("total_sales", "desc")
          .first();
          
        dailyLeader = await knex("branch_daily_sales_view")
          .select("branch_name", "order_count")
          .where("sale_date", currentDateStr)
          .orderBy("order_count", "desc")
          .first();
      } else {
        monthLeader = await knex("branch_monthly_sales_view")
          .select("branch_name", "total_sales")
          .where("branch_name", branch)
          .andWhere("year", currentYear)
          .andWhere("month", currentMonth)
          .first();
          
        dailyLeader = await knex("branch_daily_sales_view")
          .select("branch_name", "order_count")
          .where("branch_name", branch)
          .andWhere("sale_date", currentDateStr)
          .first();
      }
    } catch (error) {
      // Silent error handling
    }

    // Low stock
    let lowStockItems = "0";
    try {
      const lowStockResult = await knex("count_low_stock").select("low_stock").first();
      lowStockItems = String(lowStockResult?.low_stock || "0");
    } catch (error) {
      // Silent error handling
    }

    const response = {
      totalSales,
      newOrders,
      currentPromoCodes,
      monthLeader: monthLeader?.branch_name || "No sales yet this month",
      monthLeaderSales: monthLeader?.total_sales ? parseFloat(monthLeader.total_sales).toLocaleString("en-US") : "No sales yet this month",
      dailyLeader: dailyLeader?.branch_name || "No orders yet today",
      dailyLeaderOrders: dailyLeader?.order_count ? dailyLeader.order_count.toString() : "No orders yet today",
      lowStockItems,
      chartData: filledChartData,
      period,
      branch,
    };
    return res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

// Direct query function to handle different views
async function directQuery(period, branch, knex) {
  try {
    let query;
    
    if (branch === "All Branches") {
      switch (period) {
        case "daily":
          query = knex("orders_per_day").select("*").orderBy("sale_date", "asc");
          break;
        case "monthly":
          query = knex("orders_per_month").select("*").orderBy("year", "asc").orderBy("month", "asc");
          break;
        case "yearly":
          query = knex("orders_per_year").select("*").orderBy("year", "asc");
          break;
      }
    } else {
      switch (period) {
        case "daily":
          query = knex("branch_daily_sales_view")
            .select("*")
            .where("branch_name", branch)
            .orderBy("sale_date", "asc");
          break;
        case "monthly":
          query = knex("branch_monthly_sales_view")
            .select("*")
            .where("branch_name", branch)
            .orderBy("year", "asc")
            .orderBy("month", "asc");
          break;
        case "yearly":
          query = knex("branch_yearly_sales_view")
            .select("*")
            .where("branch_name", branch)
            .orderBy("year", "asc");
          break;
      }
    }
    
    const result = await query;
    return result;
  } catch (error) {
    return [];
  }
}

// Helper functions for formatting for frontend chart
function formatDailyLabel(date, currentDate) {
  // Reset time components to compare dates only
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    return "Today";
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return targetDate.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  }
}

function formatMonthlyLabel(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}