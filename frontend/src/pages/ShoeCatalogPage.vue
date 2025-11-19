<template>
    <div class="min-h-screen flex flex-col">
        <header>
            <NavBar />
        </header>

        <main class="flex-1 bg-antiflash-white">
            <div class="container mx-auto p-6">
                <div class="flex items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 class="text-4xl font-semibold text-oxford-blue">Sneaker Catalog</h1>
                        <p class="text-1xl text-gray-600 mt-3">Browse our collection of sneakers available at your
                            selected branch.</p>
                    </div>
                    
                    <MultiSelect 
                        v-model="selectedBrands" 
                        :options="brands" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="All Brands"
                        display-selected-label="false"
                        class="w-72"
                        showClear
                    />

                    <MultiSelect 
                        v-model="selectedCategories" 
                        :options="categories" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="All Categories"
                        display-selected-label="false"
                        class="w-72"
                        showClear
                    />

                    <div class="flex items-center gap-3">
                        <InputText v-model="searchQuery" placeholder="Search shoes..." class="w-82" />
                    </div>
                </div>

                <div v-if="loading" class="text-center py-10 text-gray">Loading shoes...</div>

                <div v-else-if="shoes.length === 0" class="text-center py-20 text-gray">
                    No shoes found for this branch.
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div v-for="shoe in filteredShoes" :key="shoe.shoe_id">
                        <ShoeCard v-if="shoe && shoe.shoe_id" :key="shoe.shoe_id" :shoe="shoe"
                            :branch-id="managerBranchId" :show-branch="false" :currency="selectedCurrency"
                            :currency-rate="currencyRate" @click="onSelectShoe" />
                    </div>
                </div>
            </div>
        </main>

        <UserContextModal v-if="showContextModal" @close="handleContextModalClose" />

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
import Listbox from 'primevue/listbox'
import MultiSelect from 'primevue/multiselect'

import { useUserContextStore } from '@/stores/userContextStore'
import { getShoesByBranch, getAllBrands, getAllCategories } from '@/services/shoeService'
import { getCurrenciesWithRates } from '@/services/currencyService'

const router = useRouter()
const userContextStore = useUserContextStore()

const managerBranchId = ref(null)

const shoes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCurrency = ref('PHP')
const currencyRate = ref(1)
const showContextModal = ref(false)
const currencies = ref([])

const brands = ref([])
const categories = ref([])

const selectedBrands = ref([])
const selectedCategories = ref([])

const filteredShoes = computed(() => {
    // Map selected brand/category IDs back to labels
    const selectedBrandLabels = selectedBrands.value
        .map(id => brands.value.find(b => b.value === id)?.label)
        .filter(Boolean) // remove undefined

    const selectedCategoryLabels = selectedCategories.value
        .map(id => categories.value.find(c => c.value === id)?.label)
        .filter(Boolean)

    return shoes.value.filter(shoe => {
        // 1️⃣ Search filter
        const matchesSearch = !searchQuery.value ||
            shoe.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            shoe.brand_name.toLowerCase().includes(searchQuery.value.toLowerCase())

        // 2️⃣ Brand filter
        const matchesBrand = !selectedBrandLabels.length ||
            selectedBrandLabels.includes(shoe.brand_name)

        // 3️⃣ Category filter
        const matchesCategory = !selectedCategoryLabels.length ||
            shoe.categories.some(cat => selectedCategoryLabels.includes(cat))

        return matchesSearch && matchesBrand && matchesCategory
    })
})

// Fetch shoes for the selected branch
async function fetchShoes() {
    if (!managerBranchId.value) return

    loading.value = true
    try {
        const response = await getShoesByBranch(managerBranchId.value)

         if (Array.isArray(response.data)) {
            shoes.value = response.data
            console.log('Loaded shoes:', shoes.value)
        } else {
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
    } catch (error) {
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

// Init from user context store
function initializeFromContext() {
    managerBranchId.value = userContextStore.branchId
    selectedCurrency.value = userContextStore.chosenCurrency || 'PHP'
    updateCurrencyRate()
}

// Handle modal close (branch select / currency)
function handleContextModalClose() {
    showContextModal.value = false
    initializeFromContext()
    fetchShoes()
}

// Handle shoe selection
function onSelectShoe(shoe) {
    router.push({
        name: 'FullShoeInfo',
        params: { shoe_id: shoe.shoe_id, branch_id: managerBranchId.value }
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

async function fetchFilters() {
    try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
            getAllBrands(),
            getAllCategories()
        ])
        brands.value = brandsResponse.data
        categories.value = categoriesResponse.data
    } catch (err) {
        brands.value = []
        categories.value = []
        console.error(err)
    }
}

onMounted(async () => {
    userContextStore.loadFromStorage()
    await Promise.all([fetchCurrencies(), fetchFilters()])
    if (!userContextStore.branchId) showContextModal.value = true
    else {
        initializeFromContext()
        fetchShoes()
    }
})
</script>
