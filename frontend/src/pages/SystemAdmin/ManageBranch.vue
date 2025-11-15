<template>
  <div class="min-h-screen flex flex-col bg-antiflash-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <!-- TABS -->
      <TabView>
        <!-- USERS TAB -->
        <TabPanel header="Manage Users">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Users</h1>
            
            <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <!-- SEARCH BAR -->
              <div class="flex items-center space-x-2 w-auto">
                <InputText 
                  v-model="userSearchQuery" 
                  placeholder="Search users by name or email..." 
                  class="w-80"
                />
                <Button icon="pi pi-search" class="search-btn" />
              </div>

              <!-- FILTERS ROW -->
              <div class="flex items-center space-x-4">
                <!-- FILTER BY BRANCH -->
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-charcoal">Branch:</span>
                  <Dropdown
                    v-model="selectedUserBranch"
                    :options="userBranchOptions"
                    optionLabel="label"
                    placeholder="All Branches"
                    class="w-48"
                  />
                </div>

                <!-- FILTER BY ROLE -->
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-charcoal">Role:</span>
                  <Dropdown
                    v-model="selectedUserRole"
                    :options="userRoleOptions"
                    optionLabel="label"
                    placeholder="All Roles"
                    class="w-48"
                  />
                </div>

                <!-- FILTER BY STATUS -->
                <div class="flex items-center space-x-3">
                  <span class="font-semibold text-charcoal">Status:</span>
                  <Dropdown
                    v-model="selectedUserStatus"
                    :options="userStatusOptions"
                    optionLabel="label"
                    placeholder="All Status"
                    class="w-48"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- USER LIST TABLE -->
          <div class="card">
            <DataTable 
              :value="filteredUsers" 
              tableStyle="min-width: 50rem" 
              :paginator="true" 
              :rows="10"
              :loading="loadingUsers"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column field="id" header="User ID" :sortable="true"></Column>
              <Column field="name" header="Name" :sortable="true"></Column>
              <Column field="email" header="Email" :sortable="true"></Column>
              <Column field="branchName" header="Branch" :sortable="true">
                <template #body="slotProps">
                  <span v-if="slotProps.data.branchName">{{ slotProps.data.branchName }}</span>
                  <span v-else class="text-gray-500">Unassigned</span>
                </template>
              </Column>
              <Column field="role" header="Role" :sortable="true">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.role" 
                      :severity="getRoleSeverity(slotProps.data.role)" />
                </template>
              </Column>
              <Column field="is_deleted" header="Status" :sortable="true">
                <template #body="slotProps">
                  <Tag 
                    :value="slotProps.data.is_deleted ? 'Inactive' : 'Active'" 
                    :severity="slotProps.data.is_deleted ? 'danger' : 'success'" 
                  />
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text edit-btn" 
                      @click="editUser(slotProps.data)" 
                    />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-4 text-gray-500">
                  No users found.
                </div>
              </template>
              <template #loading>
                <div class="text-center py-4">
                  Loading users...
                </div>
              </template>
            </DataTable>
          </div>
        </TabPanel>

        <!-- BRANCHES TAB -->
        <TabPanel header="Manage Branches">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Branches</h1>
            
            <div class="flex items-center space-x-4">
              <!-- SEARCH BAR -->
              <div class="flex items-center space-x-2 w-auto">
                <InputText 
                  v-model="branchSearchQuery" 
                  placeholder="Search branches by name or city..." 
                  class="w-80"
                />
                <Button icon="pi pi-search" class="search-btn" />
              </div>

              <!-- ADD BRANCH BUTTON -->
              <Button label="Add Branch" icon="pi pi-plus" class="add-btn" 
                      @click="showAddBranchDialog = true" />
            </div>
          </div>

          <!-- BRANCH LIST TABLE -->
          <div class="card">
            <DataTable 
              :value="filteredBranches" 
              tableStyle="min-width: 50rem" 
              :paginator="true" 
              :rows="10"
              :loading="loadingBranches"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column field="branch_id" header="Branch ID" :sortable="true"></Column>
              <Column field="branch_name" header="Branch Name" :sortable="true"></Column>
              <Column field="addressline1" header="Address Line 1" :sortable="true">
                <template #body="slotProps">
                  <span v-if="slotProps.data.addressline1">{{ slotProps.data.addressline1 }}</span>
                  <span v-else class="text-gray-500">-</span>
                </template>
              </Column>
              <Column field="addressline2" header="Address Line 2" :sortable="true">
                <template #body="slotProps">
                  <span v-if="slotProps.data.addressline2">{{ slotProps.data.addressline2 }}</span>
                  <span v-else class="text-gray-500">-</span>
                </template>
              </Column>
              <Column field="city_name" header="City" :sortable="true">
                <template #body="slotProps">
                  <span v-if="slotProps.data.city_name">{{ slotProps.data.city_name }}</span>
                  <span v-else class="text-gray-500">-</span>
                </template>
              </Column>
              <Column field="is_deleted" header="Status" :sortable="true">
                <template #body="slotProps">
                  <Tag 
                    :value="slotProps.data.is_deleted ? 'Inactive' : 'Active'" 
                    :severity="slotProps.data.is_deleted ? 'danger' : 'success'" 
                  />
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text edit-btn" 
                            @click="editBranch(slotProps.data)" />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-4 text-gray-500">
                  No branches found.
                </div>
              </template>
              <template #loading>
                <div class="text-center py-4">
                  Loading branches...
                </div>
              </template>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>

    <!-- EDIT USER DIALOG -->
    <Dialog v-model:visible="showEditUserDialog" :header="editUserDialogHeader" :modal="true" class="w-1/3">
      <div class="space-y-6">
        <!-- Read-only Personal Information Section -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-charcoal mb-4">Personal Information</h3>
          <div class="space-y-3">
            <div class="field">
              <label class="font-semibold text-charcoal block mb-1">Name</label>
              <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
                {{ editingUser.fname }} {{ editingUser.mname ? editingUser.mname + ' ' : '' }}{{ editingUser.lname }}
              </div>
            </div>
            <div class="field">
              <label class="font-semibold text-charcoal block mb-1">Email</label>
              <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
                {{ editingUser.email }}
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Personal information cannot be modified</p>
        </div>

        <!-- Editable Role Section -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-charcoal mb-4">Role Assignment</h3>
          <div class="field">
            <label class="font-semibold text-charcoal block mb-2">User Role <span class="text-red-500">*</span></label>
            <Dropdown
              v-model="editingUser.role_id"
              :options="userRoleOptionsForEdit"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Role"
              class="w-full"
            />
          </div>
        </div>

        <!-- Editable Branch Assignment Section -->
        <div class="border-b pb-4">
          <h3 class="text-lg font-semibold text-charcoal mb-4">Branch Assignment</h3>
          <div class="field">
            <label class="font-semibold text-charcoal block mb-2">Branch</label>
            <Dropdown
              v-model="editingUser.address_id"
              :options="availableBranchesForEdit"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Branch"
              class="w-full"
            />
            <small class="text-gray-500 mt-1 block">Leave unassigned if no branch assignment needed</small>
          </div>
        </div>

        <!-- Account Status Section -->
        <div>
          <h3 class="text-lg font-semibold text-charcoal mb-4">Account Status</h3>
          <div class="flex items-center space-x-4">
            <Checkbox 
              v-model="editingUser.is_deleted" 
              :binary="true" 
              inputId="isDeleted" 
              :trueValue="true" 
              :falseValue="false"
            />
            <label for="isDeleted" class="font-semibold text-charcoal">Deactivate Account</label>
          </div>
          <small class="text-gray-500 mt-1 block">When checked, user account will be deactivated and cannot log in</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelEditUser" />
        <Button label="Save Changes" icon="pi pi-check" class="save-btn" @click="saveUserChanges" :loading="loadingUpdateUser" />
      </template>
    </Dialog>

    <!-- ADD BRANCH DIALOG -->
    <Dialog v-model:visible="showAddBranchDialog" header="Add New Branch" :modal="true" class="w-1/3">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Branch Name <span class="text-red-500">*</span></label>
          <InputText v-model="newBranch.branch_name" class="w-full" placeholder="Enter branch name" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Address Line 1</label>
          <InputText v-model="newBranch.addressline1" class="w-full" placeholder="Enter address line 1" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Address Line 2</label>
          <InputText v-model="newBranch.addressline2" class="w-full" placeholder="Enter address line 2" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">City <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="newBranch.city_id"
            :options="cityOptions"
            optionLabel="city_name"
            optionValue="city_id"
            placeholder="Select City"
            class="w-full"
            :filter="true"
            filterPlaceholder="Search cities..."
            :showClear="true"
            :loading="loadingCities"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                <span>{{ getCityName(slotProps.value) }}</span>
              </div>
              <span v-else class="text-gray-400">
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #loadingicon>
              <i class="pi pi-spinner pi-spin" />
            </template>
          </Dropdown>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelAddBranch" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="saveBranch" :loading="loadingAddBranch" />
      </template>
    </Dialog>

    <!-- EDIT BRANCH DIALOG -->
    <Dialog v-model:visible="showEditBranchDialog" :header="editBranchDialogHeader" :modal="true" class="w-1/3">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">Branch Name <span class="text-red-500">*</span></label>
          <InputText v-model="editingBranch.branch_name" class="w-full" placeholder="Enter branch name" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Address Line 1</label>
          <InputText v-model="editingBranch.addressline1" class="w-full" placeholder="Enter address line 1" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Address Line 2</label>
          <InputText v-model="editingBranch.addressline2" class="w-full" placeholder="Enter address line 2" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">City <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="editingBranch.city_id"
            :options="cityOptions"
            optionLabel="city_name"
            optionValue="city_id"
            placeholder="Select City"
            class="w-full"
            :filter="true"
            filterPlaceholder="Search cities..."
            :showClear="true"
            :loading="loadingCities"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                <span>{{ getCityName(slotProps.value) }}</span>
              </div>
              <span v-else class="text-gray-400">
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #loadingicon>
              <i class="pi pi-spinner pi-spin" />
            </template>
          </Dropdown>
        </div>

        <!-- Branch Status Section -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-semibold text-charcoal mb-4">Branch Status</h3>
          <div class="flex items-center space-x-4">
            <Checkbox 
              v-model="editingBranch.is_deleted" 
              :binary="true" 
              inputId="branchIsDeleted" 
              :trueValue="true" 
              :falseValue="false"
            />
            <label for="branchIsDeleted" class="font-semibold text-charcoal">Deactivate Branch</label>
          </div>
          <small class="text-gray-500 mt-1 block">When checked, branch will be deactivated and cannot be assigned to users</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelEditBranch" />
        <Button label="Save Changes" icon="pi pi-check" class="save-btn" @click="saveBranchChanges" :loading="loadingUpdateBranch" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import NavBarSA from '@/components/NavBarSA.vue'
