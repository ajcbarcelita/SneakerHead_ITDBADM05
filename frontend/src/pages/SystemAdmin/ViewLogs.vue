<template>
  <div class="min-h-screen flex flex-col bg-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal uppercase">User Activity Logs</h1>
        
        <div class="flex items-center space-x-4">
          <!-- SEARCH BAR -->
          <div class="flex items-center space-x-2 w-auto">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search logs..." 
              class="w-80"
            />
            <Button icon="pi pi-search" class="search-btn" />
          </div>
          
        </div>
      </div>

      <!-- FILTERS -->
      <div class="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Role:</span>
          <Dropdown
            v-model="selectedRole"
            :options="roleOptions"
            optionLabel="label"
            placeholder="All Roles"
            class="w-48"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Action:</span>
          <Dropdown
            v-model="selectedAction"
            :options="actionOptions"
            optionLabel="label"
            placeholder="All Actions"
            class="w-48"
          />
        </div>

        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Status:</span>
          <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            placeholder="All Status"
            class="w-48"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="font-semibold text-charcoal">Date Range:</span>
          <Calendar v-model="dateRange" selectionMode="range" :manualInput="false" 
                    placeholder="Select Date Range" class="w-48" />
        </div>

        <div class="flex items-center ml-4">
          <Button label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined clear-btn" 
                    @click="clearFilters" />
        </div>
      </div>

      <!-- LOGS TABLE -->
      <div class="card">
        <DataTable :value="filteredLogs" tableStyle="min-width: 80rem" :paginator="true" :rows="10">
          <Column field="log_id" header="Log ID" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono font-semibold text-oxford-blue">#{{ slotProps.data.log_id }}</span>
            </template>
          </Column>
          
          <Column field="user_id" header="User ID" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-charcoal">{{ slotProps.data.user_id }}</span>
            </template>
          </Column>
          
          <Column field="role" header="Role" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.role" 
                   :severity="getRoleSeverity(slotProps.data.role)" />
            </template>
          </Column>
          
          <Column field="action" header="Action" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i :class="getActionIcon(slotProps.data.action)" class="text-giants-orange"></i>
                <span class="font-medium text-charcoal">{{ slotProps.data.action }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="description" header="Description" :sortable="true">
            <template #body="slotProps">
              <span class="text-charcoal">{{ slotProps.data.description }}</span>
            </template>
          </Column>

          <Column field="status" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" 
                   :severity="slotProps.data.status === 'PASS' ? 'success' : 'danger'" />
            </template>
          </Column>
          
          <Column field="ip_address" header="IP Address" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono text-sm text-gray">{{ slotProps.data.ip_address }}</span>
            </template>
          </Column>
          
          <Column field="created_at" header="Date & Time" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="font-semibold text-charcoal">{{ formatDate(slotProps.data.created_at) }}</span>
                <span class="text-xs text-gray">{{ formatTime(slotProps.data.created_at) }}</span>
              </div>
            </template>
          </Column>
          
          <Column header="Actions">
            <template #body="slotProps">
              <div class="flex space-x-2">
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text delete-btn" 
                        @click="deleteLog(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- STATS CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="shadow-md border-t-4 border-oxford-blue">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-oxford-blue">{{ stats.totalLogs }}</div>
              <p class="text-oxford-blue text-sm font-semibold">TOTAL LOGS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-giants-orange">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-giants-orange">{{ stats.todayLogs }}</div>
              <p class="text-giants-orange text-sm font-semibold">TODAY'S ACTIVITIES</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-charcoal">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-charcoal">{{ stats.passLogs }}</div>
              <p class="text-charcoal text-sm font-semibold">SUCCESSFUL ACTIONS</p>
            </div>
          </template>
        </Card>

        <Card class="shadow-md border-t-4 border-gray">
          <template #content>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray">{{ stats.failLogs }}</div>
              <p class="text-gray text-sm font-semibold">FAILED ACTIONS</p>
            </div>
          </template>
        </Card>
      </div>
    </main>

    <!-- FOOTER -->
    <footer>
      <Footer />
    </footer>

    <!-- LOG DETAILS DIALOG -->
    <Dialog v-model:visible="showLogDetailsDialog" header="Log Details" :modal="true" class="w-2/3">
      <div class="space-y-6" v-if="selectedLog">
        <!-- BASIC INFO -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="font-semibold text-lg border-b pb-2 text-charcoal">Log Information</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="font-semibold text-gray">Log ID:</label>
                <p class="text-charcoal font-mono">#{{ selectedLog.log_id }}</p>
              </div>
              
              <div>
                <label class="font-semibold text-gray">User ID:</label>
                <p class="text-charcoal font-semibold">{{ selectedLog.user_id }}</p>
              </div>
            </div>
            
            <div>
              <label class="font-semibold text-gray">Role:</label>
              <Tag :value="selectedLog.role" 
                   :severity="getRoleSeverity(selectedLog.role)" />
            </div>
            
            <div>
              <label class="font-semibold text-gray">Action:</label>
              <div class="flex items-center space-x-2 mt-1">
                <i :class="getActionIcon(selectedLog.action)" class="text-giants-orange"></i>
                <span class="font-medium text-charcoal">{{ selectedLog.action }}</span>
              </div>
            </div>

            <div>
              <label class="font-semibold text-gray">Status:</label>
              <Tag :value="selectedLog.status" 
                   :severity="selectedLog.status === 'PASS' ? 'success' : 'danger'" />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-semibold text-lg border-b pb-2 text-charcoal">Technical Details</h3>
            
            <div>
              <label class="font-semibold text-gray">IP Address:</label>
              <p class="text-charcoal font-mono">{{ selectedLog.ip_address }}</p>
            </div>
            
            <div>
              <label class="font-semibold text-gray">Date & Time:</label>
              <p class="text-charcoal">{{ formatDateTime(selectedLog.created_at) }}</p>
            </div>
            
            <div>
              <label class="font-semibold text-gray">Timestamp:</label>
              <p class="text-charcoal font-mono text-sm">{{ selectedLog.created_at }}</p>
            </div>
          </div>
        </div>

        <!-- DESCRIPTION -->
        <div class="space-y-2">
          <label class="font-semibold text-gray">Description:</label>
          <div class="p-4 bg-gray-50 rounded-lg border">
            <p class="text-charcoal">{{ selectedLog.description }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Close" icon="pi pi-times" class="p-button-text cancel-btn" 
                @click="showLogDetailsDialog = false" />
      </template>
    </Dialog>

    <!-- DELETE CONFIRMATION DIALOG -->
    <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" class="w-1/3">
      <div class="flex items-center space-x-4" v-if="logToDelete">
        <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
        <div>
          <p class="font-semibold text-charcoal">Are you sure you want to delete this log?</p>
          <p class="text-gray text-sm mt-1">Log #{{ logToDelete.log_id }} - {{ logToDelete.action }}</p>
          <p class="text-red-500 text-xs mt-2">This action cannot be undone.</p>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text cancel-btn" 
                @click="showDeleteDialog = false" />
        <Button label="Delete" icon="pi pi-trash" class="delete-confirm-btn" 
                @click="confirmDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import NavBarSA from '@/components/NavBarSA.vue'
import Footer from '@/components/Footer.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'

// Data
const searchQuery = ref('')
const showLogDetailsDialog = ref(false)
const showDeleteDialog = ref(false)
const logs = ref([])
const selectedLog = ref(null)
const logToDelete = ref(null)
const selectedRole = ref({ label: 'All Roles', value: 'all' })
const selectedAction = ref({ label: 'All Actions', value: 'all' })
const selectedStatus = ref({ label: 'All Status', value: 'all' })
const dateRange = ref(null)

// Options
const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'System Admin', value: 'system admin' },
  { label: 'Branch Manager', value: 'branch manager' },
  { label: 'Customer', value: 'customer' }
]

