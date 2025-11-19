<template>
  <div class="min-h-screen bg-white-smoke font-Montserrat">
    <!-- Navigation Bar -->
    <NavBar />

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-12">
      <!-- Success Card -->
      <div class="max-w-2xl mx-auto">
        <Card class="shadow-lg">
          <template #content>
            <div class="text-center">
              <!-- Success Icon -->
              <div class="mb-6">
                <i class="pi pi-check-circle text-6xl text-green-600"></i>
              </div>

              <!-- Thank You Message -->
              <h1 class="text-4xl font-bold text-oxford-blue mb-2">Order Confirmed!</h1>
              <p class="text-xl text-gray mb-6">Thank you for your order</p>

              <!-- Order ID -->
              <div class="bg-gray-100 rounded-lg p-6 mb-8">
                <p class="text-gray text-sm mb-2">Order Number</p>
                <p class="text-3xl font-bold text-charcoal">#{{ orderId }}</p>
              </div>

              <!-- Order Details -->
              <div v-if="orderData" class="text-left space-y-4 mb-8">
                <div class="border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray mb-2">Delivery Method</p>
                  <p class="font-semibold text-charcoal">
                    <i :class="orderData.delivery_method === 'pickup' ? 'pi pi-shopping-bag' : 'pi pi-truck'" class="mr-2"></i>
                    {{ orderData.delivery_method === 'pickup' ? 'Pick up at Store' : 'Ship to Address' }}
                  </p>
                </div>

                <div class="border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray mb-2">Total Amount</p>
                  <p class="text-2xl font-bold text-giants-orange">{{ formatCurrency(orderData.total_price) }}</p>
                </div>

                <div class="border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray mb-2">Currency</p>
                  <p class="font-semibold text-charcoal">{{ orderData.currency_code }}</p>
                </div>

                <div class="border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray mb-2">Order Date</p>
                  <p class="font-semibold text-charcoal">{{ formatDate(orderDate) }}</p>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="bg-blue-50 border-l-4 border-oxford-blue p-4 mb-8 text-left">
                <p class="font-semibold text-oxford-blue mb-2">What's Next?</p>
                <ul class="text-sm text-charcoal space-y-1 list-disc list-inside">
                  <li>You'll receive an email confirmation shortly</li>
                  <li>Track your order status in your account</li>
                  <li v-if="orderData?.delivery_method === 'delivery'">Expect delivery within 3-5 business days</li>
                  <li v-else>Your order is ready for pickup!</li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 flex-col sm:flex-row">
                <Button
                  label="View Order Details"
                  icon="pi pi-eye"
                  @click="viewOrderDetails"
                  class="flex-1 bg-oxford-blue text-white border-oxford-blue hover:bg-charcoal py-3"
                />
                <Button
                  label="Continue Shopping"
                  icon="pi pi-shopping-cart"
                  @click="continueShopping"
                  outlined
                  class="flex-1 border-oxford-blue text-oxford-blue hover:bg-oxford-blue/5 py-3"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import orderService from '@/services/orderService'
import { useUserContextStore } from '@/stores/userContextStore'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const userContextStore = useUserContextStore()

const orderId = ref(null)
const orderData = ref(null)
const orderDate = ref(new Date())
const loading = ref(false)

onMounted(() => {
  orderId.value = route.params.orderId
  if (!orderId.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Order ID not found',
      life: 3000
    })
    router.push('/shoes')
  }
})

const formatCurrency = (value) => {
  const currencyCode = orderData.value?.currency_code || 'PHP'
  const currencyRate = parseFloat(orderData.value?.currency_rate_to_peso) || 1
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewOrderDetails = () => {
  router.push(`/order-history/${orderId.value}`)
}

const continueShopping = () => {
  router.push('/shoes')
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

.hover\:bg-charcoal:hover {
  background-color: #313D4D;
}

:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-card-content) {
  padding: 2.5rem;
}

:deep(.p-button) {
  border-radius: 8px;
}
</style>
