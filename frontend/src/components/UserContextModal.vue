<template>
  <Dialog
    header="Select Pickup Branch & Currency"
    :visible="visible"
    modal
    :closable="false"
    @hide="$emit('close')"
    class="w-full max-w-md"
  >
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
  import Dialog from 'primevue/dialog';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { ref, onMounted, computed } from 'vue';
  import { useUserContextStore } from '@/stores/userContextStore';
  import { getAllBranches } from '@/services/branchService';
  import { getCurrencies } from '@/services/currencyService';

  const emit = defineEmits(['close']);
  const userContextStore = useUserContextStore();

  // Load localStorage
  userContextStore.loadFromStorage();

  const visible = ref(true);
  const branches = ref([]);
  const currencies = ref([]);

  const selectedBranch = ref(userContextStore.branchId || null);
  const selectedCurrency = ref(userContextStore.chosenCurrency || 'PHP');

  const canCancel = computed(() =>
      !!userContextStore.branchId || !!userContextStore.chosenCurrency
  );

  onMounted(async () => {
      try {
          branches.value = await getAllBranches();
          currencies.value = await getCurrencies();
      } catch (err) {
          console.error('Error fetching branches or currencies', err);
      }
  });

  function applyPreferences() {
      if (!selectedBranch.value) {
          alert('Please select a valid branch.');
          return;
      }

      userContextStore.setBranch(Number(selectedBranch.value));
      userContextStore.setCurrency(selectedCurrency.value);

      visible.value = false;
      emit('close');
  }

  function cancel() {
      if (canCancel.value) {
          visible.value = false;
          emit('close');
      }
  }
</script>