import { defineStore } from 'pinia';

export const useUserContextStore = defineStore('userContext', {
    state: () => ({
        branchId: null,
        chosenCurrency: 'PHP',
        currencyRate: 1.00
    }),

    getters: {
        hasBranchSelected: (state) => !!state.branchId,
        hasCurrencySelected: (state) => !!state.chosenCurrency
    },

    actions: {
        setBranch(branchId) {
            this.branchId = branchId;
            localStorage.setItem('branchId', branchId);
        },

        setCurrency(chosenCurrency, currencyRate = 1.00) {
            this.chosenCurrency = chosenCurrency;
            this.currencyRate = currencyRate;
            localStorage.setItem('chosenCurrency', chosenCurrency);
            localStorage.setItem('currencyRate', currencyRate);
        },

        loadFromStorage() {
            const storedBranchId = localStorage.getItem('branchId');
            const storedCurrency = localStorage.getItem('chosenCurrency');
            const storedRate = localStorage.getItem('currencyRate');

            if (storedBranchId) this.branchId = Number(storedBranchId);
            if (storedCurrency) this.chosenCurrency = storedCurrency;
            if (storedRate) this.currencyRate = Number(storedRate);
        },

        clear() {
            this.branchId = null;
            this.chosenCurrency = 'PHP';
            this.currencyRate = 1.00;
            localStorage.removeItem('branchId');
            localStorage.removeItem('chosenCurrency');
            localStorage.removeItem('currencyRate');
        }
    }
});
