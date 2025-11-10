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
            <div class="text-4xl font-bold text-green-600">₱12,500</div>
            <p class="text-green-500 text-sm font-semibold">
              TOTAL {{ rangeLabel.toUpperCase() }}
            </p>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-red-500">
          <template #title>Low Stock Items</template>
          <template #content>
            <div class="text-4xl font-bold text-red-600">15</div>
            <p class="text-red-500 text-sm font-semibold">URGENT</p>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-blue-500">
          <template #title>New Orders (Today)</template>
          <template #content>
            <div class="text-4xl font-bold text-blue-600">7</div>
            <p class="text-blue-500 text-sm font-semibold">PENDING</p>
          </template>
        </Card>
      </div>

      <!-- OTHER DETAILS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card class="shadow-md">
          <template #title>Branch with Highest Sales (This Month)</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">Sneakerhead - Manila</p>
            <p class="text-gray-600 text-sm mt-2">₱45,300 total this month</p>
          </template>
        </Card>

        <Card class="shadow-md">
          <template #title>Branch with Most Orders (Today)</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">Sneakerhead - Cebu</p>
            <p class="text-gray-600 text-sm mt-2">35 total orders today</p>
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
import NavBarSA from '@/components/NavBarSA.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'
import { ref, watch, onMounted, computed } from 'vue'

// Initital values
const selectedRange = ref({ label: 'Daily', value: 'daily' })
const selectedBranch = ref({ label: 'All Branches', value: 'all' })

const timeRanges = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

const branchOptions = [
  { label: 'All Branches', value: 'all' },
  { label: 'Manila', value: 'manila' },
  { label: 'Cavite', value: 'cavite' },
]

const chartData = ref()
const chartOptions = ref()

// 
const rangeLabel = computed(() => selectedRange.value?.label || 'TOTAL DAILY')

// Update Chart on Filter Changes
onMounted(() => {
  updateChart()
})

watch([selectedRange, selectedBranch], updateChart)

// Primvue Chart.js Documentation Reference
// https://primevue.org/chart
function updateChart() {
  // Chart Themes -- masisira to pag tinangal like every Primevue component
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

  // Branch Colors
  const borderColors = [
    documentStyle.getPropertyValue('--p-cyan-500'),
    documentStyle.getPropertyValue('--p-gray-500')
  ]

  // Generate sample data based on range
  let labels, data1, data2

  switch (selectedRange.value.value) {
    case 'daily':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data1 = [12, 19, 3, 5, 2, 3, 9]
      data2 = [8, 14, 7, 10, 6, 4, 5]
      break
    case 'monthly':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      data1 = [200, 400, 300, 600, 500, 700, 800, 900, 750, 850, 950, 1000]
      data2 = [150, 300, 250, 400, 350, 600, 0, 700, 600, 700, 800, 900]
      break
    case 'yearly':
      labels = ['2020', '2021', '2022', '2023', '2024', '2025']
      data1 = [5000, 7000, 8000, 9500, 11000, 12000]
      data2 = [4500, 6500, 7000, 8500, 10000, 11500]
      break
    default:
      labels = []
      data1 = []
      data2 = []
  }

  // Only one line if specific branch selected
  const datasets = [
    {
      label: selectedBranch.value.value === 'all' ? 'Manila Branch' : selectedBranch.value.label,
      data: data1,
      fill: false,
      borderColor: borderColors[0],
      tension: 0.4
    }
  ]

  // If 'All Branches' is selected, add second dataset
  if (selectedBranch.value.value === 'all') {
    datasets.push({
      label: 'Cavite Branch',
      data: data2,
      fill: false,
      borderColor: borderColors[1],
      tension: 0.4
    })
  }

  chartData.value = { labels, datasets }

  // Chart Settings
  chartOptions.value = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: { labels: { color: textColor } },
    },
    scales: {
      x: {
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder },
      },
      y: {
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder },
      },
    },
  }
}
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}
</style>
