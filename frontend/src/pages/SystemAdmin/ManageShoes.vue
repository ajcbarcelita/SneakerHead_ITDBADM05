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

      <!-- FILTERS -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Brand:</span>
          <Dropdown
            v-model="selectedBrand"
            :options="brandOptions"
            optionLabel="label"
            placeholder="All Brands"
            class="w-48"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Category:</span>
          <Dropdown
            v-model="selectedCategory"
            :options="categoryOptions"
            optionLabel="label"
            placeholder="All Categories"
            class="w-48"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Status:</span>
          <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            placeholder="All Status"
            class="w-48"
          />
        </div>
      </div>

      <!-- SHOES TABLE -->
      <div class="card">
        <DataTable :value="filteredShoes" tableStyle="min-width: 70rem" :paginator="true" :rows="10">
          <Column header="Image">
            <template #body="slotProps">
              <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                <img 
                  v-if="slotProps.data.images && slotProps.data.images.length > 0" 
                  :src="slotProps.data.images[0]" 
                  :alt="slotProps.data.name"
                  class="w-full h-full object-cover rounded"
                />
                <i v-else class="pi pi-image text-gray text-2xl"></i>
              </div>
            </template>
          </Column>
          
          <Column field="name" header="Name" :sortable="true">
            <template #body="slotProps">
              <div>
                <div class="font-semibold text-charcoal">{{ slotProps.data.name }}</div>
                <div class="text-sm text-gray">{{ slotProps.data.brand }}</div>
              </div>
            </template>
          </Column>
          
          <Column field="price" header="Price" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-charcoal">₱{{ slotProps.data.price.toLocaleString() }}</span>
            </template>
          </Column>
          
          <Column field="category" header="Category" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.category" class="mr-1" />
            </template>
          </Column>
          
          <Column header="Available Sizes">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1 max-w-xs">
                <span 
                  v-for="size in slotProps.data.availableSizes" 
                  :key="size"
                  class="text-xs px-2 py-1 bg-gray-100 rounded text-charcoal"
                >
                  {{ size }}
                </span>
              </div>
            </template>
          </Column>
          
          <Column field="branches" header="Available In" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1 max-w-xs">
                <Tag 
                  v-for="branch in slotProps.data.branches" 
                  :key="branch"
                  :value="branch" 
                  severity="info"
                  class="text-xs"
                />
              </div>
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
                <Button 
                  :icon="slotProps.data.is_deleted ? 'pi pi-refresh' : 'pi pi-trash'" 
                  :class="`p-button-rounded p-button-text ${slotProps.data.is_deleted ? 'restore-btn' : 'delete-btn'}`"
                  @click="toggleShoeStatus(slotProps.data)" 
                />
                <Button icon="pi pi-sitemap" class="p-button-rounded p-button-text branch-btn" 
                        @click="manageBranches(slotProps.data)" />
              </div>
            </template>
          </Column>
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
              <div class="text-3xl font-bold text-charcoal">{{ stats.mostAvailable }}</div>
              <p class="text-charcoal text-sm font-semibold">MOST BRANCHES</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-gray">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray">{{ stats.archivedShoes }}</div>
              <p class="text-gray text-sm font-semibold">ARCHIVED</p>
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
    <Dialog v-model:visible="showAddShoeDialog" header="Add New Shoe Model" :modal="true" class="w-3/4">
      <div class="grid grid-cols-2 gap-6">
        <!-- BASIC INFO -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg border-b pb-2 text-charcoal">Basic Information</h3>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Shoe Name *</label>
            <InputText v-model="newShoe.name" class="w-full" placeholder="Enter shoe model name" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="field">
              <label class="font-semibold text-charcoal">Brand *</label>
              <Dropdown v-model="newShoe.brand_id" :options="brands" optionLabel="name" 
                        optionValue="id" placeholder="Select Brand" class="w-full" />
            </div>
            
            <div class="field">
              <label class="font-semibold text-charcoal">Category *</label>
              <Dropdown v-model="newShoe.category_id" :options="categories" optionLabel="name" 
                        optionValue="id" placeholder="Select Category" class="w-full" />
            </div>
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Price *</label>
            <InputNumber v-model="newShoe.price" mode="currency" currency="PHP" 
                         :min="0" class="w-full" />
          </div>
        </div>

        <!-- SIZES & BRANCHES -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg border-b pb-2 text-charcoal">Configuration</h3>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Assign to Branches</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <div v-for="branch in allBranches" :key="branch.id" class="flex items-center">
                <Checkbox v-model="newShoe.branches" :value="branch.name" :binary="false" />
                <label class="ml-2 text-charcoal">{{ branch.name }}</label>
              </div>
            </div>
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Upload Images</label>
            <FileUpload mode="basic" chooseLabel="Select Images" accept="image/*" 
                        :multiple="true" class="w-full" />
          </div>
          
          <div class="field flex items-center">
            <Checkbox v-model="newShoe.is_deleted" :binary="true" />
            <label class="ml-2 text-gray">Archive this product</label>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="showAddShoeDialog = false" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="saveShoe" />
      </template>
    </Dialog>

    <!-- MANAGE BRANCHES DIALOG -->
    <Dialog v-model:visible="showManageBranchesDialog" header="Manage Branches for Shoe" :modal="true" class="w-1/2">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Shoe Model:</label>
          <p class="text-lg font-semibold text-oxford-blue">{{ selectedShoe?.name }}</p>
        </div>
        
        <div class="field">
          <label class="font-semibold text-charcoal">Assign to Branches</label>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div v-for="branch in allBranches" :key="branch.id" class="flex items-center">
              <Checkbox v-model="selectedShoeBranches" :value="branch.name" :binary="false" />
              <label class="ml-2 text-charcoal">{{ branch.name }}</label>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="showManageBranchesDialog = false" />
        <Button label="Update Branches" icon="pi pi-check" class="save-btn" @click="updateShoeBranches" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'

