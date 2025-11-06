import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'

import Test from './components/Test.vue'
import router from './router'
import './styles/tailwind.css'

const app = createApp(Test)

app.use(PrimeVue) // can add a theme later on
app.use(createPinia())
app.use(router)


app.mount('#app')