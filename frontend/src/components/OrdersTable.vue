<template>
  <div class="card">
    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-4">
      <!-- Global Search -->
      <div class="flex-1">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="searchValue"
            placeholder="Search orders..."
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Date Range Filter -->
      <div class="w-full md:w-64">
        <DatePicker
          v-model="dateRange"
          selectionMode="range"
          :manualInput="false"
          placeholder="Filter by Date Range"
          dateFormat="mm/dd/yy"
          class="w-full"
        />
      </div>

      <!-- Clear Filters Button -->
      <Button
        label="Clear"
        icon="pi pi-filter-slash"
        outlined
        @click="clearFilters"
        class="text-oxford-blue border-oxford-blue hover:bg-oxford-blue hover:text-white"
      />
    </div>

    <!-- Data Table -->
    <DataTable
      v-model:expandedRows="expandedRows"
      :value="orders"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      dataKey="order_id"
      sortMode="multiple"
      removableSort
      tableStyle="min-width: 50rem"
    >
      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray mb-3"></i>
          <p class="text-gray">No orders found.</p>
        </div>
      </template>

      <template #loading>
        <div class="flex items-center justify-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-oxford-blue"></i>
        </div>
      </template>

      <!-- Expand Column -->
      <Column expander style="width: 3rem" />

      <!-- Order ID Column -->
      <Column field="order_id" header="Order ID" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span class="font-semibold text-oxford-blue">#{{ data.order_id }}</span>
        </template>
      </Column>

      <!-- Date Column -->
      <Column field="created_at" header="Order Date" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <span class="text-charcoal">{{ formatDate(data.created_at) }}</span>
        </template>
      </Column>

      <!-- Branch Column -->
      <Column field="branch_name" header="Branch" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <i class="pi pi-map-marker text-oxford-blue"></i>
            <span class="text-charcoal">{{ data.branch_name }}</span>
          </div>
        </template>
      </Column>

      <!-- Items Count Column -->
      <Column field="items_count" header="Items" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <Tag :value="data.items_count + ' items'" severity="info" class="bg-oxford-blue text-white-smoke" />
        </template>
      </Column>

      <!-- Total Price Column -->
      <Column field="total_price" header="Total" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span class="font-bold text-giants-orange">₱{{ formatPrice(data.total_price) }}</span>
        </template>
      </Column>

      <!-- Promo Code Column -->
      <Column field="promo_code" header="Promo Code" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <Tag v-if="data.promo_code" :value="data.promo_code" severity="success" icon="pi pi-tag" />
          <span v-else class="text-gray text-sm">—</span>
        </template>
      </Column>

      <!-- Expanded Row Template - Order Items -->
      <template #expansion="{ data }">
        <div class="p-4 bg-white-smoke">
          <h3 class="text-lg font-bold text-oxford-blue mb-4">Order Items</h3>
          <DataTable :value="data.items" tableStyle="min-width: 50rem">
            <Column field="shoe_name" header="Product" style="min-width: 15rem">
              <template #body="{ data: item }">
                <div class="flex items-center gap-3">
                  <img
                    :src="item.image_url"
                    :alt="item.shoe_name"
                    class="w-16 h-16 object-cover rounded shadow-sm"
                  />
                  <div>
                    <div class="font-semibold text-oxford-blue">{{ item.shoe_name }}</div>
                    <div class="text-sm text-gray">{{ item.brand_name }}</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="size" header="Size" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">US {{ item.size }}</span>
              </template>
            </Column>

            <Column field="quantity" header="Quantity" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">{{ item.quantity }}</span>
              </template>
            </Column>

            <Column field="price_at_purchase" header="Price" style="min-width: 10rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">₱{{ formatPrice(item.price_at_purchase) }}</span>
              </template>
            </Column>

            <Column header="Subtotal" style="min-width: 10rem">
              <template #body="{ data: item }">
                <span class="font-bold text-giants-orange">₱{{ formatPrice(item.quantity * item.price_at_purchase) }}</span>
              </template>
            </Column>
          </DataTable>

          <!-- Order Summary -->
          <div class="mt-4 flex justify-end">
            <div class="bg-white p-4 rounded-lg shadow-sm" style="min-width: 300px">
              <div v-if="data.promo_code" class="flex justify-between mb-2">
                <div class="flex items-center gap-2">
                  <i class="pi pi-tag text-green-600"></i>
                  <span class="text-gray">Promo Code Applied:</span>
                </div>
                <span class="font-semibold text-green-600">{{ data.promo_code }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t pt-2" :class="{ 'mt-2': data.promo_code }">
                <span class="text-oxford-blue">Order Total:</span>
                <span class="text-giants-orange">₱{{ formatPrice(data.total_price) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Paginator -->
      <template #paginatorcontainer="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
        <div class="flex items-center gap-4 border border-oxford-blue bg-transparent rounded-full w-full py-1 px-2 justify-between">
          <Button
            icon="pi pi-chevron-left"
            rounded
            text
            @click="prevPageCallback"
            :disabled="page === 0"
            class="text-oxford-blue"
          />
          <div class="text-oxford-blue font-medium">
            <span class="hidden sm:block">Showing {{ first }} to {{ last }} of {{ totalRecords }} orders</span>
            <span class="block sm:hidden">Page {{ page + 1 }} of {{ pageCount }}</span>
          </div>
          <Button
            icon="pi pi-chevron-right"
            rounded
            text
            @click="nextPageCallback"
            :disabled="page === pageCount - 1"
            class="text-oxford-blue"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import orderService from '@/services/orderService.js'

const orders = ref([])
const allOrders = ref([]) // Store original data for filtering
const loading = ref(false)
const expandedRows = ref([])
const searchValue = ref('')
const dateRange = ref(null)
const toast = useToast()

// Computed filtered orders based on search and date range
const filteredOrders = computed(() => {
  let filtered = allOrders.value

  // Apply search filter
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase()
    filtered = filtered.filter(order => {
      const orderIdMatch = String(order.order_id).toLowerCase().includes(search)
      const branchMatch = (order.branch_name || '').toLowerCase().includes(search)
      return orderIdMatch || branchMatch
    })
  }

  // Apply date range filter
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0])
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999)

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  return filtered
})

// Watch search and date range changes
watch([searchValue, dateRange], () => {
  orders.value = filteredOrders.value
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const fetchOrderHistory = async () => {
  try {
    loading.value = true
    const data = await orderService.getOrderHistory()

    // Transform data to include items_count
    allOrders.value = data.map(order => ({
      ...order,
      items_count: order.items?.length || 0
    }))

    orders.value = allOrders.value
  } catch (error) {
    console.error('Failed to fetch order history:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load orders',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const clearFilters = async () => {
  searchValue.value = ''
  dateRange.value = null
  await fetchOrderHistory()
}

// Lifecycle
onMounted(() => {
  fetchOrderHistory()
})

</script>

<style scoped>
:deep(.p-datatable) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #102540;
  color: #F3F3F3;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #F1F3F2;
}

:deep(.p-paginator) {
  background-color: transparent;
}

.text-oxford-blue {
  color: #102540;
}

.text-giants-orange {
  color: #EA662D;
}

.text-white-smoke {
  color: #F3F3F3;
}

.text-charcoal {
  color: #313D4D;
}

.text-gray {
  color: #777B7E;
}

.bg-white-smoke {
  background-color: #F3F3F3;
}

.bg-oxford-blue {
  background-color: #102540;
}

.border-oxford-blue {
  border-color: #102540;
}
</style>
