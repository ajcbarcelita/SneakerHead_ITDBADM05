<template>
  <div class="min-h-screen flex flex-col bg-white font-Montserrat">
    <!-- NAVBAR -->
    <header>
      <NavBarSA />
    </header>

    <main class="flex-1 container mx-auto px-6 py-10 space-y-8 bg-antiflash-white">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal uppercase">User Activity Logs</h1>
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
        <DataTable :value="filteredLogs" tableStyle="min-width: 80rem" :paginator="true" :rows="10" :loading="loadingLogs">
          <Column field="log_id" header="Log ID" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono font-semibold text-oxford-blue">#{{ slotProps.data.log_id }}</span>
            </template>
          </Column>
          
          <Column field="user_name" header="User" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="font-semibold text-charcoal">{{ slotProps.data.user_name }}</span>
                <span class="text-xs text-gray">{{ slotProps.data.email }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="role_name" header="Role" :sortable="true">
            <template #body="slotProps">
              <Tag :value="slotProps.data.role_name" 
                   :severity="getRoleSeverity(slotProps.data.role_name)" />
            </template>
          </Column>
          
          <Column field="action" header="Action" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i :class="getActionIcon(slotProps.data.action)" class="text-giants-orange"></i>
                <span class="font-medium text-charcoal">{{ formatActionText(slotProps.data.action) }}</span>
              </div>
            </template>
          </Column>

          <!-- NEW PASS/FAIL COLUMN -->
          <Column field="status" header="Status" :sortable="true">
            <template #body="slotProps">
              <Tag :value="getActionStatus(slotProps.data.action)" 
                   :severity="getActionStatus(slotProps.data.action) === 'PASS' ? 'success' : 'danger'" />
            </template>
          </Column>
          
          <Column field="description" header="Description" :sortable="true">
            <template #body="slotProps">
              <span class="text-charcoal">{{ slotProps.data.description }}</span>
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
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text view-btn" 
                        @click="viewLogDetails(slotProps.data)" 
                        v-tooltip="'View Details'" />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-8 text-gray-500">
              <i class="pi pi-history text-4xl mb-4"></i>
              <p>No logs found</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-8">
              <i class="pi pi-spinner pi-spin text-2xl mr-2"></i>
              Loading logs...
            </div>
          </template>
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
                <p class="text-charcoal font-semibold">{{ selectedLog.user_id || 'System' }}</p>
              </div>
            </div>
            
            <div>
              <label class="font-semibold text-gray">User Name:</label>
              <p class="text-charcoal">{{ selectedLog.user_name }}</p>
            </div>

            <div>
              <label class="font-semibold text-gray">Email:</label>
              <p class="text-charcoal">{{ selectedLog.email }}</p>
            </div>
            
            <div>
              <label class="font-semibold text-gray">Role:</label>
              <Tag :value="selectedLog.role_name" 
                   :severity="getRoleSeverity(selectedLog.role_name)" />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-semibold text-lg border-b pb-2 text-charcoal">Action Details</h3>
            
            <div>
              <label class="font-semibold text-gray">Action:</label>
              <div class="flex items-center space-x-2 mt-1">
                <i :class="getActionIcon(selectedLog.action)" class="text-giants-orange"></i>
                <span class="font-medium text-charcoal">{{ formatActionText(selectedLog.action) }}</span>
              </div>
            </div>

            <div>
              <label class="font-semibold text-gray">Status:</label>
              <Tag :value="getActionStatus(selectedLog.action)" 
                   :severity="getActionStatus(selectedLog.action) === 'PASS' ? 'success' : 'danger'" />
            </div>
            
            <div>
              <label class="font-semibold text-gray">IP Address:</label>
              <p class="text-charcoal font-mono">{{ selectedLog.ip_address }}</p>
            </div>
            
            <div>
              <label class="font-semibold text-gray">Date & Time:</label>
              <p class="text-charcoal">{{ formatDateTime(selectedLog.created_at) }}</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
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
import SAService from '@/services/SAService'

const toast = useToast()

// Data
const showLogDetailsDialog = ref(false)
const logs = ref([])
const selectedLog = ref(null)
const loadingLogs = ref(false)
const selectedRole = ref({ label: 'All Roles', value: 'all' })
const selectedAction = ref({ label: 'All Actions', value: 'all' })
const selectedStatus = ref({ label: 'All Status', value: 'all' })
const dateRange = ref(null)

// Options
const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'System Admin', value: 'System Admin' },
  { label: 'Branch Manager', value: 'Branch Manager' },
  { label: 'Customer', value: 'Customer' }
]

