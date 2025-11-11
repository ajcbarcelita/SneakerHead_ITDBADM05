<template>
    <div class="card font-Montserrat">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-oxford-blue"></i>
            <p class="mt-4 text-gray">Loading cart...</p>
        </div>

        <!-- Empty Cart State -->
        <div v-else-if="!cartItems || cartItems.length === 0" class="text-center py-12">
            <i class="pi pi-shopping-cart text-6xl text-gray mb-4"></i>
            <h3 class="text-2xl font-bold text-charcoal mb-2">Your cart is empty</h3>
            <p class="text-gray mb-6">Add some items to get started!</p>
        </div>

        <!-- Cart Table -->
        <DataTable v-else :value="cartItems" tableStyle="min-width: 50rem" class="shadow-md">
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
                        <!-- Stock Warning -->
                        <div v-if="!slotProps.data.is_in_stock" class="text-xs text-red-600 mt-1">
                            <i class="pi pi-exclamation-triangle"></i> Out of stock
                        </div>
                    </div>
                </template>
            </Column>

            <!-- Size -->
            <Column field="size" header="Size" style="width: 100px">
                <template #body="slotProps">
                    <span class="font-medium">US {{ slotProps.data.size }}</span>
                </template>
            </Column>

            <!-- Price -->
            <Column field="price" header="Price" style="width: 120px">
                <template #body="slotProps">
                    <span class="font-semibold text-charcoal">
                        {{ formatCurrency(slotProps.data.price) }}
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
                            :disabled="slotProps.data.quantity >= slotProps.data.available_stock"
                            class="w-8 h-8"
                        />
                    </div>
                    <div v-if="slotProps.data.available_stock" class="text-xs text-gray mt-1">
                        {{ slotProps.data.available_stock }} available
                    </div>
                </template>
            </Column>

            <!-- Subtotal -->
            <Column header="Subtotal" style="width: 130px">
                <template #body="slotProps">
                    <span class="font-bold text-oxford-blue">
                        {{ formatCurrency(slotProps.data.subtotal) }}
                    </span>
                </template>
            </Column>

            <!-- Delete -->
            <Column header="" style="width: 100px">
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
                        <div>
                            <span class="font-semibold text-lg">
                                Total Items: {{ cartData?.total_items || 0 }}
                            </span>
                            <div v-if="cartData?.branch_name" class="text-sm text-gray mt-1">
                                <i class="pi pi-map-marker"></i> {{ cartData.branch_name }}
                            </div>
                        </div>
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
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import cartService from '../services/cartService.js'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const cartItems = ref([])
const cartData = ref(null)
const loading = ref(false)

onMounted(async () => {
    await fetchCart()
})

/**
 * Fetch cart data from backend
 */
const fetchCart = async () => {
    try {
        loading.value = true
        const data = await cartService.getCart()
        cartData.value = data
        cartItems.value = data.items || []
    } catch (error) {
        console.error('Failed to fetch cart:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load shopping cart',
            life: 3000
        })
        cartItems.value = []
    } finally {
        loading.value = false
    }
}

const totalAmount = computed(() => {
    return cartData.value?.subtotal || 0
})

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(value)
}

const increaseQuantity = async (item) => {
    const newQuantity = item.quantity + 1

    // Check if exceeds available stock
    if (newQuantity > item.available_stock) {
        toast.add({
            severity: 'warn',
            summary: 'Stock Limit',
            detail: `Only ${item.available_stock} units available in stock`,
            life: 3000
        })
        return
    }

    try {
        await cartService.updateCartItem(item.cart_item_id, newQuantity)
        item.quantity = newQuantity
        await fetchCart() // Refresh to get updated totals

        toast.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Cart updated successfully',
            life: 2000
        })
    } catch (error) {
        console.error('Failed to update quantity:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.error || 'Failed to update quantity',
            life: 3000
        })
    }
}

const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) return

    const newQuantity = item.quantity - 1

    try {
        await cartService.updateCartItem(item.cart_item_id, newQuantity)
        item.quantity = newQuantity
        await fetchCart() // Refresh to get updated totals

        toast.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Cart updated successfully',
            life: 2000
        })
    } catch (error) {
        console.error('Failed to update quantity:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.error || 'Failed to update quantity',
            life: 3000
        })
    }
}

const removeItem = async (item) => {
    confirm.require({
        message: `Remove ${item.shoe_name} from cart?`,
        header: 'Confirm Removal',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await cartService.removeFromCart(item.cart_item_id)
                await fetchCart() // Refresh cart

                toast.add({
                    severity: 'success',
                    summary: 'Removed',
                    detail: 'Item removed from cart',
                    life: 2000
                })
            } catch (error) {
                console.error('Failed to remove item:', error)
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to remove item from cart',
                    life: 3000
                })
            }
        }
    })
}

const clearCart = () => {
    if (cartItems.value.length === 0) {
        toast.add({
            severity: 'info',
            summary: 'Cart Empty',
            detail: 'Your cart is already empty',
            life: 2000
        })
        return
    }

    confirm.require({
        message: 'Are you sure you want to clear your entire cart?',
        header: 'Clear Cart',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await cartService.clearCart()
                await fetchCart() // Refresh cart

                toast.add({
                    severity: 'success',
                    summary: 'Cleared',
                    detail: 'Cart has been cleared',
                    life: 2000
                })
            } catch (error) {
                console.error('Failed to clear cart:', error)
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to clear cart',
                    life: 3000
                })
            }
        }
    })
}

const proceedToCheckout = () => {
    if (cartItems.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Cart Empty',
            detail: 'Please add items to your cart before checkout',
            life: 3000
        })
        return
    }

    // Navigate to checkout page
    router.push('/checkout')
}

</script>
