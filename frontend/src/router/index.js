import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

// First add new route for page here, then next put nav guards
// depending on who is allowed to access the page
// Last, use router in the Express app
// common meta fields here are requiresAuth: true/false (if need ba nakalogin or not),
//  role/s and list
// which roles are allowed or not, and config
// router.beforeEach can be used to enforce these rules

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {}
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: {}
    }
  ],
})


export default router
