<template>
  <div class="bg-antiflash-white min-h-screen text-charcoal">
    <!-- Navbar -->
    <header class="bg-oxford-blue text-white">
      <div class="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 class="text-xl font-bold tracking-wide">SneakerHead</h1>
        <nav class="flex space-x-6 text-sm uppercase">
          <a href="#" class="hover:text-giants-orange">New Arrivals</a>
          <a href="#" class="hover:text-giants-orange">Men's</a>
          <a href="#" class="hover:text-giants-orange">Brands</a>
          <a href="#" class="text-giants-orange font-semibold">Sale</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-charcoal text-white text-center py-20 relative">
      <h2 class="text-4xl font-bold mb-4">STEP INTO STYLE</h2>
      <p class="text-white-smoke mb-6">Explore the latest trends in sneakers and streetwear</p>
      <button class="bg-giants-orange px-6 py-2 rounded-lg font-semibold hover:bg-orange-500 transition">
        SHOP NOW
      </button>
    </section>

    <!-- Category Highlights -->
    <section class="container mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div class="bg-white-smoke rounded-lg p-6 shadow">
        <h3 class="font-semibold text-lg mb-2">PREMIUM SNEAKERS</h3>
        <p class="text-gray text-sm">Designed for those who never settle for less.</p>
      </div>
      <div class="bg-charcoal text-white rounded-lg p-6 shadow">
        <h3 class="font-semibold text-lg mb-2">LIFESTYLE SHOES</h3>
        <p class="text-antiflash-white text-sm">For your daily stride in comfort and confidence.</p>
      </div>
      <div class="bg-white-smoke rounded-lg p-6 shadow">
        <h3 class="font-semibold text-lg mb-2">CASUAL CLASSICS</h3>
        <p class="text-gray text-sm">Timeless icons for every occasion.</p>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="container mx-auto py-12">
      <h3 class="text-2xl font-bold text-center mb-8">FEATURED PRODUCTS</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="(item, index) in 8"
          :key="index"
          class="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <div class="bg-antiflash-white h-24 mb-4 flex items-center justify-center rounded">
            <span class="text-gray text-sm">Product {{ index + 1 }}</span>
          </div>
          <h4 class="font-semibold mb-1">Sneaker Model {{ index + 1 }}</h4>
          <p class="text-giants-orange font-bold">$50.00</p>
        </div>
      </div>
    </section>


    <!-- Footer -->
    <footer class="bg-oxford-blue text-white py-6 mt-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center px-6 text-sm">
        <p>© 2025 SneakerHead. All rights reserved.</p>
        <div class="flex space-x-6 mt-3 md:mt-0">
          <a href="#" class="hover:text-giants-orange">About Us</a>
          <a href="#" class="hover:text-giants-orange">Customer Service</a>
          <a href="#" class="hover:text-giants-orange">Follow Us</a>
        </div>
      </div>
    </footer>
  </div>

  
</template>

<script setup>
// No logic yet — this is just for structure and color testing
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
