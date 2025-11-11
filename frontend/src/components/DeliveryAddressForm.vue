<template>
  <div class="font-Montserrat">
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-map-marker text-oxford-blue"></i>
          <h2 class="text-2xl font-bold text-oxford-blue">Delivery Address</h2>
        </div>
      </template>

      <template #subtitle>
        <p class="text-gray">Please provide your delivery address details</p>
      </template>

      <template #content>
        <div class="space-y-4">
          <!-- Contact Information -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Contact Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatLabel variant="on">
                <InputText
                  id="contactName"
                  v-model="addressForm.contactName"
                  class="w-full"
                  :class="{ 'p-invalid': errors.contactName }"
                />
                <label for="contactName">Full Name *</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText
                  id="contactNumber"
                  v-model="addressForm.contactNumber"
                  class="w-full"
                  :class="{ 'p-invalid': errors.contactNumber }"
                  maxlength="11"
                />
                <label for="contactNumber">Contact Number *</label>
              </FloatLabel>
            </div>
            <small v-if="errors.contactName || errors.contactNumber" class="text-red-500 mt-1 block">
              {{ errors.contactName || errors.contactNumber }}
            </small>
          </div>

          <!-- Address Details -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Address Details</h3>
            <div class="grid grid-cols-1 gap-4">
              <!-- Address Line 1 -->
              <FloatLabel variant="on">
                <InputText
                  id="addressLine1"
                  v-model="addressForm.addressLine1"
                  class="w-full"
                  :class="{ 'p-invalid': errors.addressLine1 }"
                  placeholder="House/Unit/Floor No., Building Name, Street Name"
                />
                <label for="addressLine1">Address Line 1 *</label>
              </FloatLabel>
              <small v-if="errors.addressLine1" class="text-red-500 -mt-2">{{ errors.addressLine1 }}</small>

              <!-- Address Line 2 -->
              <FloatLabel variant="on">
                <InputText
                  id="addressLine2"
                  v-model="addressForm.addressLine2"
                  class="w-full"
                  placeholder="Barangay, Subdivision, Landmark (Optional)"
                />
                <label for="addressLine2">Address Line 2</label>
              </FloatLabel>

              <!-- Province and City -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FloatLabel variant="on">
                    <Select
                      id="province"
                      v-model="addressForm.province"
                      :options="provinces"
                      optionLabel="name"
                      optionValue="code"
                      filter
                      class="w-full"
                      :class="{ 'p-invalid': errors.province }"
                      @change="onProvinceChange"
                    />
                    <label for="province">Province *</label>
                  </FloatLabel>
                  <small v-if="errors.province" class="text-red-500 mt-1 block">{{ errors.province }}</small>
                </div>

                <div>
                  <FloatLabel variant="on">
                    <Select
                      id="city"
                      v-model="addressForm.city"
                      :options="cities"
                      optionLabel="name"
                      optionValue="code"
                      filter
                      class="w-full"
                      :class="{ 'p-invalid': errors.city }"
                      :disabled="!addressForm.province"
                    />
                    <label for="city">City / Municipality *</label>
                  </FloatLabel>
                  <small v-if="errors.city" class="text-red-500 mt-1 block">{{ errors.city }}</small>
                </div>
              </div>

              <!-- Postal Code -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatLabel variant="on">
                  <InputText
                    id="postalCode"
                    v-model="addressForm.postalCode"
                    class="w-full"
                    maxlength="4"
                    :class="{ 'p-invalid': errors.postalCode }"
                  />
                  <label for="postalCode">Postal Code *</label>
                </FloatLabel>
                <small v-if="errors.postalCode" class="text-red-500 mt-1 block">{{ errors.postalCode }}</small>
              </div>
            </div>
          </div>

          <!-- Additional Instructions -->
          <div>
            <FloatLabel variant="on">
              <Textarea
                id="deliveryNotes"
                v-model="addressForm.deliveryNotes"
                rows="3"
                class="w-full"
                placeholder="e.g., Gate code, landmarks, delivery instructions"
              />
              <label for="deliveryNotes">Delivery Instructions (Optional)</label>
            </FloatLabel>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Clear Form"
            icon="pi pi-times"
            outlined
            @click="clearForm"
            class="text-gray border-gray-300 hover:bg-gray-100"
          />
          <Button
            label="Confirm Address"
            icon="pi pi-check"
            @click="submitAddress"
            :loading="isSubmitting"
            class="bg-oxford-blue text-white border-oxford-blue hover:bg-charcoal"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'

