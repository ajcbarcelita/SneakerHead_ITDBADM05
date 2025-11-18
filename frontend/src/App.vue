<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
  <UserContextModal 
    v-if="showModal"
    @close="showModal = false"
  />
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import Toast from 'primevue/toast'  
  import ConfirmDialog from 'primevue/confirmdialog'
  import UserContextModal from './components/UserContextModal.vue';
  import { useUserContextStore } from './stores/userContextStore';

  const userContextStore = useUserContextStore();
  const showModal = ref(false);

  onMounted(() => {
      userContextStore.loadFromStorage();

      if (!userContextStore.chosenBranch || !userContextStore.chosenCurrency) {
          showModal.value = true;
      }
  })
</script>