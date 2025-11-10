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
        <DataTable :value="filteredPromoCodes" tableStyle="min-width: 60rem" :paginator="true" :rows="10">
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
                <span class="font-semibold text-charcoal">{{ slotProps.data.used_count }}</span>
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
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text delete-btn" 
                        @click="deletePromo(slotProps.data)" />
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
                      placeholder="Select Type" class="w-full" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">Discount Value *</label>
            <InputNumber v-model="newPromo.discount_value" mode="decimal" :min="0" 
                         :max="newPromo.discount_type?.value === 'percentage' ? 100 : 10000"
                         class="w-full" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">Min Order Value</label>
            <InputNumber v-model="newPromo.min_order_value" mode="currency" currency="PHP" 
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
            <Calendar v-model="newPromo.start_date" dateFormat="yy-mm-dd" class="w-full" />
          </div>
          
          <div class="field">
            <label class="font-semibold text-charcoal">End Date *</label>
            <Calendar v-model="newPromo.end_date" dateFormat="yy-mm-dd" class="w-full" />
          </div>
        </div>
        
        <div class="field flex items-center">
            <Checkbox v-model="newPromo.is_first_purchase" :binary="true" class="ml-2" />
            <small class="text-gray ml-2">Apply only for first-time customers</small>
        </div>
        
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="showAddPromoDialog = false" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="savePromo" />
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
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'

// Data
const searchQuery = ref('')
const showAddPromoDialog = ref(false)
const promoCodes = ref([])

const newPromo = ref({
  promo_code: '',
  discount_type: null,
  discount_value: 0,
  min_order_value: 0,
  is_first_purchase: false,
  start_date: null,
  end_date: null,
  used_count: 0,
  usage_limit: 100,
  is_active: true
})

const discountTypes = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed Amount', value: 'fixed' }
]

// TEMP data
const samplePromoCodes = [
  { 
    id: 1, 
    promo_code: 'SUMMER25', 
    discount_type: 'Percentage', 
    discount_value: 25, 
    min_order_value: 1000, 
    is_first_purchase: false,
    start_date: '2024-01-01', 
    end_date: '2024-12-31', 
    used_count: 45, 
    usage_limit: 100, 
    is_active: true 
  },
  { 
    id: 2, 
    promo_code: 'WELCOME10', 
    discount_type: 'Fixed', 
    discount_value: 200, 
    min_order_value: 500, 
    is_first_purchase: true,
    start_date: '2024-01-01', 
    end_date: '2024-06-30', 
    used_count: 89, 
    usage_limit: 200, 
    is_active: true 
  },
  { 
    id: 3, 
    promo_code: 'FREESHIP', 
    discount_type: 'Fixed', 
    discount_value: 150, 
    min_order_value: 2000, 
    is_first_purchase: false,
    start_date: '2024-03-01', 
    end_date: '2024-03-31', 
    used_count: 120, 
    usage_limit: 500, 
    is_active: false 
  },
  { 
    id: 4, 
    promo_code: 'BIGSALE50', 
    discount_type: 'Percentage', 
    discount_value: 50, 
    min_order_value: 3000, 
    is_first_purchase: false,
    start_date: '2024-02-01', 
    end_date: '2024-02-29', 
    used_count: 30, 
    usage_limit: 50, 
    is_active: true 
  }
]

// Computed properties
const filteredPromoCodes = computed(() => {
  if (!searchQuery.value) return promoCodes.value
  
  const query = searchQuery.value.toLowerCase()
  return promoCodes.value.filter(promo => 
    promo.promo_code.toLowerCase().includes(query)
  )
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const stats = computed(() => {
  const totalPromos = promoCodes.value.length
  const activePromos = promoCodes.value.filter(p => p.is_active).length
  const totalUsage = promoCodes.value.reduce((sum, promo) => sum + promo.used_count, 0)
  const totalDiscounts = promoCodes.value.reduce((sum, promo) => {
    const discount = promo.discount_type === 'Percentage' 
      ? (promo.discount_value / 100) * 1000 * promo.used_count
      : promo.discount_value * promo.used_count
    return sum + discount
  }, 0)

  return { totalPromos, activePromos, totalUsage, totalDiscounts }
})

// Initialize data
onMounted(() => {
  promoCodes.value = samplePromoCodes
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

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>