import Footer from '@/components/Footer.vue'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import SAService from '@/services/SAService'

const toast = useToast()

// USERS DATA
const selectedUserRole = ref({ label: 'All Roles', value: 'all' })
const selectedUserBranch = ref({ label: 'All Branches', value: 'all' })
const selectedUserStatus = ref({ label: 'All Status', value: 'all' }) // NEW
const userSearchQuery = ref('')
const users = ref([])
const loadingUsers = ref(false)
const loadingUpdateUser = ref(false)

// BRANCHES DATA
const branchSearchQuery = ref('')
const showAddBranchDialog = ref(false)
const showEditBranchDialog = ref(false)
const branches = ref([])
const loadingBranches = ref(false)
const loadingAddBranch = ref(false)
const loadingUpdateBranch = ref(false)

// ADD BRANCH DIALOG STATE
const newBranch = ref({
  branch_name: '',
  addressline1: '',
  addressline2: '',
  city_id: null
})

// CITIES DATA
const cityOptions = ref([])
const loadingCities = ref(false)

// EDIT BRANCH DIALOG STATE
const editingBranch = ref({
  branch_id: null,
  branch_name: '',
  addressline1: '',
  addressline2: '',
  city_id: null,
  is_deleted: false
})

// EDIT USER DIALOG STATE
const showEditUserDialog = ref(false)
const editingUser = ref({
  id: null,
  fname: '',
  mname: '',
  lname: '',
  email: '',
  role_id: null,
  address_id: null,
  is_deleted: false
})

