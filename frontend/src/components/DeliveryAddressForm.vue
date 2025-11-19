<template>
  <div class="font-Montserrat">
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-map-marker text-oxford-blue"></i>
          <h2 class="text-2xl font-bold text-oxford-blue">Delivery Address</h2>
          <div v-if="isAddressValid" class="ml-auto flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
            <i class="pi pi-check-circle text-green-600 text-xs"></i>
            <span class="text-green-600 font-semibold text-xs">Confirmed</span>
          </div>
          <div v-else class="ml-auto flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
            <i class="pi pi-exclamation-circle text-red-600 text-xs"></i>
            <span class="text-red-600 font-semibold text-xs">Incomplete</span>
          </div>
        </div>
      </template>

      <template #content>
        <div class="space-y-4" v-if="loading">
          <div class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-oxford-blue"></i>
            <p class="mt-4 text-gray">Loading address information...</p>
          </div>
        </div>

        <div class="space-y-4" v-else>
          <!-- Address Line 1 -->
          <div>
            <label class="block text-sm font-semibold text-charcoal mb-2">Address Line 1</label>
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p class="text-charcoal">{{ addressData.addressline1 || 'Not provided' }}</p>
            </div>
          </div>

          <!-- Address Line 2 -->
          <div>
            <label class="block text-sm font-semibold text-charcoal mb-2">Address Line 2</label>
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p class="text-charcoal">{{ addressData.addressline2 || 'Not provided' }}</p>
            </div>
          </div>

          <!-- Province and City -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-charcoal mb-2">Province</label>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p class="text-charcoal">{{ addressData.province_name || 'Not provided' }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-charcoal mb-2">City / Municipality</label>
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p class="text-charcoal">{{ addressData.city_name || 'Not provided' }}</p>
              </div>
            </div>
          </div>

          <!-- Edit Address Button -->
          <div class="flex gap-3 pt-4">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              @click="goToEditAddress"
              text
              class="text-oxford-blue hover:bg-oxford-blue hover:text-white"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import userService from '@/services/userService'

const router = useRouter()
const emit = defineEmits(['addressConfirmed'])

const addressData = ref({
  address_id: null,
  addressline1: '',
  addressline2: '',
  province_name: '',
  city_name: ''
})

const loading = ref(false)

// Check if address has required fields
const isAddressValid = computed(() => {
  return (
    addressData.value.address_id &&
    addressData.value.addressline1 &&
    addressData.value.city_name &&
    addressData.value.province_name
  )
})

onMounted(async () => {
  await loadUserAddress()
})

const loadUserAddress = async () => {
  try {
    loading.value = true
    const profile = await userService.getUserProfile()

    addressData.value = {
      address_id: profile.address_id,
      addressline1: profile.addressline1,
      addressline2: profile.addressline2,
      province_name: profile.province_name,
      city_name: profile.city_name
    }

    // Auto-confirm if all required fields are present
    if (isAddressValid.value) {
      emit('addressConfirmed', addressData.value)
    }
  } catch (error) {
    console.error('Error loading user address:', error)
  } finally {
    loading.value = false
  }
}

const goToEditAddress = () => {
  router.push('/profile')
}
</script>

<style scoped>
.font-Montserrat {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-card-title) {
  font-size: 1.5rem;
  padding: 1.5rem 1.5rem 0;
}

:deep(.p-card-subtitle) {
  padding: 0.5rem 1.5rem;
}

:deep(.p-card-content) {
  padding: 1.5rem;
}

:deep(.p-card-footer) {
  padding: 1rem 1.5rem 1.5rem;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea) {
  font-family: 'Montserrat', sans-serif;
}

:deep(.p-invalid) {
  border-color: #ef4444 !important;
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

.bg-oxford-blue {
  background-color: #102540;
}

.border-oxford-blue {
  border-color: #102540;
}

.hover\:bg-charcoal:hover {
  background-color: #313D4D;
}
</style>
