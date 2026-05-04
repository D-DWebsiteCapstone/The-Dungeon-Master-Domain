<template>
<div class="layout">
  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <h1>Welcome to Your Campaign!</h1>
    <br>
    <div class="basicInfo">

      <!-- Header column with campaign title and join code -->
      <div  class="campaignDetails">
        <div v-if="campaignData" class=campaignTitle><h2>{{ campaignData.title }}</h2></div>
        <h2 class="campaignTitle" v-else>Loading campaign details...</h2>         
        <div class=joinLine><p><strong>Join Code:</strong></p>
          <button v-if="campaignData" class="joinCode" @click="copyText($event.target)">{{ campaignData.joinCode }}</button>
          <p v-else>Loading campaign details...</p>
        </div>
      </div>

      <!-- Image column -->
        <div class="imageBox">
          <div class="campaignImageBox">
            <img class="campaignImage" v-if="campaignData?.imageUrl" :src="campaignData.imageUrl" alt="Campaign Image">
            <img class="campaignImage" v-else src="../assets/images/testImages/DefaultCampaign.jpg">

            <!-- Corners of the border box -->
            <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
              style="transform: rotate(180deg); top:-6px; left:-6px;">
            <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
              style=" bottom:-6px; right: -6px;">
            <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
              style="transform: rotate(90deg);  bottom:-6px; left:-6px;">
            <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
              style="transform: rotate(270deg); top:-6px; right:-6px;">
          </div> 

          <div class="additionalInfo">
            <p class="playerBox" v-if="campaignData"> Player Count: {{ members.length - 1 }}</p>
            <p class="playerBox" v-else>Loading campaign details...</p>
            <p class="LvlBox" v-if="campaignData">Current Level: {{ level }}</p>
            <p class="LvlBox" v-else>Loading campaign details...</p>
          </div>
        </div>

        <!-- Description column -->
        <div class="descriptionBox">
           <div class=scroll>
            <div class="txt">
              <p v-if="campaignData">{{ description }}</p>
              <p v-else>Loading description...</p>
            </div>
          </div>

            <div class="quoteText">
              <p v-if="campaignData">{{ quote }}</p> 
              <p v-else >Loading image details...</p>
            </div>

        </div>

      <!-- Corners of the border box -->
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(180deg); top:-6px; left:-6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style=" bottom:-6px; right: -6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(90deg);  bottom:-6px; left:-6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(270deg); top:-6px; right:-6px;">
    </div>

    <div class="sessionsTable">
      
      <div class="sessionBox">
        <div class="sessionHeader"><h2>Your Sessions</h2></div> 
        <div class="sessionList">
          <div
            v-if="nextPlanned"
            class="sessionCard"
            :class="{ editableCard: isDM }"
            :title="isDM ? 'Click to edit this session' : ''"
            :tabindex="isDM ? 0 : -1"
            @click="isDM ? startEdit(nextPlanned) : null"
            @keydown.enter.prevent="isDM ? startEdit(nextPlanned) : null"
          >
            <div class=markerImg>
              <img alt=redMarker src="../assets/images/markers/redMarker.png">
            </div>
            <div class="sessionDate">{{ formatDateTime(nextPlanned.plannedSession, nextPlanned.plannedSessionTime) }}</div>
            <div class="location">
              <template v-if="hasDistinctLocationName(nextPlanned)">
                {{ getLocationName(nextPlanned) }}
                <p v-if="getLocationAddress(nextPlanned)" class="addressLine">{{ getLocationAddress(nextPlanned) }}</p>
              </template>
              <template v-else>
                {{ getLocationAddress(nextPlanned) || getLocationName(nextPlanned) }}
              </template>
            </div>
          </div>
          <div class="sessionCard"  > <!--v-if="futurePlanned"-->
            <div class=markerImg>
              <img alt=blueMarker src="../assets/images/markers/blueMarker.png">
            </div>
            <div class="sessionDate">
              <p> Help </p>
              <!-- {{ formatDateTime(futurePlanned.plannedSession, futurePlanned.plannedSessionTime) }} -->
            </div>
            <div class="location">
              <!-- {{ futurePlanned.plannedSessionLocation }} -->
              <p>Location</p>
            </div>
          </div>
          <!-- <div class="sessionCard" v-else>No session scheduled.</div> -->
        </div>
      </div>

      <!-- Leaflet Map -->
      <div class="mapBox">
        
        <!-- Corners of the border box -->
        <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
          style="transform: rotate(180deg); top:-6px; left:-6px;">
        <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
          style=" bottom:-6px; right: -6px;">
        <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
          style="transform: rotate(90deg);  bottom:-6px; left:-6px;">
        <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
          style="transform: rotate(270deg); top:-6px; right:-6px;">

        <!-- This will be for the campaign session location in relation to the map -->
        <l-map v-model:zoom="zoom" :center="center" :useGlobalLeaflet="false" style="z-index:0;">
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
        <l-marker v-if="showMapMarker" :lat-lng="markerPosition" :icon="DnDIcon">
  
          <l-popup>
            <div class="mapPopup">
              <div class="mapPopupTitle">{{ mapPopupTitle }}</div>
              <div v-if="mapPopupCoords" class="mapPopupCoords">{{ mapPopupCoords }}</div>
              <div v-if="mapPopupStatus" class="mapPopupStatus">{{ mapPopupStatus }}</div>
            </div>
          </l-popup>
        </l-marker>
        
        </l-map>

      </div>


      <!-- Corners of the border box -->
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(180deg); top:-6px; left:-6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style=" bottom:-6px; right: -6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(90deg);  bottom:-6px; left:-6px;">
      <img class="corner" src="../assets/images/borders/BorderCorner.png" alt="decorative border image" 
        style="transform: rotate(270deg); top:-6px; right:-6px;">
    </div>
    
    <div class="campaign-session">

      <div v-if="nextPlanned">

        <!-- DM CONTROLS -->
        <template v-if="isDM">
          <!-- <button class="parchmentButton" @click="connectZoom"> Connect Zoom</button>
          <button v-if="!zoomMeeting" class="parchmentButton" @click="createZoomMeeting">Create Zoom Meeting</button>
          <a v-if="zoomMeeting?.zoomStartUrl" class="parchmentButton" :href="zoomMeeting.zoomStartUrl" target="_blank">Start Zoom</a> -->
        </template>

        <!-- PLAYER CONTROLS -->
        <template v-else>
          <!-- <a v-if="zoomMeeting?.zoomJoinUrl" class="parchmentButton" :href="zoomMeeting.zoomJoinUrl" target="_blank">Join Zoom</a> -->
        </template>
      </div>


      <p v-if="scheduleError" class="error">{{ scheduleError }}</p>
    </div>
    <button class="parchmentButton" @click="openInviteThroughDiscordModal">Invite Through Discord</button>
    <button v-if="isDM" class="parchmentButton" @click="openScheduleModal">Schedule a Session</button>
    <button v-if="isDM" class="parchmentButton" @click='openEditInfoModal'>Edit Info</button>
    <!-- <button v-if="isDM" class="parchmentButton" @click='openRecapModal'>Recap</button>
    <button v-if="isDM" class="parchmentButton" @click='openRulesModal'>Rules</button> -->


    <!-- Schedule modal -->
    <div class="modal" v-if="showScheduleModal" :style="{ display: showScheduleModal ? 'flex' : 'none' }">
      <div class="popup">
        <div class="popuptxt">
          <h3>{{ editingScheduleId ? 'Edit Session' : 'Schedule a Session' }}</h3>
          <p>Select planned session date/time. Optionally set a future session.</p>
          <div class="picker-row">
            <div class="picker-block">
              <label>Planned Session</label>
              <div class="calendarContainer smallCal parchmentCal">
                <VDatePicker v-model="plannedDate" mode="date" expanded borderless />
              </div>
              <input class="timeInput" type="time" v-model="plannedTime" />
              <input class="locationInput" placeholder="Enter Location" name="sessionLocation" v-model="sessionLocation">
            </div>



            <div class="picker-block">
              <label>Future Session (optional)</label>
              <div class="calendarContainer smallCal parchmentCal">
                <VDatePicker v-model="futureDate" mode="date" expanded borderless />
              </div>
              <input class="timeInput" type="time" v-model="futureTime" />
              <input class="locationInput" placeholder="Enter Location" name="sessionLocation" v-model="sessionLocation">
            </div>
          </div>
          <p class="helper">After a planned session ends, we keep it visible for 2 hours. If a future session exists, it will become the next planned session.</p>
          <div class="modal-actions">
            <button class="popupButton" :disabled="submittingSchedule" @click="saveSchedule">{{ editingScheduleId ? 'Update' : 'Save' }}</button>
            <button class="popupButton" type="button" :disabled="submittingSchedule" @click="closeScheduleModal">Cancel</button>
          </div>
          <p v-if="modalError" class="error">{{ modalError }}</p>
        </div>
      </div>
    </div>

    <!-- Recap modal 
    <div class="modal" v-if="showRecapModal" :style="{ display: showRecapModal ? 'flex' : 'none' }">
      <div class="popup">
        <div class="popuptxt">
          <h3>Session Recap</h3>
          <p v-if="recapStatus" class="error">{{ recapStatus }}</p>
          <div v-if="recapLoading">Loading recap...</div>
          <div v-else>
            <textarea v-model="recapText" rows="8" ></textarea>
             <div class="modal-actions" >
              <button class="popupButton" :disabled="recapSaving" @click="handleSaveRecap">Save Recap</button>
              <button class="popupButton" type="button" :disabled="recapSaving" @click="closeRecapModal">Close</button>
            </div>
            <div class="fullRecap" v-if="recapFullText">
              <pre style="white-space:pre-wrap; margin:0;">{{ recapFullText }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    Rules modal 
    <div class="modal" v-if="showRulesModal" :style="{ display: showRulesModal ? 'flex' : 'none' }">
      <div class="popup">
        <div class="popuptxt">
          <h3>Rules</h3>
          <p v-if="rulesStatus" class="error">{{ rulesStatus }}</p>
          <div v-if="rulesLoading">Loading rules...</div>
          <div v-else>
            <textarea v-model="rulesText" rows="8" ></textarea>
            <div class="modal-actions" >
              <button class="popupButton" :disabled="rulesSaving" @click="handleSaveRules">Save Rules</button>
              <button class="popupButton" type="button" :disabled="rulesSaving" @click="closeRulesModal">Close</button>
            </div>
            <div class="fullRecap" v-if="rulesFullText">
              <pre style="white-space:pre-wrap; margin:0;">{{ rulesFullText }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>-->

    <!-- Edit Info modal -->
    <div class="modal" v-if="showEditInfoModal" :style="{ display: showEditInfoModal ? 'flex' : 'none' }">
      <div class="popup">
        <div class="popuptxt">
            <h3>Edit Campaign Info</h3>
            <p v-if="editInfoStatus" class="error">{{ editInfoStatus }}</p>
            <div v-if="editInfoLoading">Loading info...</div>
          <div v-else>

            <label for="campaignQuote">Quote</label><br></br>
           <input type="text" placeholder="Enter Quote/Motto/Phrase" name="campaignQuote" />
           <br>

           <label for="campaignLevel">Level</label><br>
           <input type="text" placeholder="0" name="campaignLevel"/>
           

            <!-- Campaign Photo Upload -->
            <label for="campaignImage"><br>Image</br></label>
            <br>

            <input 
              id="edit-file-upload"
              type="file" 
              name="campaignImage" 
              accept="image/*" 
              @change="previewImage"
              style="display:none"
            />
            <label for="edit-file-upload" id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" style="display:none;" />
                <span id="photoPreviewText">No Photo Selected</span>
            </label>

            <!-- Campaign Description -->
            <div class = "divider">
              <img src = "../assets/images/dividers/divider-left-short.png" />
              <label class="dividertxt" for="campaignBackstory"><br>Description</br></label>
              <img src = "../assets/images/dividers/divider-right-short.png" />
            </div>
            <textarea placeholder="Enter Description" name="campaignBackstory"></textarea>
            <br>

            <div class="modal-actions" >
              <!-- <button class="popupButton" :disabled="editInfoSaving" @click="handleSaveInfo">Save Changes</button> -->
              <button class="popupButton" type="button" @click="closeEditInfoModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

  <!-- Discord Invite Modal -->
<div class="modal" v-if="showInviteModal" :style="{ display: showInviteModal ? 'flex' : 'none' }">
  <div class="popup">
    <div class="popuptxt">
      <h3>Invite Through Discord</h3>
      <p>Select a server and channel to send the campaign invite to.</p>

      <div v-if="guilds.length === 0 && !inviteError">
        <p>Loading your servers...</p>
      </div>

      <div v-else>
        <!-- Server picker -->
        <label>Server</label>
        <select @change="onGuildSelect($event.target.value)" :value="selectedGuild">
          <option value="" disabled selected>Select a server</option>
          <option v-for="guild in guilds" :key="guild.id" :value="guild.id">
            {{ guild.name }}
          </option>
        </select>

        <!-- Channel picker — only shows after a server is selected -->
        <div v-if="selectedGuild">
          <label>Channel</label>
          <select v-if="channels.length" v-model="selectedChannel">
            <option value="" disabled selected>Select a channel</option>
            <option v-for="channel in channels" :key="channel.id" :value="channel.id">
              #{{ channel.name }}
            </option>
          </select>
          <p v-else>Loading channels...</p>
        </div>
      </div>

      <p v-if="inviteError" class="error">{{ inviteError }}</p>

      <div class="modal-actions">
        <button class="popupButton" :disabled="inviteSending || !selectedChannel" @click="sendInvite">
          {{ inviteSending ? 'Sending...' : 'Send Invite' }}
        </button>
        <button class="popupButton" type="button" @click="showInviteModal = false">Cancel</button>
      </div>
    </div>
  </div>
</div>
</template>





<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import '../assets/main.css';
import { fetchRecap, saveRecap, fetchRules, inviteThroughDiscord, requestOpenInviteModal } from '../lib/dataHelper.js';
import { jwtDecode } from "jwt-decode"
import { apiFetch } from '../lib/api'
import '../assets/PaperTextureCalm.png'
import redMarker from '../assets/images/markers/redMarker.png'

import CampaignMenu from './CampaignMenus.vue'
 
const token = localStorage.getItem("authToken")
const decoded = jwtDecode(token)
 
const userId = decoded.id 

 

defineProps(['id'])

const members = ref([])
const route = useRoute()
const router = useRouter()
const isDM = ref(false)
// Get the campaign ID from the URL (/campaign/:id)
const campaignId = route.params.id

// Define reactive state for campaign data
const campaignData = ref(null)
const schedules = ref([])
const scheduleError = ref('')
const showScheduleModal = ref(false)
const submittingSchedule = ref(false)
const modalError = ref('')
const editingScheduleId = ref(null)
const plannedDate = ref(new Date())
const plannedTime = ref('19:00')
const futureDate = ref(null)
const futureTime = ref('19:00')
const sessionLocation = ref('')
const description = ref('Welcome to the campaign! I hope you\'re ready for an adventure filled with mystery, excitement, and of course, plenty of dice rolls!')
const quote = ref('No Plan Survives the Players')
const level = ref('1')
const playerCount = ref('0')

// Recap modal state
// const showRecapModal = ref(false)
// const recapText = ref('')       // new entry input
// const recapFullText = ref('')   // accumulated text from PDF
// const recapPdfUrl = ref('')
// const recapStatus = ref('')
// const recapLoading = ref(false)
// const recapSaving = ref(false)


//rules modal state
// const rulesText = ref('')       // new entry input
// const rulesFullText = ref('')   // accumulated text from PDF
// const rulesPdfUrl = ref('')
// const rulesStatus = ref('')
// const rulesLoading = ref(false)
// const rulesSaving = ref(false)
// const showRulesModal = ref(false)

//edit info modal state
const editInfoStatus = ref('')
const editInfoLoading = ref(false)
const editInfoSaving = ref(false)
const showEditInfoModal = ref(false)

// Map state
const DEFAULT_MAP_CENTER = [51.505, -0.09]
const zoom = ref(10)
const center = ref([...DEFAULT_MAP_CENTER])
const markerPosition = ref([...DEFAULT_MAP_CENTER])
const showMapMarker = ref(false)
const mapPopupTitle = ref('Session location')
const mapPopupCoords = ref('')
const mapPopupStatus = ref('')

//zoom meeting state
// const zoomMeeting = ref(null)
// const zoomStatus = ref('')

//Campaign invite through discord state
const guilds = ref([])
const channels = ref([])
const selectedGuild = ref(null)
const selectedChannel = ref(null)
const showInviteModal = ref(false)
const inviteError = ref('')
const inviteSending = ref(false)

const sortedSchedules = computed(() =>
  [...schedules.value].sort((a, b) => {
    const ta = combineDateTime(a.plannedSession, a.plannedSessionTime)?.getTime() || 0
    const tb = combineDateTime(b.plannedSession, b.plannedSessionTime)?.getTime() || 0
    return ta - tb 
  })
)
const nextPlanned = computed(() =>
  sortedSchedules.value.find(s => combineDateTime(s.plannedSession, s.plannedSessionTime))
)

function formatDateTime(dateStr, timeStr) {
  const dt = combineDateTime(dateStr, timeStr)
  if (!dt) return '-'
  return dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function withinGraceWindow(dateObj) {
  if (!dateObj) return false
  const end = dateObj.getTime() + 2 * 60 * 60 * 1000
  return Date.now() <= end
}

function toLocalDateString(dateObj) {
  if (!dateObj) return null
  const d = new Date(dateObj)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function combineDateTime(dateInput, timeStr) {
  if (!dateInput) return null
  // Build in local time to avoid UTC backshift on date-only strings.
  let dateObj
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(Number)
    if (parts.length >= 3) {
      const [y, m, d] = parts
      dateObj = new Date(y, (m || 1) - 1, d || 1)
    } else {
      dateObj = new Date(dateInput)
    }
  } else {
    dateObj = new Date(dateInput)
  }
  if (Number.isNaN(dateObj.getTime())) return null

  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const day = dateObj.getDate()

  const time = timeStr || '00:00'
  const [h, m] = time.split(':').map(Number)
  return new Date(year, month, day, h || 0, m || 0, 0, 0)
}

function buildDateTimePayload(dateObj, timeStr) {
  if (!dateObj) return { date: null, time: null }
  return { date: toLocalDateString(dateObj), time: timeStr || '00:00' }
}

// function toTimeString(dateVal) {
//   const d = new Date(dateVal)
//   const hh = `${d.getHours()}`.padStart(2, '0')
//   const mm = `${d.getMinutes()}`.padStart(2, '0')
//   return `${hh}:${mm}`
// }

const DnDIcon = L.icon({
    iconUrl: redMarker,
    iconSize: [38, 54],
    iconAnchor: [18, 44.5],
    popupAnchor: [1, -40],
});


function getLocationName(session) {
  const raw = sanitizeLocationText((session?.plannedSessionLocation || '').trim())
  if (!raw) return '-'

  // Support values like "Venue | 123 Main St" or two-line "Venue\n123 Main St".
  if (raw.includes('|')) {
    return raw.split('|')[0].trim()
  }
  if (raw.includes('\n')) {
    return raw.split('\n')[0].trim()
  }
  return raw
}

function getLocationAddress(session) {
  const direct = (
    session?.plannedSessionAddress ||
    session?.sessionAddress ||
    session?.address ||
    ''
  ).trim()
  if (direct) return direct

  const raw = sanitizeLocationText((session?.plannedSessionLocation || '').trim())
  if (!raw) return ''

  if (raw.includes('|')) {
    const parts = raw.split('|').map(p => p.trim()).filter(Boolean)
    return parts.length > 1 ? parts.slice(1).join(' | ') : ''
  }
  if (raw.includes('\n')) {
    const parts = raw.split('\n').map(p => p.trim()).filter(Boolean)
    return parts.length > 1 ? parts.slice(1).join(', ') : ''
  }
  return raw
}

function hasDistinctLocationName(session) {
  const name = sanitizeLocationText((getLocationName(session) || '').trim())
  const address = sanitizeLocationText((getLocationAddress(session) || '').trim())

  if (!name || name === '-') return false
  if (!address) return true

  return name.toLowerCase() !== address.toLowerCase()
}

function sanitizeLocationText(locationText) {
  return (locationText || '').replace(/\s*\[osm:[NWR]\d+\]\s*$/i, '').trim()
}

function buildCoordinateLabel(lat, lon) {
  const latNum = Number(lat)
  const lonNum = Number(lon)
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return ''
  return `${latNum.toFixed(5)}, ${lonNum.toFixed(5)}`
}

async function geocodeWithNominatim(rawLocation) {
  const location = sanitizeLocationText((rawLocation || '').trim())
  if (!location) return null

  // Fallback: text search for place/address.
  const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`
  const searchRes = await fetch(searchUrl)
  if (!searchRes.ok) throw new Error('Nominatim search request failed')
  const searchJson = await searchRes.json()
  const row = Array.isArray(searchJson) ? searchJson[0] : null
  if (!row?.lat || !row?.lon) return null

  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    label: row.display_name || location
  }
}

async function refreshMapLocation(session) {
  const address = getLocationAddress(session)
  const locationForLookup = address

  if (!locationForLookup) {
    center.value = [...DEFAULT_MAP_CENTER]
    markerPosition.value = [...DEFAULT_MAP_CENTER]
    showMapMarker.value = false
    mapPopupTitle.value = 'Session location'
    mapPopupCoords.value = ''
    mapPopupStatus.value = 'Session address not set'
    return
  }

  try {
    const resolved = await geocodeWithNominatim(locationForLookup)
    if (!resolved) {
      showMapMarker.value = false
      mapPopupTitle.value = locationForLookup
      mapPopupCoords.value = ''
      mapPopupStatus.value = 'Coordinates not found'
      return
    }

    const coords = [resolved.lat, resolved.lon]
    center.value = coords
    markerPosition.value = coords
    showMapMarker.value = true
    mapPopupTitle.value = resolved.label
    mapPopupCoords.value = buildCoordinateLabel(resolved.lat, resolved.lon)
    mapPopupStatus.value = ''
  } catch (err) {
    console.error('Nominatim geocoding failed:', err)
    showMapMarker.value = false
    mapPopupTitle.value = locationForLookup
    mapPopupCoords.value = ''
    mapPopupStatus.value = 'Lookup failed'
  }
}

async function openEditInfoModal() {
  showEditInfoModal.value = true
  editInfoLoading.value = false
  editInfoStatus.value = ''
}

// When modal opens, fetch their mutual servers
async function openInviteThroughDiscordModal() {
  inviteError.value = ''
  guilds.value = []
  channels.value = []
  selectedGuild.value = null
  selectedChannel.value = null
  showInviteModal.value = true

  try {
    const res = await apiFetch('/bot/guilds', {
      headers: { Authorization: token }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch servers')
    guilds.value = data.guilds
  } catch (err) {
    inviteError.value = err.message || 'Could not load your Discord servers.'
  }
}

function closeRecapModal() {
  showRecapModal.value = false
  recapSaving.value = false
  recapStatus.value = ''
}

function closeRulesModal() {
  showRulesModal.value = false
  rulesSaving.value = false
  rulesStatus.value = ''
}

function closeEditInfoModal() {
  showEditInfoModal.value = false
  editInfoSaving.value = false
  editInfoStatus.value = ''
}

 async function onGuildSelect(guildId) {
  selectedGuild.value = guildId
  selectedChannel.value = null
  channels.value = []

  try {
    const res = await apiFetch(`/bot/guilds/${guildId}/channels`, {
      headers: { Authorization: token }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch channels')
    channels.value = data.channels
  } catch (err) {
    inviteError.value = err.message || 'Could not load channels.'
  }
}

// When they confirm, send the invite
async function sendInvite() {
  if (!selectedChannel.value) {
    inviteError.value = 'Please select a channel.'
    return
  }
  inviteSending.value = true
  inviteError.value = ''

  try {
    const res = await apiFetch('/bot/send-campaign-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        channelId: selectedChannel.value,
        campaignId: campaignId,
        campaignName: campaignData.value?.title || 'Campaign'
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to send invite')
    showInviteModal.value = false
  } catch (err) {
    inviteError.value = err.message || 'Failed to send invite.'
  } finally {
    inviteSending.value = false
  }
}

async function handleSaveRecap() {
  if (!recapText.value || !recapText.value.trim()) {
    recapStatus.value = 'Please enter recap text to append.'
    return
  }

  recapSaving.value = true
  recapStatus.value = ''
  const appendText = recapFullText.value
    ? `${recapFullText.value}\n${recapText.value}`
    : recapText.value

  const res = await saveRecap(campaignId, userId, appendText)
  if (!res) {
    recapStatus.value = 'Failed to save recap.'
    recapSaving.value = false
    return
  }
  if (res.valid === false) {
    recapStatus.value = res.message || 'Failed to save recap.'
    recapSaving.value = false
    return
  }

  // Rebuild preview URL
  let blobUrl = ''
  if (typeof res.pdfBase64 === 'string' && res.pdfBase64.length) {
    const bytes = Uint8Array.from(atob(res.pdfBase64), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'application/pdf' })
    blobUrl = URL.createObjectURL(blob)
  } else if (res.pdfBytes && (Array.isArray(res.pdfBytes) || Array.isArray(res.pdfBytes?.data))) {
    const bufferData = res.pdfBytes?.data || res.pdfBytes
    const bytes = new Uint8Array(bufferData)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    blobUrl = URL.createObjectURL(blob)
  }
  recapPdfUrl.value = blobUrl
  recapFullText.value = appendText
  recapText.value = '' // clear entry box after append
  localStorage.setItem(`recap:${campaignId}`, appendText)
  recapSaving.value = false
}

//saving pdf for rules
async function handleSaveRules() {
  if (!rulesText.value || !rulesText.value.trim()) {
    rulesStatus.value = 'Please enter rules text to append.'
    return
  }

  rulesSaving.value = true
  rulesStatus.value = ''
  const appendText = rulesFullText.value
    ? `${rulesFullText.value}\n${rulesText.value}`
    : rulesText.value

  const res = await saveRules(campaignId, userId, appendText)
  if (!res) {
    rulesStatus.value = 'Failed to save rules.'
    rulesSaving.value = false
    return
  }
  if (res.valid === false) {
    rulesStatus.value = res.message || 'Failed to save rules.'
    rulesSaving.value = false
    return
  }

  // Rebuild preview URL
  let blobUrl = ''
  if (typeof res.pdfBase64 === 'string' && res.pdfBase64.length) {
    const bytes = Uint8Array.from(atob(res.pdfBase64), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'application/pdf' })
    blobUrl = URL.createObjectURL(blob)
  } else if (res.pdfBytes && (Array.isArray(res.pdfBytes) || Array.isArray(res.pdfBytes?.data))) {
    const bufferData = res.pdfBytes?.data || res.pdfBytes
    const bytes = new Uint8Array(bufferData)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    blobUrl = URL.createObjectURL(blob)
  }
  rulesPdfUrl.value = blobUrl
  rulesFullText.value = appendText
  rulesText.value = '' // clear entry box after append
  localStorage.setItem(`rules:${campaignId}`, appendText)
  rulesSaving.value = false
}

function openScheduleModal() {
  editingScheduleId.value = null
  plannedDate.value = new Date()
  plannedTime.value = '19:00'
  futureDate.value = null
  futureTime.value = '19:00'
  sessionLocation.value = ''
  modalError.value = ''
  showScheduleModal.value = true
}

function closeScheduleModal() {
  showScheduleModal.value = false
  submittingSchedule.value = false
  modalError.value = ''
}

function startEdit(session) {
  editingScheduleId.value = session.id
  plannedDate.value = session.plannedSession ? new Date(session.plannedSession) : new Date()
  plannedTime.value = session.plannedSessionTime || '19:00'
  futureDate.value = session.futureSession ? new Date(session.futureSession) : null
  futureTime.value = session.futureSessionTime || '19:00'
  sessionLocation.value = sanitizeLocationText(session.plannedSessionLocation || '')
  modalError.value = ''
  showScheduleModal.value = true
}

async function saveSchedule() {
  if (!plannedDate.value) {
    modalError.value = 'Please choose a planned session date/time.'
    return
  }
  modalError.value = ''
  const plannedDt = combineDateTime(plannedDate.value, plannedTime.value)
  if (!plannedDt || plannedDt.getTime() < Date.now()) {
    modalError.value = 'Planned session must be set in the future.'
    return
  }
  if (!sessionLocation.value || !sessionLocation.value.trim()) {
    modalError.value = 'Please enter a location for the session.'
    return
  }
  if (futureDate.value) {
    const futureDt = combineDateTime(futureDate.value, futureTime.value)
    if (!futureDt || futureDt.getTime() < Date.now()) {
      modalError.value = 'Future session must be set in the future.'
      return
    }
  }
  submittingSchedule.value = true
  try {
    const planned = buildDateTimePayload(plannedDate.value, plannedTime.value)
    const future = futureDate.value ? buildDateTimePayload(futureDate.value, futureTime.value) : { date: null, time: null }
    const body = {
      plannedSession: planned.date,
      plannedSessionTime: planned.time,
      sessionLocation: sessionLocation.value.trim(),
      futureSession: future.date,
      futureSessionTime: future.time,
    }
    const url = editingScheduleId.value
      ? `/data/campaign/${campaignId}/schedule/${editingScheduleId.value}`
      : `/data/campaign/${campaignId}/schedule`
    const method = editingScheduleId.value ? 'PATCH' : 'POST'
    const res = await apiFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (res.status === 404) throw new Error('Schedule endpoint not found. Please add /data/campaign/:id/schedule on the backend.')
    if (!res.ok || !json.valid) throw new Error(json.message || 'Failed to save schedule.')
    await loadSchedules()
    closeScheduleModal()
  } catch (err) {
    console.error(err)
    modalError.value = err.message || 'Failed to save schedule.'
  } finally {
    submittingSchedule.value = false
  }
}

async function deleteSchedule(id) {
  if (!confirm('Delete this session?')) return
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/schedule/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    const json = await res.json()
    if (!res.ok || !json.valid) throw new Error(json.message || 'Failed to delete schedule.')
    await loadSchedules()
  } catch (err) {
    console.error(err)
    alert(err.message || 'Failed to delete schedule.')
  }
}

async function loadSchedules() {
  scheduleError.value = ''
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/schedule`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    const json = await res.json()
    if (res.status === 404) throw new Error('Schedule endpoint not found. Please add /data/campaign/:id/schedule on the backend.')
    if (!res.ok || !json.valid) throw new Error(json.message || 'Failed to load schedule.')
    const raw = json.schedule || []
    let cleaned = raw
    // Fallback: if nothing returned for some reason, try /schedule/my and filter to this campaign
    if (!cleaned.length) {
      const fallback = await apiFetch(`/data/schedule/my`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      }).then(r => r.ok ? r.json() : { schedule: [] })
      cleaned = (fallback.schedule || []).filter(s => s.campaignId === campaignId)
    }
    schedules.value = await normalizeScheduleList(cleaned)
  } catch (err) {
    console.error(err)
    scheduleError.value = err.message || 'Failed to load schedule.'
  }
}

async function normalizeScheduleList(list) {
  const result = []
  for (const item of list) {
    if (!item) continue
    const planned = combineDateTime(item.plannedSession, item.plannedSessionTime)
    const future = combineDateTime(item.futureSession, item.futureSessionTime)
    const pastGrace = planned && !withinGraceWindow(planned)

    // promote future to planned if planned is expired
    if (pastGrace && future) {
      try {
        await apiFetch(`/data/campaign/${campaignId}/schedule/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            plannedSession: item.futureSession,
            plannedSessionTime: item.futureSessionTime,
            futureSession: null,
            futureSessionTime: null
          })
        }).then(r => {
          if (r.status === 404) throw new Error('Schedule endpoint missing')
          return r
        })
        result.push({
          ...item,
          plannedSession: item.futureSession,
          plannedSessionTime: item.futureSessionTime,
          futureSession: null,
          futureSessionTime: null
        })
        continue
      } catch (err) {
        console.error('Failed to promote future session:', err)
      }
    }

    // clear expired planned if no future
    if (pastGrace && !future) {
      result.push({ ...item, plannedSession: null })
      continue
    }

    result.push(item)
  }
  return result
}

watch(
  () => `${nextPlanned.value?.id || ''}|${getLocationAddress(nextPlanned.value)}`,
  async () => {
    await refreshMapLocation(nextPlanned.value)
  },
  { immediate: true }
)

// Fetch campaign info when page loads
onMounted(async () => {
  try {
    const response = await apiFetch(`/data/campaign/${campaignId}`)
    const result = await response.json()
    if (result.valid) {
      campaignData.value = result.campaign
      console.log('Campaign data loaded:', result.campaign)
    } else {
      console.error('Failed to load campaign:', result.message)
    }
  } catch (err) {
    console.error('Error fetching campaign:', err)
  }
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const result = await res.json()

    if (result.valid) {
      members.value = result.members

      // Determine if CURRENT USER is DM
      const currentUserId = JSON.parse(atob(localStorage.getItem("authToken").split(".")[1])).id
      const me = result.members.find(m => m.userId === currentUserId)
      isDM.value = me?.role === "DM"
    } else {
      members.value = []
    }
  } catch (e) {
    console.error("Failed to load campaign members:", e)
    members.value = []
  }
  await loadSchedules()
})

function copyText(button) {
  const text = button.innerText;
  navigator.clipboard.writeText(text);

  const original = button.innerText;
  button.innerText = "Copied!";
  
  setTimeout(() => {
    button.innerText = original;
  }, 1500);
}

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

.descriptionBox p {
  font-size: 0.9rem;
}

h2{
  margin: 0;
  font-size: 1.8rem;
}

.corner {
  width: 14px;
  height: 14px;
  position: absolute;
  z-index: 10;
}

textarea {
  width: 95%;
  height: 200px;
  margin: 10px 0;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  resize: vertical;
  background-color: transparent;
  border: var(--vt-c-navy) 2px solid;
  border-radius: 8px;
}

.fullRecap{
  margin-top:12px;
  text-align:left;
  background: var(--vt-c-warm-white);
  padding:8px;
  border-radius:6px;
  color:var(--vt-c-dark-brown);
}

.basicInfo {
  position: relative;
  border: 2px solid var(--vt-c-bronze);
  display: grid;
  grid-template-columns: 1.25fr 2fr;
  grid-template-rows: auto 1fr;
  width: 92%;
  height: 350px;
  margin-bottom: 5rem;

  box-shadow: 0 0px 20px #87644290;

  z-index: 0;
}

.basicInfo::before, .sessionsTable::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('../assets/PaperTextureCalm.png');
  background-size: 1000px;
  opacity: 1;
  /* Fix color + density */
  filter:
    brightness(0.18)
    saturate(0.8)
    blur(0.2px);
  pointer-events: none;
  z-index: -1;
}

.basicInfo::after, .sessionsTable::after {
  content: "";
  position: absolute;
  inset: 0;

  background: radial-gradient(
    circle,
    transparent 35%,
    rgba(0, 0, 0, 0.779) 100%
  );

  pointer-events: none;
  z-index: -1;
}

.campaignDetails {
  grid-column: 1/3;
  display: flex;
  align-items: center;
  justify-content:space-between;
  padding: 8px 12px;
  border-bottom: 1.5px solid var(--vt-c-bronze); 
}

.joinLine{
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.joinCode {
  all: unset;
  cursor: pointer;

  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  padding: 3px 10px;
  margin: 0px;
  display: inline-block;
  background: radial-gradient(circle at center, #2d2d44 60%, /* center */ #1f1f30 100% /* outside */);
  color: var(--vt-c-red);
  box-shadow: 0 0px 10px #87424290;
  border-radius: 7px;
}

.joinCode:focus-visible {
  outline: auto;
}

.imageBox {
  grid-column: 1;
  max-width: 100%;
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 8px;
  gap: 5px;
  justify-content: space between;
}

.campaignImageBox{
  grid-row: 1;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  min-width: 0;
  min-height: 0;

  background: radial-gradient(
    circle,
    rgba(0,0,0,0.2),
    rgba(0,0,0,0.7)
  );

  .campaignImage{
    object-fit: contain;
    width: 100%;
    height: 100%;
    border: 2px solid var(--vt-c-bronze);
  }
}

.additionalInfo {
  grid-row: 2;
  display: flex;
  flex: 1;
  height: 100%;
  gap: 8px;

}

.playerBox, .LvlBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 70%;
  padding: 8px 6px;
  margin: auto;
  text-align: center;
  font-size: 0.7rem;
  background: linear-gradient(145deg, rgba(30, 25, 15, 0.95), rgba(20, 17, 10, 0.98));
  border: 1px solid #5e4834b7;
  border-radius: 10px;
}

.descriptionBox {
  grid-column: 2;
  position: relative;
  display: flex;
  padding: 0px;
  margin: auto;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  height: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
}

.scroll{
  background: transparent url('../assets/ScrollHorizontal.png') no-repeat center/contain;
  background-size: 90% 96%;
  aspect-ratio: 2/1;
  color: var(--vt-c-dark-brown);
  height: auto;
  width: 100%;
  /* max-width: 535px; */
  max-height:100%;
  text-align: center;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index:0;

    .txt {
      display: flex;
      align-items: center;
      max-width: 70%; /* confines it to the “paper” area */
      box-sizing: border-box;
      overflow-y: auto;
      overflow-x: hidden;
      padding-left: 0;
      padding-right: 0;
      height: 65%;
      min-height: 0;
      margin: 0px auto;
      margin-bottom: 18px;
      z-index: 1;

      p {
        max-height: 100%;
      }
    }
  }

.quoteText {
  display: inline-flex;
  container-type: inline-size;
  position: absolute;
  bottom: 8%;
  left: 20%;
  padding: 8px 16px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #8c6b1c;
  width: 60%;
  height: 16%;
  min-height: 30px;
  z-index: 1;

  background: linear-gradient(
    145deg,
    #f7e7a3 0%,
    #e4c76a 30%,
    #c9a645 50%,
    #a67c1f 70%,
    #e8d18a 100%
  );

  box-shadow:
    inset 0 2px 3px rgba(255,255,255,0.6),
    inset 0 -3px 5px rgba(0,0,0,0.25),
    0 4px 10px rgba(0,0,0,0.35);

  text-shadow:
    0 1px 0 rgba(255,255,255,0.6),
    0 -1px 0 rgba(0,0,0,0.3);

  p{
    font-size: clamp(6px, 5cqw, 12px);;
    color: #4b3200;
    line-height: 1.2;
  }
}

.sessionsTable{
  position: relative;
  border: 2px solid var(--vt-c-bronze);
  display: grid;
  align-items: center;
  grid-template-columns: 1.5fr 2fr;
  width: 92%;
  height: 350px;
  overflow: hidden;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  box-shadow: 0 0px 20px #87644290;
  z-index: 0;
}

.sessionBox{
  display: grid;
  grid-template-rows: 0.5fr 2fr;
  padding: 10px;
  overflow: hidden;
  height: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  width: 100%;
  gap: 10px;
  border-right: 1px solid var(--vt-c-bronze);
}

.sessionHeader {
  display: flex;
  margin: auto;
  padding-top: 15px;
}

.sessionList{
  margin: auto;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  gap: 8px;
  height: 100%;
  max-width: 100%;
  width: 100%;
  min-height: 0;
  min-width: 0;
}

/* For the leaflet API map */
.mapBox {
  margin: 20px;
  height: 80%; /* Map container must have a defined height */
  width: calc(100%-40px);
  /* z-index: 0; */
  position: relative;
  overflow: hidden;
  border: 2px solid var(--vt-c-bronze);
}

.empty-state {
  margin-top: 8px;
  opacity: 0.8;
}

.error {
  color: #7c2f2f;
  margin-top: 8px;
}

.popup.wide {
  aspect-ratio: 4/1;
  width: 800px;
  height: 875px; 
}

.picker-block label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.timeInput {
  margin-top: 8px;
  color: var(--vt-c-golden);
  width: 90%;
}

.smallCal {
  margin-bottom: 8px;
}


/* Parchment styling for inline calendars */
:deep(.parchmentCal) {
  background-color: transparent !important;
  border: 2px solid var(--vt-c-dark-brown) !important;
  border: none !important;
  background-image: none !important;
  box-shadow: inset 6px 6px 15px rgba(0, 0, 0, 0.2), inset -6px -6px 15px rgba(0,0,0, 0.5) !important;
  border-radius: 10px;
  padding: 6px;
  margin-left: 6px!important;
}

:deep(.parchmentCal .vc-container),
:deep(.parchmentCal .vc-pane),
:deep(.parchmentCal .vc-content),
:deep(.parchmentCal .vc-weeks),
:deep(.parchmentCal .vc-grid) {
  background-color: transparent;
}

.campaign-session{
  margin-top: 2rem;
  color: var(--vt-c-warm-white);

  h3{
    color: var(--vt-c-warm-white);
  }
}

.sessionCard {
  display: grid;
  grid-template-columns: 50px auto;
  grid-template-rows: auto auto;
  padding: 8px;
  margin: auto;
  width: 100%;
  height: 50%;
  align-items: center;
  font-size: 0.9rem;
  overflow: hidden;
  border-top: 1px solid var(--vt-c-bronze);
}

.markerImg {
  grid-column: 1;
  grid-row: 1/span 2;
}

.markerImg img {
  aspect-ratio: 2/3;
  height: 60px;
}

.sessionDate {
  grid-column: 2;
  grid-row: 1;
}

.location {
  grid-column: 2;
  grid-row: 2;
}

.sessionCard.sessionDate {
    font-size: 1.1rem;
  }

.sessionList > div:nth-child(1):hover {
  color: var(--vt-c-red);
}

.sessionList > div:nth-child(2):hover {
  color: var(--vt-c-blue);
}

.editableCard {
  cursor: pointer;
}

.editableCard:focus-visible {
  outline: 2px solid var(--vt-c-golden);
  outline-offset: 2px;
}

.location {
  margin-top: 2px;
  width: 100%;
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
}

.addressLine {
  margin-top: 2px;
  font-size: 0.8rem;
  opacity: 0.9;
}

.locationValue {
  font-weight: 700;
}

.addressLine {
  margin-top: 2px;
  font-size: 0.8rem;
  opacity: 0.9;
}

.mapPopupTitle {
  font-weight: 700;
}

.mapPopupCoords {
  font-size: 0.85rem;
  margin-top: 2px;
}

.mapPopupStatus {
  margin-top: 2px;
  font-size: 0.8rem;
  opacity: 0.85;
}

.locationValue {
  font-weight: 700;
}

.addressLine {
  margin-top: 2px;
  font-size: 0.8rem;
  opacity: 0.9;
}

.mapPopupTitle {
  font-weight: 700;
}

.mapPopupCoords {
  font-size: 0.85rem;
  margin-top: 2px;
}

.mapPopupStatus {
  margin-top: 2px;
  font-size: 0.8rem;
  opacity: 0.85;
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

.divider{
  display: inline-flex;
  margin-top: 3vh;
  margin-bottom: 3vh;
  align-items: flex-end;
  justify-content: center;

  .dividertxt{
    align-items: flex-start;
    margin-left: 35px;
    margin-right: 35px;
  }
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

@media (max-width: 950px) {
  
  .txt {
    p {
      font-size: 0.8rem;
    }
  }
  .quoteText {
    bottom: 12%;
  }
}

@media (max-width: 875px){
  .campaignTitle {
    h2{
      font-size: 1.25rem;
    }
  }

  .txt {
    margin-top: 9px !important;

    p {
      font-size: 0.7rem;
    }
  }

  .playerBox, .LvlBox {
    font-size: 0.6rem;
  }

   .quoteText {
    bottom: 14%;
  }

  .sessionHeader {
    h2{
      font-size: 1.25rem;
    }
  }

  .sessionCard {
    font-size: 0.85rem !important;
    min-height: 120px;
    p{
      font-size: 0.75rem;
    }
  }

  .parchmentButton {
    width: 100%;
  }
}

@media (max-width: 800px) {
    .sessionCard {
    min-height: 100px;
    font-size: 0.75rem !important;

    .sessionDate {
      font-size: 0.9rem;
    }

  }
}

@media (max-width: 700px) {
  .basicInfo{
    display: flex;
    flex-direction: column;
    height: 90%;
  }

  .campaignDetails {
    display: flex;
    flex-direction: column;
  }

  .joinLine {

    margin-bottom: 5px;
    p {
      font-size: 0.7rem
    }
  }

  .joinCode {
    font-size: 0.75rem;
  }

  .txt {
    margin-bottom: 8% !important;
    p {
      font-size: 0.65rem;
    }
  }

  .playerBox, .LvlBox {
    font-size: 0.45rem;
  }

  .quoteText {
    position: absolute;
    padding: 4px 8px;
    width: 60%;
    bottom: 4%;
    left: 20%;
  }

  .sessionsTable {
    display: flex;
    flex-direction: column;
    height: 600px;
  }

  .sessionBox {
    border: none;
  }

  .sessionCard {
    font-size: 0.80rem !important;

  }

  .mapBox {
    width: 90%;
    height: 100%;
  }

  .divider {
    img {
      width: 20%;
    }
    .dividertxt {
        margin-left: 20px;
        margin-right: 20px;
      }
  }

}

@media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}

@media (max-width: 440px) {
  .campaignTitle {
    h2 {
      font-size: 0.8rem !important;
    }
  }

  .joinLine {
    p {
      font-size: 0.5rem;
    }
  }

  .txt {
    p {
      font-size: 0.55rem;
    }
  }

  .popuptxt {
    input, textarea {
      font-size: 0.75rem;
    }
  }

  .sessionCard {
    font-size: 0.65rem !important;

    .sessionDate {
      font-size: 0.8rem;
    }

  }
}

@media (max-width: 370px) {

  .scroll {
    margin-bottom: 1rem;
  }
  .txt {
    height: 68% !important;
    p{ 
      font-size: 0.5rem;
    }
    
  }

  .quoteText {
    bottom: 4px;
    min-height: 30px;
  }

  .playerBox, .LvlBox {
    font-size: 0.5rem;
  }

}
</style>