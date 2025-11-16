<template>
  <div class="max-w-6xl mx-auto p-6">
    <Card class="flex flex-col md:flex-row gap-6">
      <!-- Left: Images -->
      <div class="md:w-1/2">
        <Galleria :value="[]" :showThumbnails="true" :autoPlay="false" />
      </div>

      <!-- Right: Shoe Info -->
      <div class="md:w-1/2 flex flex-col gap-4">
        <!-- Name & Brand -->
        <h2 class="text-2xl font-bold">Shoe Name</h2>
        <p class="text-lg text-gray-600">Brand</p>

        <!-- Price -->
        <p class="text-xl font-semibold text-giants-orange">$0.00</p>

        <!-- Categories -->
        <div>
          <Chips :value="[]" placeholder="Categories" />
        </div>

        <!-- Size Selector -->
        <div>
          <label class="block mb-1">Select Size:</label>
          <SelectButton :options="[]" optionLabel="size" />
        </div>

        <!-- Quantity -->
        <div>
          <label class="block mb-1">Quantity:</label>
          <InputNumber v-model="quantity" :min="1" :max="10" showButtons />
        </div>

        <!-- Add to Cart Button -->
        <Button label="Add to Cart" icon="pi pi-shopping-cart" class="mt-4" />
      </div>
    </Card>
  </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { Card } from 'primevue/card'
    import { Galleria } from 'primevue/galleria'
    import { Chips } from 'primevue/chips'
    import { SelectButton } from 'primevue/selectbutton'
    import { InputNumber } from 'primevue/inputnumber'
    import { Button } from 'primevue/button'

    const quantity = ref(1)
</script>


<style scoped>
/* Optional: adjust card padding/spacing */
</style>
