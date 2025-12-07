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
      <h1>Campaign Characters</h1>
      <p>Manage your adventurers here! Characters shown belong to campaign members.</p>
    </div>

    <!-- Error message display -->
    <div v-if="error" class="error-banner">
      <p>{{ error }}</p>
      <button @click="error = null" class="close-btn">×</button>
    </div>

    <div class = "table-container">
      <div class="table">
        <div class="table-header">
          <div>Image</div>
          <div><button class="tableButton" @click="openLevelModal"><img :src="levelImages[currentLevel]" class="imgScroll"></button></div>
          <div>Name</div>
          <div>Player</div>
          <div><button class="tableButton" @click="openBackstoryModal"> <img class="imgScroll" src="../assets/images/Scroll4-WarmWhite.png" /></button>
          <button class="tableButton" @click="openRemoveModal"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button></div>
        </div>
          <div v-for="c in characters" :key="c.id" class="table-row">
            <div><img v-if="c.image" :src="c.image" alt="Character" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></div>
            <div>{{ c.level }}</div>
            <div>{{ c.name }}</div>
            <div>{{ c.user }}</div>
            <div>
                <!---Scroll to show character backstory -->
                <div class="tooltip-container">
                  <button class="tableButton" @click="openBackstoryModal(c)"><img class="imgScroll" src="../assets/images/Scroll1-WarmWhite.png" /></button>
                  <span class="tooltip-text">Backstory</span>
                </div>
                <!--Gravestone to remove player -->
                <div class="tooltip-container">
                  <button  class="tableButton" @click="openRemoveModal(c)"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button>
                  <span class="tooltip-text">Remove Character</span>
                </div>
            </div>
          </div>
        </div>
    </div>
  </div>
    <!-- Have a button here for selecting a character to join the campaign from each member -->
    <div class = "addButton">
      <button class="parchmentButton" @click="handleAddCharacterClick">Add Character</button>
    </div>

    <!-- Popup for character level editing-->
     <div v-if = "showLevelModal" id="editLevel" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <h3>Edit {{ currentCharacter?.name ? `${currentCharacter.name}'s` : 'Character' }} Level</h3>

          <div class="levelCycle">
            <button class="arrow" @click="prevLevel">◀</button>

            <img :src="levelImages[currentLevel]" class="level-image">

            <button class="arrow" @click="nextLevel">▶</button>
          </div>

          <p>Level: {{ currentLevel + 1 }}</p>
          <button class = "popupButton" type="button" @click="submitEditLevel">Submit</button>
          <button class = "popupButton" type="button" @click="showLevelModal = false">Cancel</button>
          
        </div>
      </div>
     </div>

      <!-- Popup for character backstory display-->
      <div v-if="showBackstoryModal" id="displayBackstory" class="modal">
        <div class="popup">
          <div class="popuptxt">
            <h3>{{ currentCharacter?.name ? `The Tales Of: ${currentCharacter.name}` : 'Character Backstory' }}</h3>
            <textarea v-model="currentCharacter.backstory" placeholder="Enter Backstory" name="cbackstory" readonly></textarea>

            <!-- Buttons to edit and to cancel-->
            <button class = "popupButton" type="button" @click="showBackstoryModal = false">Cancel</button>
            <button class = "popupButton" type="button" @click="openEditFromDisplay">Edit</button>
          </div>
        </div>
      </div>      <!-- Popup for character backstory editing-->
      <div v-if="showEditBackstoryModal" id="editBackstory" class="modal">
        <div class="popup">
          <div class="popuptxt">
            <h3>{{ currentCharacter?.name ? `Edit: ${currentCharacter.name}` : 'Character Backstory' }}</h3>
            <textarea v-model="currentCharacter.backstory" placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <!-- Buttons to submit and to cancel -->
            <button class = "popupButton" type="button" @click="submitEditBackstory">Submit</button>
            <button class = "popupButton" type="button" @click="showEditBackstoryModal = false">Cancel</button>
          </div>
        </div>
      </div>

     <!-- Popup for character removal-->
     <div v-if = "showRemoveModal" id="removeChar" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <h3>Are you sure you would like to remove {{ currentCharacter?.name || 'this character' }}?</h3>

          <button class = "popupButton" type="button" @click="removeCharacterFromCampaign(currentCharacter.characterId)">Yes</button>
          <button class = "popupButton" type="button" @click="showRemoveModal = false">No</button>
        </div>
      </div>
     </div>

     <!-- Popup for adding a new character to the campaign -->
     <div v-if = "showAddCharacterModal" id="addChar" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <h3>Who shall rise up to answer the call?</h3>
          <p>Select a character to add to the campaign</p>

          <!-- Dropdown to select from user's characters -->
          <div v-if="availableCharactersForSelection.length > 0" class="character-selection">
            <label for="characterSelect"><p>Choose a Character:</p></label>
            <select id="characterSelect" v-model="selectedCharacterId" class="character-dropdown">
              <option value="null" disabled selected>-- Select a character --</option>
              <option v-for="char in availableCharactersForSelection" :key="char.characterId" :value="char.characterId">
                {{ char.name }} (Level {{ char.level || 0 }})
              </option>
            </select>
          </div>

          <!-- Empty state when user has no characters -->
          <div v-else class="empty-state">
            <p>You have no characters to add. Create a character first!</p>
          </div>

          <!-- Action buttons -->
          <button class="popupButton" type="button" @click="addCharacterToCampaign(selectedCharacterId)" :disabled="!selectedCharacterId || selectedCharacterId === 'null'">Submit</button>
          <button class="popupButton" type="button" @click="showAddCharacterModal = false">Cancel</button>
          
        </div>
      </div>
     </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../lib/api.js'

