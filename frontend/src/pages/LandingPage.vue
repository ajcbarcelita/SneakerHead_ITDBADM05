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

      <section class="w-full py-20 bg-neutral-900 text-white">
      <h1 class="text-5xl md:text-6xl font-bold leading-tight text-center mb-12">
        Why SneakerHead?
      </h1>
      <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <!-- Card 1 -->
        <div class="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-semibold mb-2">100% Verified Authentic</h3>
          <p class="text-neutral-300">
            No fakes, no nonsense — every pair is sourced and authenticated.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-semibold mb-2">Real-Time Branch Stock</h3>
          <p class="text-neutral-300">
            See which branch has your size right now. No more “Out of stock po.”
          </p>
        </div>

        <!-- Card 3 -->
        <div class="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-semibold mb-2">Exclusive Deals & Promos</h3>
          <p class="text-neutral-300">
            Seasonal drops, promo codes, and special discounts.
          </p>
        </div>

        <!-- Card 4 -->
        <div class="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition">
          <h3 class="text-xl font-semibold mb-2">Multi-Currency Ready</h3>
          <p class="text-neutral-300">
            USD, PHP, and more — auto-converted in real time.
          </p>
        </div>
      </div>

      <div :style="{ height: '200px', position: 'relative', overflow: 'hidden' }">
        <LogoLoop
          :logos="imageLogos"
          :speed="120"
          direction="left"
          :logoHeight="120"
          :gap="60"
          :pauseOnHover="true"
          :scaleOnHover="true"
          :fadeOut="true"
          fadeOutColor="#ffffff"
          ariaLabel="Shoe brands"
        />
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
  import LogoLoop from '@/blocks/Animations/LogoLoop/LogoLoop.vue';

  import nikeLogo from '@/assets/nike-logo.png';
  import adidasLogo from '@/assets/adidas-logo.png';
  import pumaLogo from '@/assets/puma-logo.png';
  import asicsLogo from '@/assets/asics-logo.png';
  import converseLogo from '@/assets/converse-logo.png';
  import nbLogo from '@/assets/nb-logo.png';
  import onitsukaLogo from '@/assets/onitsuka-tiger-logo.png';
  import vansLogo from '@/assets/vans-logo.png';

  const imageLogos = [
    { src: nikeLogo, alt: "Nike" },
    { src: adidasLogo, alt: "Adidas" },
    { src: pumaLogo, alt: "Puma" },
    { src: asicsLogo, alt: "Asics" },
    { src: converseLogo, alt: "Converse" },
    { src: nbLogo, alt: "New Balance" },
    { src: onitsukaLogo, alt: "Onitsuka Tiger" },
    { src: vansLogo, alt: "Vans" },
  ]
</script>

<style src="@/styles/tailwind.css"></style>