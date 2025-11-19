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
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Users</h1>
            
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto">
              <!-- SEARCH BAR -->
              <div class="flex items-center gap-2 w-full lg:w-80">
                <InputText 
                  v-model="userSearchQuery" 
                  placeholder="Search users by name or email..." 
                  class="w-full"
                />
                <Button icon="pi pi-search" class="search-btn h-12 w-12 flex-shrink-0" />
              </div>

              <!-- FILTERS ROW -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <!-- FILTER BY BRANCH -->
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold text-charcoal whitespace-nowrap">Branch:</span>
                  <Dropdown
                    v-model="selectedUserBranch"
                    :options="userBranchOptions"
                    optionLabel="label"
                    placeholder="All Branches"
                    class="w-32 sm:w-36"
                  />
                </div>

                <!-- FILTER BY ROLE -->
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold text-charcoal whitespace-nowrap">Role:</span>
                  <Dropdown
                    v-model="selectedUserRole"
                    :options="userRoleOptions"
                    optionLabel="label"
                    placeholder="All Roles"
                    class="w-32 sm:w-36"
                  />
                </div>

                <!-- FILTER BY STATUS -->
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold text-charcoal whitespace-nowrap">Status:</span>
                  <Dropdown
                    v-model="selectedUserStatus"
                    :options="userStatusOptions"
                    optionLabel="label"
                    placeholder="All Status"
                    class="w-32 sm:w-36"
                  />
                </div>
              </div>

              <Button label="Add User" icon="pi pi-plus" class="add-btn h-12 whitespace-nowrap" 
                      @click="showAddUserDialog = true" />
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
              <Column field="user_id" header="User ID" :sortable="true"></Column>
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
              <Column field="is_deleted", header="Status" :sortable="true">
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
                      v-tooltip="'Edit User'"
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
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Branches</h1>
            
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <!-- SEARCH BAR -->
              <div class="flex items-center gap-2 w-full sm:w-80">
                <InputText 
                  v-model="branchSearchQuery" 
                  placeholder="Search branches by name or city..." 
                  class="w-full"
                />
                <Button icon="pi pi-search" class="search-btn h-12 w-12 flex-shrink-0" />
              </div>

              <!-- ADD BRANCH BUTTON -->
              <Button label="Add Branch" icon="pi pi-plus" class="add-btn h-12 whitespace-nowrap" 
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
              <Column field="is_deleted", header="Status" :sortable="true">
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

    <!-- ADD USER DIALOG -->
    <Dialog v-model:visible="showAddUserDialog" header="Add New User" :modal="true" class="w-11/12 md:w-1/2 lg:w-1/3">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold text-charcoal">First Name <span class="text-red-500">*</span></label>
          <InputText 
            v-model="newUser.fname" 
            class="w-full" 
            placeholder="Enter first name" 
            :class="{ 'p-invalid': validationErrors.fname }"
            @blur="validateField('fname', newUser.fname)"
          />
          <small v-if="validationErrors.fname" class="p-error">{{ validationErrors.fname }}</small>
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Middle Name</label>
          <InputText v-model="newUser.mname" class="w-full" placeholder="Enter middle name" />
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Last Name <span class="text-red-500">*</span></label>
          <InputText 
            v-model="newUser.lname" 
            class="w-full" 
            placeholder="Enter last name" 
            :class="{ 'p-invalid': validationErrors.lname }"
            @blur="validateField('lname', newUser.lname)"
          />
          <small v-if="validationErrors.lname" class="p-error">{{ validationErrors.lname }}</small>
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Email <span class="text-red-500">*</span></label>
          <InputText 
            v-model="newUser.email" 
            class="w-full" 
            placeholder="Enter email address" 
            :class="{ 'p-invalid': validationErrors.email }"
            @blur="validateEmailField(newUser.email)"
          />
          <small v-if="validationErrors.email" class="p-error">{{ validationErrors.email }}</small>
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Password <span class="text-red-500">*</span></label>
          <Password 
            v-model="newUser.pw_hash" 
            class="w-full" 
            placeholder="Enter password"
            :feedback="false"
            toggleMask
            :class="{ 'p-invalid': validationErrors.password }"
            @blur="validatePasswordField(newUser.pw_hash)"
            @input="validatePasswordField(newUser.pw_hash)"
          />
          <small v-if="validationErrors.password" class="p-error">{{ validationErrors.password }}</small>
          <small v-else class="text-gray-500 mt-1 block">
            Password must contain: at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character
          </small>
        </div>
        <div class="field">
          <label class="font-semibold text-charcoal">Role <span class="text-red-500">*</span></label>
          <Dropdown
            v-model="newUser.role_id"
            :options="userRoleOptionsForAdd"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Role"
            class="w-full"
            @change="onRoleChange"
          />
        </div>
        <div class="field" v-if="showBranchAssignment">
          <label class="font-semibold text-charcoal">Branch Assignment</label>
          <Dropdown
            v-model="newUser.branch_id"
            :options="availableBranchesForAdd"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Branch"
            class="w-full"
          />
          <small class="text-gray-500 mt-1 block">Required for Branch Managers</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" @click="cancelAddUser" />
        <Button label="Save" icon="pi pi-check" class="save-btn" @click="saveUser" :loading="loadingAddUser" />
      </template>
    </Dialog>

    <!-- EDIT USER DIALOG -->
    <Dialog v-model:visible="showEditUserDialog" :header="editUserDialogHeader" :modal="true" class="w-11/12 md:w-1/2 lg:w-1/3">
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
            <div class="field">
              <label class="font-semibold text-charcoal block mb-1">Role</label>
              <div class="p-2 bg-gray-50 rounded border border-gray-200 text-charcoal">
                {{ getRoleLabel(editingUser.role_id) }}
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Personal information and role cannot be modified</p>
        </div>

        <!-- Editable Branch Assignment Section (Only for Branch Managers) -->
        <div class="border-b pb-4" v-if="isEditingBranchManager">
          <h3 class="text-lg font-semibold text-charcoal mb-4">Branch Assignment</h3>
          <div class="field">
            <label class="font-semibold text-charcoal block mb-2">Branch <span class="text-red-500">*</span></label>
            <Dropdown
              v-model="editingUser.branch_id"
              :options="availableBranchesForEdit"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Branch"
              class="w-full"
              :class="{ 'p-invalid': !editingUser.branch_id && isEditingBranchManager }"
            />
            <small v-if="!editingUser.branch_id && isEditingBranchManager" class="p-error">Branch assignment is required for Branch Managers</small>
            <small v-else class="text-gray-500 mt-1 block">Branch assignment is required for Branch Managers</small>
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
              :trueValue="1" 
              :falseValue="0"
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
    <Dialog v-model:visible="showAddBranchDialog" header="Add New Branch" :modal="true" class="w-11/12 md:w-1/2 lg:w-1/3">
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
    <Dialog v-model:visible="showEditBranchDialog" :header="editBranchDialogHeader" :modal="true" class="w-11/12 md:w-1/2 lg:w-1/3">
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
              :trueValue="1" 
              :falseValue="0"
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
import Password from 'primevue/password'
import SAService from '@/services/SAService'
import { useValidation } from '@/composables/useValidation'

