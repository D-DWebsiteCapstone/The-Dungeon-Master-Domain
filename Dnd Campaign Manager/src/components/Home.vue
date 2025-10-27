<template>

  <div class="Greetings">
    <h2>Welcome Traveler!</h2>
    <p>To begin on your adventure, please chools a path forward:</p>
  </div>

  <div class="ChoosePath">
    <!-- replaced inline JS with Vue-controlled modals -->
    <button @click="showCreateModal = true" style="width:auto;">Create Campaign</button>
    <button @click="showJoinModal = true" style="width:auto;">Join Campaign</button>
    <button @click="router.push('/CharPage')">Characters</button>
  </div>

  <div class="Greetings">
    <h2>Your Campaigns</h2>
  </div>
  <br>

  <div class="CardSpacing">  
    <div class="Card">Campaign 1</div>
    <div class="Card">Campaign 2</div>
    <div class="Card">Campaign 3</div>
    <div class="Card">Campaign 4</div>
  </div>

  <!-- Create Campaign Modal -->
  <div id="id03" class="modal" :style="{ display: showCreateModal ? 'block' : 'none' }">
    <div class="popup">
      <p>Name your Campaign.</p>
      <input type="text" placeholder="Enter Campaign Name" v-model="campaignName" name="cname">
      <br>
      <p>Generate a code for your players.</p>
      <!-- Handles showing a button and generating code -->
      <div style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center;">
        <button type="button" @click="generateCode()">Generate Code</button>
        <div class="generated-code" v-if="generatedCode">{{ generatedCode }}</div>
      </div>
      <br><br>
      <button type="button" @click="showCreateModal = false">Cancel</button>
      <button type="button" @click="submitCampaign">Submit</button>
    </div>
  </div>

  <!-- Join Campaign Modal -->
  <div id="id04" class="modal" :style="{ display: showJoinModal ? 'block' : 'none' }">
    <div class="popup">
      <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
      <br>
      <input type="text" placeholder="Enter Campaign Code" v-model="joinCode" name="ccode">
      <br><br>
      <button type="button" @click="joinCampaign">Join</button>
      <button type="button" @click="showJoinModal = false">Cancel</button>
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
  if (!campaignName.value) {
    alert('Please enter a campaign name!')
    return
  }

  const response = await fetch('http://localhost:3000/data/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: campaignName.value })
  })

  const result = await response.json()
  if (result.valid) {
    console.log('Campaign created:', result.campaign)
    showCreateModal.value = false
    router.push(`/campaign/${result.campaign.id}`)
  } else {
    alert(result.message || 'Failed to create campaign')
  }
}

async function joinCampaign() {
  if (!joinCode.value) {
    alert('Please enter a join code!')
    return
  }

  const response = await fetch('http://localhost:3000/data/campaign/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joinCode: joinCode.value })
  })

  const result = await response.json()
  if (result.valid) {
    showJoinModal.value = false
    router.push(`/campaign/${result.campaign.id}`)
  } else {
    alert(result.message || 'Invalid join code')
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
  color: var(--vt-c-black);
  font-size: 1rem;
  word-break: break-all;
  margin-top: 8px;
}
</style>
