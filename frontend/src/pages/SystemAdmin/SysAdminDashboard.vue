<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="flex-1 container mx-auto px-6 py-10 space-y-8">
      <!-- TITLE + FILTERS -->
      <div class="flex flex-col md:flex-row justify-between items-center">
        <h1 class="text-2xl font-bold text-charcoal uppercase">Dashboard Overview</h1>

        <div class="flex items-center space-x-3">
          <span class="font-semibold text-charcoal">Filter by:</span>
          <Dropdown
            v-model="selectedRange"
            :options="timeRanges"
            optionLabel="label"
            placeholder="Select Range"
            class="w-48"
            :disabled="loading"
          />
          <Dropdown
            v-model="selectedBranch"
            :options="branchOptions"
            optionLabel="label"
            placeholder="All Branches"
            class="w-48"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
          <p class="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <i class="pi pi-exclamation-triangle text-red-500 text-xl mr-3"></i>
          <div>
            <h3 class="text-red-800 font-semibold">Failed to load dashboard data</h3>
            <p class="text-red-600 mt-1">{{ error }}</p>
            <button 
              @click="fetchMetrics" 
              class="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- METRICS CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card class="shadow-md border-t-4 border-green-500">
            <template #title>Total Sales</template>
            <template #content>
              <div class="text-4xl font-bold text-green-600">{{ formattedTotalSales }}</div>
              <p class="text-green-500 text-sm font-semibold">
                TOTAL {{ rangeLabel.toUpperCase() }}
              </p>
            </template>
          </Card>

          <Card class="shadow-md border-t-4 border-red-500">
            <template #title>Low Stock Items</template>
            <template #content>
              <div class="text-4xl font-bold text-red-600">{{ metrics.lowStockItems }}</div>
              <p class="text-red-500 text-sm font-semibold">URGENT</p>
            </template>
          </Card>

          <Card class="shadow-md border-t-4 border-blue-500">
            <template #title>New Orders</template>
            <template #content>
              <div class="text-4xl font-bold text-blue-600">{{ metrics.newOrders }}</div>
              <p class="text-blue-500 text-sm font-semibold">{{ rangeLabel.toUpperCase() }}</p>
            </template>
          </Card>

          <Card class="shadow-md border-t-4 border-purple-500">
            <template #title>Active Promo Codes</template>
            <template #content>
              <div class="text-4xl font-bold text-purple-600">{{ metrics.currentPromoCodes }}</div>
              <p class="text-purple-500 text-sm font-semibold">CURRENT {{ rangeLabel.toUpperCase() }}</p>
            </template>
          </Card>
        </div>

        <!-- SPACING BETWEEN SECTIONS -->
        <div class="my-8"></div>

        <!-- BRANCH PERFORMANCE CARDS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card class="shadow-md">
            <template #title>Branch with Highest Sales (This Month)</template>
            <template #content>
              <p class="text-2xl font-semibold text-giants-orange">{{ metrics.monthLeader }}</p>
              <p class="text-gray-600 text-sm mt-2">₱{{ metrics.monthLeaderSales }}</p>
            </template>
          </Card>

          <Card class="shadow-md">
            <template #title>Branch with Most Orders (Today)</template>
            <template #content>
              <p class="text-2xl font-semibold text-giants-orange">{{ metrics.dailyLeader}}</p>
              <p class="text-gray-600 text-sm mt-2">{{ metrics.dailyLeaderOrders }}</p>
            </template>
          </Card>
        </div>

        <!-- SPACING BETWEEN SECTIONS -->
        <div class="my-8"></div>

        <!-- CHART SECTION -->
        <Card class="shadow-md">
          <template #title>Sales & Promo Performance</template>
          <template #content>
            <Chart 
              v-if="chartData && chartData.labels && chartData.labels.length > 0" 
              type="line" 
              :data="chartData" 
              :options="chartOptions" 
              class="h-120" 
            />
            <div v-else class="h-120 flex items-center justify-center bg-gray-50 rounded">
              <div class="text-center text-gray-500">
                <i class="pi pi-chart-line text-4xl mb-3"></i>
                <p>No chart data available</p>
                <p class="text-sm mt-1">Try selecting a different time range or branch</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import NavBarSA from '@/components/NavBarSA.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'
import { ref, watch, onMounted, computed } from 'vue'
import SAService from '@/services/SAService'

// Reactive data
const selectedRange = ref({ label: 'Daily', value: 'daily' })
const selectedBranch = ref({ label: 'All Branches', value: 'All Branches' })
const metrics = ref({
    totalSales: 0,
    newOrders: 0,
    currentPromoCodes: 0,
    monthLeader: '',
    monthLeaderSales: '',
    dailyLeader: '',
    dailyLeaderOrders: '',
    lowStockItems: '',
    chartData: []
})
const loading = ref(false)
const error = ref(null)

const timeRanges = [
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
]

const branchOptions = [
    { label: 'All Branches', value: 'All Branches' },
    { label: 'Imus', value: 'SneakerHead Imus' },
    { label: 'Makati', value: 'SneakerHead Makati' },
    { label: 'Aseana', value: 'SneakerHead Aseana' }
]

const chartData = ref(null)
const chartOptions = ref(null)

// Computed properties
const rangeLabel = computed(() => selectedRange.value?.label || 'TOTAL DAILY')
const formattedTotalSales = computed(() => {
    const sales = metrics.value.totalSales || 0;
    return `₱${sales.toLocaleString()}`
})

