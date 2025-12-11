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
    <h1>Welcome to Your Campaign!</h1>
      <br>
    <div v-if="campaignData" class="campaign-details">
      <h2>{{ campaignData.title }}</h2>
      <p><strong>Join Code:</strong></p>
      <div class="join-code">{{ campaignData.joinCode }}</div>
      <p>Share this code with your players so they can join.</p>
      <button class="parchmentButton" @click='openRecapModal'>Recap</button>
      <button class="parchmentButton" @click='openRulesModal'>Rules</button>
    </div>

    <p v-else>Loading campaign details...</p>

    <p>
      This is your unique campaign page.  
      Here you can display campaign rules, maps, or characters.
    </p>
    <div class="campaign-session">
      <h3><strong>Your Sessions</strong></h3>
      <div class="upcoming">
        <strong>Next Session: </strong>
        <span v-if="nextPlanned">
          {{ formatDateTime(nextPlanned.plannedSession, nextPlanned.plannedSessionTime) }}
        </span>
        <span v-else>No session scheduled yet.</span>
      </div>
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
<button v-if="isDM" class="parchmentButton" @click="openScheduleModal()">Schedule a Session</button>

      <p v-if="scheduleError" class="error">{{ scheduleError }}</p>
    </div>
    <!-- Schedule modal -->
    <div class="modal" v-if="showScheduleModal" :style="{ display: showScheduleModal ? 'flex' : 'none' }">
      <div class="popup wide">
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
            </div>
            <div class="picker-block">
              <label>Future Session (optional)</label>
              <div class="calendarContainer smallCal parchmentCal">
                <VDatePicker v-model="futureDate" mode="date" expanded borderless />
              </div>
              <input class="timeInput" type="time" v-model="futureTime" />
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
    <!-- Recap modal -->
    <div class="modal" v-if="showRecapModal" :style="{ display: showRecapModal ? 'flex' : 'none' }">
      <div class="popup wide">
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
          <!-- <div v-if="recapPdfUrl" style="height:320px; margin-top:12px;">
            <iframe :src="recapPdfUrl" style="width:100%; height:100%; border:1px solid #ccc; border-radius:8px;"></iframe>
          </div> -->
          <div class="fullRecap" v-if="recapFullText">
            <pre style="white-space:pre-wrap; margin:0;">{{ recapFullText }}</pre>
          </div>
        </div>
      </div>
    </div>
    </div>

        <!-- Rules modal -->
    <div class="modal" v-if="showRulesModal" :style="{ display: showRulesModal ? 'flex' : 'none' }">
      <div class="popup wide">
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
          <!-- <div v-if="rulesPdfUrl" style="height:320px; margin-top:12px;">
            <iframe :src="rulesPdfUrl" style="width:100%; height:100%; border:1px solid #ccc; border-radius:8px;"></iframe>
          </div> -->
          <div class="fullRecap" v-if="rulesFullText">
            <pre style="white-space:pre-wrap; margin:0;">{{ rulesFullText }}</pre>
          </div>
        </div>
      </div>
    </div>
    </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { fetchRecap, saveRecap, fetchRules, saveRules } from '../lib/dataHelper.js';
import { jwtDecode } from "jwt-decode"
import { apiFetch } from '../lib/api'
 
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

// Recap modal state
const showRecapModal = ref(false)
const recapText = ref('')       // new entry input
const recapFullText = ref('')   // accumulated text from PDF
const recapPdfUrl = ref('')
const recapStatus = ref('')
const recapLoading = ref(false)
const recapSaving = ref(false)
const showRulesModal = ref(false)

//rules modal state
const rulesText = ref('')       // new entry input
const rulesFullText = ref('')   // accumulated text from PDF
const rulesPdfUrl = ref('')
const rulesStatus = ref('')
const rulesLoading = ref(false)
const rulesSaving = ref(false)

//zoom meeting state
const zoomMeeting = ref(null)
const zoomStatus = ref('')

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

