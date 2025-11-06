<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <!-- LEFT -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 md:px-12" :style="{ backgroundColor: 'var(--color-white-smoke)' }">
      <div class="w-full max-w-md space-y-8">
        <div class="flex flex-col items-center">
          <img src="@/assets/sneakerhead_logo_no_bg.png" alt="logo" class="h-48 w-48 rounded-full object-cover" />
          <h1 class="font-sans mt-4 text-3xl font-semibold text-oxford-blue">Welcome back!</h1>
          <p class="font-sans mt-1 text-sm text-gray">Sign in to access your account.</p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <!-- Email -->
          <FloatLabel class="w-full">
            <InputText
              id="email"
              v-model="email"
              :class="'w-full px-4 py-3 rounded-md border border-slate-200'"
            />
            <label for="email" class="text-charcoal text-sm">Email</label>
          </FloatLabel>

          <!-- Password (toggleMask + large via inputClass) -->
          <FloatLabel class="w-full">
            <Password
              id="password"
              v-model="password"
              class="w-full"
              toggleMask
              :feedback="false"
              inputClass="w-full px-4 py-3 text-lg rounded-md border border-slate-200"
            />
            <label for="password" class="text-charcoal text-sm">Password</label>
          </FloatLabel>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-charcoal">
              <Checkbox v-model="rememberMe" inputId="remember" binary />
              <label for="remember">Remember Me</label>
            </div>
          </div>

          <Button label="Sign In" class="w-full bg-oxford-blue text-white py-3 rounded-md" />
        </form>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="w-full md:w-1/2">
      <img src="@/assets/sneakerhead_branding_pic1.jpg" alt="branding" class="block md:hidden w-full h-64 object-cover" />
      <div
        class="hidden md:block w-full h-full bg-center bg-cover"
        :style="{ backgroundImage: `linear-gradient(rgba(21,41,71,0.55), rgba(21,41,71,0.55)), url(${image})` }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup>
    import { ref } from 'vue'

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

</script>

<style src="@/styles/tailwind.css"></style>