// Data
const searchQuery = ref('')
const showAddShoeDialog = ref(false)
const showManageBranchesDialog = ref(false)
const shoes = ref([])
const selectedBrand = ref({ label: 'All Brands', value: 'all' })
const selectedCategory = ref({ label: 'All Categories', value: 'all' })
const selectedStatus = ref({ label: 'All Status', value: 'all' })
const selectedShoe = ref(null)
const selectedShoeBranches = ref([])

const newShoe = ref({
  name: '',
  brand_id: null,
  category_id: null,
  price: 0,
  availableSizes: [],
  branches: [],
  is_deleted: false
})

// Options
const brandOptions = [
  { label: 'All Brands', value: 'all' },
  { label: 'Nike', value: 'nike' },
  { label: 'Adidas', value: 'adidas' },
  { label: 'Jordan', value: 'jordan' },
  { label: 'New Balance', value: 'newbalance' },
  { label: 'Puma', value: 'puma' }
]

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Skateboarding', value: 'skateboarding' }
]

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' }
]

const availableSizes = ['6', '7', '8', '9', '10', '11', '12', '13']
const brands = [
  { id: 1, name: 'Nike' },
  { id: 2, name: 'Adidas' },
  { id: 3, name: 'Jordan' },
  { id: 4, name: 'New Balance' },
  { id: 5, name: 'Puma' }
]

const categories = [
  { id: 1, name: 'Running' },
  { id: 2, name: 'Basketball' },
  { id: 3, name: 'Lifestyle' },
  { id: 4, name: 'Skateboarding' }
]

const allBranches = [
  { id: 1, name: 'Manila' },
  { id: 2, name: 'Cebu' },
  { id: 3, name: 'Davao' },
  { id: 4, name: 'Cavite' },
  { id: 5, name: 'Baguio' }
]

