<template>
    
    <div v-sound class="accountPage">
        
        <div class="divider">
            <img src="../../assets/images/divider-left-long.png" alt="divider image" style="margin-left: 25px;">
            <div class="dividerh2"><h2>Discord</h2></div>
            <img src="../../assets/images/divider-right-long.png" alt="divider image" style="margin-right: 25px;">
        </div>

        <p>Link your Discord account to your profile.</p>

        <div class="ifAccount">
            <div class="noAccount" v-if="!discordUsername">
              <div class="currentTitle"><p>Current linked account: </p></div>
              <div class="accountName"><p>No account linked</p></div>
              <div class="accountOption">
                <input type="text" placeholder="Enter Discord Username">
                <button class="popupButton">Link Account</button>
              </div>
            </div>
            <div class="linkedAccount" v-else>
              <div class="currentTitle"><p>Current linked account: </p></div>
              <div class="accountName"><p>{{ discordUsername }}</p></div>
              <div class="accountOption"><button class="parchmentButton">Unlink Account</button></div>
            </div>
        </div>
        <br>
        <br>
        <p>Want to invite users through Discord? Let Rat-Squirrel Help you with that!</p>

        <button class="parchmentButton" @click="goToBotInvite()">Rat-Squirrel Bot Invite</button>
    </div>

</template>

<script setup>
const discordUsername = null; // Placeholder for the actual Discord username
const joinLink = import.meta.env.VITE_DISCORD_BOT_JOIN_URL

 async function goToBotInvite(){
  await window.open(joinLink, '_blank');
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

.ifAccount {
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
  }
}
</style>