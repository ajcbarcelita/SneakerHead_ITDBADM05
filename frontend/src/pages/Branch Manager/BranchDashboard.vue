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
        <h1 class="text-2xl font-bold text-charcoal uppercase">Dashboard Overview</h1>

        <div class="flex items-center space-x-3">
          <span class="font-semibold text-charcoal">Filter by:</span>
          <Dropdown v-model="selectedRange" :options="timeRanges" optionLabel="label" placeholder="Select Range"
            class="w-48" />
        </div>
      </div>

      <!-- METRICS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="shadow-md border-t-4 border-green-500">
          <template #title>Total Sales</template>
          <template #content>
            <div class="text-4xl font-bold text-green-600">₱{{ formattedSales }}</div>
            <p class="text-green-500 text-sm font-semibold">
              TOTAL {{ rangeLabel.toUpperCase() }}
            </p>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-red-500">
          <template #title>Low Stock Items</template>
          <template #content>
            <div class="text-4xl font-bold text-red-600">{{ lowStock }}</div>
            <p class="text-red-500 text-sm font-semibold">URGENT</p>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-blue-500">
          <template #title>New Orders (Today)</template>
          <template #content>
            <div class="text-4xl font-bold text-blue-600">{{ newOrders }}</div>
            <p class="text-blue-500 text-sm font-semibold">PENDING</p>
          </template>
        </Card>
      </div>

      <!-- OTHER DETAILS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="shadow-md">
          <template #title>Highest-Selling Product ({{ rangeLabel }})</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">{{ topProduct.name }}</p>
            <p class="text-gray-600 text-sm mt-2">₱{{ topProduct.sales.toLocaleString() }} total sales</p>
          </template>
        </Card>

        <Card class="shadow-md">
          <template #title>Top Customer ({{ rangeLabel }})</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">{{ topCustomer.name }}</p>
            <p class="text-gray-600 text-sm mt-2">₱{{ topCustomer.spent.toLocaleString() }} spent</p>
          </template>
        </Card>
      </div>

      <!-- LINE CHART FOR SALES -->
      <Card class="shadow-md">
        <template #title>Sales Performance</template>
        <template #content>
          <Chart type="line" :data="chartData" :options="chartOptions" class="h-120" />
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

// Filters
const selectedRange = ref({ label: 'Daily', value: 'daily' })

const timeRanges = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

// Init Metrics
const totalSales = ref(18300)
const lowStock = ref(15)
const newOrders = ref(7)

// Highest selling product and top customer (mock)
const topProduct = ref({ name: 'Air Jordan 1 Retro', sales: 18300 })
const topCustomer = ref({ name: 'John Dela Cruz', spent: 9500 })

const chartData = ref()
const chartOptions = ref()

// For displaying range label
const rangeLabel = computed(() => selectedRange.value?.label || 'Daily')

// Display formatted sales -- comma stuff
const formattedSales = computed(() => totalSales.value.toLocaleString())

// Initialize
onMounted(() => updateChart())
watch(selectedRange, updateChart)

// Update chart whenever range changes
function updateChart() {
  // Important for theme
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  let labels, data
  switch (selectedRange.value.value) {
    case 'daily':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data = [12, 19, 3, 5, 2, 3, 9]
      totalSales.value = 12500
      topProduct.value = { name: 'Air Jordan 1 Retro', sales: 18300 }
      topCustomer.value = { name: 'John Dela Cruz', spent: 9500 }
      break
    case 'monthly':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      data = [200, 400, 300, 600, 500, 700, 800, 900, 750, 850, 950, 1000]
      totalSales.value = 342000
      topProduct.value = { name: 'Nike Dunk Low', sales: 96500 }
      topCustomer.value = { name: 'Maria Santos', spent: 21500 }
      break
    case 'yearly':
      labels = ['2020', '2021', '2022', '2023', '2024', '2025']
      data = [5000, 7000, 8000, 9500, 11000, 12000]
      totalSales.value = 4125000
      topProduct.value = { name: 'Yeezy Boost 350', sales: 875000 }
      topCustomer.value = { name: 'Carlos Reyes', spent: 152000 }
      break
  }

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Branch X',
        data,
        fill: false,
        borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
        tension: 0.4,
      },
    ],
  }

  // Chart Settings
  chartOptions.value = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: { legend: { labels: { color: textColor } }, },
    scales: { x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }, 
              y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }, },
  }
}
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}
</style>
