<template>
  <div>
    <NavBar />

    <!-- Pass props to layout only when data is loaded -->
    <ShoeInfoLayout 
      v-if="shoeStore.selectedShoe"
      :shoe="shoeStore.selectedShoe"
      :images="shoeStore.selectedShoe.images"
      :categories="shoeStore.selectedShoe.categories"
      :sizes="shoeStore.selectedShoe.sizes"
      :branch="shoeStore.selectedShoe.branch"
    />

    <!-- Loading / fallback -->
    <div v-else class="text-center py-20 text-gray-500">
      Loading shoe details...
    </div>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import ShoeInfoLayout from '@/layouts/ShoeInfoLayout.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShoeStore } from '@/stores/shoeStore'

const route = useRoute()
const shoeStore = useShoeStore()

onMounted(async () => {
  const shoe_id = parseInt(route.params.shoe_id)
  const branch_id = parseInt(route.params.branch_id)
  console.log('[Page] Route params:', { shoe_id, branch_id })

  console.log('[Page] Before fetching shoe details:', shoeStore.selectedShoe)
  await shoeStore.loadShoeDetails(shoe_id, branch_id)
  console.log('[Page] After fetching shoe details:', shoeStore.selectedShoe)
})
</script>

