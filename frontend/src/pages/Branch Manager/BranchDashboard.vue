<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarBM />
    </header>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="flex-1 container mx-auto px-6 py-6 space-y-8">
      <!-- FILTERS -->
      <div class="flex flex-col md:flex-row justify-between items-center">
        <h1 class="text-2xl font-bold text-charcoal uppercase">Dashboard Overview - {{ branchName }}</h1>

        <div class="flex items-center space-x-3">
          <span class="font-semibold text-charcoal">Filter by:</span>
          <Dropdown v-model="selectedRange" :options="timeRanges" optionLabel="label" placeholder="Select Range"
            class="w-48" />
        </div>
      </div>

      <!-- METRICS -->
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
          <template #title>Promo Orders</template>
          <template #content>
            <div class="text-4xl font-bold text-purple-600">{{ currentPromoOrders }}</div>
            <p class="text-purple-500 text-sm font-semibold">{{ rangeLabel.toUpperCase() }}</p>
          </template>
        </Card>
      </div>

      <!-- OTHER DETAILS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="shadow-md">
          <template #title>Highest-Selling Product ({{ rangeLabel }})</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">{{ metrics.topProduct?.product_name || 'N/A' }}</p>
            <p class="text-gray-600 text-sm mt-2">{{ (metrics.topProduct?.total_sold || 0).toLocaleString() }} total sales
            </p>
          </template>
        </Card>

        <Card class="shadow-md">
          <template #title>Top Customer ({{ rangeLabel }})</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">{{ metrics.topCustomer?.full_name  || 'N/A' }}</p>
            <p class="text-gray-600 text-sm mt-2">{{ formattedTopCust }} spent</p>
          </template>
        </Card>
      </div>

      <!-- LINE CHART FOR SALES, ORDERS, AND PROMO ORDERS -->
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
import NavBarBM from '@/components/NavBarBM.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'
import { ref, watch, onMounted, computed } from 'vue'
import BMService from '@/services/BMService.js'

const managerBranchId = ref(null)
const branchName = ref('')

const selectedRange = ref({ label: 'Daily', value: 'daily' })
const metrics = ref({
  totalSales: 0,
  newOrders: 0,
  topProduct: { name: '', sales: 0 },
  topCustomer: { name: '', spent: 0 },
  lowStockItems: 0,
  chartData: []
})
const loading = ref(false)

const timeRanges = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

const chartData = ref()
const chartOptions = ref()

const rangeLabel = computed(() => selectedRange.value?.label || 'Daily')
const formattedTotalSales = computed(() => `₱${metrics.value.totalSales.toLocaleString()}`)
const formattedTopCust = computed(() => `₱${Number(metrics.value.topCustomer?.total_spent || 0).toLocaleString()}`)

// Get current period's promo orders count
const currentPromoOrders = computed(() => {
  const chartData = metrics.value.chartData || []
  if (chartData.length === 0) return 0
  
  // Get the last entry (current period)
  const currentPeriod = chartData[chartData.length - 1]
  return currentPeriod?.promoOrders || 0
})

// Fetch metrics from DB for the logged-in branch
async function fetchMetrics() {
  loading.value = true
  try {
    const response = await BMService.getMetrics(
      selectedRange.value.value,
      branchName.value,
    )
    const data = await response.data

    metrics.value = data

    console.log('Fetched metrics:', data)
    updateChart();
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    // Reset metrics on error
    metrics.value = { totalSales: 0, newOrders: 0, topProduct: {}, topCustomer: {}, lowStockItems: 0, chartData: [] }
  } finally {
    loading.value = false
  }
}

// Load manager's branch assignment
const loadBranchAssignment = async () => {
  try {
    const res = await BMService.getBranchAssignment()
    managerBranchId.value = res?.data?.branchId ?? null
    branchName.value = res?.data?.branchName ?? ''
  } catch (err) {
    console.warn('Failed to load branch assignment:', err)
  }
}

// Update Chart with data from DB
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

  const labels = backendData.map(item => item.period || 'Unknown')

  // Create datasets for Sales, Orders, and Promo Orders
  const salesData = backendData.map(item => Number(item.sales) || 0)
  const ordersData = backendData.map(item => Number(item.orders) || 0)
  const promoOrdersData = backendData.map(item => Number(item.promoOrders) || 0)

  // Create chart lines for Sales, Orders, and Promo Orders
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
        borderColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
        backgroundColor: documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
        tension: 0.4,
        yAxisID: 'y1'
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
          label: function (context) {
            let label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (label.includes('Sales')) {
              return `Sales: ₱${value.toLocaleString()}`
            } else if (label.includes('Total Orders')) {
              return `Total Orders: ${value}`
            } else if (label.includes('Promo Orders')) {
              return `Promo Orders: ${value}`
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
          maxTicksLimit: 10
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
          callback: function (value) {
            return '₱' + value.toLocaleString()
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
        ticks: { color: textColorSecondary },
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
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6
      }
    }
  }
}

onMounted(async () => {
  await loadBranchAssignment()
  await fetchMetrics()
})

// Watchers to refetch data on filter change
watch(selectedRange, fetchMetrics)
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}

.h-120 {
  height: 30rem;
}
</style>