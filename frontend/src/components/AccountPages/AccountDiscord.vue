<template>
    
    <div v-sound class="accountPage">
        
        <div class="divider">
            <img src="../../assets/images/dividers/divider-left-long.png" alt="divider image" style="margin-left: 25px;">
            <div class="dividerh2"><h2>Discord</h2></div>
            <img src="../../assets/images/dividers/divider-right-long.png" alt="divider image" style="margin-right: 25px;">
        </div>

        <p>Link your Discord account to your profile.</p>

        <div class="ifAccount">
            <div class="noAccount" v-if="!discordID">
              <div class="currentTitle"><p>Current linked account: </p></div>
              <div class="accountName"><p>No account linked</p></div>
              <div class="accountOption">
                <button class="popupButton" @click="loginWithDiscord">Link Account</button>
              </div>
            </div>
            <div class="linkedAccount" v-else>
              <div class="currentTitle"><p>Current linked account: </p></div>
              <div class="accountName"><p>{{ discordUsername}}</p></div>
              <div class="accountOption">
                <button class="popupButton" @click="unlinkDiscordAccount()">Unlink Account</button>
              </div>
            </div>
        </div>
        <br>
        <br>
        <div class="invite">
          <p>Want to invite users through Discord? Let Rat-Squirrel Help you with that!</p>
          <button class="parchmentButton" @click="goToBotInvite()">Rat-Squirrel Bot Invite</button>
        </div>
    </div>

</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import {fetchUsername, fetchDiscordID, fetchDiscordUsername, unlinkDiscord} from '../../lib/dataHelper.js';
import { apiFetch } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

const discordID = ref(''); // Placeholder for the actual Discord ID
const discordUsername = ref('');
const username = ref('');
const token = localStorage.getItem("authToken");
const decoded = jwtDecode(token);
const userId = decoded.id;
const unlinking = ref(''); 

async function checkIfLinked() {
  try {
    const data = await fetchUsername(userId);
    username.value = data.username || null;

    const discordData = await fetchDiscordID(userId);
    discordID.value = discordData.discordID || null;

    const discordUsernameData = await fetchDiscordUsername(userId);
    discordUsername.value = discordUsernameData.discordUsername;
    console.log('discordUsername:', discordUsername.value);
  } catch (err) {
    console.error('Failed to fetch discord ID: ', err)
  } 
}

const DISCORD_REDIRECT = import.meta.env.VITE_DISCORD_REDIRECT;
function loginWithDiscord() {
  console.log(DISCORD_REDIRECT);
  window.location.href = DISCORD_REDIRECT;
}

async function unlinkDiscordAccount() {
  if(!confirm('Are you sure you want to unlink your Discord account?')) return;
  unlinking.value = true;
   
  try {
    const result = await unlinkDiscord(userId);
    if(result) {
      discordID.value = null
      discordUsername.value = null;
      window.location.reload();
    } else {
      alert('Failed to unlink: ' + (result?.message || 'Unknown error'))
    }
  
  } catch (err) {
    console.error('Failed to fetch error');
    alert('An error occurred while unlinking.')
  } finally {
    unlinking.value = false
  }
}


onMounted(async () => {
  await checkIfLinked()
  console.log("Username: ", username.value)
  console.log("Discord ID: ", discordID.value)
})
const joinLink = import.meta.env.VITE_DISCORD_BOT_JOIN_URL

 async function goToBotInvite(){
  await window.open(joinLink, '_blank');
}

</script>

<style scoped>
.parchmentButton {
  margin-top: 1rem;
  width: 260px;
}

.accountPage {
  padding: 0;
  margin: 0;
  align-items: top;
  min-height: 700px;
}

.dividerh2 {
  display: inline;
  width: 25%;
  margin: auto;
  /* margin: 10px; */
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 3vh;
}

img {
  max-width: 28%;
  margin-left: 10px;
  margin-right: 10px;
}

.ifAccount, .invite {
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  margin-top: 1rem;
  width: 90%;
  border: 1px solid var(--vt-c-bronze);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(2px);
}

.noAccount, .linkedAccount {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  grid-template-rows: 0.5fr 1fr;
}

.currentTitle {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: right;
  padding-right: 3%;
}

.accountName {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: left;
  
  p {
    font-size: 1.2rem;
  }
}

.accountOption {
  grid-row: 2;
  grid-column: 1/span 2;
  display: flex;
  justify-content: space-between;

  input {
    width: 65%;
  }

  .popupButton {
    border: 1px solid var(--vt-c-bronze);
    margin-top: 1rem;
    margin-bottom: 0;
  }
}

@media (max-width: 850px) {
    .divider h2 {
        font-size: 1.5rem;
    }
}

@media (max-width: 700px) {
    .dividerh2 {
        font-size: 1.2rem;
        width: fit-content;
        margin: 5px auto;
    }
    .divider h2 {
        font-size: 1.2rem;
    }
}

@media (max-width: 650px) {
    .divider {
        display: block;
        img{
            display: none;
        }
    }

    .supportTutorial, .supportTicket {
        padding: 16px 10px;
        margin-left: 0;
    }
}

@media (max-width: 550px) {
    .divider {
        display: inline-flex;
        img{
            display:flex;
            width: 25%;
        }
    }
}

</style>