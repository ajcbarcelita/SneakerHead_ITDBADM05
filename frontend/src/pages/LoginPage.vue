<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <!-- LEFT -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12 py-12" :style="{ backgroundColor: 'var(--color-white-smoke)' }">
      <div class="w-full max-w-lg space-y-8 shadow-lg p-8 rounded-2xl bg-white">

        <div class="flex flex-col items-center">
          <img src="@/assets/sneakerhead_logo_no_bg.png" alt="logo" class="h-42 w-42 rounded-full object-cover" />
          <h1 class="font-sans mt-4 text-2xl font-semibold text-oxford-blue">Glad you're back.</h1>
          <p class="text-center font-sans mt-1 text-sm text-gray">
            Don't have an account?
            <router-link to="/register" class="text-oxford-blue font-medium hover:underline">
              Register here.
            </router-link>
          </p>
        </div>

        <form class="flex flex-col gap-3" @submit.prevent="onSubmit"> <!-- Change -->
          <!-- Email -->
          <FloatLabel variant="on" class="w-full" autocomplete="off">
            <InputText
              id="email"
              v-model="email"
              :class="'w-full px-4 py-3 rounded-md border border-slate-300'"
            />
            <label for="email" class="text-charcoal text-sm">Email</label>
          </FloatLabel>
          <p v-if="errors.email" class="text-red-500 text-xs mt-0.5">{{ errors.email }}</p>

          <!-- Password (toggleMask + large via inputClass) -->
          <FloatLabel variant="on"class="w-full" autocomplete="off">
            <Password
              id="password"
              v-model="password"
              class="w-full"
              toggleMask
              :feedback="false"
              inputClass="w-full px-4 py-3 text-lg rounded-md border border-slate-300"
            />
            <label for="password" class="text-charcoal text-sm">Password</label>
          </FloatLabel>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-charcoal">
              <Checkbox v-model="rememberMe" inputId="remember" binary />
              <label for="remember">Remember Me</label>
            </div>
          </div>

          <Button :disabled="loading" type="submit" label="Log In" class="font-sans w-full bg-oxford-blue text-white py-3 rounded-md" />
        </form>
      </div>
    </div>

    <!-- RIGHT -->
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
    import { ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useToast } from 'primevue/usetoast'
    import { useValidation } from '@/composables/useValidation'
    import { useAuthStore } from '@/stores/authStore'

    // PrimeVue components (local import — available in template automatically)
    import FloatLabel from 'primevue/floatlabel'
    import InputText from 'primevue/inputtext'
    import Password from 'primevue/password'
    import Checkbox from 'primevue/checkbox'
    import Button from 'primevue/button'

    import brandImage from '@/assets/sneakerhead_branding_pic1.jpg'
    const image = brandImage

    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const { errors, validateEmail, clearErrors} = useValidation()

    const loading = ref(false)
    const router = useRouter()
    const toast = useToast()
    const authStore = useAuthStore()

    watch(email, (value) => {
      validateEmail(value)
    })

    async function onSubmit() {
      clearErrors()
      validateEmail(email.value)

      if (Object.keys(errors.value).length > 0) return

      loading.value = true // disable button

      try {
        const result = await authStore.login({
          email: email.value,
          password: password.value
        })

        if (result.success) {
          toast.add({
            severity: 'success',
            summary: 'Login Successful.',
            detail: `Welcome back, ${result.data.user.fname}`,
            life: 5000
          })
          // router.push('/'); // Redirect after successful login
        } else {
          // merge backend errors
          Object.assign(errors.value, authStore.errors)
          const errDetail = authStore.errors?._global || 'Invalid email or password.'

          toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: errDetail,
            life: 5000
          })

          password.value = '' // clear password after failed login
        }
      } catch (err) {
        toast.add({
          severity: 'error',
          summary: 'Network Error',
          detail: 'Could not reach server. Please try again later.',
          life: 5000
        })

        password.value = '' // clear password on network failure too
      } finally {
        loading.value = false // re-enable button
      }
    }
</script>

<style src="@/styles/tailwind.css"></style>