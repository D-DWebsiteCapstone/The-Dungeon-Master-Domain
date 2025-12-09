<template>
  <div class="verify-page">
    <div v-if="status === 'loading'" class="status">
      <h2>Verifying your account...</h2>
      <p>Please wait a moment.</p>
    </div>

    <div v-else-if="status === 'success'" class="status success">
      <h2>Account Verified!</h2>
      <p>Your account has been successfully verified.</p>
      <p>You’ll be redirected to the login page shortly...</p>
    </div>

    <div v-else-if="status === 'already'" class="status success">
      <h2>Account Already Verified</h2>
      <p>You can login using your email and password.</p>
    </div>

    <div v-else class="status error">
      <h2>Invalid or Expired Link</h2>
      <p>Sorry, your verification link is no longer valid.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../lib/api'

const status = ref('loading')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    status.value = 'error'
    return
  }

  try {
    const response = await apiFetch(`/user/verify?code=${code}`)
    const result = await response.json()

    if (result.success) {
      status.value = 'success'
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/Login'
      }, 3000)
    } else if (result.message === 'Already verified') {
      status.value = 'already'
      setTimeout(() => {
        window.location.href = '/Login'
      }, 3000)
    } else {
      status.value = 'error'
    }
  } catch (err) {
    console.error('Verification error:', err)
    status.value = 'error'
  }
})
</script>

<style scoped>
.verify-page {
  text-align: center;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  color: black;
}

.status {
  border: 2px solid #ccc;
  border-radius: 16px;
  padding: 30px;
  background: #000000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.success {
  border-color: #000000;
  background: #e8f5e9;
}

.error {
  border-color: #f44336;
  background: #000000;
}

h2 {
  margin-bottom: 10px;
}
</style>