// Grab all seal files from the folder
const sealFiles = import.meta.glob('@/assets/images/waxSeals/*.png', { eager: true });

// Sort keys alphabetically (or numerically if your filenames are consistent)
const levelImages = Object.keys(sealFiles)
  .sort((a, b) => {
    const getNum = (str) => parseInt(str.match(/\d+/)[0], 10);
    return getNum(a) - getNum(b);
  })
  .map((key) => sealFiles[key].default);


const route = useRoute()
const router = useRouter()
const campaignId = route.params.campaignId

// Reactive state for component
const loading = ref(false) // Loading indicator for API calls
const error = ref(null) // Error messages from failed API calls
const characters = ref([]) // Array of characters in this campaign
const selectedCharacterId = ref(null) // Currently selected character in the add modal dropdown
const availableCharactersForSelection = ref([]) // Characters the user can add (their own characters)
const currentCharacter = ref(null) // Character currently being viewed in modals (backstory, level, remove)

const currentLevel = ref(0);

function nextLevel() {
  currentLevel.value = (currentLevel.value + 1) % levelImages.length;
}

function prevLevel() {
  currentLevel.value =
    (currentLevel.value - 1 + levelImages.length) % levelImages.length;
}

function submitEditLevel() {
  const selectedLevel = currentLevel.value + 1;

  console.log("Submitting level:", selectedLevel);

  // Example: update backend later
  // await updateCharacterLevel(characterId, selectedLevel);

  showLevelModal.value = false;
}


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

/**
 * CHOOSECAMPAIGNCHARACTERS: Fetch and display user's characters for selection
 * 
 * Called when user clicks "Add Character" button. Fetches all characters created
 * by this user and displays them in a dropdown modal for selection. Once a character
 * is selected, addCharacterToCampaign() links it to this campaign via charCampLink.
 * 
 * Backend Process:
 * 1. Fetch user's characters: GET /character/by-creator/:username
 * 2. Decode any hex-encoded images
 * 3. Store in availableCharactersForSelection for dropdown display
 * 4. Open modal for user selection
 */
