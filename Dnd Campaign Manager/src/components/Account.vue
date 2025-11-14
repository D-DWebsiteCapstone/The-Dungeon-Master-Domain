<template>
<div class="accountPage">

    <h1>The Ancient Texts</h1>

    <p>
      The secret texts of this page holds your account settings, your subscription details, 
      the rich lore of your campaign history, and the sacred logout button.
    </p>

    <div class="divider">
      <img src="../assets/divider-left.png" alt="divider image">
      <h2>Edit Account</h2>
      <img src="../assets/divider-right.png" alt="divider image">
    </div>


    <div class = "editInfo">
      <p>USERNAME</p>
      <p>insert user usrename</p>
      <br>
      <p>PASSWORD</p>
      <p>insert user password</p>
      <br>
    </div>

    <button class="parchmentButton" @click="logout()">LOGOUT</button>
    <button class="parchmentButton" @click="showDeleteConfirm = true">DELETE ACCOUNT</button>

    <!-- Delete confirmation modal -->
    <div class="modal" v-if="showDeleteConfirm" :style="{ display: 'flex' }">
      <div class="popup">
        <div class="popuptxt">
           <p>{{ deleteMessages[currentStep] }}</p>
          <button class = "popupButton" v-if="currentStep < deleteMessages.length - 1" @click="nextDeleteStep">Yes, I'm sure</button>
          <button class = "popupButton" v-else @click="confirmDelete" :disabled="isDeleting">Final Confirmation: Delete my account</button>
          <button class = "popupButton" @click="cancelDelete" :disabled="isDeleting">Cancel</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()

const logout = () => {
  localStorage.removeItem('authToken')
  router.push('/Login')
}

// Delete flow state
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const currentStep = ref(0)

// Fun sequential messages
const deleteMessages = [
  "Are you sure you want to delete your account? This action cannot be undone.",
  "Really? You’ll lose all your data forever. Maybe just log out instead?",
  "Okay… but just to confirm, you *do* realize this erases all your campaigns?",
  "By clicking again, you set in motion events that cannot be reversed.",
  "The digital winds whisper, 'Turn back traveler... the void awaits.'",
  "The ancient scroll trembles — are you truly prepared to unmake your legend?",
  "So be it. Your fate is sealed. Speak the final words, and your tale shall end."
]

function startDeleteSequence() {
  currentStep.value = 0
  showDeleteConfirm.value = true
}

function nextDeleteStep() {
  if (currentStep.value < deleteMessages.length - 1) {
    currentStep.value++
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  currentStep.value = 0
}

async function confirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/Login')
    return
  }

  try {
    const res = await fetch('https://localhost:3000/user/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      showDeleteConfirm.value = false
      router.push('/Login')
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.message || 'Failed to delete account')
    }
  } catch (err) {
    console.error('Delete failed', err)
    alert('Network error while deleting account')
  } finally {
    isDeleting.value = false
  }
}

</script>
<style scoped>  

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 10vh;
}

img {
  width: 30%;
  margin-left: 50px;
  margin-right: 50px;
}

.editInfo {
  margin: 6vh;
  display: block;
  text-align: left;
}

</style>
