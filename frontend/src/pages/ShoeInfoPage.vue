<template>
  <div class="min-h-screen flex flex-col bg-white-smoke font-Montserrat">
    <header>
      <NavBar />
    </header>

    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Pass props to layout only when data is loaded -->
      <ShoeInfoLayout v-if="shoeStore.selectedShoe" :shoe="shoeStore.selectedShoe"
        :images="shoeStore.selectedShoe.images" :categories="shoeStore.selectedShoe.categories"
        :sizes="shoeStore.selectedShoe.sizes" :branch="shoeStore.selectedShoe.branch" />

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
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useShoeStore } from '@/stores/shoeStore'

const route = useRoute()
const shoeStore = useShoeStore()

async function loadShoe() {
  const shoe_id = parseInt(route.params.shoe_id)
  const branch_id = parseInt(route.params.branch_id)

  await shoeStore.loadShoeDetails(shoe_id, branch_id)
}

// Watch for route param changes
watch(
  () => [route.params.shoe_id, route.params.branch_id],
  () => { loadShoe()})

onMounted(() => {
  loadShoe()
})
</script>
