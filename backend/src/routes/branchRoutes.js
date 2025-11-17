import express from 'express'
import { getBranchById, getAllBranches } from '../controllers/branchController.js'

const router = express.Router()

router.get('/:id', getBranchById)
router.get('/', getAllBranches)

export default router

