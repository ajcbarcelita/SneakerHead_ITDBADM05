<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
  import Toast from 'primevue/toast'  
  import ConfirmDialog from 'primevue/confirmdialog'
</script>
