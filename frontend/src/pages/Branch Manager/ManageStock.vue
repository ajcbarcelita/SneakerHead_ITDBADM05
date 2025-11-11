<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <NavBarBM />
    </header>

    <main class="flex-1 bg-antiflash-white">
      <div class="container mx-auto p-6">
        <BManageStock />
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
import BManageStock from '@/components/BManageStock.vue'
</script>
