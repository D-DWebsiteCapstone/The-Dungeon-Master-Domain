<!-- This will be the page for displaying campaign characters and allowing users to manage them and
 edit them also edit their levels as well -->

<template>
<div class="layout">
  <CampaignMenu :campaignId="campaignId" />

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
          <!-- <div>Level</div> -->
          <div>Name</div>
          <div>Player</div>
          <div>Options</div>
        </div>
          <div v-for="c in characters" :key="c.id" class="table-row">
            <div><img v-if="c.image" :src="c.image" alt="Character" class="charimg"></div>
            <!-- <div>
              <button class="tableButton level-button" @click="openLevelModal(c)" :title="`Click to edit level (Current: ${c.level})`">
                <img :src="levelImages[(c.level || 1) - 1]" class="imgScroll" >
              </button>
            </div> -->
            <div>{{ c.name }}</div>
            <div>{{ c.user }}</div>
            <div>
                <!---Scroll to show character backstory -->
                <div class="tooltip-container">
                  <button class="tableButton" @click="openBackstoryModal(c)"><img class="imgScroll" src="../assets/images/icons/Scroll-WarmWhite.png" /></button>
                  <span class="tooltip-text">Character</span>
                </div>
                <!--Gravestone to remove player -->
                <div class="tooltip-container">
                  <button v-if="canRemoveCharacter(c)" class="tableButton" @click="openRemoveModal(c)"><img class ="imgRemove" src="../assets/images/icons/Grave-WarmWhite.png" /></button>
                  <span v-if="canRemoveCharacter(c)" class="tooltip-text">Remove Character</span>
                </div>
            </div>
          </div>
        </div>
    </div>
  
  
    <!-- Have a button here for selecting a character to join the campaign from each member -->
    <div class = "addButton">
      <button class="parchmentButton" @click="handleAddCharacterClick" :disabled="userHasCharacterInCampaign" :title="userHasCharacterInCampaign ? 'You already have an adventurer for this campaign' : 'Add a character to the campaign'">
        Add Character
      </button>
      <p v-if="userHasCharacterInCampaign" class="add-button-error">You already have an adventurer for this campaign</p>
    </div>

    <!-- Popup for character level editing
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
     </div>-->

      <!-- Popup for character display-->
      <div v-if="showBackstoryModal" id="displayBackstory" class="modal">
        <div class="scroll">
          <div class="txt">
            <div class="intro">
              <p>{{ currentCharacter?.name ? `${currentCharacter.name} - Campaign Copy` : 'Character Card Copy' }}</p>
            </div>

            <div class="fieldGrid">

              <div class="group1">
                <h2>{{ withDefault(currentCharacter?.name, 'Unnamed Hero') }}</h2>
              </div>

              <div class="group2">

                <div class="baseInfo">
                  <div class="heartIcon">
                    <label for="cmaxhealth">HP</label>
                    <img src="../assets/images/icons/charHeart.png" alt="Heart Icon" style="width: 55px; height: 55px">
                    <p>{{ withNumberDefault(currentCharacter?.maxHealth, 0) }}</p>
                  </div>

                  <div class="shieldIcon">
                    <label for="carmorclass">AC</label>
                    <img src="../assets/images/icons/charShield.png" alt="Shield Icon" style="width: 55px; height: 55px">
                    <p>{{ withNumberDefault(currentCharacter?.armorClass, 0) }}</p>
                  </div>

                  <div class="levelIcon">
                    <label for="clevel">LVL</label>
                    <img class="popupLevelSealImage" :src="getSealForLevel(withDefault(currentCharacter?.level, 1))" :alt="`Level ${getClampedLevel(withDefault(currentCharacter?.level, 1))} wax seal`" />
                  </div>
                </div>

                <div class="classInfo">
                  <p>{{ normalizeString(currentCharacter?.class, 'N/A') }}</p>
                  <p>{{ normalizeString(currentCharacter?.subClass, 'N/A') }}</p>
                </div>

                <div class="charPhoto">
                  <div class="photo-preview" style="cursor:default;">
                    <img v-if="currentCharacter?.image" class="photoPreviewImg" :src="currentCharacter.image" alt="Photo Preview" style="display:block;" />
                    <span v-else class="photoPreviewText">No Photo Selected</span>
                  </div>
                </div>
              </div>

              <div class="group3">
                <div class="backgroundInfo">
                  <p>{{ normalizeString(currentCharacter?.background, 'N/A') }}</p>
                  <p>{{ normalizeString(currentCharacter?.race, 'N/A') }}</p>
                  <p>{{ normalizeString(currentCharacter?.alignment, 'N/A') }}</p>
                </div>

                <div class="statsInfo">
                  <div class="strIcon">
                    <label for="cstr">STR</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.str, 0) }}</p>
                  </div>

                  <div class="dexIcon">
                    <label for="cdex">DEX</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.dex, 0) }}</p>
                  </div>

                  <div class="conIcon">
                    <label for="ccon">CON</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.con, 0) }}</p>
                  </div>

                  <div class="intIcon">
                    <label for="cint">INT</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.int, 0) }}</p>
                  </div>

                  <div class="wisIcon">
                    <label for="cwis">WIS</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.wis, 0) }}</p>
                  </div>

                  <div class="chaIcon">
                    <label for="ccha">CHA</label>
                    <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                    <p>{{ withNumberDefault(currentCharacter?.cha, 0) }}</p>
                  </div>
                </div>

                <div class="backstoryInfo">
                  <div class="divider">
                    <img src="../assets/images/dividers/divider-left-short.png" />
                    <label class="dividertxt" for="cbackstory">Backstory</label>
                    <img src="../assets/images/dividers/divider-right-short.png" />
                  </div>

                  <p v-if="!isEditingCampaignCopy" class="displayBackstory">{{ normalizeString(currentCharacter?.backstory, 'No backstory provided.') }}</p>
                  <textarea
                    v-else
                    v-model="currentCharacter.backstory"
                    placeholder="Enter campaign-specific backstory"
                    name="cbackstory"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <button class="popupButton" type="button" @click="showBackstoryModal = false">Close</button>
            <button v-if="canEditCharacter(currentCharacter)" class="popupButton" type="button" @click="openEditFromDisplay">Edit Character</button>
            <button v-if="isEditingCampaignCopy" class="popupButton" type="button" @click="submitEditBackstory">Save Campaign Copy</button>
            <button v-if="isEditingCampaignCopy" class="popupButton" type="button" @click="cancelEditCampaignCopy">Cancel Edit</button>
          </div>
        </div>
      </div>      

     <div v-if="showEditCharacterModal" id="editChar" class="modal">
      <div class="scroll">
        <div class="txt">
          <div class="intro">
            <p>Refine your hero before the journey</p>
          </div>

          <div class="fieldGrid">
            <div class="group1">
              <input v-model="editCharacterForm.name" type="text" placeholder="Enter Character Name" name="cname" required>
            </div>

            <div class="group2">
              <div class="baseInfo">
                <div class="heartIcon">
                  <label for="cmaxhealth">HP</label>
                  <img src="../assets/images/icons/charHeart.png" alt="Heart Icon" style="width: 55px; height: 55px">
                  <input v-model="editCharacterForm.maxHealth" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="3" placeholder="0" name="cmaxhealth">
                </div>

                <div class="shieldIcon">
                  <label for="carmorclass">AC</label>
                  <img src="../assets/images/icons/charShield.png" alt="Shield Icon" style="width: 55px; height: 55px">
                  <input v-model="editCharacterForm.armorClass" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="3" placeholder="0" name="carmorclass">
                </div>

                <div class="levelIcon">
                  <label for="clevel">LVL</label>
                  <button class="popupLevelSealButton" type="button" @click="cycleEditLevel" :title="`Level ${editLevel} - click to cycle`" aria-label="Change level">
                    <img class="popupLevelSealImage" :src="getSealForLevel(editLevel)" :alt="`Level ${editLevel} wax seal`" />
                  </button>
                </div>
              </div>

              <div class="classInfo">
                <div class="tooltip-container">
                  <input v-model="editCharacterForm.class" type="text" placeholder="Enter Class" name="cclass">
                  <span class="tooltip-text">Class</span>
                </div>

                <div class="tooltip-container">
                  <input v-model="editCharacterForm.subClass" type="text" placeholder="Enter SubClass" name="csubclass">
                  <span class="tooltip-text">SubClass</span>
                </div>
              </div>

              <div class="charPhoto">
                <input
                    id="file-upload-campaign-edit"
                    type="file"
                    name="cphoto"
                    accept="image/*"
                    @change="previewEditImage"
                    style="display:none"
                >

                <label for="file-upload-campaign-edit" class="photo-preview">
                  <img v-if="editImagePreview" class="photoPreviewImg" :src="editImagePreview" alt="Photo Preview" style="display:block;" />
                  <span v-else class="photoPreviewText">No Photo Selected</span>
                </label>
              </div>
            </div>

            <div class="group3">
              <div class="backgroundInfo">
                <div class="tooltip-container">
                  <input v-model="editCharacterForm.background" type="text" placeholder="Enter Background" name="cbackground">
                  <span class="tooltip-text">Background</span>
                </div>

                <div class="tooltip-container">
                  <input v-model="editCharacterForm.race" type="text" placeholder="Enter Race" name="crace">
                  <span class="tooltip-text">Race</span>
                </div>

                <div class="tooltip-container">
                  <input v-model="editCharacterForm.alignment" type="text" placeholder="Enter Alignment" name="calignment">
                  <span class="tooltip-text">Alignment</span>
                </div>
              </div>

              <div class="statsInfo">
                <div class="strIcon">
                  <label for="cstr">STR</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.str" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="cstr">
                </div>

                <div class="dexIcon">
                  <label for="cdex">DEX</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.dex" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="cdex">
                </div>

                <div class="conIcon">
                  <label for="ccon">CON</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.con" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="ccon">
                </div>

                <div class="intIcon">
                  <label for="cint">INT</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.int" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="cint">
                </div>

                <div class="wisIcon">
                  <label for="cwis">WIS</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.wis" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="cwis">
                </div>

                <div class="chaIcon">
                  <label for="ccha">CHA</label>
                  <img src="../assets/images/borders/statsBorder.png" alt="Stats Border Icon">
                  <input v-model="editCharacterForm.cha" oninput="this.value=this.value.slice(0,this.maxLength)" type="number" maxlength="2" placeholder="0" name="ccha">
                </div>
              </div>

              <div class="backstoryInfo">
                <div class="divider">
                  <img src="../assets/images/dividers/divider-left-short.png" />
                  <label class="dividertxt" for="cbackstory">Backstory</label>
                  <img src="../assets/images/dividers/divider-right-short.png" />
                </div>
                <textarea v-model="editCharacterForm.backstory" placeholder="Enter Backstory" name="cbackstory" required></textarea>
              </div>
            </div>
          </div>

          <button class="popupButton" type="button" @click="submitEditCharacter" :disabled="editingCharacter">{{ editingCharacter ? 'Saving...' : 'Confirm' }}</button>
          <div v-if="editCharacterError" class="field-error">{{ editCharacterError }}</div>
          <button class="popupButton" type="button" @click="closeEditCharacterModal">Cancel</button>
        </div>
      </div>
     </div>

     <!-- Popup for character removal-->
     <div v-if = "showRemoveModal" id="removeChar" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <br><br><br><br>
          <h3>Are you sure you would like to remove {{ currentCharacter?.name || 'this character' }}?</h3>

          <div class=options><button class = "popupButton" type="button" @click="removeCharacterFromCampaign(currentCharacter.characterId)">Yes</button>
          <button class = "popupButton" type="button" @click="showRemoveModal = false">No</button></div>
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
    </div>
  </div> 
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../lib/api.js'
import { jwtDecode } from 'jwt-decode'

