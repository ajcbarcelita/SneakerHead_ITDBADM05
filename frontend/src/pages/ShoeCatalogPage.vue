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
            <p class="text-sm text-gray-600">Browse our collection of sneakers available at your selected branch.</p>
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
            :key="shoe.shoe_id"
            :shoe="shoe"
            :branch-id="managerBranchId"
            :branch-name="branchName"
            :show-branch="false"
            :currency="selectedCurrency"
            :currency-rate="currencyRate"
            @click="onSelectShoe(shoe)"
          />
        </div>
      </div>
    </main>

    <UserContextModal
      v-if="showContextModal"
      @close="handleContextModalClose"
    />

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
import UserContextModal from '@/components/UserContextModal.vue'
import InputText from 'primevue/inputtext'
import { useUserContextStore } from '@/stores/userContextStore'
import { getShoesByBranch } from '@/services/shoeService'
import { getCurrenciesWithRates } from '@/services/currencyService'

const router = useRouter()
const userContextStore = useUserContextStore()

const managerBranchId = ref(null)
const branchName = ref('')

const shoes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCurrency = ref('PHP')
const currencyRate = ref(1)
const showContextModal = ref(false)
const currencies = ref([])

// Search Filter
const filteredShoes = computed(() => {
  if (!searchQuery.value) return shoes.value
  
  const query = searchQuery.value.toLowerCase()
  return shoes.value.filter(shoe => 
    shoe.name?.toLowerCase().includes(query) ||
    shoe.brand?.toLowerCase().includes(query)
  )
})

// Fetch shoes for the selected branch
async function fetchShoes() {
  if (!managerBranchId.value) return

  loading.value = true
  try {
    const response = await getShoesByBranch(managerBranchId.value)

    console.log('Fetched shoes response:', response)
    
    // Handle nested array structure from stored procedure
    let shoeData = response.data
    
    // If data is wrapped in an extra array, unwrap it
    if (Array.isArray(shoeData) && shoeData.length > 0 && Array.isArray(shoeData[0])) {
      shoeData = shoeData[0]
    }
    
    if (Array.isArray(shoeData)) {
      shoes.value = shoeData
      console.log('Loaded shoes:', shoes.value)
    } else {
      console.error('Invalid or missing shoe data:', response.data)
      shoes.value = []
    }
  } catch (error) {
    console.error('Error fetching shoes:', error)
    shoes.value = []
  } finally {
    loading.value = false
  }
}

// Fetch all currencies with their exchange rates
async function fetchCurrencies() {
  try {
    currencies.value = await getCurrenciesWithRates()
    console.log('Fetched currencies with rates:', currencies.value)
  } catch (error) {
    console.error('Error fetching currencies:', error)
    currencies.value = []
  }
}

// Get currency rate from fetched currencies
function updateCurrencyRate() {
  if (selectedCurrency.value === 'PHP') {
    currencyRate.value = 1
    return
  }

  const currency = currencies.value.find(c => c.currency_code === selectedCurrency.value)
  if (currency && currency.exchangeRates && currency.exchangeRates.length > 0) {
    // Get the most recent exchange rate (assuming first one or you can sort by date)
    currencyRate.value = Number(currency.exchangeRates[0].rate_to_php) || 1
  } else {
    currencyRate.value = 1
  }
}

// Initialize from user context store
function initializeFromContext() {
  managerBranchId.value = userContextStore.branchId
  selectedCurrency.value = userContextStore.chosenCurrency || 'PHP'
  
  console.log('Initializing from context with branchId:', managerBranchId.value, 'and chosenCurrency:', selectedCurrency.value)
  // Get branch name from store if available
  const branches = userContextStore.branches || []
  const branch = branches.find(b => b.branch_id === managerBranchId.value)
  branchName.value = branch?.branch_name || ''
  
  updateCurrencyRate()
}

// Handle context modal close
function handleContextModalClose() {
  showContextModal.value = false
  initializeFromContext()
  fetchShoes()
}

// Handle shoe selection
function onSelectShoe(shoe) {
  router.push({
    name: 'ShoeDetails',
    params: { id: shoe.shoe_id },
    query: { branchId: managerBranchId.value }
  })
}

// Watch for changes in branch or currency
watch(() => userContextStore.branchId, () => {
  initializeFromContext()
  fetchShoes()
})

watch(() => userContextStore.chosenCurrency, () => {
  selectedCurrency.value = userContextStore.chosenCurrency
  updateCurrencyRate()
})

onMounted(async () => {
  // Load from storage first
  userContextStore.loadFromStorage()
  
  // Fetch currencies with rates once
  await fetchCurrencies()
  
  // If no branch selected, show modal
  if (!userContextStore.branchId) {
    showContextModal.value = true
  } else {
    initializeFromContext()
    fetchShoes()
  }
})
</script>