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

      <!-- Back to Cart Button -->
      <div class="mb-6">
        <Button
          label="Back to Cart"
          icon="pi pi-arrow-left"
          text
          @click="goBackToCart"
          class="text-oxford-blue hover:text-charcoal"
        />
      </div>

      <!-- Checkout Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  :key="item.id"
                  class="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <!-- Product Image -->
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />

                  <!-- Product Details -->
                  <div class="flex-1">
                    <h4 class="font-semibold text-charcoal">{{ item.name }}</h4>
                    <p class="text-sm text-gray">{{ item.brand }}</p>
                    <div class="flex items-center gap-4 mt-1">
                      <span class="text-sm text-gray">Size: {{ item.size }}</span>
                      <span class="text-sm text-gray">Qty: {{ item.quantity }}</span>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="text-right">
                    <p class="font-bold text-giants-orange">₱{{ formatPrice(item.price * item.quantity) }}</p>
                    <p class="text-sm text-gray">₱{{ formatPrice(item.price) }} each</p>
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
            :branches="branches"
            :initialBranchId="selectedBranch"
            @branchSelected="handleBranchSelected"
          />
        </div>

        <!-- Right Column: Checkout Summary Card -->
        <div class="lg:col-span-1">
          <div class="sticky top-6">
            <CheckoutCard
              :subtotal="subtotal"
              :shipping="shippingCost"
              @checkout="handleCheckout"
              @promoApplied="handlePromoApplied"
              @promoRemoved="handlePromoRemoved"
              @deliveryMethodChanged="handleDeliveryMethodChanged"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import CheckoutCard from '@/components/CheckoutCard.vue'
import DeliveryAddressForm from '@/components/DeliveryAddressForm.vue'
import BranchSelectionForm from '@/components/BranchSelect.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()

// State
const cartItems = ref([
  // Sample cart items - TODO: Replace with actual cart data from store/API
  {
    id: 1,
    name: 'Air Jordan 1 Retro High',
    brand: 'Nike',
    size: 10.5,
    quantity: 1,
    price: 8999.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
  },
  {
    id: 2,
    name: 'Yeezy Boost 350 V2',
    brand: 'Adidas',
    size: 11.0,
    quantity: 1,
    price: 7000.00,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400'
  }
])

const checkoutData = ref({
  deliveryMethod: 'delivery', // This should be passed from CheckoutCard
  addressData: null,
  promoCode: null,
  promoDiscount: 0
})

const selectedBranch = ref(null)

const branches = ref([
  {
    id: 1,
    name: 'Sneakerhead Manila',
    address: 'SM Mall of Asia, Pasay City, Metro Manila',
    phone: '(02) 8123-4567',
    hours: '10:00 AM - 9:00 PM'
  },
  {
    id: 2,
    name: 'Sneakerhead Makati',
    address: 'Glorietta 4, Makati City, Metro Manila',
    phone: '(02) 8234-5678',
    hours: '10:00 AM - 9:00 PM'
  },
  {
    id: 3,
    name: 'Sneakerhead Quezon City',
    address: 'SM North EDSA, Quezon City, Metro Manila',
    phone: '(02) 8345-6789',
    hours: '10:00 AM - 9:00 PM'
  }
])

// Computed
const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const shippingCost = computed(() => {
  // TODO: Calculate based on location or fixed rate
  return 100
})

// Methods
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const goBackToCart = () => {
  router.push('/cart')
}

const handleAddressConfirmed = (addressData) => {
  checkoutData.value.addressData = addressData
  console.log('Address confirmed:', addressData)
}

const handleBranchSelected = (branchData) => {
  selectedBranch.value = branchData.branchId
  console.log('Branch selected:', branchData)
}

const handlePromoApplied = (promoData) => {
  checkoutData.value.promoCode = promoData.code
  checkoutData.value.promoDiscount = promoData.discount
  console.log('Promo applied:', promoData)
}

const handlePromoRemoved = () => {
  checkoutData.value.promoCode = null
  checkoutData.value.promoDiscount = 0
  console.log('Promo removed')
}

const handleDeliveryMethodChanged = (method) => {
  checkoutData.value.deliveryMethod = method
  console.log('Delivery method changed to:', method)
}

const handleCheckout = async (orderSummary) => {
  console.log('Processing checkout...')
  console.log('Order Summary:', orderSummary)
  console.log('Checkout Data:', checkoutData.value)
  console.log('Cart Items:', cartItems.value)

  // Validate delivery method
  if (orderSummary.deliveryMethod === 'delivery' && !checkoutData.value.addressData) {
    alert('Please confirm your delivery address before proceeding')
    return
  }

  if (orderSummary.deliveryMethod === 'pickup' && !selectedBranch.value) {
    alert('Please select a pickup branch before proceeding')
    return
  }

  // Update delivery method
  checkoutData.value.deliveryMethod = orderSummary.deliveryMethod

  // Prepare order data
  const orderData = {
    items: cartItems.value,
    deliveryMethod: orderSummary.deliveryMethod,
    address: orderSummary.deliveryMethod === 'delivery' ? checkoutData.value.addressData : null,
    branch: orderSummary.deliveryMethod === 'pickup' ? branches.value.find(b => b.id === selectedBranch.value) : null,
    subtotal: orderSummary.subtotal,
    shipping: orderSummary.shipping,
    discount: orderSummary.discount,
    total: orderSummary.total,
    promoCode: orderSummary.promoCode
  }

  try {
    // TODO: Send order to backend API
    console.log('Submitting order:', orderData)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // TODO: Navigate to order confirmation page
    alert('Order placed successfully!')
    // router.push('/order-confirmation')
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Failed to process order. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  // TODO: Load cart items from store/API
  // TODO: Check if cart is empty, redirect to cart page
  console.log('Checkout page mounted')
})
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
