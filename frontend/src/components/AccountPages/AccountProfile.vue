<template>

 <div class="accountPage" v-sound>

    <div class = "editInfo">
      <div clas="pfpInfo">
          <img class="pfp" src="../../assets/images/pawn.png" alt="profile picture">
          <button class="parchmentButton">Change Profile Picture</button>
          <button class="parchmentButton">Delete Profile Picture</button>
      </div>
      <div class="info">
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
      </div>
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

<style scoped>
.parchmentButton {
  width: 260px;
}

.accountPage {
  padding: 0;
  margin: 0;
  align-items: top;
}

select, input, textarea {
  margin-left: 10px;
  width: 95%;
  padding: 6px;
  border-radius: 5px;
}

.editInfo{
  align-items: center;
  display: grid;
  grid-template-columns: 275px 2fr;
  justify-content: center;
  margin-left: 1rem;
  margin-top: 1rem;
  width: 90%;
  border: 1px solid var(--vt-c-bronze);
  border-radius: 8px;
  padding: 1rem;
}

.spacer {
  margin-top: 2rem;
  display:flex-start;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
  margin-left: 20px;
}

.pfp {
  width: 90%;
  margin-bottom: 2rem;
  border: 1px solid var(--vt-c-bronze);
  border-radius: 50%;
}

img {
  width: 30%;
  margin-left: 10px;
  margin-right: 10px;
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}
</style>