function toTimeString(dateVal) {
  const d = new Date(dateVal)
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${hh}:${mm}`
}

async function openRecapModal() {
  showRecapModal.value = true
  recapLoading.value = true
  recapStatus.value = ''
  recapPdfUrl.value = ''
  recapText.value = '' // fresh entry each time
  recapFullText.value = localStorage.getItem(`recap:${campaignId}`) || ''

  const res = await fetchRules(campaignId)
  if (res && res.valid !== false) {
    const serverText = res.recapText || ''
    // Prefer server text if present; otherwise keep local cached text
    recapFullText.value = serverText || recapFullText.value

    // Prefer base64 if present
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
  } else {
    recapStatus.value = res?.message || 'Failed to load recap.'
  }
  recapLoading.value = false
}

async function openRulesModal() {
  showRulesModal.value = true
  rulesLoading.value = true
  rulesStatus.value = ''
  rulesPdfUrl.value = ''
  rulesText.value = '' // fresh entry each time
  rulesFullText.value = localStorage.getItem(`rules:${campaignId}`) || ''

  const res = await fetchRules(campaignId)
  if (res && res.valid !== false) {
    const serverText = res.rulesText || ''
    // Prefer server text if present; otherwise keep local cached text
    rulesFullText.value = serverText || rulesFullText.value

    // Prefer base64 if present
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
  } else {
    rulesStatus.value = res?.message || 'Failed to load rules.'
  }
  rulesLoading.value = false
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
    recapStatus.value = 'Please enter rules text to append.'
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

async function connectZoom() {
  try {
    const res = await apiFetch(`/data/zoom/connect`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const json = await res.json()
    if (!json.valid || !json.url) {
      alert('Failed to connect Zoom.')
      return
    }

    // Redirect to Zoom OAuth
    window.location.href = json.url
  } catch (err) {
    console.error(err)
    alert('Zoom connection failed.')
  }
}

async function createZoomMeeting() {
  try {
    if (!nextPlanned.value) {
      alert('No planned session to attach Zoom to.')
      return
    }

    const res = await apiFetch(
      `/data/campaign/${campaignId}/schedule/${nextPlanned.value.id}/zoom/create`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const json = await res.json()

    if (!res.ok || !json.valid) {
      throw new Error(json.message || 'Failed to create Zoom meeting.')
    }

    zoomMeeting.value = json.zoomMeeting
  } catch (err) {
    console.error(err)
    alert(err.message || 'Zoom meeting creation failed.')
  }
}

watch(nextPlanned, async (newVal) => {
  if (!newVal) {
    zoomMeeting.value = null
    return
  }

  try {
    const res = await apiFetch(`/data/zoom/by-schedule/${newVal.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const json = await res.json()
    if (json?.zoomMeeting) {
      zoomMeeting.value = json.zoomMeeting
    } else {
      zoomMeeting.value = null
    }
  } catch (err) {
    console.warn('No Zoom meeting found yet.')
    zoomMeeting.value = null
  }
})

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
</script>
<style scoped>
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
/* style="width:100%; margin-top:8px; border-radius:8px; padding:8px;" */
.fullRecap{
  margin-top:12px;
  text-align:left;
  background: var(--vt-c-warm-white);
  padding:8px;
  border-radius:6px;
  color:var(--vt-c-dark-brown);
}

.generated-code {
  padding: 6px 10px;
  background: #f3f3f3;
  border-radius: 4px;
  font-weight: 600;
  font-family:'Times New Roman', Times, serif;
  max-width: 90%;
  color: var(--vt-c-black);
  word-break: break-all;
  margin-top: 8px;
}

.campaign-code {
  background: #2d2d44;
  color: var(--vt-c-red);
  font-size: 1.5rem;
  font-weight: bold;
  font-family:'Times New Roman', Times, serif;
  padding: 10px 20px;
  border-radius: 8px;
  margin: 1rem 0;
}

.join-code {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 12px 24px;
  background: #2d2d44;
  color: var(--vt-c-red);
  border-radius: 10px;
  display: inline-block;
  margin: 0.75rem 0;
}

.schedule-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.schedule-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d2c2a6;
  background: #f4ecd8;
  color: #2f2416;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-dates {
  display: grid;
  gap: 4px;
}

.schedule-actions {
  display: flex;
  gap: 8px;
}

.parchmentButton.small {
  padding: 6px 10px;
  font-size: 0.85rem;
}

.parchmentButton.danger {
  background: #7c2f2f;
  color: #fff;
}

.empty-state {
  margin-top: 8px;
  opacity: 0.8;
}

.error {
  color: #7c2f2f;
  margin-top: 8px;
}

/*.popup.wide {
  aspect-ratio: 4/1;
  width: 800px;
  height: 875px; 
}*/

.picker-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 12px 0;
}

.picker-block label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.helper {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 6px 0 10px;
}

.timeInput {
  margin-top: 8px;
  color: var(--vt-c-golden);
  width: 90%;
}

.smallCal {
  margin-bottom: 8px;
}

.upcoming {
  margin: 8px 0;
}

/* Parchment styling for inline calendars */
:deep(.parchmentCal) {
  /* background-color: var(--vt-c-golden) !important; */
  /* background-image: url('../assets/PaperTextureCalm.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat; */
  background-color: transparent !important;
  border: 2px solid var(--vt-c-dark-brown) !important;
  border: none !important;
  background-image: none !important;
  box-shadow: inset 6px 6px 15px rgba(0, 0, 0, 0.2), inset -6px -6px 15px rgba(0,0,0, 0.5) !important;
  /* box-shadow: 0 4px 8px rgba(0,0,0,0.4); */
  border-radius: 10px;
  padding: 6px;
  margin-left: 6px!important;
  /*box-shadow: 0px 10px 20px var(--vt-c-golden) !important;  warm glow */
  /*background: rgba(189, 164, 111, 0) !important;  ultra transparent */
  /* backdrop-filter: blur(3px) !important; */
  /* background-blend-mode: multiply !important; */
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

</style>
