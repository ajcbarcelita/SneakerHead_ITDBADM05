<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Change Password"
    :style="{ width: '28rem' }"
    :breakpoints="{ '640px': '90vw' }"
    class="font-Montserrat"
  >
    <div class="flex flex-col gap-4 py-4">
      <!-- Current Password -->
      <FloatLabel variant="on">
        <Password
          id="currentPassword"
          v-model="passwordForm.currentPassword"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          :class="{ 'p-invalid': errors.currentPassword }"
        />
        <label for="currentPassword">Current Password</label>
      </FloatLabel>
      <small v-if="errors.currentPassword" class="text-red-600">{{ errors.currentPassword }}</small>

      <!-- New Password -->
      <FloatLabel variant="on">
        <Password
          id="newPassword"
          v-model="passwordForm.newPassword"
          toggleMask
          :feedback="true"
          inputClass="w-full"
          :class="{ 'p-invalid': errors.newPassword }"
        />
        <label for="newPassword">New Password</label>
      </FloatLabel>
      <small v-if="errors.newPassword" class="text-red-600">{{ errors.newPassword }}</small>

      <!-- Confirm New Password -->
      <FloatLabel variant="on">
        <Password
          id="confirmPassword"
          v-model="passwordForm.confirmPassword"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          :class="{ 'p-invalid': errors.confirmPassword }"
        />
        <label for="confirmPassword">Confirm New Password</label>
      </FloatLabel>
      <small v-if="errors.confirmPassword" class="text-red-600">{{ errors.confirmPassword }}</small>

      <!-- Password Requirements -->
      <div class="bg-white-smoke p-3 rounded-lg text-sm">
        <p class="font-semibold text-charcoal mb-2">Password Requirements:</p>
        <ul class="list-disc list-inside text-gray space-y-1">
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Contains at least one special character</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          class="flex-1 font-bold"
          @click="closeDialog"
        />
        <Button
          label="Update Password"
          class="flex-1 bg-giants-orange border-giants-orange hover:bg-giants-orange/90 text-white font-bold"
          @click="handleUpdatePassword"
          :loading="isLoading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import userService from '@/services/userService.js'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'password-updated'])

const visible = ref(props.visible)
const isLoading = ref(false)
const toast = useToast()

// Password form data
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation errors
const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Watch for prop changes
watch(() => props.visible, (newVal) => {
  visible.value = newVal
})

// Watch for dialog visibility changes and emit to parent
watch(visible, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal) {
    resetForm()
  }
})

// Validate password according to requirements
const validatePassword = (password) => {
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password)

  if (!minLength) {
    return 'Password must be at least 8 characters long'
  }
  if (!hasUpperCase) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!hasLowerCase) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!hasNumber) {
    return 'Password must contain at least one number'
  }
  if (!hasSpecialChar) {
    return 'Password must contain at least one special character'
  }
  return ''
}

// Validate form
const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  // Validate current password
  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required'
    isValid = false
  }

  // Validate new password
  if (!passwordForm.newPassword) {
    errors.newPassword = 'New password is required'
    isValid = false
  } else {
    const passwordError = validatePassword(passwordForm.newPassword)
    if (passwordError) {
      errors.newPassword = passwordError
      isValid = false
    }
  }

  // Validate confirm password
  if (!passwordForm.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  // Check if new password is same as current
  if (passwordForm.currentPassword === passwordForm.newPassword && passwordForm.currentPassword) {
    errors.newPassword = 'New password must be different from current password'
    isValid = false
  }

  return isValid
}

// Handle password update
const handleUpdatePassword = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await userService.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )

    // Emit success event
    emit('password-updated')

    // Close dialog
    visible.value = false

    // Show success toast
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password changed successfully',
      life: 3000,
    })
  } catch (error) {
    console.error('Password update failed:', error)
    const errorMessage = error.response?.data?.error || 'Failed to change password'

    // Handle specific error messages
    if (errorMessage.includes('incorrect')) {
      errors.currentPassword = errorMessage
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000,
      })
    }
  } finally {
    isLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
}

// Close dialog
const closeDialog = () => {
  visible.value = false
}
</script>
