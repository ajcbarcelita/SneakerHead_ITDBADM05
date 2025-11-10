<template>
    <div class="flex flex-col bg-antiflash-white font-Montserrat">
        <!-- MAIN -->
        <main class="flex-1 container bg-antiflash-white">
            <div class="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-charcoal uppercase">
                    Manage Stock - {{ managerBranch }} Branch
                </h1>

                <!-- Notice to when it is red it is low stock -->
                <div class="mt-4 text-sm font-bold text-oxford-blue">
                    <span class="bg-red-100 text-red-700 font-semibold px-2 py-1 rounded">Red</span>
                    : Low stock (5 or less stockQty)!
                </div>

                <div class="flex items-center space-x-2">
                    <InputText v-model="searchQuery" placeholder="Search shoes..." class="w-72" />
                    <Button icon="pi pi-search" class="search-btn" />
                </div>
            </div>

            <!-- STOCK TABLE -->
            <div class="card">
                <DataTable :value="filteredShoes" tableStyle="min-width: 75rem" :paginator="true" :rows="10"
                    :rowsPerPageOptions="[5, 10, 20, 50]">
                    <!-- IMAGE -->
                    <Column header="Image">
                        <template #body="slotProps">
                            <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                                <img v-if="slotProps.data.image" :src="slotProps.data.image" :alt="slotProps.data.name"
                                    class="w-full h-full object-cover rounded" />
                                <i v-else class="pi pi-image text-gray text-2xl"></i>
                            </div>
                        </template>
                    </Column>

                    <!-- NAME & CATEGORY -->
                    <Column header="Shoe">
                        <template #body="slotProps">
                            <div>
                                <div class="font-semibold text-charcoal">{{ slotProps.data.name }}</div>
                                <div class="text-sm text-gray">{{ slotProps.data.category }}</div>
                            </div>
                        </template>
                    </Column>

                    <!-- PRICE -->
                    <Column field="price" header="Price">
                        <template #body="slotProps">
                            ₱{{ slotProps.data.price.toLocaleString() }}
                        </template>
                    </Column>

                    <!-- AVAILABLE SIZES (PER QUANTITY) -->
                    <Column header="Available Sizes">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-1 max-w-xs">
                                <!-- If size is less than or equal to 5 it would turn red -->
                                <span v-for="size in slotProps.data.sizes" :key="size.size"
                                    :class="['text-xs px-2 py-1 rounded',
                                        size.quantity <= 5 ? 'bg-red-100 text-red-700 font-semibold' : 'bg-green-100 text-green-700']">
                                    {{ size.size }}
                                </span>
                            </div>
                        </template>
                    </Column>
            
                    <!-- UPDATE STOCK BUTTON -->
                    <Column header="Update Stock">
                        <template #body="slotProps">
                            <Button label="Edit Stock" icon="pi pi-pencil" class="update-btn"
                                @click="openDialog(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- STAT CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card class="shadow-md border-t-4 border-oxford-blue">
                    <template #content>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-oxford-blue">{{ totalStock }}</div>
                            <p class="text-oxford-blue text-sm font-semibold">TOTAL STOCK</p>
                        </div>
                    </template>
                </Card>

                <Card class="shadow-md border-t-4 border-giants-orange">
                    <template #content>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-giants-orange">{{ lowStockCount }}</div>
                            <p class="text-giants-orange text-sm font-semibold">SIZES WITH LOW STOCK</p>
                        </div>
                    </template>
                </Card>

                <Card class="shadow-md border-t-4 border-charcoal">
                    <template #content>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-charcoal">{{ availableCount }}</div>
                            <p class="text-charcoal text-sm font-semibold">SIZES WITH AVAILABLE STOCK</p>
                        </div>
                    </template>
                </Card>
            </div>
        </main>

        <!-- DIALOG FOR SIZE STOCK UPDATE -->
        <Dialog v-model:visible="dialogVisible" modal header="Edit Stock by Size" :style="{ width: '30rem' }">
            <template #default>
                <div v-if="selectedShoe">
                    <div class="mb-4">
                        <h2 class="font-semibold text-xl text-charcoal">{{ selectedShoe.name }}</h2>
                        <p class="text-gray text-sm">{{ selectedShoe.category }}</p>
                    </div>

                    <div class="space-y-3">
                        <div v-for="size in selectedShoe.sizes" :key="size.size" class="flex items-center gap-8">
                            <span class="font-medium underline w-45">Size {{ size.size }}</span>
                            <InputNumber v-model="size.quantity" :min="0" :max="67" class="w-24" :useGrouping="false" />
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-6 text-gray">No item selected</div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 mt-6">
                    <Button label="Cancel" text @click="dialogVisible = false" />
                    <Button label="Save" icon="pi pi-save" class="update-btn" @click="saveDialog" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

