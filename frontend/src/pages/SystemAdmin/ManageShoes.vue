<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Shoe Models</h1>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 w-auto">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search shoe models..." 
              class="w-80"
            />
            <Button icon="pi pi-search" class="search-btn" />
          </div>

          <!-- Updated button to use addNewShoe -->
          <Button label="Add Shoe Model" icon="pi pi-plus" class="add-btn" 
                  @click="addNewShoe" />
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

          <Column field="category_names" header="Categories">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1">
                <Tag 
                  v-for="category in slotProps.data.category_names" 
                  :key="category"
                  :value="category" 
                  class="mr-1 mb-1" 
                />
                <span v-if="slotProps.data.category_names.length === 0" class="text-gray-400 text-sm">
                  No categories
                </span>
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

    <footer>
      <Footer />
    </footer>

    <!-- ADD/EDIT SHOE DIALOG -->
    <Dialog v-model:visible="showAddShoeDialog" :header="isEditing ? 'Edit Shoe Model' : 'Add New Shoe Model'" :modal="true" class="w-3/4 max-w-4xl">
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column - Basic Info -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-charcoal border-b pb-2">Basic Information</h3>
            
            <div class="field">
              <label class="font-semibold text-charcoal">Shoe Name *</label>
              <InputText v-model="currentShoe.name" class="w-full" placeholder="Enter shoe model name" 
                        :class="{ 'p-invalid': !currentShoe.name }" />
            </div>
            
            <div class="field">
              <label class="font-semibold text-charcoal">Brand *</label>
              <Dropdown v-model="currentShoe.brand_id" :options="brands" optionLabel="brand_name" 
                        optionValue="brand_id" placeholder="Select Brand" class="w-full" 
                        :class="{ 'p-invalid': !currentShoe.brand_id }" />
            </div>
            
            <div class="field">
              <label class="font-semibold text-charcoal">Price *</label>
              <InputNumber v-model="currentShoe.price" mode="decimal" 
                          :min="0" class="w-full" 
                          :class="{ 'p-invalid': !currentShoe.price }" />
            </div>

            <div class="field">
              <label class="font-semibold text-charcoal">Categories</label>
              <MultiSelect v-model="currentShoe.categories" :options="categories" optionLabel="category_name" 
                          optionValue="category_id" placeholder="Select Categories" class="w-full" />
            </div>

            <div class="field flex items-center" v-if="isEditing">
              <Checkbox v-model="currentShoe.is_deleted" :binary="true" inputId="isDeleted" />
              <label for="isDeleted" class="ml-2 font-semibold text-charcoal">Archive this shoe</label>
            </div>
          </div>

          <!-- Right Column - Images -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-charcoal">Images</h3>
              <Button label="Add Images" icon="pi pi-plus" class="p-button-sm add-btn" 
                      @click="fileInput?.click()" />
            </div>

            <input 
              ref="fileInput"
              type="file" 
              multiple 
              accept="image/*" 
              @change="handleImageUpload" 
              class="hidden"
            />

            <!-- Image Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg">
              <div v-for="(image, index) in currentShoe.images" :key="index" 
                   class="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img :src="image.url" :alt="currentShoe.name" 
                     class="w-full h-32 object-cover" />
                
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div class="flex space-x-2">
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-sm p-button-danger" 
                            @click="removeImage(index)" />
                  </div>
                </div>
              </div>

              <div v-if="currentShoe.images.length === 0" class="col-span-full text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <i class="pi pi-image text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">No images added</p>
                <p class="text-sm text-gray-400">Click "Add Images" to upload shoe photos</p>
              </div>
            </div>

            <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p class="font-semibold">Image Guidelines:</p>
              <ul class="list-disc list-inside mt-1 space-y-1">
                <li>Supported formats: JPG, PNG, WebP</li>
                <li>Recommended resolution: 800x600 or higher</li>
              </ul>
            </div>
          </div>
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
import { ref, onMounted, computed, watch } from 'vue'
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
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import SAService from '@/services/SAService'

const toast = useToast()

// Refs
const searchQuery = ref('')
const showAddShoeDialog = ref(false)
const shoes = ref([])
const brands = ref([])
const categories = ref([])
const loadingShoes = ref(false)
const loadingBrands = ref(false)
const loadingCategories = ref(false)
const loadingSaveShoe = ref(false)
const isEditing = ref(false)
const fileInput = ref(null)

// Reset to default shoe state
const getDefaultShoe = () => ({
  shoe_id: null,
  name: '',
  brand_id: null,
  price: 0,
  is_deleted: false,
  images: [],
  originalImages: [],
  categories: []
})