// Dropdown options for user roles
const userRoleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Branch Manager', value: 'Branch Manager' },
  { label: 'Customer', value: 'Customer' }
]

// Dropdown options for user branches
const userBranchOptions = ref([
  { label: 'All Branches', value: 'all' },
  { label: 'Unassigned', value: 'unassigned' }
])

// NEW: Dropdown options for user status
const userStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Dropdown options for editing user roles
const userRoleOptionsForEdit = ref([
  { label: 'Admin', value: 1 },
  { label: 'Branch Manager', value: 2 },
  { label: 'Customer', value: 3 }
])

// Available branches for assignment
const availableBranchesForEdit = computed(() => {
  return [
    { label: 'Unassigned', value: null },
    ...(branches.value.map(branch => ({
      label: branch.branch_name,
      value: branch.address_id
    })) || [])
  ]
})

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by role
  if (selectedUserRole.value.value !== 'all') {
    filtered = filtered.filter(user => 
      user.role.toLowerCase().includes(selectedUserRole.value.value.toLowerCase())
    )
  }

  // Filter by branch
  if (selectedUserBranch.value.value !== 'all') {
    if (selectedUserBranch.value.value === 'unassigned') {
      filtered = filtered.filter(user => !user.branchName)
    } else {
      filtered = filtered.filter(user => 
        user.branchName && user.branchName.toLowerCase() === selectedUserBranch.value.value.toLowerCase()
      )
    }
  }

  // NEW: Filter by status
  if (selectedUserStatus.value.value !== 'all') {
    if (selectedUserStatus.value.value === 'active') {
      filtered = filtered.filter(user => !user.is_deleted)
    } else if (selectedUserStatus.value.value === 'inactive') {
      filtered = filtered.filter(user => user.is_deleted)
    }
  }

  // Filter by search query for users
  if (userSearchQuery.value) {
    const query = userSearchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
  }

  return filtered
})

