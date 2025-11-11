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
          />
          <Dropdown
            v-model="selectedBranch"
            :options="branchOptions"
            optionLabel="label"
            placeholder="All Branches"
            class="w-48"
          />
        </div>
      </div>

      <!-- METRICS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <!-- OTHER DETAILS -->
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
            <p class="text-gray-600 text-sm mt-2">{{ metrics.dailyLeaderOrders }} orders today</p>
          </template>
        </Card>
      </div>

      <!-- LINE CHART FOR SALES -->
      <Card class="shadow-md">
        <template #title>Sales Performance</template>
        <template #content>
          <Chart v-if="!loading && chartData" type="line" :data="chartData" :options="chartOptions" class="h-120" />
          <div v-else class="h-120 flex items-center justify-center">
            <p>{{ loading ? 'Loading chart data...' : 'No data available' }}</p>
          </div>
        </template>
      </Card>
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

// Reactive data
const selectedRange = ref({ label: 'Daily', value: 'daily' })
const selectedBranch = ref({ label: 'All Branches', value: 'All Branches' })
const metrics = ref({
    totalSales: 0,
    newOrders: 0,
    monthLeader: '',
    monthLeaderSales: 0,
    dailyLeader: '',
    dailyLeaderOrders: 0,
    lowStockItems: '',
    chartData: []
})
const loading = ref(false)

const timeRanges = [
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
]

// Maybe change this to fetch from DB later?
const branchOptions = [
    { label: 'All Branches', value: 'All Branches' },
    { label: 'Imus', value: 'SneakerHead Imus' },
    { label: 'Makati', value: 'SneakerHead Makati' },
    { label: 'Aseana', value: 'SneakerHead Aseana' }
]

const chartData = ref()
const chartOptions = ref()

// Computed properties
const rangeLabel = computed(() => selectedRange.value?.label || 'TOTAL DAILY')
const formattedTotalSales = computed(() => {
    return `₱${metrics.value.totalSales.toLocaleString()}`
})

// Fetch metrics from DB
async function fetchMetrics() {
    loading.value = true
    try {
        const params = {
            period: selectedRange.value.value,
            branch: selectedBranch.value.value
        }
        
        const response = await fetch(`http://localhost:3000/metrics?${new URLSearchParams(params)}`)
        if (!response.ok) throw new Error('Failed to fetch metrics')
        
        const data = await response.json()
        metrics.value = data
        updateChart()
    } catch (error) {
        console.error('Failed to fetch metrics:', error)
        // Reset metrics on error
        metrics.value = { totalSales: 0, newOrders: 0, chartData: [] }
    } finally {
        loading.value = false
    }
}

// Update Chart with data from DB
function updateChart() {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

    const backendData = metrics.value.chartData || []
    
    // Extract labels for x axis from backend data
    const labels = backendData.map(item => item.period)
    
    // Create datasets for Sales and Orders
    const salesData = backendData.map(item => item.sales)
    const ordersData = backendData.map(item => item.orders)

    // Create chart lines for Sales and Orders
    chartData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Sales',
                data: salesData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-green-500'),
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Orders',
                data: ordersData,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-blue-500'),
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    }

    chartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: { 
                labels: { color: textColor },
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label === 'Sales') {
                            return `Sales: ₱${context.parsed.y.toLocaleString()}`
                        } else if (label === 'Orders') {
                            return `Orders: ${context.parsed.y}`
                        }
                        return label + ': ' + context.parsed.y;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { 
                    color: textColorSecondary,
                    maxTicksLimit: 10
                },
                grid: { color: surfaceBorder },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: { 
                    color: textColorSecondary,
                    callback: function(value) {
                        return '₱' + value.toLocaleString()
                    }
                },
                grid: { color: surfaceBorder },
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
                ticks: { color: textColorSecondary },
                grid: { drawOnChartArea: false },
                title: {
                    display: true,
                    text: 'Number of Orders',
                    color: textColor
                }
            },
        },
    }
}

// Initialize data on mount
onMounted(() => {
    fetchMetrics()
})

// Watchers to refetch data on filter change
watch([selectedRange, selectedBranch], fetchMetrics)
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}

.h-120 {
  height: 30rem;
}
</style>