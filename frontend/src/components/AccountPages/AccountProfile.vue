<template>

 <div class="accountPage" v-sound>
        
    <div class="divider">
        <img src="../../assets/images/divider-left-long.png" alt="divider image">
        <h2>Edit Account</h2>
        <img src="../../assets/images/divider-right-long.png" alt="divider image">
    </div>


    <div class = "editInfo">
        <h2>Change Username</h2>
        <input v-model="newUsername" type="text" placeholder= "New Username" />
        <button class="parchmentButton" @click="changeUsername">Update Username</button>
        <p v-if="usernameMessage">{{ usernameMessage }}</p>
        <div class="spacer">
            <h2>Change Password</h2>
        </div>
        <input v-model="currentPassword" type="password" placeholder="Current password" />
        <input v-model="newPassword" type="password" placeholder="New password" />
        <input v-model="confirmPassword" type="password" placeholder="Confirm new password" />
        <button class="parchmentButton" @click="changePassword">Update Password</button>
        <p v-if="passwordMessage">{{ passwordMessage }}</p>
        <br>
    </div>

 </div>

</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import {fetchUsername} from '../../lib/dataHelper.js';
import { jwtDecode } from 'jwt-decode';
const route = useRoute()
const router = useRouter()

//token handling 
const token = localStorage.getItem("authToken");
const decoded = jwtDecode(token);

const userId = decoded.id;

defineProps(['id']);

// async function getUsername() {
//   const usernameResult = await fetchUsername(userId);
//   const username = usernameResult.username;
//   return username.value;
// }

const newUsername = ref('')
const usernameMessage = ref('')

async function changeUsername() {
  usernameMessage.value = ''

  if (!newUsername.value.trim()) {
    usernameMessage.value = 'Please enter a username.'
    return
  }

  try {
    const res = await apiFetch('/user/change-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ newUsername: newUsername.value.trim() })
    })

    const result = await res.json()
    if (result.valid) {
      usernameMessage.value = 'Username updated!'
    } else {
      usernameMessage.value = result.message || 'Failed to update username.'
    }
  } catch (e) {
    console.error(e)
    usernameMessage.value = 'Error contacting server.'
  }
}

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref('')

async function changePassword() {
  passwordMessage.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordMessage.value = 'Please fill all password fields.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'New passwords do not match.'
    return
  }

  try {
    const res = await apiFetch('/user/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      })
    })

    const result = await res.json()
    if (result.valid) {
      passwordMessage.value = 'Password updated!'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      passwordMessage.value = result.message || 'Failed to update password.'
    }
  } catch (e) {
    console.error(e)
    passwordMessage.value = 'Error contacting server.'
  }
}

</script>