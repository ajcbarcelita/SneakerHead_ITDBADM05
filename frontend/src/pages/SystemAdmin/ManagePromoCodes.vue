<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Promo Codes</h1>
        
        <div class="flex items-center space-x-4">
          <!-- SEARCH BAR -->
          <div class="flex items-center space-x-2 w-auto">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search promo codes..." 
              class="w-80"
            />
            <Button icon="pi pi-search" class="search-btn" />
          </div>

          <!-- ADD PROMO BUTTON -->
          <Button label="Add Promo Code" icon="pi pi-plus" class="add-btn" 
                  @click="showAddPromoDialog = true" />
        </div>
      </div>

      <!-- PROMO CODES TABLE -->
      <div class="card">
        <DataTable :value="filteredPromoCodes" tableStyle="min-width: 60rem" :paginator="true" :rows="10"
                   :loading="loadingPromoCodes">
          <Column field="promo_code" header="Promo Code" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono font-bold text-oxford-blue">{{ slotProps.data.promo_code }}</span>
            </template>
          </Column>
          
          <Column field="discount_type" header="Discount Type" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.discount_type" 
                   :severity="slotProps.data.discount_type === 'Percentage' ? 'warning' : 'success'" />
            </template>
          </Column>
          
          <Column field="discount_value" header="Discount Value" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-charcoal">
                {{ slotProps.data.discount_type === 'Percentage' ? slotProps.data.discount_value + '%' : '₱' + slotProps.data.discount_value }}
              </span>
            </template>
          </Column>
          
          <Column field="min_order_value" header="Min Order" :sortable="true">
            <template #body="slotProps">
              <span class="text-charcoal">₱{{ slotProps.data.min_order_value }}</span>
            </template>
          </Column>
          
          <Column field="is_first_time_only" header="One time use" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.is_first_time_only ? 'Yes' : 'No'" 
                   :severity="slotProps.data.is_first_time_only ? 'info' : 'secondary'" />
            </template>
          </Column>
          
          <Column field="start_date" header="Start Date" :sortable="true">
            <template #body="slotProps">
              <span class="text-charcoal">{{ formatDate(slotProps.data.start_date) }}</span>
            </template>
          </Column>
          
          <Column field="end_date" header="End Date" :sortable="true">
            <template #body="slotProps">
              <span class="text-charcoal">{{ formatDate(slotProps.data.end_date) }}</span>
            </template>
          </Column>
          
          <Column field="used_count" header="Used" :sortable="true">
            <template #body="slotProps">
              <div class="text-center">
                <span class="font-semibold text-charcoal">{{ slotProps.data.used_count || 0 }}</span>
                <span class="text-gray">/{{ slotProps.data.usage_limit }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="is_active" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.is_active ? 'Active' : 'Inactive'" 
                   :severity="slotProps.data.is_active ? 'success' : 'danger'" />
            </template>
          </Column>
          
          <Column header="Actions">
            <template #body="slotProps">
              <div class="flex space-x-2">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text edit-btn" 
                        @click="editPromo(slotProps.data)" />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-8 text-gray-500">
              <i class="pi pi-ticket text-4xl mb-4"></i>
              <p>No promo codes found</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-8">
              <i class="pi pi-spinner pi-spin text-2xl mr-2"></i>
              Loading promo codes...
            </div>
          </template>
        </DataTable>
      </div>

      <!-- STATS CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="shadow-md border-t-4 border-oxford-blue">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-oxford-blue">{{ stats.totalPromos }}</div>
              <p class="text-oxford-blue text-sm font-semibold">TOTAL PROMOS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-giants-orange">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-giants-orange">{{ stats.activePromos }}</div>
              <p class="text-giants-orange text-sm font-semibold">ACTIVE PROMOS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-charcoal">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-charcoal">{{ stats.totalUsage }}</div>
              <p class="text-charcoal text-sm font-semibold">TOTAL USAGE</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-gray">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray">₱{{ stats.totalDiscounts.toLocaleString() }}</div>
              <p class="text-gray text-sm font-semibold">TOTAL DISCOUNTS</p>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>

    <!-- ADD PROMO DIALOG -->
    <Dialog v-model:visible="showAddPromoDialog" header="Add Promo Code" :modal="true" class="w-2/5">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Promo Code *</label>
          <InputText v-model="newPromo.promo_code" class="w-full" placeholder="e.g., SUMMER20" 
                     :class="{ 'p-invalid': !newPromo.promo_code }" />
          <small class="text-gray">Unique code (up to 12 characters)</small>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">Discount Type *</label>
            <Dropdown v-model="newPromo.discount_type" :options="discountTypes" optionLabel="label" 
                      placeholder="Select Type" class="w-full" 
                      :class="{ 'p-invalid': !newPromo.discount_type }" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Discount Value *</label>
            <InputNumber v-model="newPromo.discount_value" mode="decimal" :min="0" 
                         :max="newPromo.discount_type?.value === 'Percentage' ? 100 : 10000"
                         class="w-full" 
                         :class="{ 'p-invalid': !newPromo.discount_value }" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">Min Order Value</label>
            <InputNumber v-model="newPromo.min_order_value" mode="decimal" 
                         :min="0" class="w-full" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Usage Limit</label>
            <InputNumber v-model="newPromo.usage_limit" :min="1" class="w-full" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">Start Date *</label>
            <Calendar v-model="newPromo.start_date" dateFormat="yy-mm-dd" class="w-full" 
                      :class="{ 'p-invalid': !newPromo.start_date }" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">End Date *</label>
            <Calendar v-model="newPromo.end_date" dateFormat="yy-mm-dd" class="w-full" 
                      :class="{ 'p-invalid': !newPromo.end_date }" />
          </div>
        </div>
        
        <div class="field flex items-center">
          <Checkbox v-model="newPromo.is_first_time_only" :binary="true" inputId="firstTimeOnly" />
          <label for="firstTimeOnly" class="ml-2 font-semibold text-charcoal">One time use only</label>
        </div>

        <div class="field flex items-center">
          <Checkbox v-model="newPromo.is_active" :binary="true" inputId="isActive" :trueValue="true" :falseValue="false" />
          <label for="isActive" class="ml-2 font-semibold text-charcoal">Active</label>
        </div>
        
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" 
                @click="cancelAddPromo" :disabled="loadingAddPromo" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="savePromo" 
                :loading="loadingAddPromo" :disabled="!isValidPromo" />
      </template>
    </Dialog>

    <!-- EDIT PROMO DIALOG -->
    <Dialog v-model:visible="showEditPromoDialog" :header="editPromoDialogHeader" :modal="true" class="w-2/5">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Promo Code</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal font-mono font-bold">
            {{ editingPromo.promo_code }}
          </div>
          <small class="text-gray">Promo code cannot be changed</small>
        </div>
        
        <div class="field">
          <label class="font-semibold text-charcoal">Discount Type</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
            {{ editingPromo.discount_type }}
          </div>
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Discount Value</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
            {{ editingPromo.discount_type === 'Percentage' ? editingPromo.discount_value + '%' : '₱' + editingPromo.discount_value }}
          </div>
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Min Order Value</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
            ₱{{ editingPromo.min_order_value }}
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">End Date</label>
            <Calendar v-model="editingPromo.end_date" dateFormat="yy-mm-dd" class="w-full" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Usage Limit</label>
            <InputNumber v-model="editingPromo.usage_limit" :min="editingPromo.used_count || 0" class="w-full" />
          </div>
        </div>

        <div class="field flex items-center">
          <Checkbox v-model="editingPromo.is_active" :binary="true" inputId="editIsActive" 
                    :trueValue="true" :falseValue="false" />
          <label for="editIsActive" class="ml-2 font-semibold text-charcoal">Active</label>
        </div>
        
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" 
                @click="cancelEditPromo" :disabled="loadingUpdatePromo" />
        <Button label="Save Changes" icon="pi pi-check" class="save-btn" @click="updatePromo" 
                :loading="loadingUpdatePromo" />
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
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import SAService from '@/services/SAService'

const toast = useToast()

// Data
const searchQuery = ref('')
const showAddPromoDialog = ref(false)
const showEditPromoDialog = ref(false)
const promoCodes = ref([])
const loadingPromoCodes = ref(false)
const loadingAddPromo = ref(false)
const loadingUpdatePromo = ref(false)

const newPromo = ref({
  promo_code: '',
  discount_type: null,
  discount_value: 0,
  min_order_value: 0,
  is_first_time_only: false,
  start_date: null,
  end_date: null,
  usage_limit: 100,
  is_active: true
})

const editingPromo = ref({
  promo_code: '',
  discount_type: '',
  discount_value: 0,
  min_order_value: 0,
  end_date: null,
  usage_limit: 100,
  is_active: true,
  used_count: 0
})

const deletingPromo = ref(null)

const discountTypes = [
  { label: 'Percentage', value: 'Percentage' },
  { label: 'Fixed Amount', value: 'Fixed' }
]

// Computed properties
const filteredPromoCodes = computed(() => {
  if (!searchQuery.value) return promoCodes.value
  
  const query = searchQuery.value.toLowerCase()
  return promoCodes.value.filter(promo => 
    promo.promo_code.toLowerCase().includes(query)
  )
})

const isValidPromo = computed(() => {
  return newPromo.value.promo_code && 
         newPromo.value.discount_type && 
         newPromo.value.discount_value > 0 &&
         newPromo.value.start_date && 
         newPromo.value.end_date
})

const editPromoDialogHeader = computed(() => {
  return `Edit Promo Code: ${editingPromo.value.promo_code}`
})

const stats = computed(() => {
  const totalPromos = promoCodes.value.length
  const activePromos = promoCodes.value.filter(p => p.is_active).length
  const totalUsage = promoCodes.value.reduce((sum, promo) => sum + (promo.used_count || 0), 0)
  const totalDiscounts = promoCodes.value.reduce((sum, promo) => {
    const discount = promo.discount_type === 'Percentage' 
      ? (promo.discount_value / 100) * 1000 * (promo.used_count || 0)
      : promo.discount_value * (promo.used_count || 0)
    return sum + discount
  }, 0)

  return { totalPromos, activePromos, totalUsage, totalDiscounts }
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchPromoCodes = async () => {
  loadingPromoCodes.value = true
  try {
    const response = await SAService.getPromoCodes()
    promoCodes.value = response.data.codes || []
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load promo codes', 
      life: 3000 
    })
    promoCodes.value = []
  } finally {
    loadingPromoCodes.value = false
  }
}

const savePromo = async () => {
  loadingAddPromo.value = true
  try {
    // Format dates for backend
    const formatDateForBackend = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    const promoData = {
      promo_code: newPromo.value.promo_code,
      discount_type: newPromo.value.discount_type?.value || newPromo.value.discount_type,
      discount_value: Number(newPromo.value.discount_value),
      min_order_value: Number(newPromo.value.min_order_value) || 0,
      is_first_time_only: Boolean(newPromo.value.is_first_time_only),
      start_date: formatDateForBackend(newPromo.value.start_date),
      end_date: formatDateForBackend(newPromo.value.end_date),
      usage_limit: Number(newPromo.value.usage_limit) || 100,
      is_active: Boolean(newPromo.value.is_active)
    }

    await SAService.addPromoCode(promoData)
    
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Promo code added successfully', 
      life: 3000 
    })
    
    showAddPromoDialog.value = false
    resetNewPromo()
    await fetchPromoCodes()
    
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Failed to add promo code', 
      life: 3000 
    })
  } finally {
    loadingAddPromo.value = false
  }
}

