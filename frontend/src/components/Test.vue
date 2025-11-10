<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <NavBar />
    </header>


    <main class="flex-1">
      <div class="container mx-auto p-6">
        <h1 class="text-2xl font-bold text-oxford-blue">Real</h1>
        <p class="mt-4 text-gray">Add your page content here.</p>
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
</style>
