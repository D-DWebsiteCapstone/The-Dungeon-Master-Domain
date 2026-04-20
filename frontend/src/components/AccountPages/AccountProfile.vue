<template>

 <div class="accountPage" v-sound>

    <div class = "editInfo">
        <div class="pfpInfo">
          <img class="pfp" :src="profilePicSrc" @error="onProfilePicError" alt="profile picture">
          <button class="parchmentButton" @click="updateProfilePic">Change Profile Picture</button>
          <button class="parchmentButton" @click="deleteProfilePicture">Reset Profile Picture</button>
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
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../../lib/api.js'
import { fetchProfilePic, updateProfilePic as saveProfilePic, deleteProfilePic as removeProfilePic } from '../../lib/dataHelper.js'

defineProps(['id']);

const defaultProfilePic = new URL('../../assets/images/icons/pawn.png', import.meta.url).href
const profilePicUrl = ref('')
const profilePicSrc = computed(() => profilePicUrl.value || defaultProfilePic)

function onProfilePicError() {
  profilePicUrl.value = defaultProfilePic
}

onMounted(async () => {
  try {
    const result = await fetchProfilePic()
    profilePicUrl.value = result?.profilePic || defaultProfilePic
  } catch (error) {
    console.error('Failed to load profile picture:', error)
    profilePicUrl.value = defaultProfilePic
  }
})

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

// Profile picture update function
// This will work similar to the character image update, 
// but will be for the user's profile picture.
//The image will be uploaded to the server, and the server will return a URL for the image,
//which will be stored in the database and used to display the profile picture.
function updateProfilePic() {
  //Create a file input element to select an image
  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*'

  imageInput.onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected')
      return;
    }

    try{ 
      const profilePicture = await readFileAsDataUrl(file)
      const result = await saveProfilePic(profilePicture)

      if (result?.valid) {
        profilePicUrl.value = result.profilePicture || profilePicture
        window.dispatchEvent(new Event('profile-picture-updated'))
      } else {
        console.error(result?.message || 'Failed to save profile picture.')
      }
    }catch (e) {
      console.error(e);
      //Handle error, maybe show a message to the user
    }

  };
  imageInput.click();

  //For now, this is just a placeholder function to show where the profile picture update logic will go.
}

async function deleteProfilePicture() {
  try {
    const result = await removeProfilePic()
    if (result?.valid) {
      profilePicUrl.value = defaultProfilePic
      window.dispatchEvent(new Event('profile-picture-updated'))
    } else {
      console.error(result?.message || 'Failed to delete profile picture.')
    }
  } catch (error) {
    console.error('Failed to delete profile picture:', error)
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
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
  max-width: 100%;
  align-items: left;
  text-align: left;
  margin-left: 20px;
}

.pfp {
  aspect-ratio: 1/1;
  width: 90%;
  margin-bottom: 2rem;
  border: 3px solid var(--vt-c-bronze);
  border-radius: 50%;
  object-fit: cover;
}

img {
  margin-left: 10px;
  margin-right: 10px;
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}


@media (max-width: 850px) {
  .editInfo {
    display: flex;
    flex-direction: column;
  }

  .pfp {
    width: 50%;
    margin-bottom: 10px;
  }

  .info {
    display: block;
    margin-left: 0;
    margin-top: 1rem;
    text-align: center;
    align-items: center;

    .spacer{
      margin-top: 0.5rem;
    }
  }

}

@media (max-width: 400px) {
  .editInfo {
    padding: 4px;

    .parchmentButton {
      margin-left: 0;
      margin-right: 0;
      padding-left: 8px;
      padding-right: 8px;
      min-width: 240px !important;
      width: 240px !important;
    }

    
      input {
        margin-left: 0;
        margin-right: 0;
        width: calc(100% - 8px)
      }
  }

  .pfpInfo {
    width: calc(100% - 8px);
  }

  .info {
    width: calc(100% - 8px);
  }
}
</style>