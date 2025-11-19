<template>
  <Card class="shadow-lg">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-building text-oxford-blue"></i>
        <span class="text-oxford-blue">Pickup Branch</span>
      </div>
    </template>

    <template #subtitle>
      <p class="text-gray">Your selected pickup branch</p>
    </template>

    <template #content>
      <div v-if="loading" class="flex justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-oxford-blue"></i>
      </div>
      <div v-else-if="selectedBranch">
        <div class="p-4 border-2 border-oxford-blue rounded-lg bg-oxford-blue bg-opacity-10">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-white mb-3">{{ selectedBranch.branch_name }}</h4>
              <div class="space-y-2 text-sm text-white">
                <p>{{ selectedBranch.address }}</p>
                <p>{{ selectedBranch.contact_number }}</p>
                <p v-if="selectedBranch.business_hours">{{ selectedBranch.business_hours }}</p>
              </div>
            </div>
            <div>
              <i class="pi pi-check-circle text-2xl text-oxford-blue"></i>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-gray">
        <p>No branch selected yet</p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Change Branch"
          icon="pi pi-pencil"
          @click="openBranchModal"
          class="bg-oxford-blue text-white border-oxford-blue hover:bg-charcoal"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { getAllBranches } from '@/services/branchService'
import { useUserContextStore } from '@/stores/userContextStore'

const userContextStore = useUserContextStore()

// State
const allBranches = ref([])
const loading = ref(true)

// Emits
const emit = defineEmits(['openModal'])

// Computed
const selectedBranch = computed(() => {
  return allBranches.value.find(b => b.branch_id === userContextStore.branchId) || null
})

// Methods
const openBranchModal = () => {
  emit('openModal')
}

onMounted(async () => {
  try {
    allBranches.value = await getAllBranches()
    loading.value = false
  } catch (err) {
    console.error('Error fetching branches:', err)
    loading.value = false
  }
})
</script>

<style scoped>
:deep(.p-card) {
  border-radius: 12px;
}

:deep(.p-card-title) {
  font-size: 1.5rem;
  padding: 1.5rem 1.5rem 0;
}

:deep(.p-card-subtitle) {
  padding: 0.5rem 1.5rem;
}

:deep(.p-card-content) {
  padding: 1.5rem;
}

:deep(.p-card-footer) {
  padding: 1rem 1.5rem 1.5rem;
}

.text-oxford-blue {
  color: #102540;
}

.text-charcoal {
  color: #313D4D;
}

.text-gray {
  color: #777B7E;
}

.bg-oxford-blue {
  background-color: #102540;
}

.border-oxford-blue {
  border-color: #102540;
}

.hover\:bg-charcoal:hover {
  background-color: #313D4D;
}
</style>
