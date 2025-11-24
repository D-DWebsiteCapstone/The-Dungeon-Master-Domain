<script>
export default {
  data() {
    return {
      singleCharacter: null,
      secondCharacter: null,
      userCharacters: [],
      loadingCharacter: false,
      characterError: null,
      secondLoading: false,
      secondError: null
        ,
        // create-character state
        creatingCharacter: false,
        createCharacterError: null
        ,
        // image validation
        imageError: null,
        // max image size in bytes (2 MB)
        maxImageSizeBytes: 2 * 1024 * 1024,
        // edit state
        editingCharacter: false,
        editCharacterError: null,
        // currently-displayed character in the Display popup
        displayedCharacter: null
    }
  },
  
  // Methods for character page functionality
  methods: {
    // Decode hex-encoded strings if needed (for image URLs) so that they display properly
    decodeHexIfNeeded(val) {
      if (typeof val !== 'string') return val
      const m = val.match(/^\\x([0-9a-fA-F]+)$/)
      // helper to decode hex string to UTF-8 without Node Buffer
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
    },
    async fetchCharacterById(uuid) {
      if (!uuid) return
      this.secondLoading = true
      this.secondError = null
      try {
  const resp = await fetch(`https://127.0.0.1:3000/character/by-uuid/${uuid}`)
        if (!resp.ok) {
          this.secondError = `HTTP ${resp.status}`
          console.warn('fetchCharacterById HTTP', resp.status)
          return
        }
        const j = await resp.json()
        // Normalize various possible response shapes from backend
        const extractCharacter = (payload) => {
          if (!payload) return null
          if (payload.character) {
            const c = payload.character
            // supabase insert helper sometimes returns { data: [ ... ] }
            if (c.data && Array.isArray(c.data)) return c.data[0]
            if (Array.isArray(c)) return c[0]
            if (c.id) return c
          }
          // direct data array
          if (payload.data && Array.isArray(payload.data)) return payload.data[0]
          // fallback: payload itself might be the character
          if (payload.id) return payload
          return null
        }

        const char = extractCharacter(j)
        if (char) {
          // ensure image is converted if needed
          if (char.image) char.image = this.decodeHexIfNeeded(char.image)
          this.secondCharacter = char
        } else {
          this.secondError = 'No character returned'
          console.warn('No character returned for id', uuid, j)
        }
      } catch (err) {
          this.secondError = err.message || String(err)
          console.warn('fetchCharacterById error', err)
          // fallback sample so UI can display while backend is unreachable
          this.secondCharacter = {
            id: '414c399f-1f2d-4153-9fa6-df00d4373ee8',
            name: 'Chris Chan (fallback)',
            image: this.decodeHexIfNeeded('\x68747470733a2f2f69312e736e6463646e2e636f6d2f617274776f726b732d4d37505a4f5167466a304e6a67664a782d363854617a772d74323430783234302e6a7067'),
            backstory: "We don't talk about the evils she has commited."
          }
      } finally {
        this.secondLoading = false
      }
    },
    showMakeChar() {
      const el = (typeof window !== 'undefined' && window.document) ? window.document.getElementById('makeChar') : null
      if (el) el.style.display = 'block'
    },
    showEditChar() {
      const el = (typeof window !== 'undefined' && window.document) ? window.document.getElementById('editChar') : null
      if (el) el.style.display = 'block'
    },
    async fetchTestCharacter() {
      this.loadingCharacter = true
      this.characterError = null
      try {
  const resp = await fetch('https://127.0.0.1:3000/character/test')
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const j = await resp.json()
        // normalize response shape
        const char = (j && j.character && j.character.data && Array.isArray(j.character.data)) ? j.character.data[0]
          : (j && j.character && j.character.id) ? j.character
          : (j && j.data && Array.isArray(j.data)) ? j.data[0]
          : (j && j.id) ? j : null
        if (char) {
          if (char.image) char.image = this.decodeHexIfNeeded(char.image)
          this.singleCharacter = char
        } else this.characterError = 'No character returned'
      } catch (err) {
        this.characterError = err.message || String(err)
        // fallback sample so UI can display while backend is unreachable
        this.singleCharacter = {
          id: 'test-fallback',
          name: 'Test Character (fallback)',
          image: this.decodeHexIfNeeded('\x68747470733a2f2f69312e736e6463646e2e636f6d2f617274776f726b732d4d37505a4f5167466a304e6a67664a782d363854617a772d74323430783234302e6a7067'),
          backstory: 'Fallback sample: backend unreachable.'
        }
      } finally {
        this.loadingCharacter = false
      }
    },
    openDisplayFor(character) {
      const display = document.getElementById('displayChar')
      if (!display) return
      const nameInput = display.querySelector('input[name="cname"]')
      const backstory = display.querySelector('textarea[name="cbackstory"]')
      const img = display.querySelector('#photoPreviewImg')
      const previewText = display.querySelector('#photoPreviewText')
      if (nameInput) nameInput.value = character.name || ''
      if (backstory) backstory.value = character.backstory || ''
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
      // remember which character is shown so Edit can reuse it
      this.displayedCharacter = character
      display.style.display = 'block'
    },

    // Close the display popup and open the edit popup, pre-filling fields
    openEditFromDisplay() {
      const display = document.getElementById('displayChar')
      const edit = document.getElementById('editChar')
      if (!this.displayedCharacter) return
      // hide display popup
      if (display) display.style.display = 'none'

      // pre-fill edit modal fields
      if (edit) {
        const nameInput = edit.querySelector('input[name="cname"]')
        const backstory = edit.querySelector('textarea[name="cbackstory"]')
        const img = edit.querySelector('#photoPreviewImg')
        const previewText = edit.querySelector('#photoPreviewText')
        if (nameInput) nameInput.value = this.displayedCharacter.name || ''
        if (backstory) backstory.value = this.displayedCharacter.backstory || ''
        if (img) {
          if (this.displayedCharacter.image) {
            img.src = this.displayedCharacter.image
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
    },
    //This will be the javascript functions for the character page

    //Start making functions for picture 
    //Can make this into an async function. 
    previewImage(event) {
      const input = event.target
      const file = input.files && input.files[0]
      // clear previous image-related errors
      this.imageError = null

      // I DID A THING...I think it works to change the image preview to be a button??????????
      const previewDiv = event.target.closest('.popup').querySelector('.photo-preview')
      const img = previewDiv.querySelector('img')
      const previewText = previewDiv.querySelector('span')

      // This is what it used to be and I hope this didn't break it
      //const img = document.getElementById('photoPreviewImg')
      //const previewText = document.getElementById('photoPreviewText')

      // if no file chosen, reset preview
      if (!file) {
        if (img) {
          img.src = ''
          img.style.display = 'none'
        }
        if (previewText) previewText.style.display = 'inline'
        return
      }

      // validate file size
      if (file && file.size > this.maxImageSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
        const msg = `Selected image is too large (${sizeMb} MB). Maximum is ${(this.maxImageSizeBytes / (1024 * 1024))} MB.`
        this.imageError = msg
        // set the input's custom validity so the browser can show a native validation tooltip
        try { input.setCustomValidity(msg); input.reportValidity() } catch (e) { /* ignore if not supported */ }
        if (img) {
          img.src = ''
          img.style.display = 'none'
        }
        if (previewText) previewText.style.display = 'inline'
        return
      }
      // clear any previously set custom validity when file is acceptable
      try { input.setCustomValidity('') } catch (e) { /* ignore */ }

      const reader = new FileReader() 
      reader.onload = (e) => {
        if (img) {
          img.src = e.target.result
          img.style.display = 'block'
        }
        if (previewText) previewText.style.display = 'none'
      }
      reader.readAsDataURL(file)
    },

    // Funciton to handle character edit submission which will be similar to the new character submission
    // but will target an existing character by id and update rather than create the fields coincidingly
    async submitEditCharacter() {
      // Ensure a character is selected
      if (!this.displayedCharacter || !this.displayedCharacter.id) {
        this.editCharacterError = 'No character selected to edit.'
        return
      }

      const edit = document.getElementById('editChar')
      if (!edit) {
        this.editCharacterError = 'Edit modal not found.'
        return
      }

      const nameInput = edit.querySelector('input[name="cname"]')
      const backstoryInput = edit.querySelector('textarea[name="cbackstory"]')
      const fileInput = edit.querySelector('input[name="cphoto"]')

      const name = nameInput ? nameInput.value.trim() : ''
      const backstory = backstoryInput ? backstoryInput.value.trim() : ''

      if (!name) {
        this.editCharacterError = 'Please provide a name.'
        return
      }

      const file = fileInput && fileInput.files && fileInput.files[0]
      if (file && file.size > this.maxImageSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
        this.editCharacterError = `Selected image is too large (${sizeMb} MB). Maximum allowed is ${(this.maxImageSizeBytes / (1024 * 1024))} MB.`
        return
      }

      this.editingCharacter = true
      this.editCharacterError = null

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
        const id = this.displayedCharacter.id
        const resp = await fetch(`https://127.0.0.1:3000/character/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image: imageData, backstory })
        })

        if (!resp.ok) {
          let errMsg = ''
          try {
            const body = await resp.json().catch(() => null)
            if (body) errMsg = body.message || body.error || JSON.stringify(body)
          } catch (e) { /* ignore */ }
          if (!errMsg) errMsg = await resp.text().catch(() => `HTTP ${resp.status}`)
          this.editCharacterError = `Server error ${resp.status}: ${errMsg}`
          return
        }

        const j = await resp.json().catch(() => null)
        const updated = (j && j.character) ? j.character : (j && j.id ? j : null)
        if (updated) {
          // Update cards if they reference this character
          if (this.singleCharacter && this.singleCharacter.id === updated.id) this.singleCharacter = updated
          if (this.secondCharacter && this.secondCharacter.id === updated.id) this.secondCharacter = updated
          this.displayedCharacter = updated
          this.closeModal('editChar')
        } else {
          this.editCharacterError = 'Unexpected server response when updating character.'
        }
      } catch (err) {
        console.error('submitEditCharacter error', err)
        this.editCharacterError = err.message || String(err)
      } finally {
        this.editingCharacter = false
      }
    },

    // Submit new character to backend and update UI optimistically
    async submitNewCharacter() {
      // scope the modal form to get values (keeps changes minimal)
      const form = document.getElementById('makeChar')?.querySelector('form')
      if (!form) return
      const nameInput = form.querySelector('input[name="cname"]')
      const backstoryInput = form.querySelector('textarea[name="cbackstory"]')
      const fileInput = form.querySelector('input[name="cphoto"]')

      const name = nameInput ? nameInput.value.trim() : ''
      const backstory = backstoryInput ? backstoryInput.value.trim() : ''

      if (!name) {
        this.createCharacterError = 'Please provide a name.'
        return
      }

      this.creatingCharacter = true
      this.createCharacterError = null

      // read file if present into a data URL
      let imageData = null
      const file = fileInput && fileInput.files && fileInput.files[0]
      // validate file size before attempting to read it
      if (file && file.size > this.maxImageSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
        this.createCharacterError = `Selected image is too large (${sizeMb} MB). Maximum allowed is ${(this.maxImageSizeBytes / (1024 * 1024))} MB.`
        this.creatingCharacter = false
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
          // proceed without image
          imageData = null
        }
      }

      // generate a client id if crypto available, otherwise fallback to timestamp
      let id = null
      try { id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}` } catch (e) { id = `id-${Date.now()}` }

      try {
        const resp = await fetch('https://127.0.0.1:3000/character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, image: imageData, backstory })
        })

        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          this.createCharacterError = `Server error ${resp.status}: ${txt}`
          console.warn('createCharacter failed', resp.status, txt)
          return
        }

        const j = await resp.json().catch(() => null)
        if (j && j.valid && j.character) {
          // update UI: place created character into the first card
          this.singleCharacter = j.character
          // close modal and reset form
          this.closeModal('makeChar')
        } else if (j && j.character) {
          this.singleCharacter = j.character
          this.closeModal('makeChar')
        } else {
          this.createCharacterError = 'Unexpected server response when creating character.'
        }
      } catch (err) {
        console.error('submitNewCharacter error', err)
        this.createCharacterError = err.message || String(err)
      } finally {
        this.creatingCharacter = false
      }
    },

    closeModal(source) {
      // source can be: Event (from @click), a string id, or undefined (defaults to makeChar)
      let modal = null
      if (typeof source === 'string') {
        modal = document.getElementById(source)
      } else if (source && source.target) {
        modal = source.target.closest && source.target.closest('.modal')
      }
      if (!modal) modal = document.getElementById('makeChar')

      if (modal) {
        modal.style.display = 'none'
        // reset only elements inside this modal to avoid cross-modal collisions
        this.resetForm(modal)
      }
    },

    //This is gonna be for the template for the cards so when a SPECIFIC user opens their character page
    // it will only show THEIR characters
    //Use Character 2 card as a sort of template but instead of pulling a specific uuid it will be 
    // calling a variable which will one of the user's characters from the database and then 
    // populating the card with that data then displaying it on the character page then
    // next steps will be to have the other characters show up as well in their own cards.
    //TODO: Make a function to fetch user-specific characters and populate cards accordingly.
    // Next up will be to make a loop to create multiple cards for each character the user has.
    async fetchUserCharacters(username) {
      if (!username) return
      this.characterError = null
      this.loadingCharacter = true
      this.userCharacters = []
      try {
        const resp = await fetch(`https://127.0.0.1:3000/character/by-creator/${encodeURIComponent(username)}`)
        if (!resp.ok) {
          this.characterError = `HTTP ${resp.status}`
          console.warn('fetchUserCharacters HTTP', resp.status)
          return
        }
        const j = await resp.json().catch(() => null)
        const chars = (j && Array.isArray(j.characters)) ? j.characters : (j && j.data && Array.isArray(j.data)) ? j.data : []
        const normalized = (chars || []).map(c => ({ ...c, image: c && c.image ? this.decodeHexIfNeeded(c.image) : c && c.image }))
        this.userCharacters = normalized
        // populate the main two cards for quick visibility (if available)
        if (normalized.length > 0) this.singleCharacter = normalized[0]
        if (normalized.length > 1) this.secondCharacter = normalized[1]
      } catch (err) {
        console.warn('fetchUserCharacters error', err)
        this.characterError = err && err.message ? err.message : String(err)
      } finally {
        this.loadingCharacter = false
      }
    },

    //This function will be to delete a character from the database 
// when the user wants to remove one of their characters
deleteCharacter(characterId) {
  // Placeholder for future implementation
  // Call to backend to delete character by characterId
  // Update UI accordingly
},
                                         

    // Reset form fields within a given modal or globally if no modal provided
    // Used after successful submission or when closing modals
    resetForm(modal) {
      // If modal element provided, reset fields scoped to that modal.
      // Otherwise fallback to global selectors (old behavior).
      const scope = modal || document

      const nameInput = scope.querySelector('input[name="cname"]')
      const backstory = scope.querySelector('textarea[name="cbackstory"]')
      const fileInput = scope.querySelector('input[type="file"]')
      const img = scope.querySelector('#photoPreviewImg')
      const previewText = scope.querySelector('#photoPreviewText')

      if (nameInput) nameInput.value = ''
      if (backstory) backstory.value = ''
      if (fileInput) fileInput.value = ''
      // clear any browser-level custom validity set on file inputs
      if (fileInput) {
        try { fileInput.setCustomValidity('') } catch (e) { /* ignore if not supported */ }
      }
      if (img) img.src = ''
      if (img) img.style.display = 'none'
      if (previewText) previewText.style.display = 'inline'
      // clear any image-specific errors
      this.imageError = null
      // also clear create errors when form is reset
      this.createCharacterError = null
      // clear edit-specific errors/state when resetting forms
      this.editCharacterError = null
      this.editingCharacter = false
    }
  },
  mounted() {
    // Populate the two cards when the component mounts
    // Card 1: test/sample route
    this.fetchTestCharacter()
    // Card 2: fetch by UUID (use your valid UUID)
    this.fetchCharacterById('414c399f-1f2d-4153-9fa6-df00d4373ee8')
  }
}



</script>

<script setup>
// Note: keep Options API above; this script block simply triggers initial fetches when
// using the file in a modern Vite environment. We call the methods defined in the
// Options API instance by emitting a DOM event that the instance handles on mount.
</script>


<template>
  <div class = "charPage" v-sound>
    <div class ="header">
    <h1>Character Page</h1>
    <p>This is your character page where your characters for campaigns will be shown on cards.</p>
    </div>
    <!-- This will be to store the character cards will make a funny function for placement later
     on but in the meantime this is temporary -->
    <!-- Use the project's global .Card and .CardSpacing classes (defined in src/assets/main.css) -->
    <div id="characterCardsContainer" class="CardSpacing">
      <div class="Card" v-if="singleCharacter">
          <div class = "imageStack" v-if="singleCharacter.image">
            <img class = "imgBorder" src="../assets/images/CharBorder.png"></img>
            <img class = "imgChar" :src="decodeHexIfNeeded(singleCharacter.image)" />
          </div>
          <div>
            <strong>{{ singleCharacter.name }}</strong>
            <button @click="openDisplayFor(singleCharacter)"></button>
        </div>
      </div>
  <div class="Card" v-else>Character 1 <br></br> Example Display <br></br><button @click="showEditChar">Edit</button></div>
      <!-- Character 2 will be the test card pulled from the database -->

      <div class="Card">
        <template v-if="secondLoading">
        <div>Loading...</div>
        </template>
        <template v-else-if="secondError">
          <div>Error: {{ secondError }}</div>
          <button @click="fetchCharacterById('414c399f-1f2d-4153-9fa6-df00d4373ee8')">Retry</button>
        </template>
        <template v-else-if="secondCharacter">
            <div class = "imageStack" v-if="secondCharacter.image">
              <img class = "imgBorder" src="../assets/images/CharBorder.png"></img>
              <img class = "imgChar" :src="secondCharacter.image" alt="thumb" />
            </div>
            <div>
              <strong>{{ secondCharacter.name }}</strong>
              <div><button @click="openDisplayFor(secondCharacter)"></button></div>
          </div>
        </template>
        <template v-else>
          Character 2 <br /> PULLED FROM DATABASE

        </template>
      </div>
    </div>

    <!-- Make a button to add a new character have it connected
     to popup for character creation.-->
  <button class="parchmentButton" @click="showMakeChar">Add</button>

<!--I want to make the cards appear here. Will be within a invisible table-->
  <table>
  </table>


    <!-- Have code for popup card here CHARACTER CREATION -->
    <div id="makeChar" class = "modal" v-scroll-reset>
    <div class="popup">
      <div class="popuptxt">
      <form @submit.prevent="submitNewCharacter">
        <div class = "header">
          <p>Character Creation<br>
            Create your magnificent character</p>
        </div>

        <!-- Character Name -->
        <label for="cname">Character Name </label>
        <input type="text" placeholder="Enter Character Name" name="cname" required>
        <br></br>
        <!-- Character Photo Upload -->
        <label for="cphoto"><br>Character Photo </br></label>

        
        
      <!--------------------TEST: IGNORE THIS DAMIEN (unless you likey it)--------------------->

       <!--  <label for="file-upload" class="uploadButton">Choose File</label>
        <input id = "file-upload" type="file" name="cphoto" accept="image/*" @change="previewImage">
        Set up some way to show a small preview window for photo -->
               
        <!-- <div id="photoPreview" class="photo-preview">
          <img id="photoPreviewImg" src="" alt="Photo Preview" />
          <span id="photoPreviewText">No Photo Selected</span>
        </div> -->

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
      <!---------------------------------------END TEST------------------------------------------>

        <!-- Backstory Description -->
        <div class = "divider">
        <img src = "../assets/images/divider-left-short.png" />
        <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
        <img src = "../assets/images/divider-right-short.png" />
        </div>
        <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>

        <br>
        <!-- Confirm Button -->
        <button class = "popupButton" type="submit" :disabled="creatingCharacter">{{ creatingCharacter ? 'Creating...' : 'Confirm' }}</button>

        <!-- Cancel Button -->
        <button class = "popupButton" type="button" @click="closeModal($event)">Cancel</button>

        <div v-if="createCharacterError">{{ createCharacterError }}</div>
      </form>
    </div>
    </div>
    </div>

    <!-- Edit character popup - pulls from the database with preloaded information to edit based upon
     which card it is which will be the id for the character -->
    <div id="editChar" class = "modal" v-scroll-reset>
        <div class="popup">
          <div class = "popuptxt">
           <label for="cname">Character Name </label>
           <input type="text" placeholder="Enter Character Name" name="cname" />
            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>
            <br></br>

          <!--------------------TEST: ONCE AGAIN, PLEASE IGNORE UNLESS GOOD --------------------->
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

            <!-- <input type="file" name="cphoto" accept="image/*" @change="previewImage">
            <-- Set up some way to show a small preview window for photo --
             
            <div id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" />
                <span id="photoPreviewText">No Photo Selected</span>
            </div> -->

      <!---------------------------------------END TEST------------------------------------------>

            <!-- Backstory Description -->
            <div class = "divider">
              <img src = "../assets/images/divider-left-short.png" />
              <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
              <img src = "../assets/images/divider-right-short.png" />
            </div>
            <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>
            <!-- Confirm Button - this will submit the edited character details 
             and change the character in the database -->
            
            <button class = "popupButton" type="button" @click="submitEditCharacter" :disabled="editingCharacter">{{ editingCharacter ? 'Saving...' : 'Confirm' }}</button>
            <div v-if="editCharacterError" class="field-error">{{ editCharacterError }}</div>

            <!-- Cancel Button -->
            <button class = "popupButton" type="button" @click="closeModal($event)">Cancel</button>
          </div>
        </div>
    </div>


    <!-- Display character popup - shows character details preloaded from database-->
  <div id="displayChar" class = "modal" v-scroll-reset>
        <div class="popup">
          <div class = "popuptxt">
          <!-- Character Name -->
            <label for="cname">Character Name </label>

            <!-- Display Character Name from the database -->
            <h2>{{displayedCharacter ? displayedCharacter.name : ''}}</h2>
           

            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>

            <!-- Set up some way to show a small preview window for photo -->
            <div id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" />
                <span id="photoPreviewText">No Photo Selected</span>
            </div>

            <!-- Backstory Description -->
            <div class = "divider">
              <img src = "../assets/images/divider-left-short.png" />
              <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
              <img src = "../assets/images/divider-right-short.png" />
            </div>
            <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>


            <!-- Cancel Button -->
            <button class = "popupButton" type="button" @click="closeModal($event)">Cancel</button>
            <button class = "popupButton" type="button" @click="openEditFromDisplay">Edit</button>
            
        </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* Photo preview styling */
.photo-preview {
  margin-top: 10px;
  padding: 10px;
  margin: 20px auto;
  border: 2px dashed #f5e0e0;
  border-radius: 8px;
  text-align: center;
  background-color: #ab8585;
  max-width: 200px;
  cursor:pointer;
  align-items: center;
  display: flex;
  justify-content: center;
}

#photoPreviewImg {
  max-width: 80%;
  max-height: 150px;
  border-radius: 4px;
  display: none; /* Hide initially */
}

 #photoPreviewText {
  /* font-family: "Cinzel", serif; */
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
  margin-top:3vh;
  margin-bottom: 10vh;
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
  position:relative;
  /* top: 15px;
  left: 15px; */
  width: 230px;
  height:230px;
  margin-top: 0.75rem;
  z-index: 1;
  object-fit: cover;
  object-position:center;
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

input {
  color: var(--vt-c-red);
  background-color:transparent;
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

.divider{
  display: inline-flex;
  margin-top: 3vh;
  margin-bottom: 3vh;
  align-items: flex-end;

  .dividertxt{
    align-items: flex-start;
    margin-left: 20px;
    margin-right: 20px;
  }
}

.header {
  margin-bottom: 5vh;
}

h2{
  color: var(--vt-c-dark-brown);
}

</style>