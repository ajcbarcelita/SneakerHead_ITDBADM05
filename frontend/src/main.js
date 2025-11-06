// ...existing code...
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'

import router from './router'
import './styles/tailwind.css'
import App from './App.vue'

import Lara from '@primeuix/themes/lara';
import 'primeicons/primeicons.css' 


const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            darkMode: false,
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    },
    pt: {
        inputtext: {
            root: { class: 'text-charcoal' }
        }
    }
});

app.use(PrimeVue)
app.use(createPinia())
app.use(router)

app.mount('#app')