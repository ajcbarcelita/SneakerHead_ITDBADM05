<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
  <UserContextModal 
    v-model:visible="userContextStore.showModal"
    @close="userContextStore.setModal(false)"
  />
</template>

<script setup>
  import { onMounted } from 'vue';
  import Toast from 'primevue/toast'  
  import ConfirmDialog from 'primevue/confirmdialog'
  import UserContextModal from './components/UserContextModal.vue';
  import { useUserContextStore } from '@/stores/userContextStore.js';
  import { useAuthStore } from '@/stores/authStore.js';

  const userContextStore = useUserContextStore();
  const authStore = useAuthStore();

  onMounted(() => {
      userContextStore.loadFromStorage();

      const needModal = !userContextStore.branchId || !userContextStore.chosenCurrency;
      if (needModal && (authStore.isCustomer || !authStore.isLoggedIn)) {
          userContextStore.setModal(true);
      }
  })
</script>