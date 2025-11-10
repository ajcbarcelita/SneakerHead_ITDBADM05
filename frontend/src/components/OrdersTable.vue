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
          @date-select="onDateRangeChange"
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
          <span>{{ formatDate(data.created_at) }}</span>
        </template>
      </Column>

      <!-- Branch Column -->
      <Column field="branch_name" header="Branch" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <i class="pi pi-map-marker text-oxford-blue"></i>
            <span>{{ data.branch_name }}</span>
          </div>
        </template>
      </Column>

      <!-- Items Count Column -->
      <Column field="items_count" header="Items" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <Tag :value="data.items_count + ' items'" severity="info" />
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
                    :src="item.shoe_image"
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

            <Column field="shoe_size" header="Size" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span>US {{ item.shoe_size }}</span>
              </template>
            </Column>

            <Column field="quantity" header="Quantity" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span>{{ item.quantity }}</span>
              </template>
            </Column>

            <Column field="price_at_purchase" header="Price" style="min-width: 10rem">
              <template #body="{ data: item }">
                <span>₱{{ formatPrice(item.price_at_purchase) }}</span>
              </template>
            </Column>

            <Column field="subtotal" header="Subtotal" style="min-width: 10rem">
              <template #body="{ data: item }">
                <span class="font-bold text-giants-orange">₱{{ formatPrice(item.subtotal) }}</span>
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
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'

