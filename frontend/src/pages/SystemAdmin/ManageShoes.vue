<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Shoe Models</h1>
        
        <div class="flex items-center space-x-4">
          <!-- SEARCH BAR -->
          <div class="flex items-center space-x-2 w-auto">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search shoe models..." 
              class="w-80"
            />
            <Button icon="pi pi-search" class="search-btn" />
          </div>

          <!-- ADD SHOE BUTTON -->
          <Button label="Add Shoe Model" icon="pi pi-plus" class="add-btn" 
                  @click="showAddShoeDialog = true" />
        </div>
      </div>

      <!-- SHOES TABLE -->
      <div class="card">
        <DataTable :value="filteredShoes" tableStyle="min-width: 70rem" :paginator="true" :rows="10" :loading="loadingShoes">
          <Column field="shoe_id" header="ID" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono text-sm text-charcoal">#{{ slotProps.data.shoe_id }}</span>
            </template>
          </Column>
          
          <Column field="name" header="Name" :sortable="true">
            <template #body="slotProps">
              <div class="font-semibold text-charcoal">{{ slotProps.data.name }}</div>
            </template>
          </Column>
          
          <Column field="price" header="Price" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-charcoal">₱{{ formatPrice(slotProps.data.price) }}</span>
            </template>
          </Column>
          
          <Column field="brand_id" header="Brand" :sortable="true">
            <template #body="slotProps">
              <Tag :value="getBrandName(slotProps.data.brand_id)" class="mr-1" />
            </template>
          </Column>
          
          <Column field="is_deleted" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.is_deleted ? 'Archived' : 'Active'" 
                :severity="slotProps.data.is_deleted ? 'danger' : 'success'" 
              />
            </template>
          </Column>
          
          <Column header="Actions">
            <template #body="slotProps">
              <div class="flex space-x-2">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text edit-btn" 
                        @click="editShoe(slotProps.data)" />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-8 text-gray-500">
              <i class="pi pi-shoe text-4xl mb-4"></i>
              <p>No shoes found</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-8">
              <i class="pi pi-spinner pi-spin text-2xl mr-2"></i>
              Loading shoes...
            </div>
          </template>
        </DataTable>
      </div>

      <!-- STATS CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="shadow-md border-t-4 border-oxford-blue">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-oxford-blue">{{ stats.totalShoes }}</div>
              <p class="text-oxford-blue text-sm font-semibold">TOTAL MODELS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-giants-orange">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-giants-orange">{{ stats.activeShoes }}</div>
              <p class="text-giants-orange text-sm font-semibold">ACTIVE MODELS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-charcoal">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-charcoal">{{ stats.archivedShoes }}</div>
              <p class="text-charcoal text-sm font-semibold">ARCHIVED</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-gray">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray">₱{{ formatPrice(stats.averagePrice) }}</div>
              <p class="text-gray text-sm font-semibold">AVG PRICE</p>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>

    <!-- ADD/EDIT SHOE DIALOG -->
    <Dialog v-model:visible="showAddShoeDialog" :header="isEditing ? 'Edit Shoe Model' : 'Add New Shoe Model'" :modal="true" class="w-1/2">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Shoe Name *</label>
          <InputText v-model="currentShoe.name" class="w-full" placeholder="Enter shoe model name" 
                     :class="{ 'p-invalid': !currentShoe.name }" />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">Brand *</label>
            <Dropdown v-model="currentShoe.brand_id" :options="brands" optionLabel="brand_name" 
                      optionValue="brand_id" placeholder="Select Brand" class="w-full" 
                      :class="{ 'p-invalid': !currentShoe.brand_id }" 
                      :loading="loadingBrands" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Price *</label>
            <InputNumber v-model="currentShoe.price" mode="decimal" 
                         :min="0" class="w-full" 
                         :class="{ 'p-invalid': !currentShoe.price }" />
          </div>
        </div>

        <div class="field flex items-center" v-if="isEditing">
          <Checkbox v-model="currentShoe.is_deleted" :binary="true" inputId="isDeleted" />
          <label for="isDeleted" class="ml-2 font-semibold text-charcoal">Archive this shoe</label>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" 
                @click="cancelShoeDialog" :disabled="loadingSaveShoe" />
        <Button :label="isEditing ? 'Update' : 'Save'" icon="pi pi-check" class="save-btn" 
                @click="saveShoe" :loading="loadingSaveShoe" :disabled="!isValidShoe" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import NavBarSA from '@/components/NavBarSA.vue'
import Footer from '@/components/Footer.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import SAService from '@/services/SAService'

const toast = useToast()

// Data
const searchQuery = ref('')
const showAddShoeDialog = ref(false)
const showStatusDialog = ref(false)
const shoes = ref([])
const brands = ref([])
const loadingShoes = ref(false)
const loadingBrands = ref(false)
const loadingSaveShoe = ref(false)
const isEditing = ref(false)
const statusActionShoe = ref(null)