async function chooseCampaignCharacters() {
  try {
    loading.value = true
    error.value = null

    // Get the current user's username from localStorage (set during login)
    const username = localStorage.getItem('username')
    
    if (!username) {
      throw new Error('You must be logged in to add characters')
    }

    // Fetch all characters created by this user from the backend
    // Endpoint: GET /character/by-creator/:username
    // Returns: { valid: true, characters: [...] }
    const response = await apiFetch(`/character/by-creator/${username}`)
    
    if (!response.ok) {
      throw new Error(`Failed to load your characters: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.valid) {
      throw new Error(result.message || 'Failed to load your characters')
    }

    // Transform character data into a format for display in the modal dropdown
    // Map the backend response to include decoded images and consistent property names
    const availableCharacters = (result.characters || []).map(char => ({
      characterId: char.id,
      name: char.name,
      image: decodeHexIfNeeded(char.image),
      backstory: char.backstory,
      level: char.Level,
      createdBy: char.createdBy
    }))

    // Store the characters in a reactive variable so the modal dropdown can display them
    // This data will be used to populate the <select> dropdown in the modal
    availableCharactersForSelection.value = availableCharacters
    // Open the add character modal to show the dropdown
    showAddCharacterModal.value = true
    
  } catch (err) {
    console.error('Error loading user characters:', err)
    error.value = err.message || 'Failed to load your characters'
  } finally {
    loading.value = false
  }
}

//LOADCAMPAIGNCHARACTER: Fetch and display all characters linked to this campaign
// 
// Called on component mount and after any character modifications (add/remove/update level).
// Queries charCampLink table to get all characters in this campaign, then joins with
// character and Users tables to get complete character info.
// 
// For each character in the campaign, displays:
//   - Image (from character table, decoded if hex-encoded)
//   - Level (from charCampLink.level, campaign-specific)
//   - Name (from character table)
//   - Player username (from Users table via charCampLink.userId)
//   - Backstory button (shows charCampLink.addBackstory for campaign edits)
//   - Remove button (deletes from charCampLink only, not the character itself)
//
// Backstory Priority: Uses charCampLink.addBackstory if set (campaign-specific),
// otherwise falls back to original character.backstory
async function loadCampaignCharacter() {
  try {
    loading.value = true
    error.value = null

    // Fetch all characters linked to this campaign from charCampLink table
    // Endpoint: GET /data/campaign/:campaignId/characters
    // Returns: { valid: true, characters: [...] } where each character includes
    // joined user data (username) and character data (name, image, backstory, etc)
    const response = await apiFetch(`/data/campaign/${campaignId}/characters`)
    
    if (!response.ok) {
      throw new Error(`Failed to load campaign characters: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.valid) {
      throw new Error(result.message || 'Failed to load campaign characters')
    }

    // Map charCampLink data with character details for display
    // Backend provides charCampLink joined with character and Users:
    //   - id, characterId, userId, level, addBackstory (campaign-specific backstory)
    //   - characterName, image, characterBackstory, createdBy, username
    // 
    // We prioritize addBackstory (from charCampLink) over original backstory
    // so each campaign can have its own unique backstory for the same character
    characters.value = (result.characters || []).map(link => {
      return {
        id: link.id, // charCampLink table id - use for v-for key
        characterId: link.characterId,
        userId: link.userId,
        name: link.characterName, // Match template expectation of c.name
        image: decodeHexIfNeeded(link.image),
        level: link.level,
        user: link.username, // Match template expectation of c.user
        backstory: link.addBackstory || link.characterBackstory,
        createdBy: link.createdBy
      }
    })

  } catch (err) {
    console.error('Error loading campaign characters:', err)
    error.value = err.message || 'Failed to load characters'
    characters.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCampaignCharacter()
})

// HANDLEADDCHARACTERCLICK: Button click handler for "Add Character" button
// This intermediate function fetches the user's characters and opens the modal
async function handleAddCharacterClick() {
  await chooseCampaignCharacters()
}

// ADDCHARACTERTOCAMPAIGN: Link a character to this campaign
// 
// Creates a new entry in the charCampLink table, establishing the relationship
// between a character and this campaign. Copies the character's original backstory
// to charCampLink.addBackstory so each campaign can have campaign-specific edits.
// 
// After successfully adding, reloads all campaign characters to display the new one.
// 
// @param {string} characterId - UUID of the character to add from availableCharactersForSelection
async function addCharacterToCampaign(characterId) {
  try {
    // Get userId and auth token from localStorage
    const userId = localStorage.getItem('userId')
    const authToken = localStorage.getItem('authToken')
    
    if (!userId || !authToken) {
      throw new Error('You must be logged in to add characters to a campaign')
    }

    // Create a link between the character and this campaign
    // Endpoint: POST /data/campaign/character/add
    // Body: { characterId, campaignId, userId }
    // The backend copies the character's backstory to charCampLink.addBackstory
    // for safe, campaign-specific editing without modifying the original character
    const response = await apiFetch('/data/campaign/character/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // Include auth token
      },
      body: JSON.stringify({
        characterId,
        campaignId,
        userId // Pass actual userId from localStorage
      })
    })

    if (!response.ok) {
      // Try to get error message from server response
      let errorMsg = 'Failed to add character to campaign'
      try {
        const errData = await response.json()
        if (errData.message) errorMsg = errData.message
      } catch (e) {
        // If response isn't JSON, use status code
        errorMsg = `Server error: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMsg)
    }

    const result = await response.json()
    await loadCampaignCharacter()
    // Close the modal and reset the character selection
    showAddCharacterModal.value = false
    selectedCharacterId.value = null
    availableCharactersForSelection.value = []
  } catch (err) {
    console.error('Error adding character:', err)
    error.value = err.message || 'Failed to add character'
  }
}

// REMOVECHARACTERFROMCAMPAIGN: Remove a character from this campaign
// 
// Deletes the entry from charCampLink table for this character in this campaign.
// NOTE: This does NOT delete the character itself or affect other campaigns.
// The character can be added to other campaigns later or modified independently.
// 
// After successfully removing, reloads all campaign characters to update display.
// 
// @param {string} characterId - UUID of the character to remove from campaign
async function removeCharacterFromCampaign(characterId) {
  try {
    // Delete the charCampLink entry for this character in this campaign
    // Endpoint: DELETE /data/campaign/:campaignId/character/:characterId
    // This only removes the campaign link, the character still exists independently
    const response = await apiFetch(`/data/campaign/${campaignId}/character/${characterId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to remove character from campaign')
    }

    // Reload the campaign characters list after removal
    await loadCampaignCharacter()
    // Close the confirmation modal
    showRemoveModal.value = false
  } catch (err) {
    console.error('Error removing character:', err)
    error.value = err.message || 'Failed to remove character'
  }
}

// UPDATECHARACTERLEVEL: Update a character's level specifically in this campaign
// 
// The level in charCampLink is campaign-specific and independent from the character's
// actual Level in the character table. This allows different levels across campaigns:
// A level 5 character in Campaign A can be level 7 in Campaign B without conflict.
// 
// After successfully updating, reloads all campaign characters to reflect change.
// 
// @param {string} characterId - UUID of the character
// @param {number} newLevel - The new campaign-specific level (1-20 typical, adjustable)
async function updateCharacterLevel(characterId, newLevel) {
  try {
    // Update the level in the charCampLink table for this character in this campaign
    // Endpoint: PUT /data/campaign/:campaignId/character/:characterId/level
    // Body: { level: newLevel }
    // This only affects the level in this campaign, other campaigns are unaffected
    const response = await apiFetch(`/data/campaign/${campaignId}/character/${characterId}/level`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: newLevel })
    })

    if (!response.ok) {
      throw new Error('Failed to update character level')
    }

    // Reload the campaign characters list to show the updated level
    await loadCampaignCharacter()
    // Close the level editing modal
    showLevelModal.value = false
  } catch (err) {
    console.error('Error updating level:', err)
    error.value = err.message || 'Failed to update character level'
  }
}

