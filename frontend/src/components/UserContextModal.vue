<template>
  <Dialog
    header="Select Pickup Branch & Currency"
    :visible="visibleProp"
    modal
    :closable="false"
    @hide="onHide"
    class="w-full max-w-md"
  >
    <Toast />

    <div class="space-y-4">
      <!-- Branch Dropdown -->
      <div>
        <label class="block mb-1">Branch<span class="text-red-400">*</span></label>
        <Dropdown
          v-model="selectedBranch"
          :options="branches"
          optionLabel="branch_name"
          optionValue="branch_id"
          placeholder="Select a branch."
          class="w-full"
        />
      </div>

      <!-- Currency Dropdown -->
      <div>
        <label class="block mb-1">Currency<span class="text-red-400">*</span></label>
        <Dropdown
          v-model="selectedCurrency"
          :options="currencies"
          optionLabel="currency_name"
          optionValue="currency_code"
          placeholder="Select a currency."
          class="w-full"
        />
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-2 mt-4">
        <Button
            label="Cancel"
            outlined
            class="p-button-danger"
            @click="cancel"
            :disabled="!canCancel"
        />
        <Button
          label="Apply"
          :disabled="!selectedBranch || !selectedCurrency"
          @click="applyPreferences"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserContextStore } from '@/stores/userContextStore';
import { useAuthStore } from '@/stores/authStore';
import { getAllBranches } from '@/services/branchService';
import { getCurrenciesWithRates } from '@/services/currencyService';
import cartService from '@/services/cartService';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toastRef = ref(null);
const toast = useToast(toastRef);

const userContextStore = useUserContextStore();
const authStore = useAuthStore();

userContextStore.loadFromStorage();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const visibleProp = computed (() => props.visible);
const emit = defineEmits(['update:visible', 'close']);

const branches = ref([]);
const currencies = ref([]);

const selectedBranch = ref(userContextStore.branchId || null);
const selectedCurrency = ref(userContextStore.chosenCurrency || 'PHP');

const canCancel = computed(() => !!userContextStore.branchId || !!userContextStore.chosenCurrency);

onMounted(async () => {
    try {
        branches.value = await getAllBranches();
        currencies.value = await getCurrenciesWithRates();
    } catch (err) {
        console.error('Error fetching branches or currencies', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches or currencies', life: 4000 });
    }
});

function onHide() {
  emit('update:visible', false);
  emit('close');
}
 
async function applyPreferences() {
    if (!selectedBranch.value) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'Please select a valid branch', life: 3000 });
        return;
    }

    // Always update local storage
    userContextStore.setBranch(Number(selectedBranch.value));
    userContextStore.setCurrency(selectedCurrency.value);

    // Check if user is logged in and is a Customer, if yes, only do cart operations
    if (authStore.isLoggedIn && authStore.isCustomer) {
        try {
            // Fetch selected currency rate to PHP
            const currencyObj = currencies.value.find(c => c.currency_code === selectedCurrency.value);
            const rateToPeso = Number(currencyObj?.exchangeRates?.[0]?.rate_to_php ?? 1);

            // Try fetching existing cart
            let cart;
            try {
                cart = await cartService.getCart(selectedBranch.value);
            } catch (err) {
                // Cart not found, will create
            }

            if (!cart) {
                await cartService.createCart({
                    branch_id: Number(selectedBranch.value),
                    currency_code: selectedCurrency.value,
                    currency_rate_to_peso: rateToPeso
                });
                toast.add({ severity: 'success', summary: 'Cart Created', detail: 'Your cart has been created.', life: 4000 });
            } else if (cart.currency_code !== selectedCurrency.value) {
                await cartService.updateCurrency(cart.cart_id, selectedCurrency.value, rateToPeso);
                toast.add({ severity: 'success', summary: 'Cart Updated', detail: 'Cart currency updated.', life: 4000 });
            } else {
                toast.add({ severity: 'info', summary: 'No Changes', detail: 'Cart already uses this currency.', life: 3000 });
            }

        } catch (err) {
            console.error(err);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update cart', life: 4000 });
        }
    } else {
        // Guest or non-Customer
        toast.add({
            severity: 'info',
            summary: 'Preferences Saved',
            detail: 'Preferences saved locally. Log in or register to save and access cart.',
            life: 4000
        });
    }

    emit('update:visible', false);
    emit('close');
}

function cancel() {
    if (canCancel.value) {
        emit('update:visible', false);
        emit('close');
    }
}
</script>