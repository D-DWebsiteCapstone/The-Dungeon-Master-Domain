<template>

      <div class="Greetings">
        <h2>Welcome Traveler!</h2>
        <p>To begin on your adventure, please chools a path forward:</p>
      </div>

      <div class="ChoosePath">
        <button onclick="document.getElementById('id03').style.display='block'" style="width:auto; ">Create Campaign</button>
        <button onclick="document.getElementById('id04').style.display='block'" style="width:auto;">Join Campaign</button>
      </div>

      <div class="Greetings">
        <h2> Your Campaigns </h2>
      </div>
      <br>

      <div class="CampaignBoxesSpacing">  
        <div class="CampaignBoxes">Campaign 1</div>
        <div class="CampaignBoxes">Campaign 2</div>
        <div class="CampaignBoxes">Campaign 3</div>
        <div class="CampaignBoxes">Campaign 4</div>
      </div>

      <div id="id03" class="modal">
        <div class="popup">
          <p>Name your Campaign.</p>
          <input type="text" placeholder="Enter Campaign Name" name="cname">
          <br>
          <p>Generate a code for your players.</p>
          <!-- Handles showing a button and generating code -->
          <div style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center;">
            <button type="button" @click="generateCode()">Generate Code</button>
            <div class="generated-code" v-if="generatedCode">{{ generatedCode }}</div>
          </div>
          <br>
          <br>
          <button type="button" onclick="document.getElementById('id03').style.display='none'">Cancel</button>
          <button type="button" @click="submitCampaign">Submit</button>
        </div>
      </div>

      <div id="id04" class="modal">
        <div class="popup">
          <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
          <br>
          <input type="text" placeholder="Enter Campaign Code" name="ccode">
          <br>
          <br>
          <button type="button" onclick="document.getElementById('id04').style.display='none'">Cancel</button>
        </div>
      </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const generatedCode = ref('')
const joinCode = ref('')
const campaignName = ref('')

function generateCode(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const array = new Uint32Array(length)
  window.crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  generatedCode.value = result
}

async function submitCampaign() {
  if (!generatedCode.value || !campaignName.value) {
    alert('Please enter a name and generate a code first!')
    return
  }

  // Replace 'currentUserId' with the actual logged-in user ID
  const currentUserId = 'user123' // <-- TODO: get this from your login system

  const response = await fetch('http://localhost:3000/data/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: campaignName.value,
      id: generatedCode.value,
      userId: currentUserId,
      roleName: 'DM', // Since creating campaign
      selectedCharacter: null
    })
  })

  const result = await response.json()
  if (result.valid) {
    console.log('Campaign created:', result.campaign)
    router.push(`/campaign/${generatedCode.value}`)
  } else {
    alert('Failed to create campaign')
  }
}
</script>

<style scoped>
.generated-code {
  padding: 6px 10px;
  background: #f3f3f3;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  max-width: 90%;
  color: var(--vt-c-black); /* ensure text is readable on light bg */
  font-size: 1rem;
  word-break: break-all;
  margin-top: 8px;
}
</style>