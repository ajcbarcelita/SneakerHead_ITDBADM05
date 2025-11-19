<template>
  <div class="min-h-screen bg-white-smoke font-Montserrat">
    <!-- Navigation Bar -->
    <NavBar />

    <!-- Main Content -->
  <main class="container mx-auto px-6 py-8">
    <!-- Page Title -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-oxford-blue mb-2">Checkout</h1>
      <p class="text-gray">Complete your order and provide delivery details</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-oxford-blue"></i>
      <p class="mt-4 text-gray">Loading your cart...</p>
    </div>

    <!-- Empty Cart Redirect -->
    <div v-else-if="!cartItems || cartItems.length === 0" class="text-center py-12">
      <i class="pi pi-shopping-cart text-6xl text-gray mb-4"></i>
      <h3 class="text-2xl font-bold text-charcoal mb-2">Your cart is empty</h3>
      <p class="text-gray">Redirecting you back to shopping...</p>
    </div>

    <!-- Checkout Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Cart Summary & Address Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Cart Items Summary -->
        <Card class="shadow-lg">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-shopping-cart text-oxford-blue"></i>
              <span class="text-oxford-blue">Order Items</span>
            </div>
          </template>

          <template #content>
            <div class="space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.cart_item_id"
                class="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <!-- Product Image -->
                <img
                  :src="item.image || '/placeholder-shoe.png'"
                  :alt="item.name"
                  class="w-20 h-20 object-cover rounded-lg shadow-sm"
                />

                <!-- Product Details -->
                <div class="flex-1">
                  <h4 class="font-semibold text-charcoal">{{ item.name }}</h4>
                  <p class="text-sm text-gray">{{ item.brand }}</p>
                  <div class="flex items-center gap-4 mt-1">
                    <span class="text-sm text-gray">Size: US {{ item.size }}</span>
                    <span class="text-sm text-gray">Qty: {{ item.quantity }}</span>
                  </div>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <p class="font-bold text-giants-orange">{{ formatCurrency(item.subtotal) }}</p>
                  <p class="text-sm text-gray">{{ formatCurrency(item.price) }} each</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Delivery Address Form -->
        <DeliveryAddressForm
          v-if="checkoutData.deliveryMethod === 'delivery'"
          @addressConfirmed="handleAddressConfirmed"
        />

        <!-- Branch Selection for Pickup -->
        <BranchSelectionForm
          v-else
          @openModal="showBranchModal = true"
        />
      </div>

      <!-- Right Column: Checkout Summary Card -->
      <div class="lg:col-span-1">
        <div class="sticky top-6">
          <CheckoutCard
            :subtotal="subtotal"
            :currency-code="cartData?.currency_code || 'PHP'"
            :currency-rate="parseFloat(cartData?.currency_rate_to_peso) || 1"
            :loading="submitting"
            @checkout="handleCheckout"
            @promoApplied="handlePromoApplied"
            @promoRemoved="handlePromoRemoved"
            @deliveryMethodChanged="handleDeliveryMethodChanged"
          />
        </div>
      </div>
    </div>

    <!-- Back to Cart Button -->
    <div class="mt-6">
      <Button
        label="Back to Cart"
        icon="pi pi-arrow-left"
        text
        @click="goBackToCart"
        class="text-oxford-blue hover:text-charcoal"
      />
    </div>
  </main>

  <!-- Branch Selection Modal -->
  <UserContextModal
    :visible="showBranchModal"
    @update:visible="showBranchModal = $event"
    @close="showBranchModal = false"
  />

  <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import CheckoutCard from '@/components/CheckoutCard.vue'
import DeliveryAddressForm from '@/components/DeliveryAddressForm.vue'
import BranchSelectionForm from '@/components/BranchSelect.vue'
import UserContextModal from '@/components/UserContextModal.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import cartService from '@/services/cartService'
import orderService from '@/services/orderService'
import { useUserContextStore } from '@/stores/userContextStore'

const router = useRouter()
const toast = useToast()
const userContextStore = useUserContextStore()

// State
const cartItems = ref([])
const cartData = ref(null)
const loading = ref(false)
const submitting = ref(false)
const showBranchModal = ref(false)

const checkoutData = ref({
  deliveryMethod: 'delivery',
  addressData: null,
  promoCode: null,
  promoDiscount: 0
})

