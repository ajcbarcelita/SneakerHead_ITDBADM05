import { defineStore } from 'pinia'
import { getShoesByBranch, getFullShoeDetails } from '@/services/shoeService'
import { getBranch } from '@/services/branchService'

export const useShoeStore = defineStore('shoes', {
  state: () => ({
    shoes: [],
    selectedShoe: null,
    loading: false
  }),

  actions: {
    async loadShoes(branch_id) {
      this.loading = true
      console.log('[Store] Fetching shoes for branch:', branch_id)
      const res = await getShoesByBranch(branch_id)
      console.log('[Store] Shoes response:', res.data)
      this.shoes = res.data
      this.loading = false
    },

    async loadShoeDetails(shoe_id, branch_id) {
      this.selectedShoe = null
      this.loading = true
      console.log('[Store] Fetching shoe details:', { shoe_id, branch_id })
      const res = await getFullShoeDetails(shoe_id, branch_id)
      console.log('[Store] Raw response:', res.data)
    
      const data = res.data

      let branchName = 'Unknown Branch'
      let branchObj = null
      try {
      branchObj = await getBranch(branch_id)
      branchName = branchObj?.branch_name || 'Unknown Branch'
      } catch (err) {
      console.error('Error fetching branch:', err)
      }

      this.selectedShoe = {
        ...data["0"],           // basic shoe info
        categories: data.categories,
        images: data.images,
        sizes: data.sizes.map (s => ({
            size: parseFloat(s.size),
            stock: Number(s.stock)
        })),
        branch: branchObj
      }
      console.log('[Store] Formatted selectedShoe:', this.selectedShoe)
      this.loading = false
    }
  }
})

