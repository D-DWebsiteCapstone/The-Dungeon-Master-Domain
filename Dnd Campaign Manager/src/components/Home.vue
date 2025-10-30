<template>
<div class="HomePage">
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
      <button type="button" @click="showJoinModal = false">Cancel</button>
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
  const currentUserId = 'user123' // <-- TODO: replace when login works

  const response = await fetch('http://localhost:3000/data/campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: campaignName.value,
      id: generatedCode.value,
      userId: currentUserId,
      roleName: 'DM',
      selectedCharacter: null
    })
  })

  const result = await response.json()
  if (result.valid) {
    console.log('Campaign created:', result.campaign)
    showCreateModal.value = false
    router.push(`/campaign/${generatedCode.value}`)
  } else {
    alert('Failed to create campaign')
  }
}
</script>

<style scoped>

</style>