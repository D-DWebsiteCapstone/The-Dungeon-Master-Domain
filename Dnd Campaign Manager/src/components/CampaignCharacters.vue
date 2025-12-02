<!-- This will be the page for displaying campaign characters and allowing users to manage them and
 edit them also edit their levels as well -->

<template>
  <nav class="navBar" v-sound>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}`)" :class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/recaps`)" :class="{ active: route.path.includes('/recaps') }">Recaps</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/maps`)" :class="{ active: route.path.includes('/maps') }">Maps</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/characters`)" :class="{ active: route.path.includes('/characters') }">Characters</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/npcs`)" :class="{ active: route.path.includes('/npcs') }">NPCs</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/rules`)" :class="{ active: route.path.includes('/rules') }">Rules</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/members`)" :class="{ active: route.path.includes('/members') }">Members</button>
  </nav>

  <div class="campaignPage" v-sound>
    <div class="header">
      <h2>Campaign Characters</h2>
      <p>Manage your adventurers here! Characters shown belong to campaign members.</p>
    </div>

    <!-- Have a button here for selecting a character to join the campaign from each member -->
     <button @click="alert('Feature coming soon!')">Select Character to Join Campaign</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const campaignId = route.params.campaignId

const loading = ref(false)
const error = ref(null)
const characters = ref([])

// Utility to decode hex-encoded strings if needed 
// (some images may be stored that way in the database)
function decodeHexIfNeeded(val) {
  if (typeof val !== 'string') return val
  const m = val.match(/^\\x([0-9a-fA-F]+)$/)
  const hexToUtf8 = (hex) => {
    try {
      const bytes = hex.match(/.{1,2}/g).map(b => parseInt(b, 16))
      const u8 = new Uint8Array(bytes)
      return new TextDecoder().decode(u8)
    } catch (e) {
      return val
    }
  }
  if (m && m[1]) return hexToUtf8(m[1])
  if (/^[0-9a-fA-F]+$/.test(val) && val.length % 2 === 0) {
    try { const dec = hexToUtf8(val); if (/^https?:\/\//i.test(dec)) return dec } catch (e) {}
  }
  return val
}

//Here will be a function to select characters for the campaign from each member
//after a character is selected it will be added to the campaign's character list as well as
//having the campaign id associated with the character added. Also after it being added
//it won't show up as a selectable character anymore cause it is now part of the campaign
//so this could be related to a popup or modal that shows available characters to select from if wanted
async function fetchCharactersForCampaign(campaignId) {
}

//This function will load characters associated with the campaign that have the id provided with them
async function loadCharactersForCampaign() {
 //TODO: work on this to load characters associated with the campaign but after a person chooses a character
 //the character they want to be there 
}

onMounted(() => {
  loadCharactersForCampaign()
})

function openDisplayFor(character) {
  // reuse same display handling as CharPage — simple alert for now
  alert(`Character: ${character.name}\nBy: ${character.createdBy || 'Unknown'}`)
}
</script>