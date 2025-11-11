import Model from 'objection';
import Order from '../models/Order.js';

export const metrics = async (req, res) => {
    try {
        const knex = Order.knex();
        
        // Fetch query params
        const { 
            period = 'daily', 
            branch = 'all' 
        } = req.query;

        let viewName;

        // Determine view name based on branch and period
        if (branch !== 'All Branches') {
            // Use these views for "All Branches"
            switch (period) {
                case 'monthly':
                    viewName = 'branch_monthly_sales_view';
                    break;
                case 'yearly':
                    viewName = 'branch_yearly_sales_view';
                    break;
                default:
                    viewName = 'branch_daily_sales_view';
            }
        } else {
            // Use these views for specific branches
            switch (period) {
                case 'monthly':
                    viewName = 'monthly_sales_view';
                    break;
                case 'yearly':
                    viewName = 'yearly_sales_view';
                    break;
                default:
                    viewName = 'daily_sales_view';
            }
        }

        // Query for metrics
        let query = knex(viewName);

        // Get specific branch data
        if (branch !== 'All Branches') {
            query = query.where('branch_name', branch);
        }

        // Execute the query based on period
        let chartData; 
        switch (period) {
            case 'monthly':
                chartData = await query.select('*')
                    .orderBy('year', 'desc')
                    .orderBy('month', 'desc');
                break;
            case 'yearly':
                chartData = await query.select('*')
                    .orderBy('year', 'desc');
                break;
            default: // daily
                chartData = await query.select('*')
                    .orderBy('sale_date', 'desc');
        }

        // Generate date ranges and fill missing data
        const currentDate = new Date();
        let dateRanges = [];
        let labels = [];

        switch (period) {
            case 'daily':
                // Last 7 days including today
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const label = formatDailyLabel(date);
                    dateRanges.push({ date: dateStr, label });
                    labels.push(label);
                }
                break;
            
            case 'monthly':
                // Last 12 months including current month
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const periodKey = `${year}-${String(month).padStart(2, '0')}`;
                    const label = formatMonthlyLabel(date);
                    dateRanges.push({ year, month, periodKey, label });
                    labels.push(label);
                }
                break;
            
            case 'yearly':
                // Last 5 years including current year
                for (let i = 4; i >= 0; i--) {
                    const year = currentDate.getFullYear() - i;
                    const label = year.toString();
                    dateRanges.push({ year, label });
                    labels.push(label);
                }
                break;
        }

        // Map fetched data
        const dataMap = new Map();
        chartData.forEach(item => {
            let key;
            switch (period) {
                case 'daily':
                    const itemDate = new Date(item.sale_date);
                    key = itemDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                    break;
                case 'monthly':
                    key = `${item.year}-${String(item.month).padStart(2, '0')}`;
                    break;
                case 'yearly':
                    key = item.year.toString();
                    break;
            }
            dataMap.set(key, {
                sales: parseFloat(item.total_sales || 0),
                orders: parseInt(item.order_count || 0),
                branch: item.branch_name || item.branch_id
            });
        });

        // Fill the chart data with zeros for missing periods
        const filledChartData = dateRanges.map(range => {
            let key, data;
            
            switch (period) {
                case 'daily':
                    key = range.date;
                    data = dataMap.get(key) || { sales: 0, orders: 0 };
                    return {
                        period: range.label,
                        sales: data.sales,
                        orders: data.orders,
                        branch: data.branch
                    };
                
                case 'monthly':
                    key = range.periodKey;
                    data = dataMap.get(key) || { sales: 0, orders: 0 };
                    return {
                        period: range.label,
                        sales: data.sales,
                        orders: data.orders,
                        branch: data.branch
                    };
                
                case 'yearly':
                    key = range.label;
                    data = dataMap.get(key) || { sales: 0, orders: 0 };
                    return {
                        period: range.label,
                        sales: data.sales,
                        orders: data.orders,
                        branch: data.branch
                    };
            }
        });

        let totalSales = 0;
        let newOrders = 0;

        // Today's current data
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDateStr = currentDate.toISOString().split('T')[0];

        switch (period) {
            case 'daily':
                // Find today's data by matching the actual date
                const todayData = filledChartData.find(item => {
                    // Find the item that corresponds to the current date
                    const rangeItem = dateRanges.find(range => range.label === item.period);
                    return rangeItem && rangeItem.date === currentDateStr;
                });
                totalSales = todayData ? todayData.sales : 0;
                newOrders = todayData ? todayData.orders : 0;
                break;
            
            case 'monthly':
                // Find current month's data
                const currentMonthLabel = formatMonthlyLabel(currentDate);
                const currentMonthData = filledChartData.find(item => 
                    item.period === currentMonthLabel
                );
                totalSales = currentMonthData ? currentMonthData.sales : 0;
                newOrders = currentMonthData ? currentMonthData.orders : 0;
                break;
            
            case 'yearly':
                // Find current year's data
                const currentYearLabel = currentYear.toString();
                const currentYearData = filledChartData.find(item => 
                    item.period === currentYearLabel
                );
                totalSales = currentYearData ? currentYearData.sales : 0;
                newOrders = currentYearData ? currentYearData.orders : 0;
                break;
        }

        // Get data for branch with highest sales this month
        // First row means latest month and year + highest total_sales
        let monthLeader = await knex('branch_monthly_sales_view')
                .select('branch_name', 'total_sales')
                .first();

        // Convert to string and formatted number
        // Add default values if no sales yet
        let monthLeaderBranch = String(monthLeader?.branch_name ?? 'No sales yet this month');
        let monthLeaderSales = monthLeader?.total_sales 
            ? parseFloat(monthLeader.total_sales).toLocaleString('en-US')
            : 'No sales yet this month';

        // Get data for branch w/ highest orders today
        // View is already ordered by order_count desc and date
        let dailyLeader = await knex('branch_daily_sales_view')
                .select('branch_name', 'order_count')
                .first();
        let dailyLeaderBranch = String(dailyLeader?.branch_name ?? 'No orders yet today');
        let dailyLeaderOrders = dailyLeader?.order_count 
            ? dailyLeader.order_count 
            : 'No orders yet today';

        // Low stock warning
        // Only returns 1 row with low_stock count of all branches
        let lowStockItems = await knex('count_low_stock')
                .select('low_stock')
                .first();
        lowStockItems = String(lowStockItems?.low_stock ?? '0');

        // Helper functions for formatting labels
        function formatDailyLabel(date) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        }

        function formatMonthlyLabel(date) {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
            });
        }

        return res.status(200).json({ 
            totalSales: totalSales,
            newOrders: newOrders,
            monthLeader: monthLeaderBranch,
            monthLeaderSales: monthLeaderSales,
            dailyLeader: dailyLeaderBranch,
            dailyLeaderOrders: dailyLeaderOrders,
            lowStockItems: lowStockItems,
            chartData: filledChartData,
            period: period,
            branch: branch
        });

    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}