const filteredBranches = computed(() => {
  let filtered = branches.value

  // Filter by search query for branches
  if (branchSearchQuery.value) {
    const query = branchSearchQuery.value.toLowerCase()
    filtered = filtered.filter(branch => 
      branch.branch_name.toLowerCase().includes(query) || 
      (branch.city_name && branch.city_name.toLowerCase().includes(query)) ||
      (branch.addressline1 && branch.addressline1.toLowerCase().includes(query))
    )
  }

  return filtered
})

const getCityName = (cityId) => {
  const city = cityOptions.value.find(c => c.city_id === cityId)
  return city ? city.city_name : 'Unknown City'
}

// Edit user dialog header
const editUserDialogHeader = computed(() => {
  return `Manage User: ${editingUser.value.fname} ${editingUser.value.lname}`
})

// Edit branch dialog header
const editBranchDialogHeader = computed(() => {
  return `Edit Branch: ${editingBranch.value.branch_name}`
})

// Methods
const getRoleSeverity = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'danger'
    case 'branch manager': return 'warning'
    case 'customer': return 'info'
    default: return 'secondary'
  }
}

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await SAService.getUsers()
    users.value = response.data.users || []
    
    // Update branch options from actual db
    const uniqueBranches = [...new Set(response.data.users
      .map(user => user.branchName)
      .filter(branchName => branchName !== null && branchName !== '')
    )]
    
    userBranchOptions.value = [
      { label: 'All Branches', value: 'all' },
      { label: 'Unassigned', value: 'unassigned' },
      ...uniqueBranches.map(branch => ({ 
        label: branch, 
        value: branch.toLowerCase() 
      }))
    ]
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users: ' + error.message, life: 3000 })
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const fetchBranches = async () => {
  loadingBranches.value = true
  try {
    const response = await SAService.getBranches()
    branches.value = response.data.branches || []
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches: ' + error.message, life: 3000 })
    branches.value = []
  } finally {
    loadingBranches.value = false
  }
}

const fetchCities = async () => {
  loadingCities.value = true
  try {
    const response = await SAService.getCities()
    cityOptions.value = response.data.cities || []
  } catch (error) {
    console.error('Error fetching cities:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cities', life: 3000 })
    cityOptions.value = []
  } finally {
    loadingCities.value = false
  }
}

// EDIT USER METHODS
const editUser = (user) => {
  editingUser.value = {
    id: user.id,
    fname: user.fname,
    mname: user.mname || '',
    lname: user.lname,
    email: user.email,
    role_id: user.role_id,
    address_id: user.address_id,
    is_deleted: user.is_deleted || false
  }
  
  showEditUserDialog.value = true
}