const actionOptions = [
  { label: 'All Actions', value: 'all' },
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'View', value: 'view' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Register', value: 'register' }
]

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'PASS', value: 'PASS' },
  { label: 'FAIL', value: 'FAIL' }
]

// TEMP data - sample logs based on your schema
const sampleLogs = [
  {
    log_id: 1001,
    user_id: 235,
    role: 'system admin',
    action: 'Login',
    description: 'User logged in successfully',
    status: 'PASS',
    ip_address: '192.168.1.105',
    created_at: '2024-01-20 14:30:22'
  },
  {
    log_id: 1002,
    user_id: 142,
    role: 'branch manager',
    action: 'Create',
    description: 'Created new inventory item - Nike Air Max 270',
    status: 'PASS',
    ip_address: '192.168.1.110',
    created_at: '2024-01-20 14:25:10'
  },
  {
    log_id: 1003,
    user_id: 301,
    role: 'customer',
    action: 'Purchase',
    description: 'Completed order #ORD-7842 for ₱7,995.00',
    status: 'PASS',
    ip_address: '192.168.1.125',
    created_at: '2024-01-20 13:45:33'
  },
  {
    log_id: 1004,
    user_id: 301,
    role: 'customer',
    action: 'Login',
    description: 'Invalid password attempt',
    status: 'FAIL',
    ip_address: '192.168.1.125',
    created_at: '2024-01-20 13:30:15'
  },
  {
    log_id: 1005,
    user_id: 235,
    role: 'system admin',
    action: 'Delete',
    description: 'Deleted expired promo code SUMMER2023',
    status: 'PASS',
    ip_address: '192.168.1.105',
    created_at: '2024-01-20 12:15:42'
  },
  {
    log_id: 1006,
    user_id: 178,
    role: 'branch manager',
    action: 'Update',
    description: 'Updated stock levels for multiple products',
    status: 'PASS',
    ip_address: '192.168.1.115',
    created_at: '2024-01-20 11:20:18'
  },
  {
    log_id: 1007,
    user_id: 401,
    role: 'customer',
    action: 'Register',
    description: 'New customer account created successfully',
    status: 'PASS',
    ip_address: '192.168.1.130',
    created_at: '2024-01-20 10:45:29'
  },
  {
    log_id: 1008,
    user_id: 142,
    role: 'branch manager',
    action: 'Delete',
    description: 'Failed to delete product - insufficient permissions',
    status: 'FAIL',
    ip_address: '192.168.1.110',
    created_at: '2024-01-20 09:15:37'
  },
  {
    log_id: 1009,
    user_id: 235,
    role: 'system admin',
    action: 'Update',
    description: 'Modified user permissions for U-142',
    status: 'PASS',
    ip_address: '192.168.1.105',
    created_at: '2024-01-20 08:30:22'
  },
  {
    log_id: 1010,
    user_id: 302,
    role: 'customer',
    action: 'Purchase',
    description: 'Payment failed - insufficient funds',
    status: 'FAIL',
    ip_address: '192.168.1.126',
    created_at: '2024-01-19 16:20:45'
  }
]