const toast = useToast()
const { 
  errors: validationErrors, 
  validateRequired, 
  validateEmail, 
  validatePassword, 
  clearErrors 
} = useValidation()

// USERS DATA
const selectedUserRole = ref({ label: 'All Roles', value: 'all' })
const selectedUserBranch = ref({ label: 'All Branches', value: 'all' })
const selectedUserStatus = ref({ label: 'All Status', value: 'all' }) 
const userSearchQuery = ref('')
const users = ref([])
const loadingUsers = ref(false)
const loadingUpdateUser = ref(false)
const loadingAddUser = ref(false)
const showAddUserDialog = ref(false)
const showEditUserDialog = ref(false)

// BRANCHES DATA
const branchSearchQuery = ref('')
const showAddBranchDialog = ref(false)
const showEditBranchDialog = ref(false)
const branches = ref([])
const loadingBranches = ref(false)
const loadingAddBranch = ref(false)
const loadingUpdateBranch = ref(false)

// ADD USER DIALOG STATE
const newUser = ref({
  fname: '',
  lname: '',
  mname: '',
  email: '',
  pw_hash: '',
  role_id: null,
  address_id: null,
  branch_id: null
})

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
  is_deleted: 0
})

// EDIT USER DIALOG STATE
const editingUser = ref({
  user_id: null,
  fname: '',
  mname: '',
  lname: '',
  email: '',
  role_id: null,
  address_id: null,
  branch_id: null,
  is_deleted: 0,
  pw_hash: ''
})