const saveUserChanges = async () => {
  loadingUpdateUser.value = true
  try {
    if (!editingUser.value.role_id) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a role', life: 3000 })
      return
    }
    
    const updateData = {
      role_id: editingUser.value.role_id,
      address_id: editingUser.value.address_id,
      is_deleted: editingUser.value.is_deleted
    }

    await SAService.updateUser(editingUser.value.id, updateData)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 })
    showEditUserDialog.value = false
    await fetchUsers()
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user: ' + error.message, life: 3000 })
  } finally {
    loadingUpdateUser.value = false
  }
}

const cancelEditUser = () => {
  showEditUserDialog.value = false
  resetEditingUser()
}

const resetEditingUser = () => {
  editingUser.value = {
    id: null,
    fname: '',
    mname: '',
    lname: '',
    email: '',
    role_id: null,
    address_id: null,
    is_deleted: false
  }
}

// BRANCH METHODS
const editBranch = (branch) => {
  editingBranch.value = {
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    addressline1: branch.addressline1 || '',
    addressline2: branch.addressline2 || '',
    city_id: branch.city_id,
    is_deleted: branch.is_deleted || false
  }
  
  showEditBranchDialog.value = true
}

const saveBranchChanges = async () => {
  loadingUpdateBranch.value = true
  try {
    if (!editingBranch.value.branch_name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please enter a branch name', life: 3000 })
      return
    }

    if (!editingBranch.value.city_id) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a city', life: 3000 })
      return
    }

    const updateData = {
      branch_name: editingBranch.value.branch_name,
      addressline1: editingBranch.value.addressline1 || '',
      addressline2: editingBranch.value.addressline2 || '',
      city_id: editingBranch.value.city_id,
      is_deleted: editingBranch.value.is_deleted || false
    }

    // Update branch
    await SAService.updateBranch(editingBranch.value.branch_id, updateData)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Branch updated successfully', life: 3000 })
    showEditBranchDialog.value = false
    await fetchBranches()
    
  } catch (error) {
    console.error('Error updating branch:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to update branch: ' + error.message, 
      life: 5000 
    })
  } finally {
    loadingUpdateBranch.value = false
  }
}

const cancelEditBranch = () => {
  showEditBranchDialog.value = false
  resetEditingBranch()
}

const resetEditingBranch = () => {
  editingBranch.value = {
    branch_id: null,
    branch_name: '',
    addressline1: '',
    addressline2: '',
    city_id: null,
    is_deleted: false
  }
}

const saveBranch = async () => {
  loadingAddBranch.value = true
  try {
    if (!newBranch.value.branch_name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please enter a branch name', life: 3000 })
      return
    }

    if (!newBranch.value.city_id) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a city', life: 3000 })
      return
    }

    const branchData = {
      branch_name: newBranch.value.branch_name,
      addressline1: newBranch.value.addressline1 || '',
      addressline2: newBranch.value.addressline2 || '',
      city_id: newBranch.value.city_id
    }

    await SAService.addBranch(branchData)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Branch added successfully', life: 3000 })
    showAddBranchDialog.value = false
    resetNewBranch()
    await fetchBranches()
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add branch: ' + error.message, life: 3000 })
  } finally {
    loadingAddBranch.value = false
  }
}

const cancelAddBranch = () => {
  showAddBranchDialog.value = false
  resetNewBranch()
}

const resetNewBranch = () => {
  newBranch.value = {
    branch_name: '',
    addressline1: '',
    addressline2: '',
    city_id: null
  }
}

// Initialize data
onMounted(() => {
  fetchUsers()
  fetchBranches()
  fetchCities()
})
</script>

<style scoped>
.search-btn.p-button {
  background-color: var(--color-oxford-blue) !important;
  border-color: var(--color-oxford-blue) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.search-btn.p-button:hover {
  background-color: #0a1a2d !important;
}

.add-btn.p-button {
  background-color: var(--color-giants-orange) !important;
  border-color: var(--color-giants-orange) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.add-btn.p-button:hover {
  background-color: #d45601 !important;
}

.save-btn.p-button {
  background-color: var(--color-giants-orange) !important;
  border-color: var(--color-giants-orange) !important;
  color: var(--color-antiflash-white) !important;
  border: 0 !important;
  box-shadow: none !important;
}

.save-btn.p-button:hover {
  background-color: #d45601 !important;
}

.edit-btn.p-button {
  color: var(--color-giants-orange) !important;
}

.edit-btn.p-button:hover {
  background-color: rgba(234, 102, 45, 0.1) !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>