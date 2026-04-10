<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { apiFetch } from '../lib/api'
import { jwtDecode } from 'jwt-decode';
import {useRoute} from 'vue-router'

const route = useRoute()
const currentPage = computed(() => parseInt(route.params.page) || 1)
const totalPages = ref(1)
// CHARACTER DISPLAY STATE
const singleCharacter = ref(null)
const secondCharacter = ref(null)
const userCharacters = ref([])
const loadingCharacter = ref(false)
const characterError = ref(null)
const secondLoading = ref(false)
const secondError = ref(null)

// CHARACTER CREATION STATE
const creatingCharacter = ref(false)
const createCharacterError = ref(null)

// LIMITS & VALIDATION
const characterLimit = ref(10)
const imageError = ref(null)
const maxImageSizeBytes = 2 * 1024 * 1024

// CHARACTER EDITING STATE
const editingCharacter = ref(false)
const editCharacterError = ref(null)
const displayedCharacter = ref(null)

// TOKEN INFORMATION
const token = localStorage.getItem("authToken")
const decoded = jwtDecode(token)

const role = decoded.role;
const userId = decoded.id ;

// METHODS FOR CHARACTER PAGE FUNCTIONALITY

// Decode hex-encoded strings if needed (for image URLs)
function decodeHexIfNeeded(val) {
  if (typeof val !== 'string') return val
  const m = val.match(/^\\x([0-9a-fA-F]+)$/)
  // Helper to decode hex string to UTF-8 without Node Buffer
  const hexToUtf8 = (hex) => {
    try {
      const bytes = hex.match(/.{1,2}/g).map(b => parseInt(b, 16))
      const u8 = new Uint8Array(bytes)
      return new TextDecoder().decode(u8)
    } catch (e) {
      return val
    }
  }
  if (m && m[1]) {
    try { return hexToUtf8(m[1]) } catch (e) { return val }
  }
  if (/^[0-9a-fA-F]+$/.test(val) && val.length % 2 === 0) {
    try {
      const dec = hexToUtf8(val)
      if (/^https?:\/\//i.test(dec)) return dec
    } catch (e) { }
  }
  return val
}

// Fetch a single character by UUID
async function fetchCharacterById(uuid) {
  if (!uuid) return
  secondLoading.value = true
  secondError.value = null
  try {
    const resp = await apiFetch(`/character/by-uuid/${uuid}`)
    if (!resp.ok) {
      secondError.value = `HTTP ${resp.status}`
      console.warn('fetchCharacterById HTTP', resp.status)
      return
    }
    const j = await resp.json()
    // Normalize various possible response shapes from backend
    const extractCharacter = (payload) => {
      if (!payload) return null
      if (payload.character) {
        const c = payload.character
        if (c.data && Array.isArray(c.data)) return c.data[0]
        if (Array.isArray(c)) return c[0]
        if (c.id) return c
      }
      if (payload.data && Array.isArray(payload.data)) return payload.data[0]
      if (payload.id) return payload
      return null
    }
    const char = extractCharacter(j)
    if (char) {
      if (char.image) char.image = decodeHexIfNeeded(char.image)
      secondCharacter.value = char
    } else {
      secondError.value = 'No character returned'
      console.warn('No character returned for id', uuid, j)
    }
  } catch (err) {
    secondError.value = err.message || String(err)
    console.warn('fetchCharacterById error', err)
  } finally {
    secondLoading.value = false
  }
}

// Show the create character modal
function showMakeChar() {
  if (userCharacters.value.length >= characterLimit.value) {
    createCharacterError.value = `You can only have up to ${characterLimit.value} characters.`
    return
  }
  const el = (typeof window !== 'undefined' && window.document) ? window.document.getElementById('makeChar') : null
  if (el) el.style.display = 'block'
}

// Show the edit character modal
function showEditChar() {
  const el = (typeof window !== 'undefined' && window.document) ? window.document.getElementById('editChar') : null
  if (el) el.style.display = 'block'
}

// Fetch test character for debugging
async function fetchTestCharacter() {
  loadingCharacter.value = true
  characterError.value = null
  try {
    const resp = await apiFetch('/character/test')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const j = await resp.json()
    // Normalize response shape
    const char = (j && j.character && j.character.data && Array.isArray(j.character.data)) ? j.character.data[0]
      : (j && j.character && j.character.id) ? j.character
      : (j && j.data && Array.isArray(j.data)) ? j.data[0]
      : (j && j.id) ? j : null
    if (char) {
      if (char.image) char.image = decodeHexIfNeeded(char.image)
      singleCharacter.value = char
    } else characterError.value = 'No character returned'
  } catch (err) {
    characterError.value = err.message || String(err)
    // Fallback sample so UI can display while backend is unreachable
    singleCharacter.value = {
      id: 'test-fallback',
      name: 'Test Character (fallback)',
      image: 'https://i1.sncdcdn.com/artworks-M7PZOU6Fj0NjgfJx-68TaZw-t240x240.jpg',
      backstory: 'Fallback sample: backend unreachable.'
    }
  } finally {
    loadingCharacter.value = false
  }
}

// Open display modal for a character
function openDisplayFor(character) {
  const display = document.getElementById('displayChar')
  if (!display) return
  const nameInput = display.querySelector('input[name="cname"]')
  const img = display.querySelector('#photoPreviewImg')
  const previewText = display.querySelector('#photoPreviewText')
  if (nameInput) nameInput.value = character.name || ''
  if (img) {
    if (character.image) {
      img.src = character.image
      img.style.display = 'block'
      if (previewText) previewText.style.display = 'none'
    } else {
      img.src = ''
      img.style.display = 'none'
      if (previewText) previewText.style.display = 'inline'
    }
  }
  // Remember which character is shown so Edit can reuse it
  displayedCharacter.value = character
  display.style.display = 'block'
}

// Close the display popup and open the edit popup, pre-filling fields
function openEditFromDisplay() {
  const display = document.getElementById('displayChar')
  const edit = document.getElementById('editChar')
  if (!displayedCharacter.value) return
  // Hide display popup
  if (display) display.style.display = 'none'
  // Pre-fill edit modal fields
  if (edit) {
    const nameInput = edit.querySelector('input[name="cname"]')
    const backstory = edit.querySelector('textarea[name="cbackstory"]')
    const img = edit.querySelector('#photoPreviewImg')
    const previewText = edit.querySelector('#photoPreviewText')
    if (nameInput) nameInput.value = displayedCharacter.value.name || ''
    if (backstory) backstory.value = displayedCharacter.value.backstory || ''
    if (img) {
      if (displayedCharacter.value.image) {
        img.src = displayedCharacter.value.image
        img.style.display = 'block'
        if (previewText) previewText.style.display = 'none'
      } else {
        img.src = ''
        img.style.display = 'none'
        if (previewText) previewText.style.display = 'inline'
      }
    }
    edit.style.display = 'block'
  }
}

// Preview image before upload
function previewImage(event) {
  const input = event.target
  const file = input.files && input.files[0]
  // Clear previous image-related errors
  imageError.value = null
  const previewDiv = event.target.closest('.popup').querySelector('.photo-preview')
  const img = previewDiv.querySelector('img')
  const previewText = previewDiv.querySelector('span')
  // If no file chosen, reset preview
  if (!file) {
    if (img) {
      img.src = ''
      img.style.display = 'none'
    }
    if (previewText) previewText.style.display = 'inline'
    return
  }
  // Validate file size
  if (file && file.size > maxImageSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    const msg = `Selected image is too large (${sizeMb} MB). Maximum is ${(maxImageSizeBytes / (1024 * 1024))} MB.`
    imageError.value = msg
    // Set the input's custom validity so browser shows native validation tooltip
    try { input.setCustomValidity(msg); input.reportValidity() } catch (e) { }
    if (img) {
      img.src = ''
      img.style.display = 'none'
    }
    if (previewText) previewText.style.display = 'inline'
    return
  }
  // Clear any previously set custom validity when file is acceptable
  try { input.setCustomValidity('') } catch (e) { }
  const reader = new FileReader()
  reader.onload = (e) => {
    if (img) {
      img.src = e.target.result
      img.style.display = 'block'
    }
    if (previewText) previewText.style.display = 'none'
  }
  reader.readAsDataURL(file)
}

// Submit edit character
async function submitEditCharacter() {
  // Ensure a character is selected
  if (!displayedCharacter.value || !displayedCharacter.value.id) {
    editCharacterError.value = 'No character selected to edit.'
    return
  }
  const edit = document.getElementById('editChar')
  if (!edit) {
    editCharacterError.value = 'Edit modal not found.'
    return
  }
  const nameInput = edit.querySelector('input[name="cname"]')
  const backstoryInput = edit.querySelector('textarea[name="cbackstory"]')
  const fileInput = edit.querySelector('input[name="cphoto"]')
  const name = nameInput ? nameInput.value.trim() : ''
  const backstory = backstoryInput ? backstoryInput.value.trim() : ''
  if (!name) {
    editCharacterError.value = 'Please provide a name.'
    return
  }
  const file = fileInput && fileInput.files && fileInput.files[0]
  if (file && file.size > maxImageSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    editCharacterError.value = `Selected image is too large (${sizeMb} MB). Maximum allowed is ${(maxImageSizeBytes / (1024 * 1024))} MB.`
    return
  }
  editingCharacter.value = true
  editCharacterError.value = null
  let imageData = null
  if (file) {
    try {
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    } catch (e) {
      console.warn('Image read failed', e)
      imageData = null
    }
  }
  try {
    const id = displayedCharacter.value.id
    // Build payload: only include `image` if a new file was provided
    const payload = { name, backstory }
    if (imageData !== null) payload.image = imageData
    const resp = await apiFetch(`/character/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!resp.ok) {
      let errMsg = ''
      try {
        const body = await resp.json().catch(() => null)
        if (body) errMsg = body.message || body.error || JSON.stringify(body)
      } catch (e) { }
      if (!errMsg) errMsg = await resp.text().catch(() => `HTTP ${resp.status}`)
      editCharacterError.value = `Server error ${resp.status}: ${errMsg}`
      return
    }
    const j = await resp.json().catch(() => null)
    const updated = (j && j.character) ? j.character : (j && j.id ? j : null)
    if (updated) {
      // Update cards if they reference this character
      if (singleCharacter.value && singleCharacter.value.id === updated.id) singleCharacter.value = updated
      if (secondCharacter.value && secondCharacter.value.id === updated.id) secondCharacter.value = updated
      displayedCharacter.value = updated
      closeModal('editChar')
    } else {
      editCharacterError.value = 'Unexpected server response when updating character.'
    }
  } catch (err) {
    console.error('submitEditCharacter error', err)
    editCharacterError.value = err.message || String(err)
  } finally {
    editingCharacter.value = false
  }
}

// Submit new character
async function submitNewCharacter() {
  if (userCharacters.value.length >= characterLimit.value) {
    createCharacterError.value = `You can only have up to ${characterLimit.value} characters.`
    return
  }
  // Scope the modal form to get values
  const form = document.getElementById('makeChar')?.querySelector('form')
  if (!form) return
  const nameInput = form.querySelector('input[name="cname"]')
  const backstoryInput = form.querySelector('textarea[name="cbackstory"]')
  const fileInput = form.querySelector('input[name="cphoto"]')
  const name = nameInput ? nameInput.value.trim() : ''
  const backstory = backstoryInput ? backstoryInput.value.trim() : ''
  if (!name) {
    createCharacterError.value = 'Please provide a name.'
    return
  }
  creatingCharacter.value = true
  createCharacterError.value = null
  // Read file if present into a data URL
  let imageData = null
  const file = fileInput && fileInput.files && fileInput.files[0]
  // Validate file size before attempting to read it
  if (file && file.size > maxImageSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    createCharacterError.value = `Selected image is too large (${sizeMb} MB). Maximum allowed is ${(maxImageSizeBytes / (1024 * 1024))} MB.`
    creatingCharacter.value = false
    return
  }
  if (file) {
    try {
      imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    } catch (e) {
      console.warn('Image read failed', e)
      // Proceed without image
      imageData = null
    }
  }
  // Generate a client id if crypto available, otherwise fallback to timestamp
  let id = null
  try { id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}` } catch (e) { id = `id-${Date.now()}` }
  try {
    // Include the logged-in username as `createdBy` when available
    let createdBy = null
    try { createdBy = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('username') : null } catch (e) { createdBy = null }
    const resp = await apiFetch('/character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, image: imageData, backstory, createdBy })
    })
    if (!resp.ok) {
      const body = await resp.json().catch(() => null)
      if (resp.status === 409 && body && body.code === 'CHARACTER_LIMIT_REACHED') {
        if (typeof body.limit === 'number') characterLimit.value = body.limit
        createCharacterError.value = body.message || `You can only have up to ${characterLimit.value} characters.`
        return
      }
      const txt = body ? (body.message || body.error || JSON.stringify(body)) : await resp.text().catch(() => '')
      createCharacterError.value = `Server error ${resp.status}: ${txt}`
      console.warn('createCharacter failed', resp.status, txt)
      return
    }
    const j = await resp.json().catch(() => null)
    if (j && j.valid && j.character) {
      // Update UI: place created character into the first card
      singleCharacter.value = j.character
      userCharacters.value = [j.character, ...userCharacters.value]
      // Close modal and reset form
      closeModal('makeChar')
    } else if (j && j.character) {
      singleCharacter.value = j.character
      userCharacters.value = [j.character, ...userCharacters.value]
      closeModal('makeChar')
    } else {
      createCharacterError.value = 'Unexpected server response when creating character.'
    }
  } catch (err) {
    console.error('submitNewCharacter error', err)
    createCharacterError.value = err.message || String(err)
  } finally {
    creatingCharacter.value = false
  }
}

// Close a modal
function closeModal(source) {
  // Source can be: Event (from @click), a string id, or undefined (defaults to makeChar)
  let modal = null
  if (typeof source === 'string') {
    modal = document.getElementById(source)
  } else if (source && source.target) {
    modal = source.target.closest && source.target.closest('.modal')
  }
  if (!modal) modal = document.getElementById('makeChar')
  if (modal) {
    modal.style.display = 'none'
    // Reset only elements inside this modal to avoid cross-modal collisions
    resetForm(modal)
  }
}

async function fetchCharacters() {
  characterError.value = null
  loadingCharacter.value = true
  userCharacters.value = []
  try {
    if (role != "Admin") {
      window.alert("You are unauthorized to view this page.")
      return
    }
    const resp = await apiFetch(`/character/adminCharacter/${currentPage.value}`)
    if (!resp.ok) {
      characterError.value = `HTTP ${resp.status}`
      return
    }
    const j = await resp.json().catch(() => null)
    const chars = (j && Array.isArray(j.characters)) ? j.characters : []
    totalPages.value = j.totalPages || 1
    const normalized = chars.map(c => ({ ...c, image: c?.image ? decodeHexIfNeeded(c.image) : c?.image }))
    userCharacters.value = normalized
  } catch (err) {
    characterError.value = err?.message ?? String(err)
  } finally {
    loadingCharacter.value = false
  }
}

// Confirm delete character
function confirmDeleteCharacter(characterId) {
  if (!characterId) return
  const confirmed = (typeof window !== 'undefined' && typeof window.confirm === 'function')
    ? window.confirm('Delete this character permanently? This cannot be undone.')
    : true
  if (!confirmed) return
  deleteCharacter(characterId)
}

// Delete character
async function deleteCharacter(characterId) {
  if (!characterId) return
  characterError.value = null
  loadingCharacter.value = true
  try {
    const resp = await apiFetch(`/character/${encodeURIComponent(characterId)}`, {
      method: 'DELETE'
    })
    if (!resp.ok) {
      characterError.value = `HTTP ${resp.status}`
      console.warn('deleteCharacter HTTP', resp.status)
      return
    } else {
      // Optimistically update UI by removing the character from the list
      const remainingCharacters = userCharacters.value.filter(c => c.id !== characterId)
      userCharacters.value = remainingCharacters
      // If deleted character was currently displayed, close popup and clear selection
      if (displayedCharacter.value && displayedCharacter.value.id === characterId) {
        const displayModal = document.getElementById('displayChar')
        if (displayModal) displayModal.style.display = 'none'
        displayedCharacter.value = null
      }
      // Keep top-card pointers in sync with current list
      singleCharacter.value = remainingCharacters[0] || null
      secondCharacter.value = remainingCharacters[1] || null
    }
  } catch (err) {
    console.warn('deleteCharacter error', err)
    characterError.value = err && err.message ? err.message : String(err)
  } finally {
    loadingCharacter.value = false
  }
}

// Reset form fields
function resetForm(modal) {
  // If modal element provided, reset fields scoped to that modal
  // Otherwise fallback to global selectors
  const scope = modal || document
  const nameInput = scope.querySelector('input[name="cname"]')
  const backstory = scope.querySelector('textarea[name="cbackstory"]')
  const fileInput = scope.querySelector('input[type="file"]')
  const img = scope.querySelector('#photoPreviewImg')
  const previewText = scope.querySelector('#photoPreviewText')
  if (nameInput) nameInput.value = ''
  if (backstory) backstory.value = ''
  if (fileInput) fileInput.value = ''
  // Clear any browser-level custom validity set on file inputs
  if (fileInput) {
    try { fileInput.setCustomValidity('') } catch (e) { }
  }
  if (img) img.src = ''
  if (img) img.style.display = 'none'
  if (previewText) previewText.style.display = 'inline'
  // Clear any image-specific errors
  imageError.value = null
  // Also clear create errors when form is reset
  createCharacterError.value = null
  // Clear edit-specific errors/state when resetting forms
  editCharacterError.value = null
  editingCharacter.value = false
}

// Lifecycle hook to fetch initial data
onMounted(async () => {
  await fetchCharacters()
})

watch(currentPage, async () => {
  await fetchCharacters()
})
</script>

<template>
  <div class="charPage" v-sound>
    <div class="header">
      <h1>Your Characters</h1>
      <p>Here you can craft the next legend whose name shall be remembered for years to come.</p>
    </div>

    <!-- Render characters for the current user (fetched by fetchCharacters) -->
    <div id="characterCardsContainer" class="CardSpacing">
      <template v-if="loadingCharacter">
        <div>Loading characters...</div>
      </template>
      <template v-else-if="characterError">
        <div>Error: {{ characterError }}</div>
      </template>
      <template v-else-if="userCharacters && userCharacters.length">
        <div class="Card" v-for="(c, idx) in userCharacters" :key="c.id">
          <button class="cardDisplayButton" type="button" @click="openDisplayFor(c)" aria-label="Open character details"></button>
          <div class="imageStack" v-if="c.image">
            <img class="imgBorder" src="../assets/images/CharBorder.png"></img>
            <img class="imgChar" :src="decodeHexIfNeeded(c.image)" />
          </div>
          <div>
            <strong>{{ c.name }}</strong>
            <div class="cardDeleteButton">
              <button class="deleteButton" type="button" @click.stop="confirmDeleteCharacter(c.id)">
                <img src="../assets/images/skull.png" alt="Skull Image" />
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div>You do not have authorization to view this page</div>
      </template>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination">
  <router-link v-if="currentPage > 1" :to="`/AdminCharacters/${currentPage - 1}`">
    <img src="../assets/images/CharPrev.png" alt="Previous" height="60" width="60"/>
  </router-link>

  <span>Page {{ currentPage }} of {{ totalPages }}</span>

  <router-link v-if="currentPage < totalPages" :to="`/AdminCharacters/${currentPage + 1}`">
    <img src="../assets/images/CharNext.png" alt="Next" height="60" width="60" />
  </router-link>
</div>

    <!-- Have code for popup card here CHARACTER CREATION -->
    <div id="makeChar" class="modal" v-scroll-reset>
      <div class="popup">
        <div class="popuptxt">
          <form @submit.prevent="submitNewCharacter">
            <div class="header">
              <p>Character Creation<br>
                Create your magnificent character</p>
            </div>

            <!-- Character Name -->
            <label for="cname">Character Name </label>
            <input type="text" placeholder="Enter Character Name" name="cname" required>
            <br></br>
            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>

            <!-- Hidden file input -->
            <input
              id="file-upload"
              type="file"
              name="cphoto"
              accept="image/*"
              @change="previewImage"
              style="display:none"
            >

            <!-- The clickable preview box -->
            <label for="file-upload" id="photoPreview" class="photo-preview">
              <img id="photoPreviewImg" src="" alt="Photo Preview" style="display:none;" />
              <span id="photoPreviewText">No Photo Selected</span>
            </label>

            <!-- Backstory Description -->
            <div class="divider">
              <img src="../assets/images/divider-left-short.png" />
              <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
              <img src="../assets/images/divider-right-short.png" />
            </div>
            <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>
            <!-- Confirm Button -->
            <button class="popupButton" type="submit" :disabled="creatingCharacter">{{ creatingCharacter ? 'Creating...' : 'Confirm' }}</button>

            <!-- Cancel Button -->
            <button class="popupButton" type="button" @click="closeModal($event)">Cancel</button>

            <div v-if="createCharacterError">{{ createCharacterError }}</div>
          </form>
        </div>
      </div>
    </div>

    <!-- This is the popup for the delete confirmation button -->
    <div id="delConfirm" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <p>Are you sure you want to delete this character?</p>
          <button class="popupButton" @click="deleteCharacter(selectedCharacterId)">Yes, Delete</button>
          <button class="popupButton" @click="closeModal($event)">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Edit character popup -->
    <div id="editChar" class="modal" v-scroll-reset>
      <div class="popup">
        <div class="popuptxt">
          <label for="cname">Character Name </label>
          <input type="text" placeholder="Enter Character Name" name="cname" />
          <!-- Character Photo Upload -->
          <label for="cphoto"><br>Character Photo </br></label>
          <br></br>

          <input
            id="edit-file-upload"
            type="file"
            name="cphoto"
            accept="image/*"
            @change="previewImage"
            style="display:none"
          />
          <label for="edit-file-upload" id="photoPreview" class="photo-preview">
            <img id="photoPreviewImg" src="" alt="Photo Preview" style="display:none;" />
            <span id="photoPreviewText">No Photo Selected</span>
          </label>

          <!-- Backstory Description -->
          <div class="divider">
            <img src="../assets/images/divider-left-short.png" />
            <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
            <img src="../assets/images/divider-right-short.png" />
          </div>
          <textarea placeholder="Enter Backstory" name="cbackstory"></textarea>

          <br>
          <button class="popupButton" type="button" @click="submitEditCharacter" :disabled="editingCharacter">{{ editingCharacter ? 'Saving...' : 'Confirm' }}</button>
          <div v-if="editCharacterError" class="field-error">{{ editCharacterError }}</div>

          <!-- Cancel Button -->
          <button class="popupButton" type="button" @click="closeModal($event)">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Display character popup -->
    <div id="displayChar" class="modal" v-scroll-reset>
      <div class="popup">
        <div class="popuptxt">
          <h2>{{ displayedCharacter ? displayedCharacter.name : '' }}</h2>

          <div id="photoPreview" class="photo-preview">
            <img id="photoPreviewImg" src="" alt="Photo Preview" />
            <span id="photoPreviewText">No Photo Selected</span>
          </div>

          <!-- Backstory Description -->
          <div class="divider">
            <img src="../assets/images/divider-left-short.png" />
            <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
            <img src="../assets/images/divider-right-short.png" />
          </div>
          <p class="displayBackstory">{{ displayedCharacter ? displayedCharacter.backstory : '' }}</p>

          <button class="popupButton" type="button" @click="closeModal($event)">Cancel</button>
          <button class="popupButton" type="button" @click="openEditFromDisplay">Edit</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Photo preview styling */
.photo-preview {
  padding: 10px;
  margin: 15px auto;
  border: 2px dashed #f5e0e0;
  border-radius: 8px;
  text-align: center;
  background-color: #ab8585;
  max-width: 200px;
  cursor: pointer;
  align-items: center;
  display: flex;
  justify-content: center;
}

#photoPreviewImg {
  max-width: 80%;
  max-height: 150px;
  border-radius: 4px;
  display: none;
}

