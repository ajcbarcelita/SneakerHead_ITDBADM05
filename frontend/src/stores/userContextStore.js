import { defineStore } from 'pinia';

export const useUserContextStore = defineStore('userContext', {
    state: () => ({
        branchId: null,
        chosenCurrency: 'PHP',
        showModal: false
    }),

    getters: {
        hasBranchSelected: (state) => !!state.branchId,
        hasCurrencySelected: (state) => !!state.chosenCurrency
    },

    actions: {
        setModal(val) {
            this.showModal = val;
        },

        setBranch(branchId) {
            this.branchId = branchId;
            localStorage.setItem('branchId', branchId);
        },

        setCurrency(chosenCurrency) {
            this.chosenCurrency = chosenCurrency;
            localStorage.setItem('chosenCurrency', chosenCurrency);
        },

        loadFromStorage() {
            const storedBranchId = localStorage.getItem('branchId');
            const storedCurrency = localStorage.getItem('chosenCurrency');

            if (storedBranchId) this.branchId = Number(storedBranchId);
            if (storedCurrency) this.chosenCurrency = storedCurrency;
        },

        clear() {
            this.branchId = null;
            this.chosenCurrency = 'PHP';
            localStorage.removeItem('branchId');
            localStorage.removeItem('chosenCurrency');
        }
    }
});