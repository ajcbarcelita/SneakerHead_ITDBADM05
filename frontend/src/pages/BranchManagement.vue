<template>
  <div class="min-h-screen flex flex-col bg-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarBM />
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

      <!-- TOP METRICS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="shadow-md border-t-4 border-green-500">
          <template #title>Total Sales</template>
          <template #content>
            <div class="text-4xl font-bold text-green-600">₱12,500</div>
            <p class="text-green-500 text-sm font-semibold">THIS WEEK</p>
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
          <template #title>Branch with Highest Sales</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">Sneakerhead - Manila</p>
            <p class="text-gray-600 text-sm mt-2">₱45,300 total this week</p>
          </template>
        </Card>

        <Card class="shadow-md">
          <template #title>Branch with Most Orders</template>
          <template #content>
            <p class="text-2xl font-semibold text-giants-orange">Sneakerhead - Cebu</p>
            <p class="text-gray-600 text-sm mt-2">35 total orders today</p>
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
import NavBarBM from '@/components/NavBarBM.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import { ref } from 'vue'

const selectedRange = ref(null)
const selectedBranch = ref(null)

const timeRanges = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]

const branchOptions = [
  { label: 'All Branches', value: 'all' },
  { label: 'Manila', value: 'manila' },
  { label: 'Cavite', value: 'cavite' },
]
</script>

<style scoped>
main {
  background-color: var(--color-white-smoke);
}
</style>
