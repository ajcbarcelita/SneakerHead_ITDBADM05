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
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Uses different created views based on period
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

        // Query for CURRENT (today/this month/this year) period metrics
        let currentPeriodQuery = knex(viewName);

        // Apply current period filter FIRST
        switch (period) {
            case 'daily':
                currentPeriodQuery = currentPeriodQuery.where('sale_date', knex.raw('CURRENT_DATE'));
                break;
            case 'monthly':
                currentPeriodQuery = currentPeriodQuery.where({
                    year: currentYear,
                    month: currentMonth
                });
                break;
            case 'yearly':
                currentPeriodQuery = currentPeriodQuery.where('year', currentYear);
                break;
        }

        // Apply branch filter if not default all is selected
        if (branch !== 'All Branches') {
            currentPeriodQuery = currentPeriodQuery.where('branch_name', branch);
        }

        let totalSales, newOrders;

        // FIXED: Consistent approach for both branch scenarios
        if (branch === 'All Branches') {
            // Sum across all branches - get all records and sum manually
            const allResults = await currentPeriodQuery;
            totalSales = allResults.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0);
            newOrders = allResults.reduce((sum, row) => sum + parseInt(row.order_count || 0), 0);
        } else {
            // For specific branch - use database aggregation
            const result = await currentPeriodQuery
                .select([
                    knex.raw('COALESCE(SUM(total_sales), 0) as total_sales'),
                    knex.raw('COALESCE(SUM(order_count), 0) as order_count')
                ])
                .first();
            
            totalSales = parseFloat(result.total_sales) || 0;
            newOrders = parseInt(result.order_count) || 0;
        }

        // Query for chart data over the SELECTED period
        let chartData;

        switch (period) {
            case 'daily':
            // Generate last 7 days even if there are no sales
            const allDays = [];
            const today = new Date();
            
            // Generate last 7 days (from 6 days ago to today)
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const dateString = date.toISOString().split('T')[0];
                allDays.push({ 
                    date: dateString, 
                    label: formatDate(dateString),
                    year, month, day 
                });
            }
            // No need to reverse - already in chronological order

            // Get actual sales data for these days
            let dailyQuery = knex(viewName);
            if (branch !== 'All Branches') {
                dailyQuery = dailyQuery.where('branch_name', branch);
            }
            
            dailyQuery = dailyQuery.where('sale_date', '>=', knex.raw('CURRENT_DATE - INTERVAL 6 DAY'))
                                .where('sale_date', '<=', knex.raw('CURRENT_DATE'));
            
            const dailySalesData = await dailyQuery.orderBy('sale_date', 'asc');
            
            // Combine all days with sales data (fill missing days with zeros)
            chartData = allDays.map(day => {
                const salesRecord = dailySalesData.find(item => {
                    const itemDate = new Date(item.sale_date).toISOString().split('T')[0];
                    return itemDate === day.date;
                });
                
                return {
                    sale_date: day.date,
                    branch_name: branch === 'All Branches' ? 'All Branches' : branch,
                    total_sales: salesRecord ? parseFloat(salesRecord.total_sales) : 0,
                    order_count: salesRecord ? parseInt(salesRecord.order_count) : 0,
                    period_label: day.label
                };
            });
            break;
                
            case 'monthly':
                // Generate past 12 months even if there are no sales
                const allMonths = [];
                const current = new Date();
                const baseDate = new Date(current.getFullYear(), current.getMonth() - 1, 1); // Start from last month
                
                // Last month to 11 months ago (e.g. Oct 2025 to Nov 2024)
                // For loop that adds the last 12 months
                for (let i = 0; i < 12; i++) {
                    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    allMonths.push({ year, month, label: `${getMonthName(month)} ${year}` });
                }

                // Put in chronological order for proper chart display
                allMonths.reverse();
                
                // Get actual sales data
                const monthlyConditions = allMonths.map(m => ({ year: m.year, month: m.month }));
                
                // Query sales from the computed last 12 months
                let salesQuery = knex(viewName);
                if (branch !== 'All Branches') {
                    salesQuery = salesQuery.where('branch_name', branch);
                }
                
                // Build OR conditions for year/month combinations
                salesQuery = salesQuery.where(builder => {
                    monthlyConditions.forEach(condition => {
                        builder.orWhere(builder => {
                            builder.where('year', condition.year)
                                .andWhere('month', condition.month);
                        });
                    });
                });
                
                const salesData = await salesQuery;
                
                // Combine all months with sales data (fill missing months with zeros)
                chartData = allMonths.map(month => {
                    const salesRecord = salesData.find(item => 
                        item.year === month.year && item.month === month.month
                    );
                    
                    return {
                        year: month.year,
                        month: month.month,
                        branch_name: branch === 'All Branches' ? 'All Branches' : branch,
                        total_sales: salesRecord ? parseFloat(salesRecord.total_sales) : 0,
                        order_count: salesRecord ? parseInt(salesRecord.order_count) : 0,
                        // For the label
                        period_label: month.label
                    };
                });
                break;
                
            case 'yearly':
                // Last 5 years including current year
                let yearlyQuery = knex(viewName);
                if (branch !== 'All Branches') {
                    yearlyQuery = yearlyQuery.where('branch_name', branch);
                }
                
                // Generate all 5 years (including empty years)
                const allYears = [];
                for (let i = 0; i < 5; i++) {
                    const year = currentYear - i;
                    allYears.push(year);
                }
                // Put in chronological order
                allYears.reverse();
                
                // Get actual sales data for these years
                yearlyQuery = yearlyQuery.whereIn('year', allYears);
                const yearlySalesData = await yearlyQuery.orderBy('year', 'asc');
                
                // Combine all years with sales data (fill missing years with zeros)
                chartData = allYears.map(year => {
                    const salesRecord = yearlySalesData.find(item => item.year === year);
                    
                    return {
                        year: year,
                        branch_name: branch === 'All Branches' ? 'All Branches' : branch,
                        total_sales: salesRecord ? parseFloat(salesRecord.total_sales) : 0,
                        order_count: salesRecord ? parseInt(salesRecord.order_count) : 0,
                        period_label: year.toString()
                    };
                });
                break;
        }

        // FIXED: Return the correct values (no more .totalSales or .newOrdersCount properties)
        return res.status(200).json({ 
            totalSales: totalSales,
            newOrders: newOrders,
            chartData: formatChartData(chartData, period, branch),
            period: period,
            branch: branch
        });

    } catch (error) {
        return res.status(500).json({ error: `Failed to fetch metrics: ${error.message}` });
    }
}