// Watchers for real-time currency updates
watch(
  () => [userContextStore.chosenCurrency, userContextStore.currencyRate],
  ([newCurrency, newRate], [oldCurrency, oldRate]) => {
    if (newCurrency !== oldCurrency || newRate !== oldRate) {
      // Update cart data with new currency info
      if (cartData.value) {
        cartData.value.currency_code = newCurrency
        cartData.value.currency_rate_to_peso = newRate
      }
    }
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  await loadCartData()
})

// Methods
const loadCartData = async () => {
  try {
    loading.value = true
    userContextStore.loadFromStorage()

    if (!userContextStore.branchId) {
      toast.add({
        severity: 'warn',
        summary: 'No Branch Selected',
        detail: 'Please select a branch before checkout',
        life: 3000
      })
      router.push('/cart')
      return
    }

    const data = await cartService.getCart(userContextStore.branchId)
    cartData.value = data
    cartItems.value = (data.items || []).map(item => ({
      cart_item_id: item.cart_item_id,
      shoe_id: item.shoe_id,
      name: item.shoe_name,
      brand: item.brand_name,
      image: item.shoe_image,
      size: item.size,
      quantity: item.quantity,
      price: item.price, // PHP price
      subtotal: item.subtotal // PHP subtotal
    }))

    if (cartItems.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'Empty Cart',
        detail: 'Your cart is empty. Redirecting to shopping...',
        life: 3000
      })
      setTimeout(() => router.push('/shoes'), 3000)
    }
  } catch (error) {
    console.error('Failed to load cart:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load cart data',
      life: 3000
    })
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// Computed
const subtotal = computed(() => {
  // Return the PHP subtotal without conversion
  // CheckoutCard will handle the currency conversion
  return cartData.value?.subtotal || 0
})

const formatCurrency = (value) => {
  const currencyCode = cartData.value?.currency_code || 'PHP'
  const currencyRate = parseFloat(cartData.value?.currency_rate_to_peso) || 1
  const numericValue = parseFloat(value)

  const convertedValue = currencyCode === 'PHP'
    ? numericValue
    : numericValue * currencyRate

  if (currencyCode === 'PHP') {
    return `₱${convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(convertedValue)
  }
}

const goBackToCart = () => {
  router.push('/cart')
}

const handleAddressConfirmed = (addressData) => {
  checkoutData.value.addressData = addressData
}

const handlePromoApplied = (promoData) => {
  checkoutData.value.promoCode = promoData.code
  checkoutData.value.promoDiscount = promoData.discount
}

const handlePromoRemoved = () => {
  checkoutData.value.promoCode = null
  checkoutData.value.promoDiscount = 0
}

const handleDeliveryMethodChanged = (method) => {
  checkoutData.value.deliveryMethod = method
}

const handleCheckout = async (orderSummary) => {

  // Validate delivery method
  if (orderSummary.deliveryMethod === 'delivery' && !checkoutData.value.addressData) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Address',
      detail: 'Please confirm your delivery address before proceeding',
      life: 3000
    })
    return
  }

  if (orderSummary.deliveryMethod === 'pickup' && !userContextStore.branchId) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Branch',
      detail: 'Please select a pickup branch before proceeding',
      life: 3000
    })
    return
  }

  submitting.value = true

  try {
    // Prepare order data
    const orderData = {
      cart_id: cartData.value.cart_id,
      delivery_method: orderSummary.deliveryMethod,
      address_id: orderSummary.deliveryMethod === 'delivery' ? checkoutData.value.addressData.address_id : null,
      branch_id: orderSummary.deliveryMethod === 'pickup' ? userContextStore.branchId : cartData.value.branch_id,
      promo_code: checkoutData.value.promoCode || null
    }

    // Create order
    const result = await orderService.createOrder(orderData)

    toast.add({
      severity: 'success',
      summary: 'Order Created',
      detail: `Order #${result.order_id} has been placed successfully!`,
      life: 3000
    })

    // Reset checkout data immediately
    checkoutData.value = {
      deliveryMethod: 'delivery',
      addressData: null,
      promoCode: null,
      promoDiscount: 0
    }

    // Clear cart items
    cartItems.value = []
    cartData.value = null

    // Navigate to home page after a brief delay
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    console.error('Checkout error:', error)
    toast.add({
      severity: 'error',
      summary: 'Order Failed',
      detail: error.response?.data?.error || 'Failed to create order. Please try again.',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.font-Montserrat {
  font-family: 'Montserrat', sans-serif;
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

.hover\:text-charcoal:hover {
  color: #313D4D;
}

:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-card-title) {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 1.5rem 1.5rem 0;
}

:deep(.p-card-content) {
  padding: 1.5rem;
}
</style>
