<template>
  <Card class="checkout-card">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-shopping-cart text-oxford-blue"></i>
        <span class="text-oxford-blue">Order Summary</span>
      </div>
    </template>

    <template #content>
      <!-- Delivery Method Selection -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-charcoal mb-3">
          Delivery Method
        </label>
        <div class="flex gap-3">
          <div
            @click="deliveryMethod = 'delivery'"
            :class="[
              'flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all',
              deliveryMethod === 'delivery'
                ? 'border-oxford-blue bg-oxford-blue'
                : 'border-gray-300 hover:border-oxford-blue'
            ]"
          >
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-truck text-xl" :class="deliveryMethod === 'delivery' ? 'text-white' : 'text-gray'"></i>
              <span class="font-semibold" :class="deliveryMethod === 'delivery' ? 'text-white' : 'text-charcoal'">
                Delivery
              </span>
            </div>
            <p class="text-xs" :class="deliveryMethod === 'delivery' ? 'text-white' : 'text-gray'">Ships to your address</p>
          </div>

          <div
            @click="deliveryMethod = 'pickup'"
            :class="[
              'flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all',
              deliveryMethod === 'pickup'
                ? 'border-oxford-blue bg-oxford-blue'
                : 'border-gray-300 hover:border-oxford-blue'
            ]"
          >
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-shopping-bag text-xl" :class="deliveryMethod === 'pickup' ? 'text-white' : 'text-gray'"></i>
              <span class="font-semibold" :class="deliveryMethod === 'pickup' ? 'text-white' : 'text-charcoal'">
                Pickup
              </span>
            </div>
            <p class="text-xs" :class="deliveryMethod === 'pickup' ? 'text-white' : 'text-gray'">Pick up at store</p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <Divider />

      <!-- Subtotal -->
      <div class="flex justify-between mb-3">
        <span class="text-charcoal">Subtotal:</span>
        <span class="font-semibold text-charcoal">₱{{ formatPrice(subtotal) }}</span>
      </div>

      <!-- Shipping -->
      <div class="flex justify-between mb-3">
        <span class="text-charcoal">Shipping:</span>
        <span class="font-semibold" :class="deliveryMethod === 'pickup' ? 'text-green-600' : 'text-charcoal'">
          {{ deliveryMethod === 'pickup' ? 'FREE' : '₱' + formatPrice(shipping) }}
        </span>
      </div>

      <!-- Divider -->
      <Divider />

      <!-- Promo Code Section -->
      <div class="mb-4">
        <label for="promoCode" class="block text-sm font-semibold text-charcoal mb-2">
          Have a promo code?
        </label>
        <div class="flex gap-2">
          <InputText
            id="promoCode"
            v-model="promoCode"
            placeholder="Enter promo code"
            class="flex-1"
            :disabled="promoApplied"
          />
          <Button
            v-if="!promoApplied"
            label="Apply"
            icon="pi pi-check"
            @click="applyPromoCode"
            :loading="applyingPromo"
            class="bg-oxford-blue text-white border-oxford-blue hover:bg-charcoal"
          />
          <Button
            v-else
            label="Remove"
            icon="pi pi-times"
            severity="danger"
            outlined
            @click="removePromoCode"
          />
        </div>

        <!-- Promo Code Success Message -->
        <Message v-if="promoApplied && promoDiscount > 0" severity="success" class="mt-2" :closable="false">
          <div class="flex items-center gap-2">
            <i class="pi pi-tag"></i>
            <span>{{ promoCode }} applied! You saved ₱{{ formatPrice(promoDiscount) }}</span>
          </div>
        </Message>

        <!-- Promo Code Error Message -->
        <Message v-if="promoError" severity="error" class="mt-2" :closable="true" @close="promoError = ''">
          {{ promoError }}
        </Message>
      </div>

      <!-- Discount (if promo applied) -->
      <div v-if="promoApplied && promoDiscount > 0" class="flex justify-between mb-3">
        <span class="text-green-600">Discount:</span>
        <span class="font-semibold text-green-600">-₱{{ formatPrice(promoDiscount) }}</span>
      </div>

      <!-- Divider -->
      <Divider />

      <!-- Total -->
      <div class="flex justify-between mb-4">
        <span class="text-xl font-bold text-oxford-blue">Total:</span>
        <span class="text-xl font-bold text-giants-orange">₱{{ formatPrice(total) }}</span>
      </div>

      <!-- Checkout Button -->
      <Button
        label="Proceed to Checkout"
        icon="pi pi-arrow-right"
        iconPos="right"
        @click="handleCheckout"
        :loading="processingCheckout"
        class="w-full bg-giants-orange text-white border-giants-orange hover:bg-oxford-blue py-3 text-lg font-semibold"
      />
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