// SUBMITEDIBACKSTORY: Save campaign-specific backstory changes
// 
// Updates the addBackstory field in charCampLink table with the edited backstory.
// This allows each campaign to have its own version of a character's backstory
// without affecting the original character's backstory in the character table.
//
// After successfully updating, reloads all campaign characters to reflect change.
async function submitEditBackstory() {
  try {
    if (!currentCharacter.value || !currentCharacter.value.characterId) {
      throw new Error('No character selected')
    }

    // Update campaign-specific backstory in charCampLink table
    // Endpoint: PUT /data/campaign/:campaignId/character/:characterId/backstory
    // Body: { backstory: newBackstory }
    const response = await apiFetch(`/data/campaign/${campaignId}/character/${currentCharacter.value.characterId}/backstory`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backstory: currentCharacter.value.backstory })
    })

    if (!response.ok) {
      throw new Error('Failed to update backstory')
    }

    // Close the edit modal and reload characters to show updated data
    showEditBackstoryModal.value = false
    await loadCampaignCharacter()
  } catch (err) {
    console.error('Error updating backstory:', err)
    error.value = err.message || 'Failed to update backstory'
  }
}

// Functions needed for opening modals at a basic level
function openBackstoryModal(character) {
  currentCharacter.value = character
  showBackstoryModal.value = true
}
function openRemoveModal(character) {
  currentCharacter.value = character
  showRemoveModal.value = true
}
function openLevelModal(character) {
  currentCharacter.value = character
  showLevelModal.value = true
}
function openEditFromDisplay() {
  showBackstoryModal.value = false
  showEditBackstoryModal.value = true
}
function openAddCharacterModal() {
  showAddCharacterModal.value = true
}

