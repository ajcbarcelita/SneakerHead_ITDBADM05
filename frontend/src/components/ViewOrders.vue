<template>
  <!-- MAIN -->
  <main class="flex-1 container mx-auto space-y-8 bg-antiflash-white">
    <h1 class="text-2xl font-bold text-charcoal uppercase mb-6 mt-3">
      Branch Orders Overview
    </h1>

    <!-- Search and Filter Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-4">
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

      <div class="w-full md:w-64">
        <DatePicker
          v-model="dateRange"
          selectionMode="range"
          :manualInput="false"
          placeholder="Filter by Date Range"
          dateFormat="mm/dd/yy"
          class="w-full"
          @date-select="applyFilters"
        />
      </div>

      <Button
        label="Clear"
        icon="pi pi-filter-slash"
        outlined
        @click="clearFilters"
        class="text-oxford-blue border-oxford-blue hover:bg-oxford-blue hover:text-white"
      />
    </div>

    <!-- Branch Orders Table -->
    <Card class="shadow-md">
      <template #title>All Orders for {{ branchName }}</template>
      <template #content>
        <DataTable
          v-model:expandedRows="expandedRows"
          :value="filteredOrders"
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
              <p class="text-gray">No orders found for this branch.</p>
            </div>
          </template>

          <template #loading>
            <div class="flex items-center justify-center py-8">
              <i class="pi pi-spin pi-spinner text-4xl text-oxford-blue"></i>
            </div>
          </template>

          <Column expander style="width: 4rem" />
          <Column field="order_id" header="Order ID" sortable>
            <template #body="{ data }">
              <span class="font-semibold text-oxford-blue">#{{ data.order_id }}</span>
            </template>
          </Column>

          <Column field="full_name" header="Full Name" sortable>
            <template #body="{ data }">
              <span class="font-semibold text-oxford-blue">{{ data.full_name }}</span>
            </template>
          </Column>

          <Column field="created_at" header="Order Date" sortable>
            <template #body="{ data }">
              <span>{{ formatDate(data.created_at) }}</span>
            </template>
          </Column>

          <Column field="items_count" header="Item Qty" sortable>
            <template #body="{ data }">
              <Tag :value="data.items_count + ' items'" severity="info" />
            </template>
          </Column>

          <Column field="total_price" header="Total (in PHP)" sortable>
            <template #body="{ data }">
              <span class="font-bold text-giants-orange">
                ₱{{ formatPrice(data.total_price) }}
              </span>
            </template>
          </Column>

          <Column field="promo_code" header="Promo Code Used" sortable>
            <template #body="{ data }">
              <Tag :value="data.promo_code || 'None'" severity="success" />
            </template>
          </Column>

          <!-- Expanded Row -->
          <template #expansion="{ data }">
            <div class="p-4 bg-white-smoke rounded-lg">
              <h3 class="text-lg font-bold text-oxford-blue mb-4">Order Items</h3>
              <DataTable :value="data.items" tableStyle="min-width: 50rem">
                <Column field="shoe_name" header="Product">
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
                <Column field="shoe_size" header="Size" />
                <Column field="quantity" header="Qty" />
                <Column field="subtotal" header="Subtotal">
                  <template #body="{ data: item }">
                    <span class="font-bold text-giants-orange">
                      ₱{{ formatPrice(item.subtotal) }}
                    </span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BMService from "@/services/BMService";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import DatePicker from "primevue/datepicker";

// Reactive state
const branchName = "Sneakerhead Manila";
const branchId = 1;
const loading = ref(false);
const expandedRows = ref([]);
const searchValue = ref("");
const dateRange = ref(null);
const orders = ref([]);

// Fetch orders from backend
const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await BMService.getOrders(branchId);
    orders.value = res.data;
  } catch (err) {
    console.error("Failed to fetch orders:", err);
  } finally {
    loading.value = false;
  }
};

// Filters
const filteredOrders = computed(() => {
  let result = [...orders.value];

  // Search filter
  if (searchValue.value) {
    const q = searchValue.value.trim().toLowerCase().replace(/^#/, "");
    result = result.filter(
      (o) =>
        o.order_id.toString().includes(q) ||
        o.full_name.toLowerCase().includes(q)
    );
  }

  // Date range filter
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const start = new Date(dateRange.value[0]);
    const end = new Date(dateRange.value[1]);
    result = result.filter((o) => {
      const d = new Date(o.created_at);
      return d >= start && d <= end;
    });
  }

  return result;
});

const applyFilters = async () => {
  await fetchOrders(); // Re-fetch orders to apply filters
};

const clearFilters = async () => {
  searchValue.value = "";
  dateRange.value = null;
  await fetchOrders(); // Re-fetch all orders
};

// Utils
const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatPrice = (price) =>
  parseFloat(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

onMounted(() => {
  fetchOrders();
});
</script>