// Emits
const emit = defineEmits(['addressConfirmed'])

// State
const addressForm = ref({
  contactName: '',
  contactNumber: '',
  addressLine1: '',
  addressLine2: '',
  province: null,
  city: null,
  postalCode: '',
  deliveryNotes: '',
  saveAddress: false
})

const errors = ref({})
const isSubmitting = ref(false)
const provinces = ref([])
const cities = ref([])

// Methods
const loadProvinces = async () => {
  try {
    // Load from the ph_provinces.json file
    const response = await fetch('/src/data/ph_provinces.json')
    const data = await response.json()
    // Map the data to match the expected format (code, name)
    provinces.value = data.map(province => ({
      code: province.province_id,
      name: province.province_name
    }))
  } catch (error) {
    console.error('Error loading provinces:', error)
    // Fallback sample data
    provinces.value = [
      { code: 82, name: 'Metro Manila' },
      { code: 18, name: 'Cavite' },
      { code: 19, name: 'Laguna' },
      { code: 11, name: 'Bulacan' }
    ]
  }
}

const onProvinceChange = async () => {
  // Clear city when province changes
  addressForm.value.city = null
  cities.value = []

  if (!addressForm.value.province) return

  try {
    // Load from the ph_locations.json file
    const response = await fetch('/src/data/ph_locations.json')
    const data = await response.json()

    // Get cities for the selected province (province ID is the key)
    const provinceId = addressForm.value.province.toString()
    if (data.cities && data.cities[provinceId]) {
      cities.value = data.cities[provinceId].map(city => ({
        code: city.id,
        name: city.name
      }))
    } else {
      cities.value = []
      console.warn(`No cities found for province ID: ${provinceId}`)
    }
  } catch (error) {
    console.error('Error loading cities:', error)
    // Fallback sample data
    cities.value = [
      { code: 1, name: 'Quezon City' },
      { code: 2, name: 'Makati' },
      { code: 3, name: 'Manila' }
    ]
  }
}

const validateForm = () => {
  errors.value = {}

  if (!addressForm.value.contactName?.trim()) {
    errors.value.contactName = 'Full name is required'
  }

  if (!addressForm.value.contactNumber?.trim()) {
    errors.value.contactNumber = 'Contact number is required'
  } else if (!/^09\d{9}$/.test(addressForm.value.contactNumber)) {
    errors.value.contactNumber = 'Invalid mobile number format (09XXXXXXXXX)'
  }

  if (!addressForm.value.addressLine1?.trim()) {
    errors.value.addressLine1 = 'Address Line 1 is required'
  }

  if (!addressForm.value.province) {
    errors.value.province = 'Province is required'
  }

  if (!addressForm.value.city) {
    errors.value.city = 'City/Municipality is required'
  }

  if (!addressForm.value.postalCode?.trim()) {
    errors.value.postalCode = 'Postal code is required'
  } else if (!/^\d{4}$/.test(addressForm.value.postalCode)) {
    errors.value.postalCode = 'Postal code must be 4 digits'
  }

  return Object.keys(errors.value).length === 0
}

const submitAddress = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // Get province and city names
    const provinceName = provinces.value.find(p => p.code === addressForm.value.province)?.name
    const cityName = cities.value.find(c => c.code === addressForm.value.city)?.name

    const addressData = {
      ...addressForm.value,
      provinceName,
      cityName,
      fullAddress: `${addressForm.value.addressLine1}, ${addressForm.value.addressLine2 ? addressForm.value.addressLine2 + ', ' : ''}${cityName}, ${provinceName} ${addressForm.value.postalCode}`
    }

    // TODO: Save to backend if saveAddress is true

    emit('addressConfirmed', addressData)
  } catch (error) {
    console.error('Error submitting address:', error)
  } finally {
    isSubmitting.value = false
  }
}

const clearForm = () => {
  addressForm.value = {
    contactName: '',
    contactNumber: '',
    addressLine1: '',
    addressLine2: '',
    province: null,
    city: null,
    postalCode: '',
    deliveryNotes: '',
    saveAddress: false
  }
  errors.value = {}
  cities.value = []
}

// Lifecycle
onMounted(() => {
  loadProvinces()
})
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
