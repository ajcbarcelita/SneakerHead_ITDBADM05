import { defineStore } from 'pinia';

export const useUserContextStore = defineStore('userContext', {
    state: () => ({
        chosenBranch: null,
        chosenCurrency: 'PHP'
    }),

    getters: {
        hasBranchSelected: (state) => !!state.chosenBranch,
        hasCurrencySelected: (state) => !!state.chosenCurrency
    },
    actions: {
        setBranch(chosenBranch) {
            this.chosenBranch = chosenBranch;
            localStorage.setItem('chosenBranch', JSON.stringify(chosenBranch));
        },

        setCurrency(chosenCurrency) {
            this.chosenCurrency = chosenCurrency;
            localStorage.setItem('chosenCurrency', chosenCurrency);
        },

        loadFromStorage() {
            const storedBranch = localStorage.getItem('chosenBranch');
            const storedCurrency = localStorage.getItem('chosenCurrency');
            if (storedBranch) this.chosenBranch = JSON.parse(storedBranch);
            if (storedCurrency) this.chosenCurrency = storedCurrency;   

        },

        init() {
            this.loadFromStorage();
        },

        clear() {
            this.chosenBranch = null;
            this.chosenCurrency = 'PHP';
            localStorage.removeItem('chosenBranch');
            localStorage.removeItem('chosenCurrency');
        }
    }
})