const managerBranch = 'Cebu'
const searchQuery = ref('')
const dialogVisible = ref(false)
const selectedShoe = ref(null)

const shoes = ref([
    {
        id: 1,
        name: 'Nike Air Max 270',
        price: 7995,
        category: 'Lifestyle',
        image: '/images/nike-airmax-270.jpg',
        sizes: [
            { size: 8, quantity: 12 },
            { size: 9, quantity: 3 },
            { size: 10, quantity: 0 }
        ],
        totalStock: 15
    },
    {
        id: 2,
        name: 'Adidas Ultraboost 5.0',
        price: 8995,
        category: 'Running',
        image: '/images/adidas-ultraboost.jpg',
        sizes: [
            { size: 8, quantity: 2 },
            { size: 9, quantity: 1 },
            { size: 10, quantity: 0 },
            { size: 12, quantity: 2 }
        ],
        totalStock: 5
    },
    {
        id: 3,
        name: 'Jordan 1 Retro High',
        price: 12995,
        category: 'Basketball',
        image: '/images/jordan-1-retro.jpg',
        sizes: [
            { size: 9, quantity: 6 },
            { size: 10, quantity: 7 }
        ],
        totalStock: 13
    }
])

const filteredShoes = computed(() => {
    if (!searchQuery.value) return shoes.value
    const q = searchQuery.value.toLowerCase()
    return shoes.value.filter(
        shoe => shoe.name.toLowerCase().includes(q) || shoe.category.toLowerCase().includes(q)
    )
})

const totalStock = computed(() => shoes.value.reduce((sum, s) => sum + s.totalStock, 0))
// Count total sizes that are low stock (5 or less) -- s = shoe, sz = size
const lowStockCount = computed(() => shoes.value.reduce((count, s) => { return count + s.sizes.filter(sz => sz.quantity <= 5).length}, 0))
// Count total sizes that are available (More than 5)
const availableCount = computed(() => shoes.value.reduce((count, s) => { return count + s.sizes.filter(sz => sz.quantity > 5).length}, 0))

const openDialog = (shoe) => {
    selectedShoe.value = JSON.parse(JSON.stringify(shoe))
    // Ensure quantities are numbers
    selectedShoe.value.sizes = selectedShoe.value.sizes.map(s => ({
        ...s,
        quantity: Number(s.quantity) || 0
    }))
    dialogVisible.value = true
}

const saveDialog = () => {
    const index = shoes.value.findIndex(s => s.id === selectedShoe.value.id)
    if (index !== -1) {
        shoes.value[index].sizes = selectedShoe.value.sizes
        // Recalculate total stock
        shoes.value[index].totalStock = selectedShoe.value.sizes.reduce((sum, sz) => sum + sz.quantity, 0)
    }
    dialogVisible.value = false
}
</script>

<style scoped>
.search-btn.p-button {
    background-color: var(--color-oxford-blue);
    color: var(--color-antiflash-white);
    border: none;
}

.update-btn.p-button {
    background-color: var(--color-giants-orange);
}

.update-btn.p-button:hover {
    background-color: #d45601;
}
</style>
