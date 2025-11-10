<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <NavBarBM />
    </header>

    <main class="flex-1 bg-antiflash-white">
      <div class="container mx-auto p-6">
        <BManageOrders />
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import NavBarBM from '@/components/NavBarBM.vue'
import Footer from '@/components/Footer.vue'
import BManageOrders from '@/components/BManageOrders.vue'
</script>