// Props
const props = defineProps({
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['checkout', 'promoApplied', 'promoRemoved', 'deliveryMethodChanged'])

// State
const deliveryMethod = ref('delivery') // 'delivery' or 'pickup'
const promoCode = ref('')
const promoApplied = ref(false)
const promoDiscount = ref(0)
const promoError = ref('')
const applyingPromo = ref(false)
const processingCheckout = ref(false)

// Watch delivery method changes
watch(deliveryMethod, (newMethod) => {
  emit('deliveryMethodChanged', newMethod)
})

// Computed
const total = computed(() => {
  const shippingCost = deliveryMethod.value === 'pickup' ? 0 : props.shipping
  const subtotalWithShipping = props.subtotal + shippingCost
  return Math.max(0, subtotalWithShipping - promoDiscount.value)
})

// Methods
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const applyPromoCode = async () => {
  if (!promoCode.value.trim()) {
    promoError.value = 'Please enter a promo code'
    return
  }

  applyingPromo.value = true
  promoError.value = ''

  try {
    // TODO: Replace with actual API call to validate promo code
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation - replace with actual API response
    const mockValidPromos = {
      'WELCOME10': 0.10, // 10% discount
      'SUMMER20': 0.20,  // 20% discount
      'SAVE50': 50,      // Fixed 50 peso discount
      'FREESHIP': 0      // Free shipping (handled separately)
    }

    const upperPromoCode = promoCode.value.toUpperCase()

    if (Object.prototype.hasOwnProperty.call(mockValidPromos, upperPromoCode)) {
      const discountValue = mockValidPromos[upperPromoCode]

      if (upperPromoCode === 'FREESHIP') {
        // Free shipping promo
        promoDiscount.value = props.shipping
      } else if (discountValue < 1) {
        // Percentage discount
        promoDiscount.value = props.subtotal * discountValue
      } else {
        // Fixed amount discount
        promoDiscount.value = discountValue
      }

      promoApplied.value = true
      emit('promoApplied', {
        code: upperPromoCode,
        discount: promoDiscount.value
      })
    } else {
      promoError.value = 'Invalid promo code. Please try again.'
    }
  } catch (error) {
    promoError.value = 'Failed to apply promo code. Please try again.'
    console.error('Error applying promo code:', error)
  } finally {
    applyingPromo.value = false
  }
}

const removePromoCode = () => {
  promoCode.value = ''
  promoApplied.value = false
  promoDiscount.value = 0
  promoError.value = ''
  emit('promoRemoved')
}

const handleCheckout = () => {
  processingCheckout.value = true

  emit('checkout', {
    deliveryMethod: deliveryMethod.value,
    subtotal: props.subtotal,
    shipping: deliveryMethod.value === 'pickup' ? 0 : props.shipping,
    discount: promoDiscount.value,
    total: total.value,
    promoCode: promoApplied.value ? promoCode.value : null
  })

  // Reset processing state after a delay (actual checkout will handle this)
  setTimeout(() => {
    processingCheckout.value = false
  }, 2000)
}
</script>

<style scoped>
.checkout-card {
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.p-card-title) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

:deep(.p-card-content) {
  padding: 1.5rem;
}

:deep(.p-divider) {
  margin: 1rem 0;
}

:deep(.p-message) {
  font-size: 0.875rem;
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

.bg-oxford-blue {
  background-color: #102540;
}

.bg-giants-orange {
  background-color: #EA662D;
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

.hover\:bg-charcoal:hover {
  background-color: #313D4D;
}
</style>
