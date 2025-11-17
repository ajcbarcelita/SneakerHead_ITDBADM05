import api from './api.js'

export async function getBranch(branchId) {
  try {
    const res = await api.get(`/branches/${branchId}`)
    return res.data // will now be the full branch object
  } catch (err) {
    console.error('Error fetching branch:', err)
    throw err
  }
}

export async function getAllBranches() {
  try {
    const res = await api.get(`/branches`)
    return res.data
  } catch (err) {
    console.error('Error fetching branches:', err)
    throw err
  }
}