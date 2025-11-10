<template>
  <div class="min-h-screen flex flex-col bg-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-gray-50">
      <!-- TABS -->
      <TabView>
        <!-- USERS TAB -->
        <TabPanel header="Manage Users">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-charcoal uppercase">Manage Users</h1>
            
            <div class="flex items-center space-x-4">
              <!-- SEARCH BAR -->
              <div class="flex items-center space-x-2 w-auto">
                <InputText 
                  v-model="userSearchQuery" 
                  placeholder="Search users by name or email..." 
                  class="w-80"
                />
                <Button icon="pi pi-search" class="p-button-primary" />
              </div>

              <!-- FILTER -->
              <div class="flex items-center space-x-3">
                <span class="font-semibold text-charcoal">Role:</span>
                <Dropdown
                  v-model="selectedUserRole"
                  :options="userRoleOptions"
                  optionLabel="label"
                  placeholder="Select Role"
                  class="w-48"
                />
              </div>
            </div>
          </div>

          <!-- USER LIST TABLE -->
          <div class="card">
            <DataTable :value="filteredUsers" tableStyle="min-width: 50rem" :paginator="true" :rows="10">
              <Column field="id" header="User ID" :sortable="true"></Column>
              <Column field="name" header="Name" :sortable="true"></Column>
              <Column field="email" header="Email" :sortable="true"></Column>
              <Column field="role" header="Role" :sortable="true">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.role" 
                       :severity="slotProps.data.role === 'Branch Manager' ? 'warning' : 'info'" />
                </template>
              </Column>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning" 
                            @click="editUser(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                            @click="deleteUser(slotProps.data)" />
                  </div>
                </template>
              </Column>
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
                  placeholder="Search branches by name or location..." 
                  class="w-80"
                />
                <Button icon="pi pi-search" class="p-button-primary" />
              </div>

              <!-- ADD BRANCH BUTTON -->
              <Button label="Add Branch" icon="pi pi-plus" class="p-button-success" 
                      @click="showAddBranchDialog = true" />
            </div>
          </div>

          <!-- BRANCH LIST TABLE -->
          <div class="card">
            <DataTable :value="filteredBranches" tableStyle="min-width: 50rem" :paginator="true" :rows="10">
              <Column field="id" header="Branch ID" :sortable="true"></Column>
              <Column field="name" header="Branch Name" :sortable="true"></Column>
              <Column field="location" header="Location" :sortable="true"></Column>
                <template #body="slotProps">
                  <Tag :value="slotProps.data.status" 
                       :severity="slotProps.data.status === 'Active' ? 'success' : 'danger'" />
                </template>
              <Column header="Actions">
                <template #body="slotProps">
                  <div class="flex space-x-2">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning" 
                            @click="editBranch(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                            @click="deleteBranch(slotProps.data)" />
                    <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info" 
                            @click="viewBranch(slotProps.data)" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>

    <!-- ADD BRANCH DIALOG -->
    <Dialog v-model:visible="showAddBranchDialog" header="Add New Branch" :modal="true" class="w-1/3">
      <div class="space-y-4">
        <div class="field">
          <label class="font-semibold">Branch Name</label>
          <InputText v-model="newBranch.name" class="w-full" placeholder="Enter branch name" />
        </div>
        <div class="field">
          <label class="font-semibold">Location</label>
          <InputText v-model="newBranch.location" class="w-full" placeholder="Enter location" />
        </div>
        </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddBranchDialog = false" />
        <Button label="Save" icon="pi pi-check" class="p-button-success" @click="saveBranch" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

// USERS DATA
const selectedUserRole = ref({ label: 'All Roles', value: 'all' })
const userSearchQuery = ref('')
const users = ref([])

// BRANCHES DATA
const branchSearchQuery = ref('')
const showAddBranchDialog = ref(false)
const branches = ref([])
const newBranch = ref({
  name: '',
  location: '',
  manager: null
})

// Dropdown options for user roles
const userRoleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Customer', value: 'customer' },
  { label: 'Branch Manager', value: 'manager' }
]

// TEMP Sample managers for dropdown
const availableManagers = [
  { id: 1, name: 'Mike Johnson' },
  { id: 2, name: 'David Brown' },
  { id: 3, name: 'Sarah Wilson' }
]

// TEMP Sample user data
const sampleUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Customer' },
  { id: 3, name: 'Mike Johnson', email: 'mike@branch.com', role: 'Branch Manager' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Customer' },
  { id: 5, name: 'David Brown', email: 'david@branch.com', role: 'Branch Manager' },
  { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'Customer' }
]

// TEMP Sample branch data
const sampleBranches = [
  { id: 1, name: 'Sneakerhead Manila', location: 'Manila', manager: 'Mike Johnson', status: 'Active', totalSales: 45300 },
  { id: 2, name: 'Sneakerhead Cebu', location: 'Cebu', manager: 'David Brown', status: 'Active', totalSales: 38750 },
  { id: 3, name: 'Sneakerhead Davao', location: 'Davao', manager: 'Sarah Wilson', status: 'Inactive', totalSales: 21500 },
  { id: 4, name: 'Sneakerhead Cavite', location: 'Cavite', manager: 'Available', status: 'Active', totalSales: 29800 }
]

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by role
  if (selectedUserRole.value.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedUserRole.value.label)
  }

  // Filter by search query fro users
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
      branch.name.toLowerCase().includes(query) || 
      branch.location.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Initialize data
onMounted(() => {
  users.value = sampleUsers
  branches.value = sampleBranches
})
</script>