// Dropdown options for user roles (for filtering)
const userRoleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Branch Manager', value: 'Branch Manager' },
  { label: 'Customer', value: 'Customer' }
]

// Dropdown options for user roles (for adding new users)
const userRoleOptionsForAdd = [
  { label: 'Admin', value: 1 },
  { label: 'Branch Manager', value: 2 },
  { label: 'Customer', value: 3 }
]

// Dropdown options for user branches
const userBranchOptions = ref([
  { label: 'All Branches', value: 'all' },
  { label: 'Unassigned', value: 'unassigned' }
])

// Dropdown options for user status
const userStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Computed properties
const showBranchAssignment = computed(() => {
  return newUser.value.role_id === 2 // Show branch assignment only for Branch Managers
})

const isEditingBranchManager = computed(() => {
  return editingUser.value.role_id === 2 // Check if editing user is a Branch Manager
})

const availableBranchesForAdd = computed(() => {
  const activeBranches = branches.value.filter(branch => branch.is_deleted === 0);
  
  return [
    { label: 'Unassigned', value: null },
    ...(activeBranches.map(branch => ({
      label: branch.branch_name,
      value: branch.branch_id
    })) || [])
  ]
})

const availableBranchesForEdit = computed(() => {
  // Use all active branches (not deleted)
  const activeBranches = branches.value.filter(branch => 
    branch.is_deleted === 0 || branch.is_deleted === false
  );
  
  const branchOptions = activeBranches.map(branch => ({
    label: branch.branch_name,
    value: branch.branch_id
  }));
  
  return [
    { label: 'Unassigned', value: null },
    ...branchOptions
  ];
})

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

  // Filter by user status
  if (selectedUserStatus.value.value !== 'all') {
    if (selectedUserStatus.value.value === 'active') {
      filtered = filtered.filter(user => user.is_deleted === 0)
    } else if (selectedUserStatus.value.value === 'inactive') {
      filtered = filtered.filter(user => user.is_deleted === 1)
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

const getRoleLabel = (roleId) => {
  const roles = {
    1: 'Admin',
    2: 'Branch Manager', 
    3: 'Customer'
  }
  return roles[roleId] || 'Unknown Role'
}

// Edit user dialog header
const editUserDialogHeader = computed(() => {
  return `Manage User: ${editingUser.value.fname} ${editingUser.value.lname}`
})

// Edit branch dialog header
const editBranchDialogHeader = computed(() => {
  return `Edit Branch: ${editingBranch.value.branch_name}`
})

// Validation methods
const validateField = (fieldName, value) => {
  validateRequired(fieldName, value)
}

const validateEmailField = (email) => {
  validateEmail(email)
}

const validatePasswordField = (password) => {
  validatePassword(password)
}

const validateAllFields = () => {
  validateRequired('fname', newUser.value.fname)
  validateRequired('lname', newUser.value.lname)
  validateEmail(newUser.value.email)
  validatePassword(newUser.value.pw_hash)
  
  // Validate branch assignment for Branch Managers
  if (newUser.value.role_id === 2 && !newUser.value.branch_id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Branch assignment is required for Branch Managers', life: 3000 })
    return false
  }
  
  return Object.keys(validationErrors.value).length === 0
}

// Methods
const getRoleSeverity = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'danger'
    case 'branch manager': return 'warning'
    case 'customer': return 'info'
    default: return 'secondary'
  }
}