// Fetch metrics from DB
async function fetchMetrics() {
    loading.value = true;
    error.value = null;
    
    try {
        const period = selectedRange.value.value;
        const branch = selectedBranch.value.value;
        
        const response = await SAService.getMetrics(period, branch);
        
        if (!response.data) {
            throw new Error('No data received from server');
        }
        
        const data = response.data;
        
        // Validate and set metrics with proper data types
        metrics.value = {
            totalSales: Number(data.totalSales) || 0,
            newOrders: Number(data.newOrders) || 0,
            currentPromoCodes: Number(data.currentPromoCodes) || 0,
            monthLeader: String(data.monthLeader || 'N/A'),
            monthLeaderSales: String(data.monthLeaderSales || '0'),
            dailyLeader: String(data.dailyLeader || 'N/A'),
            dailyLeaderOrders: String(data.dailyLeaderOrders || '0'),
            lowStockItems: String(data.lowStockItems || '0'),
            chartData: Array.isArray(data.chartData) ? data.chartData : []
        };
        
        updateChart();
        
    } catch (err) {
        error.value = err.message || 'Failed to load dashboard data';
        // Reset to safe defaults
        metrics.value = { 
            totalSales: 0, 
            newOrders: 0, 
            currentPromoCodes: 0,
            monthLeader: 'N/A',
            monthLeaderSales: '0',
            dailyLeader: 'N/A', 
            dailyLeaderOrders: '0',
            lowStockItems: '0',
            chartData: [] 
        };
        chartData.value = null;
    } finally {
        loading.value = false;
    }
}

// Update Chart with data from DB
function updateChart() {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

    const backendData = metrics.value.chartData || []
    
    if (backendData.length === 0) {
        chartData.value = null;
        return;
    }
    
    // Extract labels for x axis from backend data
    const labels = backendData.map(item => item.period || 'Unknown')
    
    // Create datasets - include promo metrics
    const salesData = backendData.map(item => Number(item.sales) || 0);
    const ordersData = backendData.map(item => Number(item.orders) || 0);
    const promoOrdersData = backendData.map(item => Number(item.promo_orders) || 0);
    const promoRateData = backendData.map(item => Number(item.promo_rate) || 0);
    const activePromoCodesData = backendData.map(item => Number(item.active_promo_codes) || 0);

    // Create chart data structure with promo metrics
    chartData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Sales (₱)',
                data: salesData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-green-500') || '#22c55e',
                backgroundColor: documentStyle.getPropertyValue('--p-green-500') || '#22c55e',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Total Orders',
                data: ordersData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-blue-500') || '#3b82f6',
                backgroundColor: documentStyle.getPropertyValue('--p-blue-500') || '#3b82f6',
                tension: 0.4,
                yAxisID: 'y1'
            },
            {
                label: 'Promo Orders',
                data: promoOrdersData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-orange-500') || '#f97316',
                backgroundColor: documentStyle.getPropertyValue('--p-orange-500') || '#f97316',
                borderDash: [5, 5],
                tension: 0.4,
                yAxisID: 'y1'
            },
            {
                label: 'Promo Usage Rate (%)',
                data: promoRateData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                backgroundColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
                tension: 0.4,
                yAxisID: 'y2'
            },
            {
                label: 'Active Promo Codes',
                data: activePromoCodesData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-pink-500') || '#ec4899',
                backgroundColor: documentStyle.getPropertyValue('--p-pink-500') || '#ec4899',
                borderDash: [2, 2],
                tension: 0.4,
                yAxisID: 'y3'
            }
        ]
    }

    chartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        responsive: true,
        plugins: {
            legend: { 
                labels: { color: textColor },
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
                        if (label.includes('Sales')) {
                            return `Sales: ₱${value.toLocaleString()}`;
                        } else if (label.includes('Orders')) {
                            return `Orders: ${value}`;
                        } else if (label.includes('Promo Usage Rate')) {
                            return `Promo Rate: ${value.toFixed(1)}%`;
                        } else if (label.includes('Active Promo Codes')) {
                            return `Active Promos: ${value}`;
                        }
                        return label + ': ' + value;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        scales: {
            x: {
                ticks: { 
                    color: textColorSecondary,
                    maxTicksLimit: 12
                },
                grid: { 
                    color: surfaceBorder,
                    drawBorder: true
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: { 
                    color: textColorSecondary,
                    callback: function(value) {
                        return '₱' + value.toLocaleString();
                    }
                },
                grid: { 
                    color: surfaceBorder,
                    drawBorder: true
                },
                title: {
                    display: true,
                    text: 'Sales (₱)',
                    color: textColor
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: { 
                    color: textColorSecondary 
                },
                grid: { 
                    drawOnChartArea: false,
                    drawBorder: true
                },
                title: {
                    display: true,
                    text: 'Number of Orders',
                    color: textColor
                }
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: { 
                    color: textColorSecondary,
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: { 
                    drawOnChartArea: false,
                    drawBorder: true
                },
                title: {
                    display: true,
                    text: 'Promo Usage Rate (%)',
                    color: textColor
                },
                offset: true
            },
            y3: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: { 
                    color: textColorSecondary 
                },
                grid: { 
                    drawOnChartArea: false,
                    drawBorder: true
                },
                title: {
                    display: true,
                    text: 'Active Promo Codes',
                    color: textColor
                },
                offset: true
            }
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 6
            }
        }
    }
}

// Initialize data on mount
onMounted(() => {
    fetchMetrics()
})

// Watchers to refetch data on filter change
watch([selectedRange, selectedBranch], () => {
    if (!loading.value) {
        fetchMetrics()
    }
}, { deep: true })
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}

.h-120 {
  height: 30rem;
}
</style>