// Sample orders data (replace with API call)
// Data structure matches database schema:
// orders: order_id, user_id, branch_id, total_price, promo_code, created_at
// order_items: order_item_id, order_id, shoe_id, shoe_size, branch_id, quantity, price_at_purchase, subtotal, created_at
// Note: branch_name, shoe_name, brand_name, shoe_image are joined from related tables (branches, shoes, brands, shoe_images)
const orders = ref([
  {
    order_id: 1001,
    user_id: 1,
    branch_id: 1,
    branch_name: 'Sneakerhead Manila', // joined from branches table
    total_price: 15999.00,
    promo_code: null,
    created_at: '2024-11-01T10:30:00',
    items_count: 2, // calculated from order_items count
    items: [
      {
        order_item_id: 1,
        order_id: 1001,
        shoe_id: 1,
        shoe_size: 10.5,
        branch_id: 1,
        quantity: 1,
        price_at_purchase: 8999.00,
        subtotal: 8999.00,
        created_at: '2024-11-01T10:30:00',
        // Joined data from related tables:
        shoe_name: 'Air Jordan 1 Retro High', // from shoes.name
        brand_name: 'Nike', // from ref_shoe_brands.brand_name via shoes.brand_id
        shoe_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' // from shoe_images table
      },
      {
        order_item_id: 2,
        order_id: 1001,
        shoe_id: 2,
        shoe_size: 11.0,
        branch_id: 1,
        quantity: 1,
        price_at_purchase: 7000.00,
        subtotal: 7000.00,
        created_at: '2024-11-01T10:30:00',
        shoe_name: 'Yeezy Boost 350 V2',
        brand_name: 'Adidas',
        shoe_image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400'
      }
    ]
  },
  {
    order_id: 1002,
    user_id: 1,
    branch_id: 2,
    branch_name: 'Sneakerhead Makati',
    total_price: 12500.00,
    promo_code: 'WELCOME10',
    created_at: '2024-11-05T14:15:00',
    items_count: 3,
    items: [
      {
        order_item_id: 3,
        order_id: 1002,
        shoe_id: 3,
        shoe_size: 9.0,
        branch_id: 2,
        quantity: 2,
        price_at_purchase: 2999.00,
        subtotal: 5998.00,
        created_at: '2024-11-05T14:15:00',
        shoe_name: 'Chuck Taylor All Star',
        brand_name: 'Converse',
        shoe_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400'
      },
      {
        order_item_id: 4,
        order_id: 1002,
        shoe_id: 4,
        shoe_size: 10.0,
        branch_id: 2,
        quantity: 1,
        price_at_purchase: 4500.00,
        subtotal: 4500.00,
        created_at: '2024-11-05T14:15:00',
        shoe_name: 'New Balance 574',
        brand_name: 'New Balance',
        shoe_image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400'
      },
      {
        order_item_id: 5,
        order_id: 1002,
        shoe_id: 5,
        shoe_size: 11.5,
        branch_id: 2,
        quantity: 1,
        price_at_purchase: 6500.00,
        subtotal: 6500.00,
        created_at: '2024-11-05T14:15:00',
        shoe_name: 'Air Max 90',
        brand_name: 'Nike',
        shoe_image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400'
      }
    ]
  },
  {
    order_id: 1003,
    user_id: 1,
    branch_id: 1,
    branch_name: 'Sneakerhead Manila',
    total_price: 8999.00,
    promo_code: null,
    created_at: '2024-11-08T09:45:00',
    items_count: 1,
    items: [
      {
        order_item_id: 6,
        order_id: 1003,
        shoe_id: 6,
        shoe_size: 9.5,
        branch_id: 1,
        quantity: 1,
        price_at_purchase: 3999.00,
        subtotal: 3999.00,
        created_at: '2024-11-08T09:45:00',
        shoe_name: 'Old Skool',
        brand_name: 'Vans',
        shoe_image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400'
      }
    ]
  },
  {
    order_id: 1004,
    user_id: 1,
    branch_id: 3,
    branch_name: 'Sneakerhead Quezon City',
    total_price: 21999.00,
    promo_code: null,
    created_at: '2024-11-09T16:20:00',
    items_count: 2,
    items: [
      {
        order_item_id: 7,
        order_id: 1004,
        shoe_id: 7,
        shoe_size: 10.0,
        branch_id: 3,
        quantity: 1,
        price_at_purchase: 5999.00,
        subtotal: 5999.00,
        created_at: '2024-11-09T16:20:00',
        shoe_name: 'Air Force 1',
        brand_name: 'Nike',
        shoe_image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
      },
      {
        order_item_id: 8,
        order_id: 1004,
        shoe_id: 8,
        shoe_size: 11.0,
        branch_id: 3,
        quantity: 1,
        price_at_purchase: 9500.00,
        subtotal: 9500.00,
        created_at: '2024-11-09T16:20:00',
        shoe_name: 'Ultra Boost',
        brand_name: 'Adidas',
        shoe_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400'
      }
    ]
  },
  {
    order_id: 1005,
    user_id: 1,
    branch_id: 2,
    branch_name: 'Sneakerhead Makati',
    total_price: 4999.00,
    promo_code: 'SUMMER20',
    created_at: '2024-10-28T11:00:00',
    items_count: 1,
    items: [
      {
        order_item_id: 9,
        order_id: 1005,
        shoe_id: 9,
        shoe_size: 9.0,
        branch_id: 2,
        quantity: 1,
        price_at_purchase: 3499.00,
        subtotal: 3499.00,
        created_at: '2024-10-28T11:00:00',
        shoe_name: 'Classic Leather',
        brand_name: 'Reebok',
        shoe_image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400'
      }
    ]
  }
])

const loading = ref(false)
const expandedRows = ref([])
const searchValue = ref('')
const dateRange = ref(null)

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

const onDateRangeChange = () => {
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    orders.value = orders.value.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= startDate && orderDate <= endDate
    })
  }
}

const clearFilters = () => {
  searchValue.value = ''
  dateRange.value = null
  // TODO: Fetch original data from API
  console.log('Filters cleared')
}

// Lifecycle
onMounted(() => {
  // TODO: Fetch orders from API
  // Example: await fetchOrderHistory()
  console.log('Order history component mounted')
})
</script>

<style scoped>
/* Custom color scheme variables */
:deep(.p-datatable) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-datatable-header) {
  background-color: #102540;
  color: #F3F3F3;
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

.border-giants-orange {
  border-color: #EA662D;
}

.hover\:bg-oxford-blue:hover {
  background-color: #102540;
}

.hover\:bg-giants-orange:hover {
  background-color: #EA662D;
}
</style>
