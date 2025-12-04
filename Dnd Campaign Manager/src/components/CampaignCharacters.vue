<!-- This will be the page for displaying campaign characters and allowing users to manage them and
 edit them also edit their levels as well -->

<template>
  <nav class="navBar" v-sound>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}`)" :class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/recaps`)" :class="{ active: route.path.includes('/recaps') }">Recaps</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/maps`)" :class="{ active: route.path.includes('/maps') }">Map</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/characters`)" :class="{ active: route.path.includes('/characters') }">Characters</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/rules`)" :class="{ active: route.path.includes('/rules') }">Rules</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/members`)" :class="{ active: route.path.includes('/members') }">Members</button>
  </nav>

  <div class="campaignPage" v-sound>
    <div class="header">
      <h2>Campaign Characters</h2>
      <p>Manage your adventurers here! Characters shown belong to campaign members.</p>
    </div>

    <div class = "table-container">
      <div class="table">
        <div class="table-header">
          <div>Image</div>
          <div>Level</div>
          <div>Name</div>
          <div>Player</div>
          <div><img class="imgScroll" src="../assets/images/Scroll4-WarmWhite.png" />
          <img class="imgScroll" src="../assets/images/Scroll3-WarmWhite.png" />
        <img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></div>
        </div>
          <div v-for="c in characters" :key="c.userID" class="table-row">
            <div>{{ c.image }}</div>
            <div>{{ c.level }}</div>
            <div>{{ c.name }}</div>
            <div>{{ c.user }}</div>
            <div>
                <!---Scroll to show character backstory -->
                <div class="tooltip-container">
                  <button class="tableButton" @click="openBackstoryModal()"><img class="imgScroll" src="../assets/images/Scroll1-WarmWhite.png" /></button>
                  <span class="tooltip-text">Edit Permissions</span>
                </div>
                <!--Gravestone to remove player -->
                <div class="tooltip-container">
                  <button  class="tableButton" @click="openRemoveModal()"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button>
                  <span class="tooltip-text">Remove player</span>
                </div>
            </div>
          </div>
        </div>
    </div>
  </div>
    <!-- Have a button here for selecting a character to join the campaign from each member -->
    <div class = "addButton">
      <button class="parchmentButton" @click="alert('Feature coming soon!')">Add Character</button>
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

<style scoped>

.addButton{
  display:flex;
  justify-content:left;
  padding-left: 60px;
}

.table-container {
  margin-top:10vh;
  margin-bottom:10vh;
  width: 100%;
  max-width: 900px;
  min-height:300px;
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  background: transparent;
  border-collapse: collapse;
  border-radius: 12px;  
  box-shadow: 0 0 30px var(--vt-c-navy);
  padding: 20px;
  background: rgba(0,0,0,0.25); /* ultra transparent */
  backdrop-filter: blur(3px);
  overflow-x: auto;
}

.table{
  width: 100%;
  min-width: 475px;
  justify-content: center;
  align-items:center;
  box-sizing: border-box;
  color: var(--vt-c-warm-white);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  width: 100%;
  min-height: 60px;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  border-bottom: 1px solid var(--vt-c-warm-white);
}

.table-header > div,
.table-row > div {
  text-align: left;
  white-space: nowrap;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.table-row > div:nth-child(5) {
  overflow: visible !important;
  position: relative; /* important for stacking context */
  z-index: 100;
}

.table-header {
  font-weight: bold;
  font-size: 22px;
}

.tableButton {
  background:transparent;
  border:none;
  cursor:pointer;
}

.imgScroll {
  width: 40px;
  height: 40px;
  margin: 0px;
  margin-right: 4px;
  margin-bottom: 3px;
}

.imgRemove {
  width: 40px;
  height: 40px;
  margin: 0px;
  margin-top:5px;
}

::v-deep(.modal){
  display:flex;
}

.inlineButtons {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}
</style>