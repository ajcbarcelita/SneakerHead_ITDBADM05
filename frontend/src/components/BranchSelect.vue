<template>
  <Card class="shadow-lg">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-building text-oxford-blue"></i>
        <span class="text-oxford-blue">Select Pickup Branch</span>
      </div>
    </template>

    <template #subtitle>
      <p class="text-gray">Choose a branch to pick up your order</p>
    </template>

    <template #content>
      <div class="space-y-3">
        <div
          v-for="branch in branches"
          :key="branch.id"
          @click="selectBranch(branch.id)"
          :class="[
            'p-4 border-2 rounded-lg cursor-pointer transition-all',
            selectedBranchId === branch.id
              ? 'border-oxford-blue bg-oxford-blue bg-opacity-10'
              : 'border-gray-300 hover:border-oxford-blue'
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-charcoal mb-1">{{ branch.name }}</h4>
              <p class="text-sm text-gray mb-2">{{ branch.address }}</p>
              <div class="flex items-center gap-4 text-sm">
                <span class="flex items-center gap-1 text-gray">
                  <i class="pi pi-phone text-xs"></i>
                  {{ branch.phone }}
                </span>
                <span class="flex items-center gap-1 text-gray">
                  <i class="pi pi-clock text-xs"></i>
                  {{ branch.hours }}
                </span>
              </div>
            </div>
            <div v-if="selectedBranchId === branch.id">
              <i class="pi pi-check-circle text-2xl text-oxford-blue"></i>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Clear Selection"
          icon="pi pi-times"
          outlined
          @click="clearSelection"
          class="text-gray border-gray-300 hover:bg-gray-100"
          :disabled="!selectedBranchId"
        />
        <Button
          label="Confirm Branch"
          icon="pi pi-check"
          @click="confirmBranch"
          :disabled="!selectedBranchId"
          class="bg-oxford-blue text-white border-oxford-blue hover:bg-charcoal"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

// Props
const props = defineProps({
  branches: {
    type: Array,
    required: true,
    default: () => []
  },
  initialBranchId: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['branchSelected'])

// State
const selectedBranchId = ref(props.initialBranchId)

// Methods
const selectBranch = (branchId) => {
  selectedBranchId.value = branchId
}

const clearSelection = () => {
  selectedBranchId.value = null
}

const confirmBranch = () => {
  if (!selectedBranchId.value) {
    return
  }

  const selectedBranch = props.branches.find(b => b.id === selectedBranchId.value)

  if (selectedBranch) {
    emit('branchSelected', {
      branchId: selectedBranchId.value,
      branchData: selectedBranch
    })
  }
}
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