import CampaignMenu from './CampaignMenus.vue'

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
const canRemoveCampaignCharacters = ref(false) // DM/Co DM can remove characters from campaign
const isSiteAdmin = ref(false) // Global Admin can remove characters from any campaign
const isEditingCampaignCopy = ref(false)
const originalCampaignBackstory = ref('')
const showEditCharacterModal = ref(false)
const editingCharacter = ref(false)
const editCharacterError = ref(null)
const editCharacterFile = ref(null)
const editImagePreview = ref('')
const editLevel = ref(1)
const maxImageSizeBytes = 2 * 1024 * 1024
const editCharacterForm = ref({
  name: '',
  backstory: '',
  class: '',
  subClass: '',
  background: '',
  race: '',
  alignment: '',
  maxHealth: '',
  armorClass: '',
  str: '',
  dex: '',
  con: '',
  int: '',
  wis: '',
  cha: ''
})

const currentLevel = ref(0);

// Check if the current user already has a character in this campaign
const userHasCharacterInCampaign = ref(false)

// Functions for level editing modal
// Cycle through level images for selection (levels 1-20)
function nextLevel() {
  currentLevel.value = (currentLevel.value + 1) % levelImages.length;
}

// Cycle backwards through level images
function prevLevel() {
  currentLevel.value =
    (currentLevel.value - 1 + levelImages.length) % levelImages.length;
}