// TEMP data
const sampleShoes = [
  {
    id: 1,
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Lifestyle',
    price: 7995,
    availableSizes: ['8', '9', '10', '11'],
    branches: ['Manila', 'Cebu', 'Davao'],
    images: ['/images/nike-airmax-270.jpg'],
    is_deleted: false,
    created_at: '2024-01-15',
    updated_at: '2024-01-20'
  },
  {
    id: 2,
    name: 'Adidas Ultraboost 5.0',
    brand: 'Adidas',
    category: 'Running',
    price: 8995,
    availableSizes: ['7', '8', '9', '10'],
    branches: ['Manila', 'Cavite'],
    images: ['/images/adidas-ultraboost.jpg'],
    is_deleted: false,
    created_at: '2024-01-10',
    updated_at: '2024-01-18'
  },
  {
    id: 3,
    name: 'Jordan 1 Retro High',
    brand: 'Jordan',
    category: 'Basketball',
    price: 12995,
    availableSizes: ['9', '10', '11', '12'],
    branches: ['Manila', 'Cebu', 'Davao', 'Cavite', 'Baguio'],
    images: ['/images/jordan-1-retro.jpg'],
    is_deleted: false,
    created_at: '2024-01-05',
    updated_at: '2024-01-22'
  },
  {
    id: 4,
    name: 'New Balance 574',
    brand: 'New Balance',
    category: 'Lifestyle',
    price: 4595,
    availableSizes: ['8', '9', '10'],
    branches: ['Cebu'],
    images: ['/images/newbalance-574.jpg'],
    is_deleted: true,
    created_at: '2024-01-08',
    updated_at: '2024-01-25'
  }
]

// Computed properties
const filteredShoes = computed(() => {
  let filtered = shoes.value

  // Filter by brand
  if (selectedBrand.value.value !== 'all') {
    filtered = filtered.filter(shoe => shoe.brand === selectedBrand.value.label)
  }

  // Filter by category
  if (selectedCategory.value.value !== 'all') {
    filtered = filtered.filter(shoe => shoe.category === selectedCategory.value.label)
  }

  // Filter by status
  if (selectedStatus.value.value !== 'all') {
    filtered = filtered.filter(shoe => 
      selectedStatus.value.value === 'active' ? !shoe.is_deleted : shoe.is_deleted
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(shoe => 
      shoe.name.toLowerCase().includes(query) ||
      shoe.brand.toLowerCase().includes(query) ||
      shoe.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

const stats = computed(() => {
  const totalShoes = shoes.value.length
  const activeShoes = shoes.value.filter(s => !s.is_deleted).length
  const archivedShoes = shoes.value.filter(s => s.is_deleted).length
  const mostAvailable = Math.max(...shoes.value.map(s => s.branches.length))

  return { totalShoes, activeShoes, archivedShoes, mostAvailable }
})

// Methods
const editShoe = (shoe) => {
  console.log('Edit shoe:', shoe)
  showAddShoeDialog.value = true
}

const manageBranches = (shoe) => {
  selectedShoe.value = shoe
  selectedShoeBranches.value = [...shoe.branches]
  showManageBranchesDialog.value = true
}

const updateShoeBranches = () => {
  if (selectedShoe.value) {
    selectedShoe.value.branches = [...selectedShoeBranches.value]
    showManageBranchesDialog.value = false
  }
}

const toggleShoeStatus = (shoe) => {
  shoe.is_deleted = !shoe.is_deleted
  console.log(`Shoe ${shoe.id} ${shoe.is_deleted ? 'archived' : 'activated'}`)
}

const saveShoe = () => {
  if (newShoe.value.name && newShoe.value.brand_id && newShoe.value.category_id && newShoe.value.price > 0) {
    const shoe = {
      id: shoes.value.length + 1,
      ...newShoe.value,
      brand: brands.find(b => b.id === newShoe.value.brand_id)?.name,
      category: categories.find(c => c.id === newShoe.value.category_id)?.name,
      images: [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    }

    // Temp stack adding stuff
    shoes.value.push(shoe)
    showAddShoeDialog.value = false
    resetNewShoe()
  }
}

const resetNewShoe = () => {
  newShoe.value = {
    name: '',
    brand_id: null,
    category_id: null,
    price: 0,
    availableSizes: [],
    branches: [],
    is_deleted: false
  }
}

// Initialize data
onMounted(() => {
  shoes.value = sampleShoes
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

.branch-btn.p-button {
  color: var(--color-oxford-blue) !important;
}

.branch-btn.p-button:hover {
  background-color: rgba(16, 37, 64, 0.1) !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>