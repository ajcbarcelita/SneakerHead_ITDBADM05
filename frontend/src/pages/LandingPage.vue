<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <NavBar />
    </header>

    <main class="flex-1 bg-antiflash-white">
      <section
        class="w-full bg-oxford-blue text-white-smoke py-32 px-6 md:px-20 flex flex-col items-center text-center gap-6">
        <h1 class="text-5xl md:text-6xl font-bold leading-tight">
          Step Up Your Sneaker Game
        </h1>
        <p class="text-lg md:text-xl text-gray max-w-2xl">
          SneakerHead brings you the hottest sneakers, limited releases, and exclusive deals. Handpicked quality, iconic
          style, and the latest drops, delivered straight to your collection.
        </p>
        <div class="flex gap-4 mt-4 flex-wrap justify-center">
          <a href="#shop"
            class="px-6 py-3 bg-giants-orange text-white-smoke font-semibold rounded-lg hover:bg-orange-600 transition">
            Shop Now
          </a>

        </div>
      </section>
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style src="@/styles/tailwind.css"></style>