// Modal visibility states
const showLevelModal = ref(false) // Show/hide level editing modal
const showBackstoryModal = ref(false) // Show/hide backstory display modal
const showEditBackstoryModal = ref(false) // Show/hide backstory editing modal
const showRemoveModal = ref(false) // Show/hide character removal confirmation modal
const showAddCharacterModal = ref(false) // Show/hide add character selection modal



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
  width: 38px;
  height: 38px;
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

.inlineButtons {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}

textarea {
  width: 100%;
  height: 100px;
  margin-top:10px;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  resize: vertical;
  background-color: transparent;
  border: transparent;
}

textarea::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

.level-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.level-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.arrow {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--vt-c-warm-white);
  cursor: pointer;
  width: 40px;
}



/* Character selection dropdown styles */
.character-selection {
  margin: 15px 0;
}

.character-selection label {
  display: block;
  margin-bottom: 8px;
  color: var(--vt-c-warm-white);
  font-weight: bold;
}

.character-dropdown {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--vt-c-warm-white);
  border-radius: 4px;
  color: var(--vt-c-warm-white);
  font-family: "Cinzel", serif;
  cursor: pointer;
}

.character-dropdown:hover,
.character-dropdown:focus {
  background-color: rgba(255, 255, 255, 0.15);
  outline: none;
  border-color: var(--vt-c-gold);
}

.character-dropdown option {
  background-color: var(--vt-c-navy);
  color: var(--vt-c-warm-white);
}

.character-dropdown:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 15px;
  text-align: center;
  color: var(--vt-c-warm-white);
  opacity: 0.7;
}

/* Error banner styles */
.error-banner {
  margin: 20px;
  padding: 15px 20px;
  background-color: rgba(200, 50, 50, 0.3);
  border: 2px solid #c83232;
  border-radius: 8px;
  color: #ff6b6b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.error-banner p {
  margin: 0;
}

.error-banner .close-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin-left: 20px;
}
</style>
