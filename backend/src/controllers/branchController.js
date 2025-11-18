import Branch from '../models/Branch.js'

export async function getBranchById(req, res) {
  try {
    const branch = await Branch.query().findById(req.params.id)
    if (!branch) return res.status(404).json({ message: 'Branch not found' })
    res.json(branch)  // <-- return the full object
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getAllBranches(req, res) {
  try {
    const branches = await Branch.query().where('is_deleted', 0); // Objection/Knex query
    res.json(branches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