// ... rest of your helper functions remain the same ...
function formatChartData(data, period, branch) {
    if (branch === 'All Branches') {
        // Format for multiple branches
        return formatMultiBranchChartData(data, period);
    } else {
        // Format for single branch
        return formatSingleBranchChartData(data, period);
    }
}

function formatSingleBranchChartData(data, period) {
    const labels = [];
    const salesData = [];
    const ordersData = [];

    data.forEach(item => {
        let label;
        // For yearly data, use the year directly
        if (period === 'yearly') {
            label = item.year ? item.year.toString() : 'Invalid Year';
        } else {
            label = item.period_label;
        }
        labels.push(label);

        // Convert to number types + handle nulls
        salesData.push(parseFloat(item.total_sales) || 0);
        ordersData.push(parseInt(item.order_count) || 0);
    });

    return { 
        labels, 
        datasets: [
            {
                label: 'Sales (₱)',
                data: salesData,
                type: 'line',
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Number of Orders',
                data: ordersData,
                type: 'bar',
                backgroundColor: '#10B981',
                yAxisID: 'y1'
            }
        ]
    };
}

function formatMultiBranchChartData(data, period) {
    // Group data by branch
    const branches = {};
    const allLabels = [];

    // Used for chart's x-axis labeling 
    data.forEach(item => {
        let label;
        if (item.period_label) {
            label = item.period_label;
        } else {
            // Just in case fallback
            switch (period) {
                case 'daily':
                    label = item.sale_date ? formatDate(item.sale_date) : 'Invalid Date';
                    break;
                case 'monthly':
                    label = (item.month && item.year) ? `${getMonthName(item.month)} ${item.year}` : 'Invalid Date';
                    break;
                case 'yearly':
                    label = item.year ? item.year.toString() : 'Invalid Year';
                    break;
            }
        }
        
        if (!allLabels.includes(label)) {
            allLabels.push(label);
        }
        
        if (!branches[item.branch_name]) {
            branches[item.branch_name] = {
                sales: {}, // Will store sales by label (date/month/year)
                orders: {} // Will store orders by label
            };
        }
        
        // Conver to number types + handle nulls
        branches[item.branch_name].sales[label] = parseFloat(item.total_sales) || 0;
        branches[item.branch_name].orders[label] = parseInt(item.order_count) || 0;
    });
    
    const datasets = [];

    // Create sales datasets for each branch
    Object.keys(branches).forEach((branchName, index) => {
        const salesData = allLabels.map(label => branches[branchName].sales[label] || 0);
        
        datasets.push({
            label: `${branchName} - Sales`,
            data: salesData,
            borderColor: getChartColor(index),
            backgroundColor: getChartColor(index),
            type: 'line',
            tension: 0.4,
            fill: false
        });
    });

    return { labels: allLabels, datasets };
}

// Helper functions
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
        return 'Invalid Date';
    }
}

function getMonthName(month) {
    try {
        const monthNum = parseInt(month);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return 'Invalid';
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthNum - 1];
    } catch (error) {
        return 'Invalid';
    }
}

function getChartColor(index) {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
}