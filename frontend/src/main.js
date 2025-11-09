import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'

import router from './router'
import './styles/tailwind.css'
import App from './App.vue'

import 'primeicons/primeicons.css' 

import Lara from '@primevue/themes/material';

const app = createApp(App);

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