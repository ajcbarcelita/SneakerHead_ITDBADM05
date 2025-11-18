<template>
  <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="onClick">
    <div class="flex flex-col">
      <div class="w-full h-48 bg-gray-100 rounded overflow-hidden mb-3">
        <img :src="image" :alt="shoe.name" class="w-full h-full object-cover" />
      </div>

      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <p class="text-lg font-semibold text-giants-orange truncate">{{ shoe.name }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ shoe.brand || '' }}</p>
        </div>

        <div class="text-right">
          <p class="text-lg font-bold">{{ formattedPrice }}</p>
          <p class="text-xs text-gray-500">{{ totalStockLabel }}</p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <div v-if="showBranch" class="text-xs px-2 py-1 bg-white rounded border text-gray-600">
          {{ branchName || 'Branch' }}
        </div>

        <Button
          label="View"
          class="p-button-sm menu-btn"
          @click.stop="onClick"
        />
      </div>
    </div>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'
import Button from 'primevue/button'

const props = defineProps({
  shoe: { type: Object, required: true },
  branchId: { type: [Number, String], default: null },
  branchName: { type: String, default: '' },
  showBranch: { type: Boolean, default: false },
  currency: { type: String, default: 'PHP' },
  currencyRate: { type: Number, default: 1 } 
})


</script>

<style scoped>
.p-card {
  border-radius: 0.5rem;
}
</style>