// Submit the selected level to updateCharacterLevel function
function submitEditLevel() {
  const selectedLevel = currentLevel.value + 1;

  if (!currentCharacter.value || !currentCharacter.value.characterId) {
    error.value = 'No character selected'
    return
  }

  // Call updateCharacterLevel with the selected level
  updateCharacterLevel(currentCharacter.value.characterId, selectedLevel)
  
  showLevelModal.value = false
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

function normalizeString(value, fallback) {
  const trimmed = (typeof value === 'string') ? value.trim() : ''
  return trimmed || fallback
}

function withDefault(value, fallback) {
  return value ?? fallback
}

function withNumberDefault(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  return value
}

function getClampedLevel(rawLevel) {
  const parsed = Number.parseInt(rawLevel, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  if (parsed > levelImages.length) return levelImages.length
  return parsed
}

function getSealForLevel(level) {
  const normalized = getClampedLevel(level)
  return levelImages[normalized - 1]
}

function currentUserIdValue() {
  return localStorage.getItem('userId') || localStorage.getItem('userid') || ''
}

function canEditCharacter(character) {
  if (!character) return false
  const currentUserId = currentUserIdValue()
  const isOwner = !!currentUserId && character.userId === currentUserId
  return isOwner || canRemoveCampaignCharacters.value || isSiteAdmin.value
}

function canRemoveCharacter(character) {
  if (!character) return false
  const currentUserId = currentUserIdValue()
  const isOwner = !!currentUserId && character.userId === currentUserId
  return isOwner || canRemoveCampaignCharacters.value || isSiteAdmin.value
}

function cycleEditLevel() {
  editLevel.value = editLevel.value >= levelImages.length ? 1 : editLevel.value + 1
}

function resetEditCharacterState() {
  editCharacterError.value = null
  editingCharacter.value = false
  editCharacterFile.value = null
  editImagePreview.value = ''
  editLevel.value = 1
  editCharacterForm.value = {
    name: '',
    backstory: '',
    class: '',
    subClass: '',
    background: '',
    race: '',
    alignment: '',
    maxHealth: '',
    armorClass: '',
    str: '',
    dex: '',
    con: '',
    int: '',
    wis: '',
    cha: ''
  }
}

function openEditCharacterModal(character) {
  if (!character) return
  if (!canEditCharacter(character)) {
    error.value = 'You do not have permission to edit this character'
    return
  }

  currentCharacter.value = { ...character }
  editCharacterError.value = null
  editCharacterFile.value = null
  editLevel.value = getClampedLevel(character.level)
  editImagePreview.value = character.image || ''
  editCharacterForm.value = {
    name: normalizeString(character.name, 'Unnamed Hero'),
    backstory: normalizeString(character.backstory, 'No backstory provided.'),
    class: normalizeString(character.class, 'N/A'),
    subClass: normalizeString(character.subClass, 'N/A'),
    background: normalizeString(character.background, 'N/A'),
    race: normalizeString(character.race, 'N/A'),
    alignment: normalizeString(character.alignment, 'N/A'),
    maxHealth: withNumberDefault(character.maxHealth, 0),
    armorClass: withNumberDefault(character.armorClass, 0),
    str: withNumberDefault(character.str, 0),
    dex: withNumberDefault(character.dex, 0),
    con: withNumberDefault(character.con, 0),
    int: withNumberDefault(character.int, 0),
    wis: withNumberDefault(character.wis, 0),
    cha: withNumberDefault(character.cha, 0)
  }

  showBackstoryModal.value = false
  showEditCharacterModal.value = true
}

function openEditFromDisplay() {
  if (!currentCharacter.value) return
  openEditCharacterModal(currentCharacter.value)
}

function closeEditCharacterModal() {
  showEditCharacterModal.value = false
  resetEditCharacterState()
}

function previewEditImage(event) {
  const input = event.target
  const file = input.files && input.files[0]
  editCharacterError.value = null

  if (!file) {
    editCharacterFile.value = null
    editImagePreview.value = currentCharacter.value?.image || ''
    return
  }

  if (file.size > maxImageSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    const msg = `Selected image is too large (${sizeMb} MB). Maximum is ${(maxImageSizeBytes / (1024 * 1024))} MB.`
    editCharacterError.value = msg
    editCharacterFile.value = null
    try { input.setCustomValidity(msg); input.reportValidity() } catch (e) {}
    return
  }

  try { input.setCustomValidity('') } catch (e) {}
  editCharacterFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    editImagePreview.value = e.target?.result || ''
  }
  reader.readAsDataURL(file)
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function submitEditCharacter() {
  try {
    if (!currentCharacter.value?.characterId) {
      throw new Error('No character selected to edit')
    }
    if (!canEditCharacter(currentCharacter.value)) {
      throw new Error('You do not have permission to edit this character')
    }

    editingCharacter.value = true
    editCharacterError.value = null

    let imageData = null
    if (editCharacterFile.value) {
      imageData = await fileToDataUrl(editCharacterFile.value)
    }

    const payload = {
      name: normalizeString(editCharacterForm.value.name, 'Unnamed Hero'),
      backstory: normalizeString(editCharacterForm.value.backstory, 'No backstory provided.'),
      level: getClampedLevel(editLevel.value),
      class_: normalizeString(editCharacterForm.value.class, 'N/A'),
      subClass: normalizeString(editCharacterForm.value.subClass, 'N/A'),
      background: normalizeString(editCharacterForm.value.background, 'N/A'),
      race: normalizeString(editCharacterForm.value.race, 'N/A'),
      alignment: normalizeString(editCharacterForm.value.alignment, 'N/A'),
      maxHealth: String(editCharacterForm.value.maxHealth ?? '').trim(),
      armorClass: String(editCharacterForm.value.armorClass ?? '').trim(),
      str: String(editCharacterForm.value.str ?? '').trim(),
      dex: String(editCharacterForm.value.dex ?? '').trim(),
      con: String(editCharacterForm.value.con ?? '').trim(),
      int: String(editCharacterForm.value.int ?? '').trim(),
      wis: String(editCharacterForm.value.wis ?? '').trim(),
      cha: String(editCharacterForm.value.cha ?? '').trim()
    }
    if (imageData !== null) payload.image = imageData

    const response = await apiFetch(`/character/${encodeURIComponent(currentCharacter.value.characterId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      let errMsg = ''
      try {
        const body = await response.json().catch(() => null)
        if (body) errMsg = body.message || body.error || JSON.stringify(body)
      } catch (e) {}
      if (!errMsg) errMsg = await response.text().catch(() => `HTTP ${response.status}`)
      throw new Error(`Server error ${response.status}: ${errMsg}`)
    }

    await loadCampaignCharacter()
    closeEditCharacterModal()
  } catch (err) {
    console.error('Error editing character:', err)
    editCharacterError.value = err.message || 'Failed to edit character'
  } finally {
    editingCharacter.value = false
  }
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
        createdBy: link.createdBy,
        class: link.class,
        subClass: link.subClass,
        background: link.background,
        race: link.race,
        alignment: link.alignment,
        maxHealth: link.maxHealth,
        armorClass: link.armorClass,
        str: link.str,
        dex: link.dex,
        con: link.con,
        int: link.int,
        wis: link.wis,
        cha: link.cha
      }
    })

    // Check if current user already has a character in this campaign
    const currentUserId = localStorage.getItem('userId')
    userHasCharacterInCampaign.value = characters.value.some(char => char.userId === currentUserId)

  } catch (err) {
    console.error('Error loading campaign characters:', err)
    error.value = err.message || 'Failed to load characters'
    characters.value = []
  } finally {
    loading.value = false
  }
}

async function loadCampaignRoleAccess() {
  try {
    const authToken = localStorage.getItem('authToken')
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken)
        isSiteAdmin.value = decoded?.role === 'Admin'
      } catch (decodeErr) {
        isSiteAdmin.value = false
      }
    } else {
      isSiteAdmin.value = false
    }

    const response = await apiFetch(`/data/campaign/${campaignId}/members`)

    if (!response.ok) {
      canRemoveCampaignCharacters.value = isSiteAdmin.value
      return
    }

    const result = await response.json()
    if (!result.valid) {
      canRemoveCampaignCharacters.value = isSiteAdmin.value
      return
    }

    const currentUserId = localStorage.getItem('userid')
    const me = (result.members || []).find(member => member.userId === currentUserId)
    const isCampaignDm = me?.role === 'DM' || me?.role === 'Co DM'
    canRemoveCampaignCharacters.value = isCampaignDm || isSiteAdmin.value
  } catch (err) {
    console.error('Error loading campaign role access:', err)
    canRemoveCampaignCharacters.value = isSiteAdmin.value
  }
}

onMounted(() => {
  loadCampaignRoleAccess()
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
    const userId = localStorage.getItem('userid')
    const authToken = localStorage.getItem('authToken')
    console.log(userId);
    console.log(authToken);
    
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
    const selectedCharacter = (currentCharacter.value && currentCharacter.value.characterId === characterId)
      ? currentCharacter.value
      : characters.value.find(c => c.characterId === characterId)

    if (!canRemoveCharacter(selectedCharacter)) {
      throw new Error('You can only remove your own character unless you are DM, Co DM, or Admin')
    }

    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      throw new Error('You must be logged in to remove characters from a campaign')
    }

    // Delete the charCampLink entry for this character in this campaign
    // Endpoint: DELETE /data/campaign/:campaignId/character/:characterId
    // This only removes the campaign link, the character still exists independently
    const response = await apiFetch(`/data/campaign/${campaignId}/character/${characterId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
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

    // Keep modal open in view mode and refresh campaign data.
    isEditingCampaignCopy.value = false
    originalCampaignBackstory.value = currentCharacter.value.backstory || ''
    await loadCampaignCharacter()
  } catch (err) {
    console.error('Error updating backstory:', err)
    error.value = err.message || 'Failed to update backstory'
  }
}

// Functions needed for opening modals at a basic level
function openBackstoryModal(character) {
  currentCharacter.value = { ...character }
  originalCampaignBackstory.value = character?.backstory || ''
  isEditingCampaignCopy.value = false
  showBackstoryModal.value = true
}
function openRemoveModal(character) {
  if (!canRemoveCharacter(character)) {
    error.value = 'You can only remove your own character unless you are DM, Co DM, or Admin'
    return
  }
  currentCharacter.value = character
  showRemoveModal.value = true
}
function openLevelModal(character) {
  currentCharacter.value = character
  // Set currentLevel to the character's level minus 1 (since levels are 1-20 but array is 0-19)
  currentLevel.value = (character.level || 1) - 1
  showLevelModal.value = true
}
function startEditCampaignCopy() {
  isEditingCampaignCopy.value = true
}
function cancelEditCampaignCopy() {
  if (currentCharacter.value) {
    currentCharacter.value.backstory = originalCampaignBackstory.value
  }
  isEditingCampaignCopy.value = false
}
function openAddCharacterModal() {
  showAddCharacterModal.value = true
}

// Modal visibility states
const showLevelModal = ref(false) // Show/hide level editing modal
const showBackstoryModal = ref(false) // Show/hide backstory display modal
const showRemoveModal = ref(false) // Show/hide character removal confirmation modal
const showAddCharacterModal = ref(false) // Show/hide add character selection modal



</script>

<style scoped>
.layout {
  display: flex;
  align-items: flex-start;
}
.campaignPage {
  flex: 1;
  min-width: 0; /* VERY important for preventing overflow issues */
}
.addButton{
  display:flex;
  justify-content:left;
  padding-left: 60px;
  align-items: center;
  max-width: calc(100% - 60px);
  gap: 15px;
}

.charimg{
  width:50px;
  height:50px;
  object-fit:cover;
}

.add-button-error {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 14px;
}

.table-container {
  margin-top:10vh;
  margin-bottom:10vh;
  width: 100%;
  max-width: 950px;
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
  box-sizing: border-box; 
  color: var(--vt-c-warm-white);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 0.75fr 1.25fr 1.25fr 1.25fr;
  width: 100%;
  min-height: 60px;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: minmax(85px, 0.75fr) repeat(2, minmax(150px, 1.25fr)) minmax(100px, 1.25fr);
  border-bottom: 1px solid var(--vt-c-warm-white);
}

.table-header > div,
.table-row > div {
  text-align: left;
  white-space: nowrap;  
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row > div:nth-child(4) {
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

.edit-text-button {
  color: var(--vt-c-warm-white);
  font-family: "Cinzel", serif;
  font-size: 0.82rem;
  padding: 2px 8px;
  border: 1px solid rgba(245, 224, 224, 0.5);
  border-radius: 6px;
  background: rgba(31, 57, 89, 0.45);
}

.edit-text-button:hover {
  background: rgba(31, 57, 89, 0.7);
}

.level-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.level-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.level-text {
  color: var(--vt-c-warm-white);
  font-weight: bold;
  font-size: 14px;
  min-width: 20px;
  text-align: center;
}

.imgScroll {
  width: 40px;
  height: 40px;
  margin: 0px;
  margin-right: 4px;
  margin-bottom: 5px;
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

.photo-preview {
  /* margin-top: 40px; */
  padding: 10px;
  margin: 15px auto;
  margin-bottom: 0;
  border: 2px dashed #f5e0e0;
  border-radius: 8px;
  text-align: center;
  /* background-color: #ab8585; */
  background-color: rgba(31, 57, 89, 0.587);
  max-width: 200px;
  height: fit-content;
  min-height: 130px;
  cursor:pointer;
  align-items: center;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(17, 26, 45, 0.5);
}

.photoPreviewImg {
  max-width: 80%;
  max-height: 150px;
  border-radius: 4px;
  display: none; /* Hide initially */
}

.photoPreviewText {
  font-size: 1rem;
  letter-spacing: 1px;
  line-height: 1.6;
  color: var(--vt-c-warm-white);
}

.scroll{
  background: transparent url('../assets/ScrollHorizontal.png') no-repeat center/contain;
  background-size: 80% 100%;
  aspect-ratio: 2/1;
  color: var(--vt-c-dark-brown);
  width:100%;
  height:100%;
  margin: 0;
  text-align: center;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index:1;

    .txt {
      align-items: center;
      max-width: 63%; /* confines it to the “paper” area */
      box-sizing: border-box;
      overflow-y: auto;
      padding-left: 0;
      padding-right: 0;
      height: 79%;
      margin: 0px auto;
      padding: 0 5px ;
      z-index: 2;
    }
  }

.intro {
  margin-top: 13px;
  margin-bottom: 0.5rem;
}

.fieldGrid {
  display: grid;
  grid-template-columns: minmax(100px, 0.75fr) minmax(250px, 2fr);
  grid-template-rows: auto auto;
  width: 99%;
  height: 80%;
}

.campaign-card-scroll {
  background: transparent url('../assets/ScrollHorizontal.png') no-repeat center/contain;
  background-size: 80% 100%;
  aspect-ratio: 2/1;
  color: var(--vt-c-dark-brown);
  width: 100%;
  height: 100%;
  margin: 0;
  text-align: center;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.campaign-card-scroll .campaign-card-txt {
  align-items: center;
  max-width: 63%;
  box-sizing: border-box;
  overflow-y: auto;
  padding-left: 0;
  padding-right: 0;
  height: 79%;
  margin: 0px auto;
  padding: 0 5px;
  z-index: 2;
}

.fieldGrid p {
  color: var(--vt-c-warm-white);
  background-color: var(--vt-c-bronze);
  font-family: "Cinzel", serif;
  border: 1.5px solid var(--vt-c-navy);
  box-shadow: 0 2px 6px rgba(17, 26, 45, 0.5);
  padding: 5px;
  margin: 15px 0;
  border-radius: 5px;
  font-size: 0.8rem;
  text-align: left;
}

.group1 {
  grid-column: 1/3;
  margin: 0;
  width: 100%;
}

.group1 input {
  width: 100%;
  max-width:100%;
}

.group1 h2 {
  text-wrap: nowrap;
  overflow: hidden;
  margin-bottom: 0;
}

.group2 {
  grid-column: 1;
}

.group2 input {
  width: 100%;
}

.group2 p {
  width: 100%;
  max-width: 100%;
}

.group3 {
  grid-column: 2;
}

.baseInfo {
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 8px;
  gap: 8px;
}

.baseInfo  input {
  width: 80%;
  height: 30px;
  margin: 10px 0px;
  background-color: transparent;
  box-shadow: none;
}

.baseInfo p {
  width: 60%;
  height: 30px;
  margin: 10px 0;
  background-color: transparent;
  box-shadow: none;
  overflow: hidden;
}

.classInfo p {
  text-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
}

.backgroundInfo {
  display: flex;
  gap: 10px;
}

.backgroundInfo p {
  min-width: calc(33% - 10px);
  margin: 10px 5px;
  text-wrap: nowrap;
  overflow: hidden;
}

.statsInfo {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.statsInfo p {
  width: 60%;
  height: 30px;
  margin: 10px 0;
  background-color: transparent;
  box-shadow: none;
  overflow: hidden;
}

.statsInfo input {
  width: 60%;
  height: 30px;
  margin: 10px 0px;
  background-color: transparent;
  box-shadow: none;
}

.heartIcon, .shieldIcon {
  position: relative;
}

.heartIcon p, .shieldIcon p {
  position: absolute;
  top: 3px;
  left: 11px;
  font-size: 96% !important;
  color: var(--vt-c-navy);
  border: none;
  text-align: center;
  padding: 0;
}

.heartIcon input, .shieldIcon input {
  position: absolute;
  top: 0.5px;
  left: 5.5px;
  font-size: 98% !important;
  color: var(--vt-c-navy);
  border: none;
  text-align: center;
  padding: 0 0;
}

.heartIcon label, .shieldIcon label {
  position: absolute;
  bottom: -12px;
  left: 15px;
}

.shieldIcon {
  input {
    color: var(--vt-c-golden);
  }

  p {
    color: var(--vt-c-golden);
  }

  input::placeholder {
    color: var(--vt-c-golden);
  }
  
}

.levelIcon {
  position: relative;
}

.levelIcon label {
  position: absolute;
  bottom: -11px;
  left: 15px;
}

.popupLevelSealButton {
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin-bottom: 0.5rem;
}

.popupLevelSealImage {
  width: 57px;
  height: 57px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.popupLevelSealText {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vt-c-dark-brown);
  background: rgba(244, 233, 208, 0.9);
  border-radius: 10px;
  padding: 1px 8px;
  line-height: 1.2;
}

.strIcon, .dexIcon, .conIcon, .intIcon, .wisIcon, .chaIcon {
  position: relative;
}

.strIcon img, .dexIcon img, .conIcon img, .intIcon img, .wisIcon img, .chaIcon img {
  width: 90px;
  height: 115px;
}

.strIcon p, .dexIcon p, .conIcon p, .intIcon p, .wisIcon p, .chaIcon p {
  position: absolute;
  top: 22px;
  left: 18px;
  font-size: 20px;
  color: var(--vt-c-dark-brown);
  border: none;
  text-align: center;
}

.strIcon label, .dexIcon label, .conIcon label, .intIcon label, .wisIcon label, .chaIcon label {
  position: absolute;
  font-size: 100%;
  bottom: 15px;
  left: 28px;
  border-top: solid 1px var(--vt-c-dark-brown);
}

.strIcon input, .dexIcon input, .conIcon input, .intIcon input, .wisIcon input, .chaIcon input {
  position: absolute;
  top: 22px;
  left: 18px;
  font-size: 20px;
  color: var(--vt-c-dark-brown);
  border: none;
  text-align: center;
}

.dexIcon label {
  left: 27px;
}

.conIcon label {
  left: 24px;
}

.intIcon label {
  left: 29px;
}

.chaIcon label {
  left: 26px;
}

.backstoryInfo {
  height: fit-content;
}

.backstoryInfo textarea {
  width: calc(100% - 40px);
  margin: 0 20px;
}

.backstoryInfo p {
  width: calc(100% - 40px);
  margin: 0 20px;

}

.divider {
  display: inline-flex;
  align-items: flex-start;
  width: 100%;
  height: 50px;
  justify-content: center;
}

.divider .dividertxt {
  align-items: center;
  margin-top: 10px;
  margin-left: 6%;
  margin-right: 6%;
}

.divider img {
  width: 20%;
  margin-top: 10px;
  margin-bottom: 0;
}

.displayBackstory {
  width: 100%;
  height: 100px;
  margin-top:10px;
  margin-bottom: 1rem;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  text-align: left;
  font-size: 0.85rem;
  letter-spacing: 0.4px;
  background-color: transparent;
  border: transparent;
}

textarea {
  width: 100%;
  height: 100px;
  margin-top:10px;
  border-radius: 5px;
  font-family: "Cinzel", serif;
  font-size: 0.8rem;
  color: var(--vt-c-navy);
  resize: vertical;
  background-color: var(--vt-c-bronze);
  border: 1.5px solid var(--vt-c-navy);
  box-shadow: 0 2px 6px rgba(17, 26, 45, 0.5);
}

textarea:focus {
  outline: none;
  color: var(--vt-c-red);
  border: 1.5px solid var(--vt-c-red);
  box-shadow: 0 2px 6px var(--vt-c-red);
  /* background-color: var(--vt-c-golden); */
}

textarea::placeholder {
  outline: none;
  color: var(--vt-c-warm-white);
}

/* Read-only backstory display styling */
.backstory-display {
  width: 100%;
  min-height: 100px;
  max-height: 300px;
  margin-top: 10px;
  padding: 10px;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
  line-height: 1.5;
}

.campaign-card-copy {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.06);
}

.card-copy-header {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 10px;
}

.card-copy-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--vt-c-warm-white);
}

.card-copy-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
}

.card-copy-meta p {
  margin: 0;
}

textarea::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

/* .level-carousel {
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
} */

.charPreview{
  width: 50px;
  height: 50px;
  object-fit: cover;
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
  width: 90%;
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

.field-error {
  color: #b31c1c;
  font-weight: 700;
  margin-top: 8px;
}

@media (max-width: 1030px) {
    .table-row {
    font-size: 0.7rem;
  }

  .table-header {
    font-size: 0.95rem;
  }

  .table-row>div:nth-child(4) {
    display: inline-flex;
    flex-direction: column;

    .tooltip-text {
      left: 0%;
      bottom: 80%;
    } 
  }
}

@media (max-width: 830px) {

  .table-header, .table-row {
    grid-template-columns: 0.75fr 0.5fr 0.5fr;
  }

  .table-header>div:nth-child(1), .table-row>div:nth-child(1) {
    display: none;
  }

  .tooltip-text {
    font-size: 0.7rem;
    width: 135px;
  }
}

@media(max-width: 750px){
  .addButton {
    padding-left: 0;
    margin: auto;
    display: block;
    text-align: center;
    
    .parchmentButton {
      margin: 5px auto;
    }
  }
}

@media(max-width: 655px) {
  .table-row>div:nth-child(2),.table-row>div:nth-child(3) {
    grid-column: 1;
  }

  .table-header>div:nth-child(3) {
    display: none;
  }

  .table-row>div:nth-child(4) {
    grid-column: 2;
    grid-row: 1/ span 2;
  }

  .table-header, .table-row {
    grid-template-columns: minmax(150px, 1fr) minmax(100px, 0.5fr);
  }

  .tooltip-text {
    display: none;
  }

}
@media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}

@media (max-width: 1215px) {
  .scroll {
    background:transparent url('../assets/Scroll.png') no-repeat center/contain;
    aspect-ratio: 3 / 4;
    color: var(--vt-c-dark-brown);
    min-width:95vh;
    min-height:95vh;
    max-width: 100vh;
    max-height: 100vh;
    margin: 40px auto;
    text-align: center;
    line-height: 1.6;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index:100;

    .txt {
    align-items: center;
    max-height: 77%; /* confines it to the “paper” area */
    box-sizing: border-box;
    overflow-y: auto;
    padding-left: 0;
    padding-right: 0;
    max-width: 68%;
    margin: 0px auto;
    }
  }

  .fieldGrid {
    /* grid-template-rows: 0.5fr 2fr 2fr; */
    grid-template-rows: auto auto auto;
    /* grid-template-columns: 1fr; */
    grid-template-columns: minmax(300px, 1fr);
    gap: 5px;
    width: 99%;
    max-width: 99%;
    height: fit-content;
    
    input {
      font-size: 0.69rem;
    }

    p {
      font-size: 0.62rem;
    }
  }

  .group1 {
    grid-column: 1;
    grid-row: 1;

    input {
      width: 94%
    }
  }

  .heartIcon, .shieldIcon {
    input {
      left: 5px;
    }
  }

  .group2 {
    grid-column: 1;
    grid-row: 2;

    height: fit-content;
    

    display: grid;
    grid-template-columns: minmax(125px, 1fr) minmax(150px, 1fr);
    grid-template-rows: auto auto;
  }

  .charPhoto {
    grid-column: 1;
    grid-row: 1/3;

    margin-left: 10px;
    margin-right: 10px;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .photo-preview {
    margin: 0;
    height: 160px;
  }

  .baseInfo {
    grid-column: 2;
    grid-row: 1;

    margin: auto;
    margin-bottom: 9px;
  }
  
  .classInfo {
    grid-column: 2;
    grid-row: 2;

    input {
      width: 100%;
    }
  }

  .tooltip-container {
    width: 100%;
  }

  .heartIcon, .shieldIcon {

    p {
      top: 5px;
    }

  }

  .group3 {
    grid-column: 1;
    grid-row: 3;
  }

  .backgroundInfo {

    p {
      margin: 5px 0;
    }
  }

  .strIcon, .dexIcon, .conIcon, .intIcon, .wisIcon, .chaIcon {
    img {
      width: 63px;
      height: 80.5px
    }

    input {
      width: 60%;
      left: 13px;
      top: 5px;
      font-size: 20px;
    }

    p {
      left: 13px;
      top: 0px;
      font-size: 20px;
    }
  }

  .strIcon {
    label {
      left: 16.5px;
    }
  }

  .dexIcon {
    label {
      left: 16px;
    }
  }

  .conIcon {
    label {
      left: 13.25px;
    }
  }

  .intIcon {
    label {
      left: 17px;
    }
  }

  .wisIcon {
    label {
      left: 17px;
    }
  }

  .chaIcon {
    label {
      left: 14px;
    }
  }

  .divider {
    .dividertxt {
      margin-left: 9%;
      margin-right: 9%;
    }
  }

  .backstoryInfo {

    .displayBackstory {
      margin: auto; 
    }
    
    p {
      font-size: 0.7rem;
      width: 98%;
    }
  }

  textarea {
    margin: 0 10px;
  }

}


@media (max-width: 640px) {
  .scroll {
    min-width: 90vw;
    padding: 0;

    .txt{
      max-width: 71%;
      height: 85vw;
    }
  }
}

@media(max-width: 600px) {
  .scroll .txt {
    min-width: 77%;
  }
}

@media (max-width: 530px) {
  .baseInfo {
    gap: 1px;
  }
  .statsInfo {
    img {
      width: 55px;
      height: 72px;
    }
    font-size: 0.61rem;
  }
  .strIcon, .dexIcon, .conIcon, .intIcon, .wisIcon, .chaIcon {
    p {
      left: 11px;
    }
    input {
      left: 10.5px;
      width: 64%;
    }
  }
  .backgroundInfo {
    gap: 3px;

    .tooltip-text {
      left: 10%;
    }
  }

  .popupButton {
    font-size: 0.8rem;
    min-width: 100px;
    padding: 5px 5px;
  }
}

@media (max-width: 470px) {
  .fieldGrid {
    gap:0;
  }

  .classInfo p, .backgroundInfo p, .backstoryInfo p {
    font-size: 0.55rem !important;
  }

  .group2 {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .group1, .group2, .group3,
  .classInfo, .backgroundInfo, .backstoryInfo {
    margin-left: 1px;
    max-width: 70vw;
  }

  .charPhoto {
    grid-column: 1/ span 2;
    margin: auto;
    margin-bottom: 10px;
  }

  .baseInfo, .classInfo {
    grid-column: 1/ span 2;
    grid-row: auto;
  }

  .baseInfo {
    gap: 12px;
  }

  .classInfo p{
    margin: 12px 0;
  }

  .backgroundInfo {
    flex-direction: column;

    .tooltip-text {
      left: 20%;
    }
  }

  .statsInfo {
    display: grid;
    grid-template-rows: 1fr 1fr;
    justify-content:space-evenly;
    margin-top: 20px;
    gap: 5px;
  }

  .strIcon, .dexIcon, .conIcon {
    grid-row: 1;

  }

  .intIcon, .wisIcon, .chaIcon {
    grid-row: 2;
  }

  .divider {
    height: 35px;
    img {
      width: 20%;
    }
  }

  .backstoryInfo {
    textarea {
      width: 95%;
      margin: 0 auto;
      font-size: 0.65rem;
    }
  }


  .scroll {
    .txt {
      min-width: 74vw;
    }
  }
}

/*
Source - https://stackoverflow.com/a/4298216
Posted by antonj, modified by community. See post 'Timeline' for change history
Retrieved 2026-04-09, License - CC BY-SA 4.0
*/

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    appearance: textfield;
    -moz-appearance: textfield; /* Firefox */
}
</style>
