<template>
  <div class="w-full px-4 md:px-8 py-6">
    <Card class="w-full">
      <template #content>
        <div class="flex flex-col md:flex-row gap-10">

          <!-- LEFT: IMAGE GALLERY -->
          <div class="md:w-2/5 w-full flex justify-center items-start">
            <div class="w-full max-w-[500px] max-h-[500px] rounded bg-gray-100 overflow-hidden min-h[500px]">
              <Galleria v-show="images.length" :value="images" :showThumbnails="false" :showIndicators="true"
                :showItemNavigators="false" :autoPlay="true" :circular="true" :transitionInterval="3000"
                class="w-full h-[400px]">
                <template #item="{ item }">
                  <div class="w-full h-full flex justify-center items-center bg-gray-100 rounded">
                    <img :src="item" class="max-w-full max-h-full object-contain rounded" />
                  </div>
                </template>
              </Galleria>
            </div>
          </div>

          <!-- RIGHT: SHOE DETAILS -->
          <div class="md:w-3/5 w-full flex flex-col gap-5">

            <!-- Name, Brand & Branch -->
            <div>
              <h2 class="text-3xl font-bold leading-tight">{{ shoe.name }}</h2>
              <p class="text-gray-600 text-lg mt-1">{{ shoe.brand_name }}</p>
              <p class="text-gray-900 font-medium mt-1">
                Branch: {{ branch.branch_name }}
              </p>



            </div>

            <!-- Price -->
            <p class="text-2xl font-semibold text-orange-500">
              ₱{{ parseFloat(shoe.price).toLocaleString() }}
            </p>

            <!-- Categories -->
            <div>
              <label class="block mb-2 font-medium">Categories:</label>
              <div class="flex flex-wrap gap-2">
                <Chip v-for="cat in categories" :key="cat" :label="cat" class="bg-gray-200 text-gray-800" />
              </div>
            </div>

            <!-- SIZE SELECTOR -->
            <div>
              <label class="block mb-2 font-medium">Select Size:</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="size in sizes" :key="size.size" @click="selectedSize = size" :disabled="size.stock === 0"
                  :class="[
                    'px-4 py-2 rounded border',
                    size.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
                  ]"
                  :style="selectedSize?.size === size.size ? { backgroundColor: 'var(--color-oxford-blue)', color: 'white' } : {}">
                  {{ size.size }}
                </button>
              </div>

              <p v-if="selectedSize" class="text-sm mt-1">
                Stock left:
                <span :class="selectedSize.stock === 0 ? 'text-red-500' : 'text-green-600'">
                  {{ selectedSize.stock }}
                </span>
              </p>
            </div>


            <!-- Quantity -->
            <div>
              <label class="block mb-2 font-medium">Quantity:</label>
              <InputNumber v-model="quantity" :min="1" :max="selectedSize ? selectedSize.stock : 1" showButtons
                :step="1" buttonLayout="horizontal" input-class="w-16 text-center">
                <template #incrementicon>
                  <i class="pi pi-plus"></i>
                </template>
                <template #decrementicon>
                  <i class="pi pi-minus"></i>
                </template>
              </InputNumber>
            </div>


            <!-- Add to Cart -->
            <Button label="Add to Cart" icon="pi pi-shopping-cart" class="mt-4 w-full md:w-auto"
              :disabled="!selectedSize || selectedSize.stock === 0" @click="addToCart" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, watchEffect, toRefs } from 'vue'
import Card from 'primevue/card'
import Galleria from 'primevue/galleria'
import Chip from 'primevue/chip'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

const props = defineProps({
  shoe: { type: Object, required: true },
  images: { type: Array, default: () => [] },
  sizes: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  branch: { type: Object, default: () => ({ branch_name: 'Unknown Branch' }) }
})

const quantity = ref(1)
const selectedSize = ref(null)
const shoe = props.shoe
const images = props.images
const sizes = ref(props.sizes)
const categories = props.categories

function addToCart() {
  if (!selectedSize || selectedSize.stock === 0) return
  console.log(`[Cart] Added ${quantity.value} of size ${selectedSize.size} to cart at ${branchName}`)
}

watchEffect(() => {
  console.log('Shoe:', shoe)
  console.log('Selected Size:', selectedSize)
})


</script>

<style src="@/styles/tailwind.css"></style>