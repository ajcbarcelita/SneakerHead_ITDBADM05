<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <NavBar />
    </header>

    <main class="flex-1 bg-antiflash-white">
      <div class="container mx-auto p-6">
        <div class="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-oxford-blue">Sneaker Catalog</h1>
            <p class="text-sm text-gray mt-1">Branch: {{ branchName || 'All Branches' }}</p>
          </div>

          <div class="flex items-center gap-3">
            <InputText v-model="searchQuery" placeholder="Search shoes..." class="w-82" />
          </div>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray">Loading shoes...</div>

        <div v-else-if="shoes.length === 0" class="text-center py-20 text-gray">
          No shoes found for this branch.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ShoeCard
            v-for="shoe in filteredShoes"
            :key="shoe.id"
            :shoe="shoe"
            :branch-id="managerBranchId"
            :branch-name="branchName"
            :currency="selectedCurrency"
            :currency-rate="currencyRate"
            @select="onSelectShoe"
          />
        </div>
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import ShoeCard from '@/components/ShoeCard.vue'
import InputText from 'primevue/inputtext'

const router = useRouter()

const managerBranchId = ref(null)
const branchName = ref('')
const shoes = ref([])
const loading = ref(false)
const searchQuery = ref('')


const currencyRate = ref(1) // rate from PHP -> selectedCurrency



</script>

