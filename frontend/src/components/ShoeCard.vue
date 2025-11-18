<template>
    <Card 
        class="cursor-pointer hover:shadow-lg transition-shadow duration-300" 
        @click="handleClick"
        style="min-height: 400px;"
    >
        <template #content>
            <div class="flex flex-col h-full">
                <!-- Image Section -->
                <div class="w-full h-48 bg-gray-200 rounded overflow-hidden mb-3">
                    <img 
                        :src="image" 
                        :alt="shoe.name" 
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                    />
                </div>

                <!-- Content Section -->
                <div class="flex-1">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div class="flex-1 min-w-0">
                            <p class="text-lg font-semibold text-giants-orange truncate">{{ shoe.name || 'No Name' }}</p>
                            <p class="text-sm text-gray-600 mt-1 truncate">{{ shoe.brand_name || shoe.brand || 'No Brand' }}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <p class="text-lg font-bold whitespace-nowrap">{{ formattedPrice }}</p>
                        </div>
                    </div>

                    <!-- Action Section -->
                    <div class="mt-4 flex items-center justify-between">
                        <div v-if="showBranch" class="text-xs px-2 py-1 bg-gray-100 rounded border text-gray-600 truncate">
                            {{ branchName || 'Branch' }}
                        </div>
                        <Button 
                            label="View" 
                            class="p-button-sm" 
                            @click.stop="handleClick"
                            style="background-color: #ff6b35; border-color: #ff6b35;"
                        />
                    </div>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const emit = defineEmits(['click'])

const props = defineProps({
    shoe: { type: Object, required: true },
    branchId: { type: [Number, String], default: null },
    branchName: { type: String, default: '' },
    showBranch: { type: Boolean, default: false },
    currency: { type: String, default: 'PHP' },
    currencyRate: { type: Number, default: 1 }
})

// Computed properties
const image = computed(() => {
    // Use the actual thumbnail from your API data
    return props.shoe.thumbnail || '/placeholder-shoe.png'
})

const formattedPrice = computed(() => {
    const price = props.shoe.price
    
    if (!price && price !== 0) return 'Price unavailable'
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    const convertedPrice = numericPrice * props.currencyRate
    
    if (props.currency === 'PHP') {
        return `₱${convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: props.currency,
            minimumFractionDigits: 2
        }).format(convertedPrice)
    }
})

const handleClick = () => {
    emit('click')
}


</script>

<style scoped>
.p-card {
    border-radius: 0.5rem;
}
</style>