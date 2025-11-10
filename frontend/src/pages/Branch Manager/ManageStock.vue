<template>
  <div class="min-h-screen flex flex-col bg-white font-Montserrat">
    <NavBarBM />

    <main class="flex-1 container mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-charcoal uppercase mb-6">Manage Stock</h1>

      <!-- Example Stock Management Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card class="shadow-md border-t-4 border-giants-orange">
          <template #title>Current Inventory</template>
          <template #content>
            <p class="text-gray-600">View and update stock levels by product or category.</p>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-blue-500">
          <template #title>Low Stock Alerts</template>
          <template #content>
            <p class="text-gray-600">Automatically identify items below threshold.</p>
          </template>
        </Card>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import NavBarBM from '@/components/NavBarBM.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
</script>