// Hardcoded for now?
const actionOptions = [
  { label: 'All Actions', value: 'all' },
  { label: 'Login', value: 'LOGIN' },
  { label: 'User Management', value: 'USER' },
  { label: 'Branch Management', value: 'BRANCH' },
  { label: 'Promo Code', value: 'PROMO_CODE' },
  { label: 'Shoe Management', value: 'SHOE' }
]

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'PASS', value: 'PASS' },
  { label: 'FAIL', value: 'FAIL' }
]

// Computed properties
const filteredLogs = computed(() => {
  let filtered = logs.value

  // Filter by role
  if (selectedRole.value.value !== 'all') {
    filtered = filtered.filter(log => log.role_name === selectedRole.value.value)
  }

  // Filter by action
  if (selectedAction.value.value !== 'all') {
    filtered = filtered.filter(log => log.action.includes(selectedAction.value.value))
  }

  // Filter by status
  if (selectedStatus.value.value !== 'all') {
    const status = selectedStatus.value.value
    filtered = filtered.filter(log => getActionStatus(log.action) === status)
  }

  // Filter by date range
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999)
    
    filtered = filtered.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= startDate && logDate <= endDate
    })
  }

  return filtered
})

const stats = computed(() => {
  const totalLogs = logs.value.length
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.value.filter(log => log.created_at.split('T')[0] === today).length
  const passLogs = logs.value.filter(log => getActionStatus(log.action) === 'PASS').length
  const failLogs = logs.value.filter(log => getActionStatus(log.action) === 'FAIL').length

  return { totalLogs, todayLogs, passLogs, failLogs }
})

// Methods
const getActionStatus = (action) => {
  const failIndicators = ['_FAIL', ' FAIL', 'FAILED', 'FAILURE']
  const hasFail = failIndicators.some(indicator => 
    action.toUpperCase().includes(indicator)
  )
  
  return hasFail ? 'FAIL' : 'PASS'
}

// Maybe remove when we make sure that the action of the user logs is consistent
const formatActionText = (action) => {
  let formatted = action
    .replace(/_FAIL$/, '')
    .replace(/_FAILED$/, '')
    .replace(/_FAILURE$/, '')
    .replace(/ FAIL$/, '')
    .replace(/ FAILED$/, '')
    .replace(/ FAILURE$/, '')
    .replace(/_/g, ' ')
    .trim()
  
  return formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getRoleSeverity = (role) => {
  const severities = {
    'System Admin': 'danger',
    'Branch Manager': 'warning',
    'Customer': 'success'
  }
  return severities[role] || 'secondary'
}

const getActionIcon = (action) => {
  const icons = {
    'LOGIN': 'pi pi-sign-in',
    'LOGOUT': 'pi pi-sign-out',
    'USER': 'pi pi-users',
    'BRANCH': 'pi pi-building',
    'PROMO_CODE': 'pi pi-ticket',
    'SHOE': 'pi pi-shopping-bag'
  }
  
  if (action.includes('INSERT')) return 'pi pi-plus'
  if (action.includes('UPDATE')) return 'pi pi-pencil'
  if (action.includes('DELETE')) return 'pi pi-trash'
  if (getActionStatus(action) === 'FAIL') return 'pi pi-exclamation-triangle'
  
  const baseAction = formatActionText(action).toUpperCase().replace(/ /g, '_')
  return icons[baseAction] || 'pi pi-info-circle'
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
    minute: '2-digit',
    second: '2-digit'
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

const clearFilters = () => {
  selectedRole.value = { label: 'All Roles', value: 'all' }
  selectedAction.value = { label: 'All Actions', value: 'all' }
  selectedStatus.value = { label: 'All Status', value: 'all' }
  dateRange.value = null
}

const fetchLogs = async () => {
  loadingLogs.value = true
  try {
    const response = await SAService.getLogs()
    logs.value = response.data.logs || []
  } catch (error) {
    console.error('Error fetching logs:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to load activity logs', 
      life: 3000 
    })
    logs.value = []
  } finally {
    loadingLogs.value = false
  }
}

// Initialize data
onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.clear-btn.p-button {
  color: var(--color-gray) !important;
  border-color: var(--color-gray) !important;
}

.clear-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}

.view-btn.p-button {
  color: var(--color-oxford-blue) !important;
}

.view-btn.p-button:hover {
  background-color: rgba(16, 37, 64, 0.1) !important;
}

.cancel-btn.p-button {
  color: var(--color-gray) !important;
}

.cancel-btn.p-button:hover {
  background-color: rgba(119, 123, 126, 0.1) !important;
}
</style>