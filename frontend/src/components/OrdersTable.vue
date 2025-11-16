<template>
  <div class="card">
    <!-- Data Table -->
    <DataTable
      :value="orders"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      dataKey="order_id"
      sortMode="multiple"
      removableSort
      tableStyle="min-width: 50rem"
      v-model:expandedRows="expandedRows"
      @row-expand="onRowExpand"
      @row-collapse="onRowCollapse"
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
      <Column expander style="width: 5rem"></Column>

      <!-- Order ID Column -->
      <Column field="order_id" header="Order ID" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <span class="font-semibold text-oxford-blue">#{{ data.order_id }}</span>
        </template>
      </Column>

      <!-- Date Column -->
      <Column field="order_created_at" header="Date" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span class="text-charcoal">{{ formatDate(data.order_created_at) }}</span>
        </template>
      </Column>

      <!-- Branch Column -->
      <Column field="branch_name" header="Branch" sortable style="min-width: 10rem">
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
          <span class="text-charcoal font-medium">{{ data.items_count }}</span>
        </template>
      </Column>

      <!-- Promo Code Column -->
      <Column field="promo_code" header="Promo Code" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span v-if="data.promo_code" class="text-giants-orange font-semibold">{{ data.promo_code }}</span>
          <span v-else class="text-gray">—</span>
        </template>
      </Column>

      <!-- Total Column -->
      <Column field="total_price" header="Total" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span class="font-bold text-giants-orange">₱{{ formatPrice(data.total_price) }}</span>
        </template>
      </Column>

      <!-- Expandable Row with Order Items -->
      <template #expansion="{ data }">
        <div class="p-4 bg-white-smoke">
          <DataTable :value="data.items" dataKey="order_item_id" tableStyle="min-width: 100%">
            <Column header="Product" style="min-width: 20rem">
              <template #body="{ data: item }">
                <div class="flex items-center gap-3">
                  <img
                    :src="item.image_url"
                    :alt="item.shoe_name"
                    class="w-12 h-12 object-cover rounded shadow-sm"
                  />
                  <div>
                    <div class="font-semibold text-oxford-blue">{{ item.shoe_name }}</div>
                    <div class="text-sm text-gray">{{ item.brand_name }}</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="size" header="Size" style="min-width: 6rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">US {{ item.size }}</span>
              </template>
            </Column>

            <Column field="quantity" header="Qty" style="min-width: 6rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">{{ item.quantity }}</span>
              </template>
            </Column>

            <Column field="price_at_purchase" header="Price" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span class="text-charcoal">₱{{ formatPrice(item.price_at_purchase) }}</span>
              </template>
            </Column>

            <Column header="Subtotal" style="min-width: 8rem">
              <template #body="{ data: item }">
                <span class="font-bold text-giants-orange">₱{{ formatPrice(item.quantity * item.price_at_purchase) }}</span>
              </template>
            </Column>
          </DataTable>
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
            <span class="hidden sm:block">Showing {{ first }} to {{ last }} of {{ totalRecords }} items</span>
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
import { useToast } from 'primevue/usetoast'
import orderService from '@/services/orderService.js'

const orders = ref([])
const expandedRows = ref([])
const loading = ref(false)
const toast = useToast()

// Methods
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const clusterOrders = (items) => {
  const ordersMap = new Map()

  for (const item of items) {
    if (!ordersMap.has(item.order_id)) {
      ordersMap.set(item.order_id, {
        order_id: item.order_id,
        order_created_at: item.order_created_at,
        branch_name: item.branch_name,
        promo_code: item.promo_code || null,
        total_price: item.total_price,
        items: [],
        items_count: 0
      })
    }

    const order = ordersMap.get(item.order_id)
    order.items.push(item)
    order.items_count = order.items.length
  }

  return Array.from(ordersMap.values()).sort(
    (a, b) => new Date(b.order_created_at) - new Date(a.order_created_at)
  )
}

const fetchOrderHistory = async () => {
  try {
    loading.value = true
    const data = await orderService.getOrderHistory()

    // Cluster flat items into grouped orders with items
    orders.value = clusterOrders(data)
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

const onRowExpand = (event) => {
  console.log('Row expanded:', event.data)
}

const onRowCollapse = (event) => {
  console.log('Row collapsed:', event.data)
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
