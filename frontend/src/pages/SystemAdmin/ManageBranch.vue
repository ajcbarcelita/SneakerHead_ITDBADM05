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

                <!-- ADD USER BUTTON -->
                <Button label="Add User" icon="pi pi-plus" class="add-btn" 
                        @click="showAddUserDialog = true" />
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
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text edit-btn" 
                      @click="editUser(slotProps.data)" 
                    />
                    <Button 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text delete-btn" 
                      @click="confirmDeleteUser(slotProps.data)" 
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
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text edit-btn" 
                            @click="editBranch(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-text delete-btn" 
                            @click="confirmDeleteBranch(slotProps.data)" />
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

    <!-- ADD USER DIALOG -->
    <Dialog v-model:visible="showAddUserDialog" header="Add New User" :modal="true" class="w-1/3">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="font-semibold text-charcoal">First Name <span class="text-red-500">*</span></label>
            <InputText v-model="newUser.fname" class="w-full" placeholder="Enter first name" />
          </div>
          <div class="field">
            <label class="font-semibold text-charcoal">Middle Name</label>
            <InputText v-model="newUser.mname" class="w-full" placeholder="Enter middle name" />
          </div>
        </div>
        
        <div class="field">
          <label class="font-semibold text-charcoal">Last Name <span class="text-red-500">*</span></label>
          <InputText v-model="newUser.lname" class="w-full" placeholder="Enter last name" />
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Email <span class="text-red-500">*</span></label>
          <InputText v-model="newUser.email" class="w-full" placeholder="Enter email address" />
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Password <span class="text-red-500">*</span></label>
          <InputText v-model="newUser.password" type="password" class="w-full" placeholder="Enter password" />
          <small class="text-gray-500 mt-1 block">Password must be at least 8 characters long</small>
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Confirm Password <span class="text-red-500">*</span></label>
          <InputText v-model="newUser.confirmPassword" type="password" class="w-full" placeholder="Confirm password" />
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">User Role <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="newUser.role_id"
            :options="userRoleOptionsForEdit"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Role"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-semibold text-charcoal">Branch Assignment</label>
          <Dropdown
            v-model="newUser.branchId"
            :options="availableBranchesForEdit"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Branch"
            class="w-full"
          />
          <small class="text-gray-500 mt-1 block">Leave unassigned if no branch assignment needed</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelAddUser" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="saveUser" :loading="loadingAddUser" />
      </template>
    </Dialog>

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
              v-model="editingUser.branchId"
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
            <Checkbox v-model="editingUser.is_deleted" :binary="true" inputId="isDeleted" />
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
          <label class="font-semibold text-charcoal">City</label>
          <InputText v-model="newBranch.city_name" class="w-full" placeholder="Enter city" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelAddBranch" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="saveBranch" />
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
          <label class="font-semibold text-charcoal">City</label>
          <InputText v-model="editingBranch.city_name" class="w-full" placeholder="Enter city" />
        </div>
        <div class="field">
          <div class="flex items-center space-x-4">
            <Checkbox v-model="editingBranch.is_deleted" :binary="true" inputId="branchIsDeleted" />
            <label for="branchIsDeleted" class="font-semibold text-charcoal">Deactivate Branch</label>
          </div>
          <small class="text-gray-500 mt-1 block">When checked, branch will be deactivated and cannot be assigned to users</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelEditBranch" />
        <Button label="Save Changes" icon="pi pi-check" class="save-btn" @click="saveBranchChanges" />
      </template>
    </Dialog>

    <!-- DELETE CONFIRMATION DIALOG -->
    <Dialog v-model:visible="showDeleteDialog" :header="deleteDialogHeader" :modal="true" class="w-1/3">
      <p>{{ deleteDialogMessage }}</p>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="showDeleteDialog = false" />
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="executeDelete" :loading="loadingDelete" />
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
const userSearchQuery = ref('')
const users = ref([])
const loadingUsers = ref(false)
const loadingAddUser = ref(false)
const loadingUpdateUser = ref(false)
const loadingDelete = ref(false)
const showAddUserDialog = ref(false)