const currentShoe = ref({
  shoe_id: null,
  name: '',
  brand_id: null,
  price: 0,
  is_deleted: false
})

// Computed properties
const filteredShoes = computed(() => {
  if (!searchQuery.value) return shoes.value
  
  const query = searchQuery.value.toLowerCase()
  return shoes.value.filter(shoe => 
    shoe.name.toLowerCase().includes(query)
  )
})

const isValidShoe = computed(() => {
  return currentShoe.value.name && 
         currentShoe.value.brand_id && 
         currentShoe.value.price > 0
})

const stats = computed(() => {
  const totalShoes = shoes.value.length
  const activeShoes = shoes.value.filter(s => !s.is_deleted).length
  const archivedShoes = shoes.value.filter(s => s.is_deleted).length
  const averagePrice = shoes.value.length > 0 
    ? shoes.value.reduce((sum, shoe) => sum + parseFloat(shoe.price), 0) / shoes.value.length 
    : 0

  return { totalShoes, activeShoes, archivedShoes, averagePrice }
})

// Methods
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getBrandName = (brandId) => {
  const brand = brands.value.find(b => b.brand_id === brandId)
  return brand ? brand.brand_name : `Brand ${brandId}`
}

const fetchShoes = async () => {
  loadingShoes.value = true
  try {
    const response = await SAService.getShoes()
    shoes.value = response.data.shoes || []
  } catch (error) {
    console.error('Error fetching shoes:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load shoes', 
      life: 3000 
    })
    shoes.value = []
  } finally {
    loadingShoes.value = false
  }
}

const fetchBrands = async () => {
  loadingBrands.value = true
  try {
    const response = await SAService.getBrands()
    brands.value = response.data.brands || []
  } catch (error) {
    console.error('Error fetching brands:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load brands', 
      life: 3000 
    })
    brands.value = []
  } finally {
    loadingBrands.value = false
  }
}

const editShoe = (shoe) => {
  currentShoe.value = {
    shoe_id: shoe.shoe_id,
    name: shoe.name,
    brand_id: shoe.brand_id,
    price: parseFloat(shoe.price),
    is_deleted: shoe.is_deleted
  }
  isEditing.value = true
  showAddShoeDialog.value = true
}

const toggleShoeStatus = (shoe) => {
  statusActionShoe.value = shoe
  showStatusDialog.value = true
}

const saveShoe = async () => {
  loadingSaveShoe.value = true
  try {
    const shoeData = {
      name: currentShoe.value.name,
      brand_id: currentShoe.value.brand_id,
      price: Number(currentShoe.value.price)
    }

    if (isEditing.value) {
      // For update, include is_deleted and use shoe_id
      shoeData.is_deleted = Boolean(currentShoe.value.is_deleted)
      await SAService.updateShoe(currentShoe.value.shoe_id, shoeData)
      toast.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Shoe updated successfully', 
        life: 3000 
      })
    } else {
      // For add, don't include is_deleted
      await SAService.addShoe(shoeData)
      toast.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Shoe added successfully', 
        life: 3000 
      })
    }
    
    showAddShoeDialog.value = false
    resetCurrentShoe()
    await fetchShoes()
    
  } catch (error) {
    console.error('Error saving shoe:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || `Failed to ${isEditing.value ? 'update' : 'add'} shoe`, 
      life: 3000 
    })
  } finally {
    loadingSaveShoe.value = false
  }
}

const cancelShoeDialog = () => {
  showAddShoeDialog.value = false
  resetCurrentShoe()
}

const resetCurrentShoe = () => {
  currentShoe.value = {
    shoe_id: null,
    name: '',
    brand_id: null,
    price: 0,
    is_deleted: false
  }
  isEditing.value = false
}

// Initialize data
onMounted(() => {
  fetchShoes()
  fetchBrands()
})
</script>

<style scoped>
.search-btn.p-button {
  background-color: var(--color-oxford-blue) !important;
  border-color: var(--color-oxford-blue) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.search-btn.p-button:hover {
  background-color: #0a1a2d !important;
}

.add-btn.p-button {
  background-color: var(--color-giants-orange) !important;
  border-color: var(--color-giants-orange) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.add-btn.p-button:hover {
  background-color: #d45601 !important;
}

.save-btn.p-button {
  background-color: var(--color-giants-orange) !important;
  border-color: var(--color-giants-orange) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.save-btn.p-button:hover {
  background-color: #d45601 !important;
}

.edit-btn.p-button {
  color: var(--color-giants-orange) !important;
}

.edit-btn.p-button:hover {
  background-color: rgba(234, 102, 45, 0.1) !important;
}

.delete-btn.p-button {
  color: #dc2626 !important;
}

.delete-btn.p-button:hover {
  background-color: rgba(220, 38, 38, 0.1) !important;
}

.restore-btn.p-button {
  color: #16a34a !important;
}

.restore-btn.p-button:hover {
  background-color: rgba(22, 163, 74, 0.1) !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>