const onRoleChange = () => {
  // Reset branch assignment when role changes
  if (newUser.value.role_id !== 2) {
    newUser.value.branch_id = null
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cities', life: 3000 })
    cityOptions.value = []
  } finally {
    loadingCities.value = false
  }
}

// ADD USER METHODS
const saveUser = async () => {
  // Validate all fields before proceeding
  if (!validateAllFields()) {
    return
  }

  loadingAddUser.value = true
  try {
    const userData = {
      fname: newUser.value.fname,
      lname: newUser.value.lname,
      mname: newUser.value.mname || '',
      pw_hash: newUser.value.pw_hash,
      role_id: newUser.value.role_id,
      address_id: newUser.value.address_id,
      branch_id: newUser.value.branch_id
    }

    await SAService.addUser(userData)
    toast.add({ severity: 'success', summary: 'Success', detail: 'User added successfully', life: 3000 })
    showAddUserDialog.value = false
    resetNewUser()
    await fetchUsers()
    
  } catch (error) {
    if (error.response?.data?.message?.includes('Email already in use')) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Email address is already in use', life: 3000 })
    } else if (error.response?.data?.message?.includes('Branch already has a manager assigned')) {
      toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Branch already has a manager assigned', 
        life: 3000 
      })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add user: ' + error.message, life: 3000 })
    }
  } finally {
    loadingAddUser.value = false
  }
}

const cancelAddUser = () => {
  showAddUserDialog.value = false
  resetNewUser()
  clearErrors()
}

const resetNewUser = () => {
  newUser.value = {
    fname: '',
    lname: '',
    mname: '',
    email: '',
    pw_hash: '',
    role_id: null,
    address_id: null,
    branch_id: null
  }
}

// EDIT USER METHODS
const editUser = (user) => {
  
  editingUser.value = {
    user_id: user.id, // Use user.id
    fname: user.fname,
    mname: user.mname || '',
    lname: user.lname,
    email: user.email,
    role_id: user.role_id,
    address_id: user.address_id,
    branch_id: user.branchId, // Use user.branchId
    is_deleted: user.is_deleted || 0,
    pw_hash: ''
  }
  
  showEditUserDialog.value = true
}

const saveUserChanges = async () => {
  // For Branch Managers, allow unassigning (branch_id can be null)
  if (isEditingBranchManager.value && editingUser.value.branch_id === undefined) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a branch assignment or unassign', life: 3000 })
    return
  }

  // Validate that we have a user_id
  if (!editingUser.value.user_id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'User ID is missing', life: 3000 })
    return
  }

  loadingUpdateUser.value = true
  try {
    // Prepare update data according to backend expectations
    const updateData = {
      email: null,
      pw_hash: editingUser.value.pw_hash || null,
      fname: null,
      lname: null,
      mname: null,
      address_id: null,
      role_id: null,
      branch_id: editingUser.value.branch_id,
      is_deleted: editingUser.value.is_deleted
    }

    await SAService.updateUser(editingUser.value.user_id, updateData)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 })
    showEditUserDialog.value = false
    await fetchUsers()
    
  } catch (error) {
    // Handle specific error for duplicate branch manager
    if (error.response?.data?.message?.includes('Branch already has a manager assigned')) {
      toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Branch already has a manager assigned', 
        life: 3000 
      })
    } else {
      toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update user: ' + error.message, 
        life: 3000 
      })
    }
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
    user_id: null,
    fname: '',
    mname: '',
    lname: '',
    email: '',
    role_id: null,
    address_id: null,
    branch_id: null,
    is_deleted: 0,
    pw_hash: ''
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
    is_deleted: branch.is_deleted || 0
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
      is_deleted: editingBranch.value.is_deleted || 0
    }

    await SAService.updateBranch(editingBranch.value.branch_id, updateData)
    
    toast.add({ severity: 'success', summary: 'Success', detail: 'Branch updated successfully', life: 3000 })
    showEditBranchDialog.value = false
    await fetchBranches()
    
  } catch (error) {
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
    is_deleted: 0
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

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>