<script>
import { apiFetch } from '../lib/api'
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
        characterLimit: 10,
        // image validation
        imageError: null,
        // max image size in bytes (2 MB)
        maxImageSizeBytes: 2 * 1024 * 1024,
        // edit state
        editingCharacter: false,
        editCharacterError: null,
        // currently-displayed character in the Display popup
        displayedCharacter: null,
        // level controls (editable only in create/edit popups)
        createLevel: 1,
        editLevel: 1
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
        const resp = await apiFetch(`/character/by-uuid/${uuid}`)
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
      } finally {
        this.secondLoading = false
      }
    },
    showMakeChar() {
      if (this.userCharacters.length >= this.characterLimit) {
        this.createCharacterError = `You can only have up to ${this.characterLimit} characters.`
        return
      }
      this.createLevel = 1
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
        const resp = await apiFetch('/character/test')
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
        const levelInput = edit.querySelector('input[name="clevel"]')
        const classInput = edit.querySelector('input[name="cclass"]')
        const subClassInput = edit.querySelector('input[name="csubclass"]')
        const backgroundInput = edit.querySelector('input[name="cbackground"]')
        const raceInput = edit.querySelector('input[name="crace"]')
        const alignmentInput = edit.querySelector('input[name="calignment"]')
        const maxHealthInput = edit.querySelector('input[name="cmaxhealth"]')
        const armorClassInput = edit.querySelector('input[name="carmorclass"]')
        const strInput = edit.querySelector('input[name="cstr"]')
        const dexInput = edit.querySelector('input[name="cdex"]')
        const conInput = edit.querySelector('input[name="ccon"]')
        const intInput = edit.querySelector('input[name="cint"]')
        const wisInput = edit.querySelector('input[name="cwis"]')
        const chaInput = edit.querySelector('input[name="ccha"]')
        const img = edit.querySelector('#photoPreviewImg')
        const previewText = edit.querySelector('#photoPreviewText')
        if (nameInput) nameInput.value = this.displayedCharacter.name || ''
        if (backstory) backstory.value = this.displayedCharacter.backstory || ''
        this.editLevel = this.getClampedLevel(this.displayedCharacter.level)
        if (levelInput) levelInput.value = this.editLevel
        if (classInput) classInput.value = this.displayedCharacter.class || ''
        if (subClassInput) subClassInput.value = this.displayedCharacter.subClass || ''
        if (backgroundInput) backgroundInput.value = this.displayedCharacter.background || ''
        if (raceInput) raceInput.value = this.displayedCharacter.race || ''
        if (alignmentInput) alignmentInput.value = this.displayedCharacter.alignment || ''
        if (maxHealthInput) maxHealthInput.value = this.displayedCharacter.maxHealth || ''
        if (armorClassInput) armorClassInput.value = this.displayedCharacter.armorClass || ''
        if (strInput) strInput.value = this.displayedCharacter.str || ''
        if (dexInput) dexInput.value = this.displayedCharacter.dex || ''
        if (conInput) conInput.value = this.displayedCharacter.con || ''
        if (intInput) intInput.value = this.displayedCharacter.int || ''
        if (wisInput) wisInput.value = this.displayedCharacter.wis || ''
        if (chaInput) chaInput.value = this.displayedCharacter.cha || ''
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

    getClampedLevel(rawLevel) {
      const parsed = Number.parseInt(rawLevel, 10)
      if (!Number.isFinite(parsed) || parsed < 1) return 1
      if (parsed > 20) return 20
      return parsed
    },

    getSealForLevel(level) {
      const normalized = this.getClampedLevel(level)
      return new URL(`../assets/images/waxSeals/Seal${normalized}.png`, import.meta.url).href
    },

    cycleCreateLevel() {
      this.createLevel = this.createLevel >= 20 ? 1 : this.createLevel + 1
    },

    cycleEditLevel() {
      this.editLevel = this.editLevel >= 20 ? 1 : this.editLevel + 1
    },

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
      const classInput = edit.querySelector('input[name="cclass"]')
      const subClassInput = edit.querySelector('input[name="csubclass"]')
      const backgroundInput = edit.querySelector('input[name="cbackground"]')
      const raceInput = edit.querySelector('input[name="crace"]')
      const alignmentInput = edit.querySelector('input[name="calignment"]')
      const maxHealthInput = edit.querySelector('input[name="cmaxhealth"]')
      const armorClassInput = edit.querySelector('input[name="carmorclass"]')
      const strInput = edit.querySelector('input[name="cstr"]')
      const dexInput = edit.querySelector('input[name="cdex"]')
      const conInput = edit.querySelector('input[name="ccon"]')
      const intInput = edit.querySelector('input[name="cint"]')
      const wisInput = edit.querySelector('input[name="cwis"]')
      const chaInput = edit.querySelector('input[name="ccha"]')

      const name = nameInput ? nameInput.value.trim() : ''
      const backstory = backstoryInput ? backstoryInput.value.trim() : ''
      const level = this.getClampedLevel(this.editLevel)
      const class_ = classInput ? classInput.value.trim() : ''
      const subClass = subClassInput ? subClassInput.value.trim() : ''
      const background = backgroundInput ? backgroundInput.value.trim() : ''
      const race = raceInput ? raceInput.value.trim() : ''
      const alignment = alignmentInput ? alignmentInput.value.trim() : ''
      const maxHealth = maxHealthInput ? maxHealthInput.value.trim() : ''
      const armorClass = armorClassInput ? armorClassInput.value.trim() : ''
      const str = strInput ? strInput.value.trim() : ''
      const dex = dexInput ? dexInput.value.trim() : ''
      const con = conInput ? conInput.value.trim() : ''
      const int = intInput ? intInput.value.trim() : ''
      const wis = wisInput ? wisInput.value.trim() : ''
      const cha = chaInput ? chaInput.value.trim() : ''
      
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
        // Build payload: only include `image` if a new file was provided.
        const payload = {
          name,
          backstory,
          level,
          class_,
          subClass,
          background,
          race,
          alignment,
          maxHealth,
          armorClass,
          str,
          dex,
          con,
          int,
          wis,
          cha
        }
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
      if (this.userCharacters.length >= this.characterLimit) {
        this.createCharacterError = `You can only have up to ${this.characterLimit} characters.`
        return
      }

      // scope the modal form to get values (keeps changes minimal)
      const form = document.getElementById('makeChar')?.querySelector('form')
      if (!form) return
      const nameInput = form.querySelector('input[name="cname"]')
      const backstoryInput = form.querySelector('textarea[name="cbackstory"]')
      const fileInput = form.querySelector('input[name="cphoto"]')
      const classInput = form.querySelector('input[name="cclass"]')
      const subClassInput = form.querySelector('input[name="csubclass"]')
      const backgroundInput = form.querySelector('input[name="cbackground"]')
      const raceInput = form.querySelector('input[name="crace"]')
      const alignmentInput = form.querySelector('input[name="calignment"]')
      const maxHealthInput = form.querySelector('input[name="cmaxhealth"]')
      const armorClassInput = form.querySelector('input[name="carmorclass"]')
      const strInput = form.querySelector('input[name="cstr"]')
      const dexInput = form.querySelector('input[name="cdex"]')
      const conInput = form.querySelector('input[name="ccon"]')
      const intInput = form.querySelector('input[name="cint"]')
      const wisInput = form.querySelector('input[name="cwis"]')
      const chaInput = form.querySelector('input[name="ccha"]')

      const name = nameInput ? nameInput.value.trim() : ''
      const backstory = backstoryInput ? backstoryInput.value.trim() : ''
      const level = this.getClampedLevel(this.createLevel)
      const class_ = classInput ? classInput.value.trim() : ''
      const subClass = subClassInput ? subClassInput.value.trim() : ''
      const background = backgroundInput ? backgroundInput.value.trim() : ''
      const race = raceInput ? raceInput.value.trim() : ''
      const alignment = alignmentInput ? alignmentInput.value.trim() : ''
      const maxHealth = maxHealthInput ? maxHealthInput.value.trim() : ''
      const armorClass = armorClassInput ? armorClassInput.value.trim() : ''
      const str = strInput ? strInput.value.trim() : ''
      const dex = dexInput ? dexInput.value.trim() : ''
      const con = conInput ? conInput.value.trim() : ''
      const int = intInput ? intInput.value.trim() : ''
      const wis = wisInput ? wisInput.value.trim() : ''
      const cha = chaInput ? chaInput.value.trim() : ''

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
        // include the logged-in username as `createdBy` when available
        let createdBy = null
        try { createdBy = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('username') : null } catch (e) { createdBy = null }

        const resp = await apiFetch('/character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name,
            image: imageData,
            backstory,
            createdBy,
            level,
            class_,
            subClass,
            background,
            race,
            alignment,
            maxHealth,
            armorClass,
            str,
            dex,
            con,
            int,
            wis,
            cha
          })
        })

        if (!resp.ok) {
          const body = await resp.json().catch(() => null)
          if (resp.status === 409 && body && body.code === 'CHARACTER_LIMIT_REACHED') {
            if (typeof body.limit === 'number') this.characterLimit = body.limit
            this.createCharacterError = body.message || `You can only have up to ${this.characterLimit} characters.`
            return
          }

          const txt = body ? (body.message || body.error || JSON.stringify(body)) : await resp.text().catch(() => '')
          this.createCharacterError = `Server error ${resp.status}: ${txt}`
          console.warn('createCharacter failed', resp.status, txt)
          return
        }

        const j = await resp.json().catch(() => null)
        if (j && j.valid && j.character) {
          // update UI: place created character into the first card
          this.singleCharacter = j.character
          this.userCharacters = [j.character, ...this.userCharacters]
          // close modal and reset form
          this.closeModal('makeChar')
        } else if (j && j.character) {
          this.singleCharacter = j.character
          this.userCharacters = [j.character, ...this.userCharacters]
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
    // it will only show THEIR characters by using their username as the parameter to fetch from the database
    async fetchUserCharacters(username) {
      if (!username) return
      this.characterError = null
      this.loadingCharacter = true
      this.userCharacters = []
      try {
        const resp = await apiFetch(`/character/by-creator/${encodeURIComponent(username)}`)
        if (!resp.ok) {
          this.characterError = `HTTP ${resp.status}`
          console.warn('fetchUserCharacters HTTP', resp.status)
          return
        }
        const j = await resp.json().catch(() => null)
        const chars = (j && Array.isArray(j.characters)) ? j.characters : (j && j.data && Array.isArray(j.data)) ? j.data : []
        if (j && typeof j.limit === 'number') this.characterLimit = j.limit
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
confirmDeleteCharacter(characterId) {
  if (!characterId) return
  const confirmed = (typeof window !== 'undefined' && typeof window.confirm === 'function')
    ? window.confirm('Delete this character permanently? This cannot be undone.')
    : true
  if (!confirmed) return
  this.deleteCharacter(characterId)
},

async deleteCharacter(characterId) {
  if(!characterId) return
  this.characterError = null
  this.loadingCharacter = true
  try {
    //This will be the API call to delete the character by id, make sure to 
    //handle the response and update the UI accordingly
    const resp = await apiFetch(`/character/${encodeURIComponent(characterId)}`, {
      method: 'DELETE'
    }) 
    if (!resp.ok) {
      this.characterError = `HTTP ${resp.status}`
      console.warn('deleteCharacter HTTP', resp.status)
      return
    } else {
      // Optimistically update UI by removing the character from the list
      const remainingCharacters = this.userCharacters.filter(c => c.id !== characterId)
      this.userCharacters = remainingCharacters

      // If deleted character was currently displayed, close popup and clear selection
      if (this.displayedCharacter && this.displayedCharacter.id === characterId) {
        const displayModal = document.getElementById('displayChar')
        if (displayModal) displayModal.style.display = 'none'
        this.displayedCharacter = null
      }

      // Keep top-card pointers in sync with current list
      this.singleCharacter = remainingCharacters[0] || null
      this.secondCharacter = remainingCharacters[1] || null
    }
  } catch (err) {
    console.warn('deleteCharacter error', err)
    this.characterError = err && err.message ? err.message : String(err)
  }
  finally {
    this.loadingCharacter = false
  }

},
                                         

    // Reset form fields within a given modal or globally if no modal provided
    // Used after successful submission or when closing modals
    resetForm(modal) {
      // If modal element provided, reset fields scoped to that modal.
      // Otherwise fallback to global selectors (old behavior).
      const scope = modal || document

      const textInputs = scope.querySelectorAll('input[type="text"], input[type="number"]')
      const textareas = scope.querySelectorAll('textarea')
      const fileInput = scope.querySelector('input[type="file"]')
      const img = scope.querySelector('#photoPreviewImg')
      const previewText = scope.querySelector('#photoPreviewText')

      textInputs.forEach(el => { el.value = '' })
      textareas.forEach(el => { el.value = '' })
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
      this.createLevel = 1
      this.editLevel = 1
    }
  },

  // Lifecycle hook to fetch initial data MAKE SURE TO CALL fetchUserCharacters HERE and work on later for different users
  mounted() {
    //Use the logged-in username (stored at login) to fetch user-specific characters
    try {
      const username = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('username') : null
      if (username) {
        this.fetchUserCharacters(username)
      } else {
        // no username available (not logged in) — leave list empty
        console.warn('CharPage: no username in localStorage; skipping fetchUserCharacters')
      }
    } catch (e) {
      console.warn('CharPage: failed to read username from localStorage', e)
    }
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
    <h1>Your Characters</h1>
    <p>Here you can craft the next legend whose name shall be remembered for years to come.</p>
    </div>
    <!-- Render characters for the current user (fetched by fetchUserCharacters) -->
    <div id="characterCardsContainer" class="CardSpacing">
      <template v-if="loadingCharacter">
        <div>Loading characters...</div>
      </template>
      <template v-else-if="characterError">
        <div>Error: {{ characterError }}</div>
      </template>
      <template v-else-if="userCharacters && userCharacters.length">
        <div class="Card" v-for="(c, idx) in userCharacters" :key="c.id">
          <div class="levelSealBadge" :title="`Level ${getClampedLevel(c.level)}`" aria-hidden="true">
            <img class="levelSealImage" :src="getSealForLevel(c.level)" :alt="`Level ${getClampedLevel(c.level)} wax seal`" />
            <span class="levelSealText">Lv {{ getClampedLevel(c.level) }}</span>
          </div>
          <button class="cardDisplayButton" type="button" @click="openDisplayFor(c)" aria-label="Open character details"></button>
          <div class="imageStack" v-if="c.image">
            <img class="imgBorder" src="../assets/images/CharBorder.png"></img>
            <img class="imgChar" :src="decodeHexIfNeeded(c.image)" />
          </div>
          <div>
            <strong>{{ c.name }}</strong>
            <!-- This button will allow you to delete the character from the database and remove it from the UI -->
            <!-- Add a popup for confirmation of character delete -->
            <div class="cardDeleteButton">
              <button class="deleteButton" type="button" @click.stop="confirmDeleteCharacter(c.id)">
                <img src="../assets/images/skull.png" alt="Skull Image" />
              </button>
            </div>
          </div>
        </div>

      </template>
      <template v-else>
        <div>No characters found for this user.</div>
      </template>
    </div>

    <!-- Make a button to add a new character have it connected
     to popup for character creation. Hides when the user has 9 characters 
     so if a user has <10 characters hide the button-->
  <button v-show="!loadingCharacter && userCharacters.length <= 9"class="parchmentButton" @click="showMakeChar" :disabled="userCharacters.length >= characterLimit" :title="userCharacters.length >= characterLimit ? `Character limit reached (${characterLimit})` : 'Add character'">Add</button>

  <!-- userCharacters rendered above inside #characterCardsContainer -->


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

        <!-- Additional Character Details -->
         <!-- The level will be similar to what is made for the campaign character page with the stamp level input. -->
        <label for="clevel">Level </label>
        <button class="popupLevelSealButton" type="button" @click="cycleCreateLevel" :title="`Level ${createLevel} - click to cycle`" aria-label="Change level">
          <img class="popupLevelSealImage" :src="getSealForLevel(createLevel)" :alt="`Level ${createLevel} wax seal`" />
          <span class="popupLevelSealText">Lv {{ createLevel }}</span>
        </button>
        <input type="hidden" name="clevel" :value="createLevel">

        <label for="cclass">Class </label>
        <input type="text" placeholder="Enter Class" name="cclass">

        <label for="csubclass">SubClass </label>
        <input type="text" placeholder="Enter SubClass" name="csubclass">

        <label for="cbackground">Background </label>
        <input type="text" placeholder="Enter Background" name="cbackground">

        <label for="crace">Race </label>
        <input type="text" placeholder="Enter Race" name="crace">

        <label for="calignment">Alignment </label>
        <input type="text" placeholder="Enter Alignment" name="calignment">

        <label for="cmaxhealth">Max Health </label>
        <input type="text" placeholder="Enter Max Health" name="cmaxhealth">

        <label for="carmorclass">Armor Class </label>
        <input type="text" placeholder="Enter Armor Class" name="carmorclass">

        <label for="cstr">Str </label>
        <input type="text" placeholder="Enter Str" name="cstr">

        <label for="cdex">Dex </label>
        <input type="text" placeholder="Enter Dex" name="cdex">

        <label for="ccon">Con </label>
        <input type="text" placeholder="Enter Con" name="ccon">

        <label for="cint">Int </label>
        <input type="text" placeholder="Enter Int" name="cint">

        <label for="cwis">Wis </label>
        <input type="text" placeholder="Enter Wis" name="cwis">

        <label for="ccha">Cha </label>
        <input type="text" placeholder="Enter Cha" name="ccha">

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

    <!-- Edit character popup - pulls from the database with preloaded information to edit based upon
     which card it is which will be the id for the character -->
    <div id="editChar" class = "modal" v-scroll-reset>
        <div class="popup">
          <div class = "popuptxt">
           <label for="cname">Character Name </label>
           <input type="text" placeholder="Enter Character Name" name="cname" />

            <!-- Additional Character Details -->
            <label for="clevel">Level </label>
            <button class="popupLevelSealButton" type="button" @click="cycleEditLevel" :title="`Level ${editLevel} - click to cycle`" aria-label="Change level">
              <img class="popupLevelSealImage" :src="getSealForLevel(editLevel)" :alt="`Level ${editLevel} wax seal`" />
              <span class="popupLevelSealText">Lv {{ editLevel }}</span>
            </button>
            <input type="hidden" name="clevel" :value="editLevel" />

            <label for="cclass">Class </label>
            <input type="text" placeholder="Enter Class" name="cclass" />

            <label for="csubclass">SubClass </label>
            <input type="text" placeholder="Enter SubClass" name="csubclass" />

            <label for="cbackground">Background </label>
            <input type="text" placeholder="Enter Background" name="cbackground" />

            <label for="crace">Race </label>
            <input type="text" placeholder="Enter Race" name="crace" />

            <label for="calignment">Alignment </label>
            <input type="text" placeholder="Enter Alignment" name="calignment" />

            <label for="cmaxhealth">Max Health </label>
            <input type="text" placeholder="Enter Max Health" name="cmaxhealth" />

            <label for="carmorclass">Armor Class </label>
            <input type="text" placeholder="Enter Armor Class" name="carmorclass" />

            <label for="cstr">Str </label>
            <input type="text" placeholder="Enter Str" name="cstr" />

            <label for="cdex">Dex </label>
            <input type="text" placeholder="Enter Dex" name="cdex" />

            <label for="ccon">Con </label>
            <input type="text" placeholder="Enter Con" name="ccon" />

            <label for="cint">Int </label>
            <input type="text" placeholder="Enter Int" name="cint" />

            <label for="cwis">Wis </label>
            <input type="text" placeholder="Enter Wis" name="cwis" />

            <label for="ccha">Cha </label>
            <input type="text" placeholder="Enter Cha" name="ccha" />

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
            <div class = "divider">
              <img src = "../assets/images/divider-left-short.png" />
              <label class="dividertxt" for="cbackstory"><br>Backstory</br></label>
              <img src = "../assets/images/divider-right-short.png" />
            </div>
            <textarea placeholder="Enter Backstory" name="cbackstory"></textarea>

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
            <!-- <label for="cname">Character Name </label> -->

            <!-- Display Character Name from the database -->
            <h2>{{displayedCharacter ? displayedCharacter.name : ''}}</h2>
           

            <!-- Character Photo Upload -->
            <!-- <label for="cphoto"><br>Character Photo </br></label> -->

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
            <p class="displayBackstory">{{ displayedCharacter ? displayedCharacter.backstory : '' }}</p>

            <div class="displayStats">
              <p><strong>Level:</strong> {{ displayedCharacter ? displayedCharacter.level : '' }}</p>
              <p><strong>Class:</strong> {{ displayedCharacter ? displayedCharacter.class : '' }}</p>
              <p><strong>SubClass:</strong> {{ displayedCharacter ? displayedCharacter.subClass : '' }}</p>
              <p><strong>Background:</strong> {{ displayedCharacter ? displayedCharacter.background : '' }}</p>
              <p><strong>Race:</strong> {{ displayedCharacter ? displayedCharacter.race : '' }}</p>
              <p><strong>Alignment:</strong> {{ displayedCharacter ? displayedCharacter.alignment : '' }}</p>
              <p><strong>Max Health:</strong> {{ displayedCharacter ? displayedCharacter.maxHealth : '' }}</p>
              <p><strong>Armor Class:</strong> {{ displayedCharacter ? displayedCharacter.armorClass : '' }}</p>
              <p><strong>Str:</strong> {{ displayedCharacter ? displayedCharacter.str : '' }}</p>
              <p><strong>Dex:</strong> {{ displayedCharacter ? displayedCharacter.dex : '' }}</p>
              <p><strong>Con:</strong> {{ displayedCharacter ? displayedCharacter.con : '' }}</p>
              <p><strong>Int:</strong> {{ displayedCharacter ? displayedCharacter.int : '' }}</p>
              <p><strong>Wis:</strong> {{ displayedCharacter ? displayedCharacter.wis : '' }}</p>
              <p><strong>Cha:</strong> {{ displayedCharacter ? displayedCharacter.cha : '' }}</p>
            </div>


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
  /* margin-top: 40px; */
  padding: 10px;
  margin: 15px auto;
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

 .displayBackstory { 
  width: 100%;
  height: 100px;
  margin-top:10px;
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

.displayStats {
  width: 100%;
  text-align: left;
  margin-top: 0.75rem;
  color: var(--vt-c-navy);
}

.displayStats p {
  margin: 0.2rem 0;
  font-size: 0.85rem;
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
    margin-left: 35px;
    margin-right: 35px;
  }
}

.header {
  margin-bottom: 5vh;
}

h2{
  color: var(--vt-c-dark-brown);
}

.modal{
  display:none;
}

.Card {
  position: relative;
}

.levelSealBadge {
  position: absolute;
  top: 6px;
  left: 8px;
  z-index: 9;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.popupLevelSealButton {
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0;
  margin-bottom: 0.5rem;
}

.levelSealImage {
  width: 46px;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.popupLevelSealImage {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.levelSealText {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vt-c-dark-brown);
  background: rgba(244, 233, 208, 0.9);
  border-radius: 10px;
  padding: 1px 6px;
  line-height: 1.2;
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

.deleteButton img{
  width: 22px;
  height: 22px;
}


</style>
