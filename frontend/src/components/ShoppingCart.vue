<template>
    <div class="card font-Montserrat">
        <DataTable :value="cartItems" tableStyle="min-width: 50rem" class="shadow-md">
            <!-- Shoe Image -->
            <Column header="Image" style="width: 120px">
                <template #body="slotProps">
                    <img
                        :src="slotProps.data.shoe_image || '/placeholder-shoe.png'"
                        :alt="slotProps.data.shoe_name"
                        class="w-20 h-20 object-cover rounded border border-gray"
                    />
                </template>
            </Column>

            <!-- Shoe Name -->
            <Column field="shoe_name" header="Product" class="font-semibold">
                <template #body="slotProps">
                    <div>
                        <div class="font-semibold text-charcoal">{{ slotProps.data.shoe_name }}</div>
                        <div class="text-sm text-gray">{{ slotProps.data.brand_name }}</div>
                    </div>
                </template>
            </Column>

            <!-- Size -->
            <Column field="shoe_us_size" header="Size" style="width: 100px">
                <template #body="slotProps">
                    <span class="font-medium">US {{ slotProps.data.shoe_us_size }}</span>
                </template>
            </Column>

            <!-- Price -->
            <Column field="price_at_addition" header="Price" style="width: 120px">
                <template #body="slotProps">
                    <span class="font-semibold text-charcoal">
                        {{ formatCurrency(slotProps.data.price_at_addition) }}
                    </span>
                </template>
            </Column>

            <!-- Quantity -->
            <Column header="Quantity" style="width: 150px">
                <template #body="slotProps">
                    <div class="flex items-center gap-2">
                        <Button
                            icon="pi pi-minus"
                            size="small"
                            outlined
                            @click="decreaseQuantity(slotProps.data)"
                            :disabled="slotProps.data.quantity <= 1"
                            class="w-8 h-8"
                        />
                        <span class="font-semibold w-8 text-center">{{ slotProps.data.quantity }}</span>
                        <Button
                            icon="pi pi-plus"
                            size="small"
                            outlined
                            @click="increaseQuantity(slotProps.data)"
                            class="w-8 h-8"
                        />
                    </div>
                </template>
            </Column>

            <!-- Subtotal -->
            <Column header="Subtotal" style="width: 130px">
                <template #body="slotProps">
                    <span class="font-bold text-oxford-blue">
                        {{ formatCurrency(slotProps.data.price_at_addition * slotProps.data.quantity) }}
                    </span>
                </template>
            </Column>

            <!-- Actions -->
            <Column header="Actions" style="width: 100px">
                <template #body="slotProps">
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        @click="removeItem(slotProps.data)"
                        class="hover:bg-red-100"
                    />
                </template>
            </Column>

            <!-- Footer with Total -->
            <template #footer>
                <div class="bg-white-smoke text-charcoal px-4 py-4 rounded-b-lg">
                    <div class="flex items-center justify-between">
                        <span class="font-semibold text-lg">
                            Total Items: {{ cartItems ? cartItems.length : 0 }}
                        </span>
                        <div class="text-right">
                            <div class="text-sm text-gray">Total Amount:</div>
                            <div class="text-2xl font-bold text-oxford-blue">
                                {{ formatCurrency(totalAmount) }}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-4">
                        <Button
                            icon="pi pi-trash"
                            label="Clear Cart"
                            severity="danger"
                            outlined
                            @click="clearCart"
                            class="flex-1 text-red-600 border-red-600 hover:bg-red-50 font-bold py-3"
                        />
                        <Button
                            label="Proceed to Checkout"
                            icon="pi pi-shopping-cart"
                            class="flex-1 bg-giants-orange border-giants-orange hover:bg-giants-orange/90 text-white font-bold py-3"
                            @click="proceedToCheckout"
                        />
                    </div>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const router = useRouter()

// Sample cart items - replace with actual API call
const cartItems = ref([
    {
        cart_item_id: 1,
        shoe_id: 101,
        shoe_name: 'Air Jordan 1 Retro High',
        brand_name: 'Nike',
        shoe_us_size: 10.0,
        shoe_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
        price_at_addition: 8500.00,
        quantity: 2,
        branch_id: 1
    },
    {
        cart_item_id: 2,
        shoe_id: 102,
        shoe_name: 'Yeezy Boost 350 V2',
        brand_name: 'Adidas',
        shoe_us_size: 9.5,
        shoe_image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&fit=crop',
        price_at_addition: 12500.00,
        quantity: 1,
        branch_id: 1
    },
    {
        cart_item_id: 3,
        shoe_id: 103,
        shoe_name: 'Chuck Taylor All Star',
        brand_name: 'Converse',
        shoe_us_size: 11.0,
        shoe_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
        price_at_addition: 3200.00,
        quantity: 1,
        branch_id: 2
    },
    {
        cart_item_id: 4,
        shoe_id: 104,
        shoe_name: 'New Balance 574',
        brand_name: 'New Balance',
        shoe_us_size: 10.5,
        shoe_image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&h=300&fit=crop',
        price_at_addition: 4800.00,
        quantity: 3,
        branch_id: 1
    }
])

onMounted(() => {
    // TODO: Fetch cart items from API
    // Example structure based on shopping_cart_items table:
    // cartItems.value = await fetchCartItems(userId)
})

const totalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => {
        return total + (item.price_at_addition * item.quantity)
    }, 0)
})

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(value)
}

const increaseQuantity = (item) => {
    item.quantity++
    // TODO: Update quantity in database
}

const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
        item.quantity--
        // TODO: Update quantity in database
    }
}

const removeItem = (item) => {
    const index = cartItems.value.indexOf(item)
    if (index > -1) {
        cartItems.value.splice(index, 1)
        // TODO: Remove item from database
    }
}

const clearCart = () => {
    // TODO: Add confirmation dialog
    cartItems.value = []
    // TODO: Clear cart in database
}

const proceedToCheckout = () => {
    // Navigate to checkout page
    router.push('/checkout')
}

</script>