// BRANCHES DATA
const branchSearchQuery = ref('')
const showAddBranchDialog = ref(false)
const showEditBranchDialog = ref(false)
const showDeleteDialog = ref(false)
const branches = ref([])
const loadingBranches = ref(false)
const newBranch = ref({
  branch_name: '',
  addressline1: '',
  addressline2: '',
  city_name: ''
})

// ADD USER DIALOG STATE
const newUser = ref({
  fname: '',
  mname: '',
  lname: '',
  email: '',
  password: '',
  confirmPassword: '',
  role_id: null,
  branchId: null
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
  branchId: null,
  is_deleted: false
})

// EDIT BRANCH DIALOG STATE
const editingBranch = ref({
  branch_id: null,
  branch_name: '',
  addressline1: '',
  addressline2: '',
  city_name: '',
  is_deleted: false
})

// Delete dialog state
const itemToDelete = ref(null)
const deleteType = ref('') // 'user' or 'branch'
const deleteDialogHeader = ref('')
const deleteDialogMessage = ref('')

// Dropdown options for user roles - updated to match your data
const userRoleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Branch Manager', value: 'branch manager' },
  { label: 'Customer', value: 'customer' }
]

// Dropdown options for user branches
const userBranchOptions = ref([
  { label: 'All Branches', value: 'all' },
  { label: 'Unassigned', value: 'unassigned' }
])

// Dropdown options for editing user roles
const userRoleOptionsForEdit = ref([
  { label: 'Admin', value: 1 },
  { label: 'Branch Manager', value: 2 },
  { label: 'Customer', value: 3 }
])

// Available branches for assignment (from branches data)
const availableBranchesForEdit = computed(() => {
  return [
    { label: 'Unassigned', value: null },
    ...(branches.value.map(branch => ({
      label: branch.branch_name,
      value: branch.branch_id
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
      // Show users with no branch (null branchName)
      filtered = filtered.filter(user => !user.branchName)
    } else {
      // Show users with specific branch
      filtered = filtered.filter(user => 
        user.branchName && user.branchName.toLowerCase() === selectedUserBranch.value.value.toLowerCase()
      )
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

// Edit user dialog header
const editUserDialogHeader = computed(() => {
  return `Manage User: ${editingUser.value.fname} ${editingUser.value.lname}`;
})

// Edit branch dialog header
const editBranchDialogHeader = computed(() => {
  return `Edit Branch: ${editingBranch.value.branch_name}`;
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
    const response = await SAService.getUsers();

    const data = response.data;
    users.value = data.users || []
    
    // Update branch options dynamically from actual data
    const uniqueBranches = [...new Set(data.users
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 })
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const fetchBranches = async () => {
  loadingBranches.value = true
  try {
    const response = await SAService.getBranches();

    const data = response.data;

    branches.value = data.branches || []
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches', life: 3000 })
    branches.value = []
  } finally {
    loadingBranches.value = false
  }
}

// ADD USER METHODS
const saveUser = async () => {
  loadingAddUser.value = true
  try {
    // Validate required fields
    if (!newUser.value.fname || !newUser.value.lname || !newUser.value.email || !newUser.value.password || !newUser.value.role_id) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields', life: 3000 })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.value.email)) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please enter a valid email address', life: 3000 })
      return
    }

    // Validate password length
    if (newUser.value.password.length < 8) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 8 characters long', life: 3000 })
      return
    }

    // Validate password confirmation
    if (newUser.value.password !== newUser.value.confirmPassword) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 })
      return
    }

    const userData = {
      fname: newUser.value.fname,
      lname: newUser.value.lname,
      email: newUser.value.email,
      password: newUser.value.password,
      role_id: newUser.value.role_id,
      mname: newUser.value.mname || null,
      branch_id: newUser.value.branchId || null
    };

    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'User created successfully', life: 3000 });
      showAddUserDialog.value = false;
      resetNewUser();
      await fetchUsers(); // Refresh the user list
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user: ' + error.message, life: 3000 });
  } finally {
    loadingAddUser.value = false;
  }
}

const cancelAddUser = () => {
  showAddUserDialog.value = false
  resetNewUser()
}

const resetNewUser = () => {
  newUser.value = {
    fname: '',
    mname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: null,
    branchId: null
  }
}

