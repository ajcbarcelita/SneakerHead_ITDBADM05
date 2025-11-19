import api from './api.js'

export function getShoesByBranch(branch_id) {
    return api.get(`/shoes/branch/${branch_id}`)
}

export function getFullShoeDetails(shoe_id, branch_id) {
    return api.get(`/shoes/${shoe_id}/branch/${branch_id}`)
}

// --- New functions for filters ---
export function getAllBrands() {
    return api.get('/shoes/brands')
}

export function getAllCategories() {
    return api.get('/shoes/categories')
}