// Computed properties
const filteredLogs = computed(() => {
  let filtered = logs.value

  // Filter by role
  if (selectedRole.value.value !== 'all') {
    filtered = filtered.filter(log => log.role === selectedRole.value.value)
  }

  // Filter by action
  if (selectedAction.value.value !== 'all') {
    filtered = filtered.filter(log => log.action.toLowerCase().includes(selectedAction.value.value))
  }

  // Filter by status
  if (selectedStatus.value.value !== 'all') {
    filtered = filtered.filter(log => log.status === selectedStatus.value.value)
  }

  // Filter by date range
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    
    filtered = filtered.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= startDate && logDate <= endDate
    })
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.log_id.toString().includes(query) ||
      log.user_id.toString().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      log.role.toLowerCase().includes(query) ||
      log.ip_address.includes(query)
    )
  }

  return filtered
})

const stats = computed(() => {
  const totalLogs = logs.value.length
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.value.filter(log => log.created_at.split(' ')[0] === today).length
  const passLogs = logs.value.filter(log => log.status === 'PASS').length
  const failLogs = logs.value.filter(log => log.status === 'FAIL').length

  return { totalLogs, todayLogs, passLogs, failLogs }
})

// Methods
const getRoleSeverity = (role) => {
  const severities = {
    'system admin': 'danger',
    'branch manager': 'warning',
    'customer': 'success'
  }
  return severities[role] || 'secondary'
}

const getActionIcon = (action) => {
  const icons = {
    'Login': 'pi pi-sign-in',
    'Logout': 'pi pi-sign-out',
    'Create': 'pi pi-plus',
    'Update': 'pi pi-pencil',
    'Delete': 'pi pi-trash',
    'View': 'pi pi-eye',
    'Purchase': 'pi pi-shopping-cart',
    'Register': 'pi pi-user-plus',
    'Failed Login': 'pi pi-exclamation-triangle'
  }
  return icons[action] || 'pi pi-info-circle'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewLogDetails = (log) => {
  selectedLog.value = log
  showLogDetailsDialog.value = true
}

const deleteLog = (log) => {
  logToDelete.value = log
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (logToDelete.value) {
    logs.value = logs.value.filter(log => log.log_id !== logToDelete.value.log_id)
    showDeleteDialog.value = false
    logToDelete.value = null
  }
}

const clearFilters = () => {
  selectedRole.value = { label: 'All Roles', value: 'all' }
  selectedAction.value = { label: 'All Actions', value: 'all' }
  selectedStatus.value = { label: 'All Status', value: 'all' }
  dateRange.value = null
  searchQuery.value = ''
}

// Initialize data
onMounted(() => {
  logs.value = sampleLogs
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

.clear-btn.p-button {
  color: var(--color-gray) !important;
  border-color: var(--color-gray) !important;
}

.clear-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}

.delete-btn.p-button {
  color: #dc2626 !important;
}

.delete-btn.p-button:hover {
  background-color: rgba(220, 38, 38, 0.1) !important;
}

.delete-confirm-btn.p-button {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}

.delete-confirm-btn.p-button:hover {
  background-color: #b91c1c !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>