// EDIT USER METHODS
const editUser = (user) => {
  // Populate the editing form with selected user data
  editingUser.value = {
    id: user.id,
    fname: user.fname,
    mname: user.mname || '',
    lname: user.lname,
    email: user.email,
    role_id: user.role_id,
    branchId: user.branchId,
    is_deleted: user.is_deleted || false
  }
  
  showEditUserDialog.value = true
}

const saveUserChanges = async () => {
  loadingUpdateUser.value = true
  try {
    // Validate required fields
    if (!editingUser.value.role_id) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a role', life: 3000 })
      return
    }
    
    const updateData = {
      role_id: editingUser.value.role_id,
      branch_id: editingUser.value.branchId,
      is_deleted: editingUser.value.is_deleted
    };

    const response = await fetch(`http://localhost:3000/api/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    
    if (result.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 });
      showEditUserDialog.value = false;
      await fetchUsers(); // Refresh the user list
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user: ' + error.message, life: 3000 });
  } finally {
    loadingUpdateUser.value = false;
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
    branchId: null,
    is_deleted: false
  }
}

// BRANCH METHODS
const editBranch = (branch) => {
  // Populate the editing form with branch data
  editingBranch.value = {
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    addressline1: branch.addressline1 || '',
    addressline2: branch.addressline2 || '',
    city_name: branch.city_name || '',
    is_deleted: branch.is_deleted || false
  }
  
  showEditBranchDialog.value = true
}

const saveBranchChanges = async () => {
  try {
    // Validate required fields
    if (!editingBranch.value.branch_name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please enter a branch name', life: 3000 })
      return
    }
    
    // For now, just show success message
    toast.add({ severity: 'success', summary: 'Success', detail: 'Branch updated successfully', life: 3000 })
    
    // Close dialog and refresh data
    showEditBranchDialog.value = false
    await fetchBranches() // Refresh the branches list
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update branch', life: 3000 })
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
    city_name: '',
    is_deleted: false
  }
}

const confirmDeleteUser = (user) => {
  itemToDelete.value = user
  deleteType.value = 'user'
  deleteDialogHeader.value = 'Confirm User Deletion'
  deleteDialogMessage.value = `Are you sure you want to delete user ${user.name}? This action cannot be undone.`
  showDeleteDialog.value = true
}

const confirmDeleteBranch = (branch) => {
  itemToDelete.value = branch
  deleteType.value = 'branch'
  deleteDialogHeader.value = 'Confirm Branch Deletion'
  deleteDialogMessage.value = `Are you sure you want to delete branch ${branch.branch_name}? This action cannot be undone.`
  showDeleteDialog.value = true
}

const executeDelete = async () => {
  loadingDelete.value = true
  try {
    if (deleteType.value === 'user') {
      // Call delete user API
      const response = await fetch(`http://localhost:3000/api/users/${itemToDelete.value.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully', life: 3000 });
      } else {
        throw new Error(result.message);
      }
    } else if (deleteType.value === 'branch') {
      // Call delete branch API
      const response = await fetch(`http://localhost:3000/api/branches/${itemToDelete.value.branch_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Branch deleted successfully', life: 3000 });
      } else {
        throw new Error(result.message);
      }
    }
    
    // Refresh data
    await fetchUsers()
    await fetchBranches()
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item: ' + error.message, life: 3000 })
  } finally {
    showDeleteDialog.value = false
    itemToDelete.value = null
    deleteType.value = ''
    loadingDelete.value = false
  }
}

const saveBranch = async () => {
  try {
    // Validate required fields
    if (!newBranch.value.branch_name) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please enter a branch name', life: 3000 })
      return
    }
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Branch added successfully', life: 3000 })
    showAddBranchDialog.value = false
    resetNewBranch()
    
    // Refresh branches list
    await fetchBranches()
    
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add branch', life: 3000 })
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
    city_name: ''
  }
}

// Initialize data
onMounted(() => {
  fetchUsers()
  fetchBranches()
})
</script>

<style scoped>
/* Your existing styles remain the same */
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

.delete-btn.p-button {
  color: #dc2626 !important;
}

.delete-btn.p-button:hover {
  background-color: rgba(220, 38, 38, 0.1) !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}

.p-button-danger {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
}

.p-button-danger:hover {
  background-color: #b91c1c !important;
}
</style>