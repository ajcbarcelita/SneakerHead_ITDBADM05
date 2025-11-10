import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'

import router from './router'
import './styles/tailwind.css'

// Change to see specific page
import Login from '@/pages/BranchManagement.vue'

import 'primeicons/primeicons.css' 
import Lara from '@primevue/themes/material';

const app = createApp(Login);

app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      darkModeSelector: false
    }
  }
});


app.use(createPinia())
app.use(router)

app.mount('#app')