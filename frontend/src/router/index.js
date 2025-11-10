import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import ShoppingCartPage from '@/pages/ShoppingCartPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import SysAdminDashboard from '@/pages/SystemAdmin/SysAdminDashboard.vue'
import ManageBranch from '@/pages/SystemAdmin/ManageBranch.vue'
import ManagePromoCodes from '@/pages/SystemAdmin/ManagePromoCodes.vue'

// First add new route for page here, then next put nav guards
// depending on who is allowed to access the page
// Last, use router in the Express app
// common meta fields here are requiresAuth: true/false (if need ba nakalogin or not),
//  role/s and list
// which roles are allowed or not, and config
// router.beforeEach can be used to enforce these rules

// Ff are meta fields depending on who should be able to access
// guestOnly, customerOnly, branchManagerOnly, adminOnly
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {guestOnly: true}
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: {guestOnly: true}
    },
    {
      path: '/cart',
      name: 'Cart',
      component: ShoppingCartPage,
      meta: {requiresAuth: true, customerOnly: true}
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfilePage,
      meta: {requiresAuth: true}
    },
    {
      path: '/SysAdminDashboard',
      name: 'SADashboard',
      component: SysAdminDashboard,
      meta: {requiresAuth: true, adminOnly: true}
    },
    {
      path: '/ManageBranch',
      name: 'ManageBranch',
      component: ManageBranch,
      meta: {requiresAuth: true, adminOnly: true}
    },
    {
      path: '/ManagePromoCodes',
      name: 'ManagePromoCodes',
      component: ManagePromoCodes,
      meta: {requiresAuth: true, adminOnly: true}
    },
  ],
})

// Add navigation guards here if needed using router.beforeEach

export default router
