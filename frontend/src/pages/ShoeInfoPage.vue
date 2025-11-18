<template>
  <div class="min-h-screen flex flex-col bg-white-smoke font-Montserrat">
    <header>
      <NavBar />
    </header>

    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Pass props to layout only when data is loaded -->
      <ShoeInfoLayout 
        v-if="shoeStore.selectedShoe" 
        :shoe="shoeStore.selectedShoe"
        :images="shoeStore.selectedShoe.images" 
        :categories="shoeStore.selectedShoe.categories"
        :sizes="shoeStore.selectedShoe.sizes" 
        :branch="shoeStore.selectedShoe.branch"
        :convertedPrice="convertedPrice"
        :currency="userContextStore.chosenCurrency"
      />

      <!-- Loading / fallback -->
      <div v-else class="text-center py-20 text-gray-500">
        Loading shoe details...
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
  import NavBar from '@/components/NavBar.vue'
  import Footer from '@/components/Footer.vue'
  import ShoeInfoLayout from '@/layouts/ShoeInfoLayout.vue'

  import { onMounted, watch, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useShoeStore } from '@/stores/shoeStore'
  import { useUserContextStore } from '@/stores/userContextStore'
  import * as currencyService from '@/services/currencyService'

  const route = useRoute()
  const shoeStore = useShoeStore()
  const userContextStore = useUserContextStore()

  const convertedPrice = ref(null)

  // Load the shoe details from the store
  async function loadShoe() {
    const shoe_id = parseInt(route.params.shoe_id)
    const branch_id = parseInt(route.params.branch_id)

    await shoeStore.loadShoeDetails(shoe_id, branch_id)
  }

  async function updateConvertedPrice() {
    if (!shoeStore.selectedShoe) return

    const price = Number(shoeStore.selectedShoe.price)
    const currencyCode = userContextStore.chosenCurrency || 'PHP'

    if (currencyCode === 'PHP') {
      convertedPrice.value = price
    } else {
      try {
        convertedPrice.value = await currencyService.convertFromPHP(price, currencyCode)
      } catch (err) {
        console.error('Error converting currency:', err)
        convertedPrice.value = null
      }
    }
  }

  // Watch for changes in currency 
  watch (
    () => userContextStore.chosenCurrency,
    () => updateConvertedPrice()
  )

  // Watch for new shoe selection
  watch(
    () => shoeStore.selectedShoe,
    () => updateConvertedPrice()
  )

  // Initial load
  onMounted(() => {
    userContextStore.loadFromStorage()
    loadShoe()
  })
</script>