#photoPreviewText {
  font-size: 1rem;
  letter-spacing: 1px;
  line-height: 1.6;
  color: var(--vt-c-warm-white);
}

.imageStack {
  position: relative;
  justify-content: center;
  align-items: center;
  height: fit-content;
  margin-top: 1.5rem;
  margin-bottom: 5rem;
}

.imgBorder {
  position: absolute;
  z-index: 2;
  top: -78px;
  left: -63px;
  width: 405px;
  height: 415px;
}

.imgChar {
  position: relative;
  width: 230px;
  height: 230px;
  margin-top: 0.75rem;
  z-index: 1;
  object-fit: cover;
  object-position: center;
}

textarea {
  width: 100%;
  height: 100px;
  margin-top: 10px;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  resize: vertical;
  background-color: transparent;
  border: transparent;
}

.displayBackstory {
  width: 100%;
  height: 100px;
  margin-top: 10px;
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

input {
  color: var(--vt-c-red);
  background-color: transparent;
  font-family: "Cinzel", serif;
}

textarea::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

input:focus {
  outline: none;
  color: var(--vt-c-navy);
}

input::placeholder {
  outline: none;
  color: var(--vt-c-red);
}

input[type="file"] {
  display: none;
}

.uploadButton {
  padding: 0.5rem 1rem;
  background: var(--vt-c-bronze);
  color: var(--vt-c-warm-white);
  border-radius: 4px;
  cursor: pointer;
}

.divider {
  display: inline-flex;
  margin-top: 3vh;
  margin-bottom: 3vh;
  align-items: flex-end;
}

.divider .dividertxt {
  align-items: flex-start;
  margin-left: 35px;
  margin-right: 35px;
}

.header {
  margin-bottom: 5vh;
}

h2 {
  color: var(--vt-c-dark-brown);
}

.modal {
  display: none;
}

.Card {
  position: relative;
}

.cardDisplayButton {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 4;
}

.cardDeleteButton {
  position: absolute;
  top: 5px;
  right: 0px;
  z-index: 8;
}

.cardDeleteButton .deleteButton {
  position: static;
  width: auto;
  height: auto;
  border: none;
  background: transparent;
  color: var(--vt-c-red);
  cursor: pointer;
}

.deleteButton img {
  width: 22px;
  height: 22px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 640px) {

  .imageStack {
    margin-top: 2.5rem;
    margin-left: 1.1rem;
  }

  .cardDisplayButton {
    height: 439.854px !important;
  }

  .Card{
    /* min-height: 449.854px; */
  }
 
  .imageStack {
    max-width: 281px;
  }

}

@media (max-width: 480px) {
  .divider {
    justify-content: center;
    img {
      width: 20%;
    }
  }
}

@media (max-width: 350px) {
  .divider {
    .dividertxt {
      margin-left: 20px;
      margin-right: 20px;
    }
  }
}

</style>