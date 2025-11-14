<template>
<div class="homePage">
  <div class="Greetings">
    <h1>Welcome Traveler!</h1>
    <br>
    <p>To begin on your adventure, please choose a path forward:</p>
  </div>

  <div class="ChoosePath">
    <button class="parchmentButton" @click="showCreateModal = true" style="width:auto;">Create Campaign</button>
    <button class="parchmentButton" @click="showJoinModal = true" style="width:auto;">Join Campaign</button>
    <button class="parchmentButton" @click="router.push('/CharPage')">Characters</button>
  </div>

    <h2>Your Campaigns</h2>

  <div class="dropdown">
    <select id="dropdown" @change="CampaignSort()">
      <option value="All_Campaigns">All Campaigns</option>
      <option value="Campaigns_You_Play_In">Player</option>
      <option value="Campaigns_You_Run">Dungeon Master</option>
    </select>
  </div>
  <div class="CardSpacing">  
    <div class="Card" data-role="DM">Campaign 1</div>
    <div class="Card" data-role="Player">Campaign 2</div>
    <div class="Card" data-role="DM">Campaign 3</div>
    <div class="Card" data-role="Player">Campaign 4</div>
  </div>

  <!-- Create Campaign Modal -->
  <div id="id03" class="modal" :style="{ display: showCreateModal ? 'block' : 'none' }">
    <div class="popup">
      <div class="popuptxt">
      <p>Name your Campaign.</p>
      <input type="text" placeholder="Enter Campaign Name" v-model="campaignName" name="cname">
      <br>
      <br><br>
      <button type="button" @click="submitCampaign">Submit</button>
      <button type="button" @click="showCreateModal = false">Cancel</button>
    </div>
    </div>
  </div>

  <!-- Join Campaign Modal -->
  <div id="id04" class="modal" :style="{ display: showJoinModal ? 'block' : 'none' }">
    <div class="popup">
      <div class="popuptxt">
      <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
      <br>
      <input type="text" placeholder="Enter Campaign Code" v-model="joinCode" name="ccode">
      <br><br>
      <button type="button" @click="joinCampaign()">Join</button>
      <button type="button" @click="showJoinModal = false">Cancel</button>
    </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const joinCode = ref('')
const campaignName = ref('')




async function submitCampaign() {
  if (!campaignName.value) {
    alert('Please enter a name')
    return
  }

  const response = await fetch('https://localhost:3000/data/campaign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      title: campaignName.value,
      roleName: 'DM',
      selectedCharacter: null
    })
  })

  const result = await response.json()

  if (result.valid && result.campaign && result.campaign.id) {
    console.log("Campaign created:", result.campaign)
    router.push(`/campaign/${result.campaign.id}`)
  } else {
    console.error("No campaign ID returned:", result)
  }
}

async function joinCampaign() {
  if (!joinCode.value) {
    alert('Please enter a campaign code')
    return
  }

  const response = await fetch('https://localhost:3000/data/campaign/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ joinCode: joinCode.value })
  })

  const result = await response.json()

  if (result.valid && result.campaign && result.campaign.id) {
    router.push(`/campaign/${result.campaign.id}`)
    showJoinModal.value = false
  } else {
    alert('Failed to join campaign. Please check the join code and try again.')
  }
}



async function CampaignSort() {
  const dropdown = document.getElementById('dropdown').value;
  if(dropdown === "All_Campaigns"){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='block');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='block');
    // Implement filtering logic here
    //console.log("Filtering campaigns based on selection:", dropdown);
  }
  else if(dropdown === "Campaigns_You_Play_In"){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='none');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='block');
    //console.log("Filtering campaigns based on selection:", dropdown);
  }
  else if(dropdown === "Campaigns_You_Run"){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='block');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='none');
    //console.log("Filtering campaigns based on selection:", dropdown);
  }
}
</script>

<style scoped>
.Greetings {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 2.5rem;
}

.ChoosePath {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}
</style>