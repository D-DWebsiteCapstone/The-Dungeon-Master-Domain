<template>
  <div class="reset-page">
    <h2>Reset Your Password</h2>

    <div v-if="status === 'loading'">
      <p>Checking reset link...</p>
    </div>

    <div v-else-if="status === 'expired'">
      <p class="error">This reset link has expired or is invalid.</p>
    </div>

    <div v-else-if="status === 'ready'">
      <form @submit.prevent="resetPassword">
        <label>New Password:</label>
        <input type="password" v-model="newPassword" required />

        <label>Confirm Password:</label>
        <input type="password" v-model="confirmPassword" required />

        <button type="submit">Update Password</button>
      </form>
    </div>

    <div v-else-if="status === 'success'">
      <p class="success">Your password has been successfully updated!</p>
      <p>Redirecting you to login...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../lib/api'

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const status = ref('loading')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  token.value = params.get('token')

  if (!token.value) {
    status.value = 'expired'
  } else {
    status.value = 'ready'
  }
})

async function resetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    window.alert('Passwords do not match!')
    return
  }

  try {
    const response = await apiFetch('/user/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, newPassword: newPassword.value })
    })

    const result = await response.json()

    if (result.success) {
      status.value = 'success'
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } else {
      status.value = 'expired'
    }
  } catch (err) {
    console.error('Password reset error:', err)
    status.value = 'expired'
  }
}
</script>

<style scoped>
.reset-page {
  text-align: center;
  padding: 40px;
  max-width: 400px;
  margin: 0 auto;
}

input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 10px 0;
}

button {
  background: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