const currentShoe = ref(getDefaultShoe())

// Computed properties
const filteredShoes = computed(() => {
  if (!searchQuery.value) return shoes.value
  
  const query = searchQuery.value.toLowerCase()
  return shoes.value.filter(shoe => 
    shoe.name.toLowerCase().includes(query) ||
    (shoe.category_names && shoe.category_names.some(cat => cat.toLowerCase().includes(query)))
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

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Please select only image files',
        life: 3000
      })
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: 'Image size should be less than 5MB',
        life: 3000
      })
      return
    }

    // Create blob URL for preview and store file reference
    const blobUrl = URL.createObjectURL(file)
    currentShoe.value.images.push({
      url: blobUrl,
      file: file,
      isNew: true
    })
  }

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index) => {
  currentShoe.value.images.splice(index, 1)
}

const fetchShoes = async () => {
  loadingShoes.value = true
  try {
    const response = await SAService.getShoes()
    shoes.value = response.data.shoes || []
  } catch (error) {
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

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await SAService.getCategories()
    categories.value = response.data.categories || []
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load categories', 
      life: 3000 
    })
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const addNewShoe = () => {
  // Reset to default state for new shoe
  resetCurrentShoe()
  isEditing.value = false
  showAddShoeDialog.value = true
}

const editShoe = async (shoe) => {
  try {
    const response = await SAService.getShoeById(shoe.shoe_id)
    const shoeDetails = response.data.shoe
    
    // Clean up any existing blob URLs first
    resetCurrentShoe()
    
    // Convert existing images to the needed format
    const existingImages = shoeDetails.images.map(imgUrl => ({
      url: imgUrl,
      isNew: false
    }))
    
    // Ensure categories are numbers
    const categoryIds = Array.isArray(shoeDetails.categories) 
      ? shoeDetails.categories.map(cat => Number(cat))
      : []
    
    currentShoe.value = {
      shoe_id: shoe.shoe_id,
      name: shoe.name,
      brand_id: shoe.brand_id,
      price: parseFloat(shoe.price),
      is_deleted: shoe.is_deleted,
      images: [...existingImages],
      originalImages: [...existingImages],
      categories: categoryIds
    }

    isEditing.value = true
    showAddShoeDialog.value = true
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load shoe details', 
      life: 3000 
    })
  }
}

const saveShoe = async () => {
  loadingSaveShoe.value = true
  try {
    
    const formData = new FormData()
    
    // Add basic shoe data
    formData.append('name', currentShoe.value.name)
    formData.append('brand_id', currentShoe.value.brand_id)
    formData.append('price', currentShoe.value.price)
    
    // Ensure categories are sent as numbers
    const categoriesToSend = Array.isArray(currentShoe.value.categories) 
      ? currentShoe.value.categories.map(cat => Number(cat))
      : []
    
    formData.append('categories', JSON.stringify(categoriesToSend))

    if (isEditing.value) {
      // Handle the boolean conversion
      const isDeletedValue = currentShoe.value.is_deleted ? 'true' : 'false';
      formData.append('is_deleted', isDeletedValue);
      
      // Find images that were removed by comparing with originalImages
      const currentExistingUrls = currentShoe.value.images
        .filter(img => !img.isNew)
        .map(img => img.url)
      
      const imagesToDelete = currentShoe.value.originalImages
        .filter(originalImg => !currentExistingUrls.includes(originalImg.url))
        .map(img => img.url)
      
      if (imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete))
      }
    }

    // Add new image files
    const newImages = currentShoe.value.images.filter(img => img.isNew && img.file)
    
    newImages.forEach(img => {
      formData.append('images', img.file)
    })

    if (isEditing.value) {
      await SAService.updateShoe(currentShoe.value.shoe_id, formData)
      toast.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Shoe updated successfully', 
        life: 3000 
      })
    } else {
      await SAService.addShoe(formData)
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
  // Clean up blob URLs to prevent memory leaks
  if (currentShoe.value.images) {
    currentShoe.value.images.forEach(img => {
      if (img.url && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
  }
  
  // Reset to default state
  currentShoe.value = getDefaultShoe()
  isEditing.value = false
}

// Watch for dialog close to cleanup
watch(showAddShoeDialog, (newVal) => {
  if (!newVal) {
    // Dialog closed, reset state
    resetCurrentShoe()
  }
})

// Initialize data
onMounted(() => {
  fetchShoes()
  fetchBrands()
  fetchCategories()
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
</style>