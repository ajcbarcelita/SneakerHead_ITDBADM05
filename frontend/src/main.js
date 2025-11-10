import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

import PrimeVue from 'primevue/config'
import router from './router'
import './styles/tailwind.css'

// Change to see specific page
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
app.use(ToastService);
app.component('Toast', Toast)
app.use(createPinia())
app.use(router)

app.mount('#app')