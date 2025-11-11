<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <!-- LEFT -->
    <div
      class="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-12"
      :style="{ backgroundColor: 'var(--color-white-smoke)' }"
    >
      <div class="w-full max-w-lg space-y-8 shadow-lg p-8 rounded-2xl bg-white">
        <div class="flex flex-col items-center text-center">
          <img
            src="@/assets/sneakerhead_logo_no_bg.png"
            alt="logo"
            class="h-42 w-42 rounded-full object-cover"
          />
          <h1 class="font-sans mt-4 text-3xl font-semibold text-oxford-blue">
            Welcome to the club!
          </h1>
          <p class="font-sans mt-1 text-sm text-gray">
            Already have an account?
            <router-link
              to="/login"
              class="text-oxford-blue font-medium hover:underline"
            >
              Log in here.
            </router-link>
          </p>
        </div>


        <Stepper v-model:value="activeStep" class="mt-6">
          <StepList class="flex w-full justify-between items-center gap-3 overflow-hidden">
            <Step :value="1">Personal Details</Step>
            <Step :value="2">Address Details</Step>
          </StepList>

          <StepPanels>
            <!-- STEP 1: Personal Details -->
            <StepPanel :value="1">
              <div class="flex flex-col gap-3 mt-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                  <!-- First Name -->
                  <div class="flex flex-col gap-0.5">
                    <FloatLabel class="w-full" variant="on">
                      <InputText id="firstName" v-model="formData.firstName" class="w-full" />
                      <label for="firstName">First Name <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.firstName" class="text-red-400 text-xs mt-0.5">{{ errors.firstName }}</p>
                  </div>

                  <!-- Middle Name -->
                  <div class="flex flex-col gap-0.5">
                    <FloatLabel class="w-full" variant="on">
                      <InputText id="middleName" v-model="formData.middleName" class="w-full" />
                      <label for="middleName">Middle Name</label>
                    </FloatLabel>
                  </div>

                  <!-- Last Name -->
                  <div class="flex flex-col gap-0.5">
                    <FloatLabel class="w-full" variant="on">
                      <InputText id="lastName" v-model="formData.lastName" class="w-full" />
                      <label for="lastName">Last Name <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.lastName" class="text-red-400 text-xs mt-0.5">{{ errors.lastName }}</p>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-0.5">
                  <FloatLabel class="w-full" variant="on">
                    <InputText id="email" v-model="formData.email" class="w-full" />
                    <label for="email">Email <span class="text-red-400">*</span></label>
                  </FloatLabel>
                  <p v-if="errors.email" class="text-red-400 text-xs mt-0.5">{{ errors.email }}</p>
                </div>

                <!-- Passwords -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  <div class="flex flex-col gap-0.5">
                    <FloatLabel class="w-full" variant="on">
                      <Password
                        id="password"
                        v-model="formData.password"
                        toggleMask
                        inputClass="w-full px-3 py-2"
                      />
                      <label for="password">Password <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.password" class="text-red-400 text-xs mt-0.5">{{ errors.password }}</p>
                  </div>

                  <div class="flex flex-col gap-0.5">
                    <FloatLabel class="w-full" variant="on">
                      <Password
                        id="confirmPassword"
                        v-model="formData.confirmPassword"
                        toggleMask
                        inputClass="w-full px-3 py-2"
                      />
                      <label for="confirmPassword">Confirm Password <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.confirmPassword" class="text-red-400 text-xs mt-0.5">{{ errors.confirmPassword }}</p>
                  </div>
                </div>

                <Button
                  label="Next"
                  class="w-full bg-oxford-blue text-white"
                  @click="goToStep2"
                />
              </div>
            </StepPanel>

            <!-- STEP 2: Address Details -->
            <StepPanel :value="2">
              <div class="flex flex-col gap-3 mt-6">
                <!-- Address Line 1 -->
                <div class="flex flex-col gap-0.5">
                  <FloatLabel class="w-full" variant="on">
                    <InputText
                      id="addressLine1"
                      v-model="formData.addressLine1"
                      class="w-full"
                    />
                    <label for="addressLine1">Address Line 1 <span class="text-red-400">*</span></label>
                  </FloatLabel>
                  <p v-if="errors.addressLine1" class="text-red-400 text-xs mt-0.5">{{ errors.addressLine1 }}</p>
                </div>

                <!-- Address Line 2 -->
                <FloatLabel class="w-full" variant="on">
                  <InputText
                    id="addressLine2"
                    v-model="formData.addressLine2"
                    class="w-full"
                  />
                  <label for="addressLine2">Address Line 2</label>
                </FloatLabel>

                <!-- Province & City -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  <div class="flex flex-col gap-0.5">
                    <FloatLabel variant="on">
                      <Select
                        v-model="formData.province"
                        :options="provinces"
                        optionLabel="province_name"
                        optionValue="province_id"
                        @change="onProvinceChange"
                        @update:modelValue="onProvinceChange"
                        class="w-full"
                      />
                      <label for="province">Province <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.province" class="text-red-400 text-xs mt-0.5">{{ errors.province }}</p>
                  </div>

                  <div class="flex flex-col gap-0.5">
                    <FloatLabel variant="on">
                      <Select
                        v-model="formData.city"
                        :options="cities"
                        optionLabel="name"
                        optionValue="id"
                        :disabled="!formData.province"
                        class="w-full"
                      />
                      <label for="city">City / Municipality <span class="text-red-400">*</span></label>
                    </FloatLabel>
                    <p v-if="errors.city" class="text-red-400 text-xs mt-0.5">{{ errors.city }}</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <Button
                    label="Previous"
                    class="flex-1"
                    @click="activeStep = 1"
                  />
                  <Button
                    type="submit"
                    label="Register"
                    class="flex-1 bg-oxford-blue text-white"
                    @click="goToRegister"
                    :disabled="loadingRegister"
                  />
                </div>
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>
    </div>

    <div class="w-full md:w-1/2">
      <img src="@/assets/sneakerhead_branding_pic1.jpg" alt="branding" class="block md:hidden w-full h-64 object-cover" />
      <div
        class="hidden md:block w-full h-full bg-center bg-cover"
        :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.5)), url(${image})` }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useToast } from 'primevue/usetoast'
  import { useValidation } from '@/composables/useValidation'

  const router = useRouter()
  const authStore = useAuthStore()
  const toast = useToast()

  // PrimeVue Components
  import FloatLabel from 'primevue/floatlabel'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  import Select from 'primevue/select'

  // Animated Stepper Components
  import Stepper from 'primevue/stepper'
  import StepList from 'primevue/steplist'
  import Step from 'primevue/step'
  import StepPanels from 'primevue/steppanels'
  import StepPanel from 'primevue/steppanel'

  // Assets
  import brandImage from '@/assets/sneakerhead_branding_pic1.jpg'
  import phJSONData from '@/data/ph_locations.json'

  const image = brandImage
  const activeStep = ref(1)
  const loadingRegister = ref(false)

  const provinces = ref(phJSONData.provinces)
  const cities = ref([])

  const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    province: '',
    city: ''
  })

  const onProvinceChange = (eventOrValue) => {
    // PrimeVue @change often emits an event object with .value, while v-model updates pass raw
    const raw = eventOrValue?.value ?? eventOrValue

    // convert to string key because ph_locations.json uses string keys like "1"
    const key = raw == null ? '' : String(raw)

    const lookup = phJSONData.cities?.[key]

    // fallback: if cities stored as array, filter by province_id
    if (!lookup && Array.isArray(phJSONData.cities)) {
      const filtered = phJSONData.cities.filter(c => String(c.province_id) === key)
      cities.value = filtered
    } else {
      cities.value = lookup ?? []
    }

    formData.city = '' // reset selection
  }

  const { errors, validateEmail, validatePassword, validateConfirmPassword, validateRequired, clearErrors } = useValidation()

  // Watchers for reactive validation
  watch(() => formData.firstName, (value) => {
    validateRequired('firstName', value)
  })

  watch(() => formData.lastName, (value) => {
    validateRequired('lastName', value)
  })

  watch(() => formData.email, (value) => {
    validateEmail(value)
  })

  watch(() => formData.password, (value) => {
    validatePassword(value)
    // Re-validate confirm password if it has a value
    if (formData.confirmPassword) {
      validateConfirmPassword(value, formData.confirmPassword)
    }
  })

  watch(() => formData.confirmPassword, (value) => {
    validateConfirmPassword(formData.password, value)
  })

  watch(() => formData.addressLine1, (value) => {
    validateRequired('addressLine1', value)
  })

  watch(() => formData.province, (value) => {
    // coerce numeric id to string for validation helper
    validateRequired('province', value == null ? '' : String(value))
  })

  watch(() => formData.city, (value) => {
    // coerce numeric id to string for validation helper
    validateRequired('city', value == null ? '' : String(value))
  })

  const goToStep2 = () => {
    clearErrors()
    validateRequired('firstName', formData.firstName)
    validateRequired('lastName', formData.lastName)
    validateEmail(formData.email)
    validatePassword(formData.password)
    validateConfirmPassword(formData.password, formData.confirmPassword)

    if (Object.keys(errors.value).length === 0) {
      activeStep.value = 2
    } else  {
      console.log('Validation errors:', errors.value)
    }
  }

  async function goToRegister() {
    clearErrors()
    
    const payload = {
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      province: formData.province,
      city: formData.city
    }

    loadingRegister.value = true // disable button

    try {
      const result = await authStore.register(payload)

      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: 'You can now log in with your account.',
          life: 15000
        })
        setTimeout(() => router.push('/login'), 5000)
      } else {
        Object.assign(errors.value, authStore.errors)

        const errDetail =
          authStore.errors?.message ||
          (authStore.errors && typeof authStore.errors === 'object'
            ? Object.values(authStore.errors).flat().join('; ')
            : String(authStore.errors)) ||
          'Registration failed. Please check the form and try again.'

        toast.add({
          severity: 'error',
          summary: 'Registration failed',
          detail: errDetail,
          life: 8000
        })
      }
    } finally {
      loadingRegister.value = false // re-enable button
    }
  }
</script>

<style src="@/styles/tailwind.css"></style>

<style>
  .p-password,
  .p-password .p-inputtext {
    width: 100% !important;
    box-sizing: border-box;
  }

  .p-password .p-inputtext {
    padding-right: 3rem;
  }

  .p-stepper .p-steplist,
  .p-stepper .p-step-list,
  .p-stepper .p-steps-list {
    gap: 0.5rem !important;
    align-items: center;
    overflow: visible;
  }

  /* smaller step circle */
  .p-stepper .p-step-number,
  .p-stepper .p-steps-number,
  .p-steps .p-steps-number {
    width: 28px !important;
    height: 28px !important;
    line-height: 28px !important;
    font-size: 0.85rem !important;
    border-radius: 9999px !important;
  }

  /* smaller label text */
  .p-stepper .p-step-label,
  .p-stepper .p-step .p-step-label,
  .p-steps .p-menuitem-text {
    font-size: 0.875rem !important;
    margin-top: 0 !important;
  }

  /* reduce vertical spacing around the stepper */
  .p-stepper {
    padding: 0.25rem 0 !important;
    margin-bottom: 0.75rem !important;
  }

  /* tighten hover/active shadow so smaller circles still look good */
  .p-stepper .p-step.p-highlight .p-step-number,
  .p-steps .p-steps-item.p-highlight .p-steps-number {
    transform: scale(1.08) !important;
    box-shadow: 0 6px 16px rgba(16,37,64,0.10) !important;
  }
</style>