const editPromo = (promo) => {
  editingPromo.value = {
    promo_code: promo.promo_code,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    min_order_value: promo.min_order_value,
    end_date: new Date(promo.end_date),
    usage_limit: promo.usage_limit,
    is_active: promo.is_active,
    used_count: promo.used_count || 0
  }
  showEditPromoDialog.value = true
}

const updatePromo = async () => {
  loadingUpdatePromo.value = true
  try {
    const updateData = {
      end_date: editingPromo.value.end_date,
      usage_limit: editingPromo.value.usage_limit,
      is_active: editingPromo.value.is_active
    }

    await SAService.updatePromoCode(editingPromo.value.promo_code, updateData)
    
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Promo code updated successfully', 
      life: 3000 
    })
    
    showEditPromoDialog.value = false
    await fetchPromoCodes()
    
  } catch (error) {
    console.error('Error updating promo code:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.message || 'Failed to update promo code', 
      life: 3000 
    })
  } finally {
    loadingUpdatePromo.value = false
  }
}

const cancelAddPromo = () => {
  showAddPromoDialog.value = false
  resetNewPromo()
}

const cancelEditPromo = () => {
  showEditPromoDialog.value = false
  resetEditingPromo()
}

const resetNewPromo = () => {
  newPromo.value = {
    promo_code: '',
    discount_type: null,
    discount_value: 0,
    min_order_value: 0,
    is_first_time_only: false,
    start_date: null,
    end_date: null,
    usage_limit: 100,
    is_active: true
  }
}

const resetEditingPromo = () => {
  editingPromo.value = {
    promo_code: '',
    discount_type: '',
    discount_value: 0,
    min_order_value: 0,
    end_date: null,
    usage_limit: 100,
    is_active: true,
    used_count: 0
  }
}

// Initialize data
onMounted(() => {
  fetchPromoCodes()
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

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>