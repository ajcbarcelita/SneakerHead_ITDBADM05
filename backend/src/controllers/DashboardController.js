import Order from "../models/Order.js";

export const metrics = async (req, res) => {
  try {
    const knex = Order.knex();
    const { period = "daily", branch = "All Branches" } = req.query;

    // Manila time
    const time = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

    // Determine view based on period
    const viewName =
      period === "monthly"
        ? "orders_per_month"
        : period === "yearly"
        ? "orders_per_year"
        : "orders_per_day";

    // Build base query
    let query = knex(viewName);

    // Branch filter for branch-specific views
    if (branch !== "All Branches") {
      const branchViewName =
        period === "monthly"
          ? "branch_monthly_sales_view"
          : period === "yearly"
          ? "branch_yearly_sales_view"
          : "branch_daily_sales_view";
      
      query = knex(branchViewName).where("branch_name", branch);
    }

    // DB Rows
    let chartRows = await query.select("*");

    // Sort depending on view 
    if (period === "daily") chartRows.sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));
    if (period === "monthly") chartRows.sort((a, b) => a.year - b.year || a.month - b.month);
    if (period === "yearly") chartRows.sort((a, b) => a.year - b.year);

    // Date Ranges (Manila time)
    const ranges = [];
    
    if (period === "daily") {
      // 7-day range
      for (let i = 6; i >= 0; i--) {
        const d = new Date(time);
        d.setDate(time.getDate() - i);

        const dateKey = d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

        ranges.push({
          key: dateKey,
          label: formatDailyLabel(d),
        });
      }
    }
    if (period === "monthly") {
      // 12-month range
      for (let i = 11; i >= 0; i--) {
        const d = new Date(time.getFullYear(), time.getMonth() - i, 1);

        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;

        ranges.push({
          key,
          year,
          month,
          label: formatMonthlyLabel(d),
        });
      }
    }
    if (period === "yearly") {
      // 5-year range
      for (let i = 4; i >= 0; i--) {
        const year = time.getFullYear() - i;
        ranges.push({
          key: year.toString(),
          year,
          label: year.toString(),
        });
      }
    }

    // Map fetched data
    const dataMap = new Map();
    
    for (const row of chartRows) {
      try {
        let key;
        let dataItem = {};

        if (period === "daily" && row.sale_date) {
          key = new Date(row.sale_date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Manila",
          });
          
          dataItem = {
            sales: parseFloat(row.total_sales || 0),
            orders: parseInt(row.order_count || 0),
            promo_orders: parseInt(row.orders_with_promo || 0),
            promo_rate: parseFloat(row.promo_usage_rate || 0),
            active_promo_codes: parseInt(row.active_promo_codes || 0),
            branch: row.branch_name || 'All Branches',
          };
        }
        else if (period === "monthly" && row.year && row.month) {
          key = `${row.year}-${String(row.month).padStart(2, "0")}`;
          dataItem = {
            sales: parseFloat(row.total_sales || 0),
            orders: parseInt(row.order_count || 0),
            promo_orders: parseInt(row.orders_with_promo || 0),
            promo_rate: parseFloat(row.promo_usage_rate || 0),
            active_promo_codes: parseInt(row.active_promo_codes || 0),
            branch: row.branch_name || 'All Branches',
          };
        }
        else if (period === "yearly" && row.year) {
          key = row.year.toString();
          dataItem = {
            sales: parseFloat(row.total_sales || 0),
            orders: parseInt(row.order_count || 0),
            promo_orders: parseInt(row.orders_with_promo || 0),
            promo_rate: parseFloat(row.promo_usage_rate || 0),
            active_promo_codes: parseInt(row.active_promo_codes || 0),
            branch: row.branch_name || 'All Branches',
          };
        }

        if (key) {
          dataMap.set(key, dataItem);
        }
      } catch (error) {
        // Silent error handling
      }
    }

    // Fill chart data with zeros for missing periods
    const filledChartData = ranges.map(range => {
      const data = dataMap.get(range.key) || { 
        sales: 0, 
        orders: 0, 
        promo_orders: 0, 
        promo_rate: 0, 
        active_promo_codes: 0, 
        branch 
      };
      
      return {
        period: range.label,
        ...data
      };
    });

    // Calculate current period metrics (Manila time)
    let totalSales = 0;
    let newOrders = 0;
    let currentPromoCodes = 0;

    if (period === "daily") {
      const todayKey = time.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
      const todayData = dataMap.get(todayKey);
      if (todayData) {
        totalSales = todayData.sales;
        newOrders = todayData.orders;
        currentPromoCodes = todayData.active_promo_codes;
      }
    }
    if (period === "monthly") {
      const key = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}`;
      const monthData = dataMap.get(key);
      if (monthData) {
        totalSales = monthData.sales;
        newOrders = monthData.orders;
        currentPromoCodes = monthData.active_promo_codes;
      }
    }
    if (period === "yearly") {
      const key = time.getFullYear().toString();
      const yearData = dataMap.get(key);
      if (yearData) {
        totalSales = yearData.sales;
        newOrders = yearData.orders;
        currentPromoCodes = yearData.active_promo_codes;
      }
    }

    // Get leaders data
    let monthLeader = {};
    let dailyLeader = {};

    try {
      // Get Top Customer for the period
      const [tc] = await knex.raw("CALL get_top_customer(?, ?)", [period, branch]);
      monthLeader = tc?.[0]?.[0] || null;

      // Get Top Product for the period  
      const [tp] = await knex.raw("CALL get_top_product(?, ?)", [period, branch]);
      dailyLeader = tp?.[0]?.[0] || null;
    } catch (error) {
      // Silent error handling for stored procedures
    }

    // Low stock items
    let lowStockItems = 0;
    try {
      const [ls] = await knex.raw("CALL get_low_stock_branch(?)", [branch]);
      lowStockItems = ls?.[0]?.[0]?.low_stock || 0;
    } catch (error) {
      // Silent error handling
    }

    const response = {
      totalSales,
      newOrders,
      currentPromoCodes,
      lowStockItems,
      chartData: filledChartData,
      period,
      branch,
      topCustomer: monthLeader,
      topProduct: dailyLeader
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    res.status(500).json({ 
      error: "Failed to retrieve metrics",
      message: error.message 
    });
  }
};

// Use the same formatting functions as BM controller
function formatDailyLabel(date) {
  const today = new Date();
  const manilaDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const target = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));

  const diff = target.toDateString() === manilaDate.toDateString()
    ? "Today"
    : new Date(manilaDate.setDate(manilaDate.getDate() - 1)).toDateString() === target.toDateString()
      ? "Yesterday"
      : target.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return diff;
}

function formatMonthlyLabel(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}