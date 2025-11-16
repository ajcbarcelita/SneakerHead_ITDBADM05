<template>
  <div class="font-Montserrat">
    <Card class="shadow-lg">
      <!-- Profile Info -->
      <template #title>
        <div class="mt-4">
          <h2 class="text-2xl font-bold text-oxford-blue">
            {{ profileData.fname }} {{ profileData.mname ? profileData.mname + ' ' : '' }}{{ profileData.lname }}
          </h2>
        </div>
      </template>

      <template #subtitle>
        <div class="flex items-center gap-2 text-gray">
          <i class="pi pi-envelope text-sm"></i>
          <span>{{ profileData.email }}</span>
        </div>
      </template>

      <!-- Profile Content -->
      <template #content>
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center p-8">
          <i class="pi pi-spin pi-spinner text-2xl text-giants-orange" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded">
          <p class="text-red-600">{{ error }}</p>
          <Button
            label="Retry"
            icon="pi pi-refresh"
            @click="fetchUserProfile"
            class="mt-3 p-button-sm"
          />
        </div>

        <!-- View Content -->
        <div v-else-if="!isEditing" class="space-y-4">
          <!-- Personal Information -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray font-medium">First Name</label>
                <p class="text-charcoal">{{ profileData.fname }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Middle Name</label>
                <p class="text-charcoal">{{ profileData.mname || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Last Name</label>
                <p class="text-charcoal">{{ profileData.lname }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Email</label>
                <p class="text-charcoal">{{ profileData.email }}</p>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Address Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray font-medium">Address Line 1</label>
                <p class="text-charcoal">{{ profileData.addressline1 || 'Not provided' }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Address Line 2</label>
                <p class="text-charcoal">{{ profileData.addressline2 || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Province</label>
                <p class="text-charcoal">{{ profileData.province_name || 'Not provided' }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">City / Municipality</label>
                <p class="text-charcoal">{{ profileData.city_name || 'Not provided' }}</p>
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div>
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Account Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray font-medium">Role</label>
                <p class="text-charcoal capitalize">{{ profileData.role_name || 'Customer' }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Member Since</label>
                <p class="text-charcoal">{{ formatDate(profileData.created_at) }}</p>
              </div>
              <div>
                <label class="text-sm text-gray font-medium">Last Updated</label>
                <p class="text-charcoal">{{ formatDate(profileData.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-else class="space-y-4">
          <!-- Personal Information Form -->
          <div class="border-b border-gray-200 pb-4">
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatLabel variant="on">
                <InputText id="fname" v-model="editForm.fname" class="w-full" />
                <label for="fname">First Name</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText id="mname" v-model="editForm.mname" class="w-full" />
                <label for="mname">Middle Name</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText id="lname" v-model="editForm.lname" class="w-full" />
                <label for="lname">Last Name</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText id="email" v-model="editForm.email" class="w-full" disabled />
                <label for="email">Email (Cannot be changed)</label>
              </FloatLabel>
            </div>
          </div>

          <!-- Address Information Form -->
          <div>
            <h3 class="text-lg font-semibold text-oxford-blue mb-3">Address Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatLabel variant="on">
                <InputText id="addressline1" v-model="editForm.addressline1" class="w-full" />
                <label for="addressline1">Address Line 1</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <InputText id="addressline2" v-model="editForm.addressline2" class="w-full" />
                <label for="addressline2">Address Line 2</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <Select
                  v-model="editForm.province_id"
                  :options="provinces"
                  optionLabel="province_name"
                  optionValue="province_id"
                  @update:modelValue="onProvinceChange"
                  class="w-full"
                />
                <label for="province">Province</label>
              </FloatLabel>

              <FloatLabel variant="on">
                <Select
                  v-model="editForm.city_id"
                  :options="cities"
                  optionLabel="name"
                  optionValue="id"
                  :disabled="!editForm.province_id"
                  class="w-full"
                />
                <label for="city">City / Municipality</label>
              </FloatLabel>
            </div>
          </div>
        </div>
      </template>

      <!-- Footer with Action Buttons -->
      <template #footer>
        <div v-if="!isEditing" class="flex gap-3">
          <Button
            label="Edit Profile"
            icon="pi pi-pencil"
            class="flex-1 bg-oxford-blue border-oxford-blue hover:bg-oxford-blue/90 text-white font-bold"
            @click="startEditing"
          />
          <Button
            label="Change Password"
            icon="pi pi-lock"
            outlined
            class="flex-1 text-oxford-blue border-oxford-blue hover:bg-oxford-blue/10 font-bold"
            @click="showChangePassword"
          />
        </div>
        <div v-else class="flex gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            severity="secondary"
            class="flex-1 font-bold"
            @click="cancelEditing"
          />
          <Button
            label="Save Changes"
            icon="pi pi-check"
            class="flex-1 bg-giants-orange border-giants-orange hover:bg-giants-orange/90 text-white font-bold"
            @click="saveProfile"
          />
        </div>
      </template>
    </Card>

    <!-- Change Password Dialog -->
    <ChangePasswordDialog
      v-model:visible="showPasswordDialog"
      @password-updated="handlePasswordUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'
import userService from '@/services/userService.js'
import phJSONData from '@/data/ph_locations.json'

// Profile data based on database schema
const profileData = ref({
  user_id: null,
  email: '',
  fname: '',
  mname: '',
  lname: '',
  address_id: null,
  role_id: null,
  created_at: '',
  updated_at: '',
  is_deleted: 0,
  addressline1: '',
  addressline2: '',
  city_id: null,
  city_name: '',
  province_id: null,
  province_name: '',
  role_name: 'Customer',
})

const isEditing = ref(false)
const showPasswordDialog = ref(false)
const loading = ref(false)
const error = ref(null)
const toast = useToast()
const provinces = ref(phJSONData.provinces)
const cities = ref([])

// Edit form matching database schema
const editForm = reactive({
  fname: '',
  mname: '',
  lname: '',
  email: '',
  addressline1: '',
  addressline2: '',
  city_id: '',
  province_id: ''
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fetchUserProfile = async () => {
  try {
    loading.value = true
    error.value = null
    const profile = await userService.getUserProfile()
    Object.assign(profileData.value, profile)

    // Load cities for user's province
    if (profileData.value.province_id) {
      cities.value = phJSONData.cities[profileData.value.province_id] || []
    }
  } catch (err) {
    error.value = 'Failed to load profile'
    console.error('Error loading profile:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load profile',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  editForm.fname = profileData.value.fname
  editForm.mname = profileData.value.mname
  editForm.lname = profileData.value.lname
  editForm.email = profileData.value.email
  editForm.addressline1 = profileData.value.addressline1
  editForm.addressline2 = profileData.value.addressline2
  editForm.province_id = profileData.value.province_id
  editForm.city_id = profileData.value.city_id

  // Load cities for current province
  if (editForm.province_id) {
    cities.value = phJSONData.cities[editForm.province_id] || []
  }

  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  // Reset form
  Object.keys(editForm).forEach(key => editForm[key] = '')
}

const saveProfile = async () => {
  try {
    loading.value = true
    const updateData = {
      fname: editForm.fname,
      mname: editForm.mname,
      lname: editForm.lname,
      addressline1: editForm.addressline1,
      addressline2: editForm.addressline2,
      city_id: editForm.city_id,
    }

    const updatedProfile = await userService.updateUserProfile(updateData)
    Object.assign(profileData.value, updatedProfile)

    // Update local city and province names for display
    const selectedProvince = provinces.value.find(p => p.province_id === editForm.province_id)
    const selectedCity = cities.value.find(c => c.id === editForm.city_id)

    if (selectedProvince) {
      profileData.value.province_name = selectedProvince.province_name
    }
    if (selectedCity) {
      profileData.value.city_name = selectedCity.name
    }

    isEditing.value = false
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile updated successfully',
      life: 3000,
    })
  } catch (err) {
    console.error('Error saving profile:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.error || 'Failed to update profile',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const onProvinceChange = (provinceId) => {
  cities.value = phJSONData.cities[provinceId] || []
  editForm.city_id = ''
}

const showChangePassword = () => {
  showPasswordDialog.value = true
}

const handlePasswordUpdated = () => {
  console.log('Password updated successfully!')
}

onMounted(() => {
  fetchUserProfile()
})

</script>
