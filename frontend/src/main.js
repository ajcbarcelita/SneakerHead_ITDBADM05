import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Test from './components/Test.vue'
import router from './router'
import './styles/tailwind.css'

const app = createApp(Test)

app.use(createPinia())
app.use(router)

app.mount('#app')