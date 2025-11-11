<template>
  <div class="min-h-screen bg-white-smoke font-Montserrat">
    <!-- Navigation Bar -->
    <NavBar />

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
      <!-- Page Title -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-oxford-blue mb-2">Your Shopping Cart</h1>
        <p class="text-gray">Review your items before checkout</p>
      </div>

      <!-- Shopping Cart Component -->
      <div class="mb-8">
        <ShoppingCart />
      </div>

      <!-- Continue Shopping Button -->
      <div class="flex justify-center mb-8">
        <router-link to="/products">
          <Button
            label="Continue Shopping"
            icon="pi pi-arrow-left"
            outlined
            class="text-oxford-blue border-oxford-blue hover:bg-oxford-blue hover:text-white font-semibold px-6 py-3"
          />
        </router-link>
      </div>
    </main>


    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import ShoppingCart from '@/components/ShoppingCart.vue'
import Button from 'primevue/button'
</script>

<style src="@/styles/tailwind.css"></style>
