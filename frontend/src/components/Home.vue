<template>
<div class="homePage" v-sound>

  <div v-if= "showWelcome"><Welcome /></div>

  <div class="Greetings">
    <h1>Welcome, {{ username }}!</h1>
    <br>
    <p>To begin on your adventure, please choose a path forward:</p>
  </div>
  
  <div class="ChoosePath">
    <button class="parchmentButton" @click="showCreateModal = true" ><img class= "buttonImg" src="../assets/images/icons/structure_watchtower.png"/>Create Campaign</button>
    <button class="parchmentButton" @click="showJoinModal = true" ><img class= "buttonImg" src="../assets/images/icons/sword.png"/>Join Campaign</button>
    <button class="parchmentButton" @click="router.push('/CharPage')"><img class= "buttonImg" src="../assets/images/icons/chess_knight.png"/>Characters</button>
    <button class="parchmentButton" @click="router.push('/LevelUp')"><img class= "buttonImg" src="../assets/images/icons/bow.png"/>Level Up</button>
  </div>

  <!-- Pay Attention -->
  <div class="calendarRow">
    <div class="calendarContainer" >
      <VCalendar transparent borderless v-model="selectedDate" :attributes="attributes" />
    </div>
    <div class="calendarList">
      <img class = "corner bottom-left" src="../assets/images/borders/goldCornerBottomLeft.png" alt="corner decoration" />
      <img class = "corner bottom-right" src="../assets/images/borders/goldCornerBottomRight.png" alt="corner decoration" />
      <img class = "corner top-right" src="../assets/images/borders/goldCornerTopRight.png" alt="corner decoration" />
      <img class = "corner top-left" src="../assets/images/borders/goldCornerTopLeft.png" alt="corner decoration" />
      <h3>Upcoming Sessions</h3>

      <div v-if="loadingSchedules">Loading...</div>
      <div v-else-if="scheduleError">{{ scheduleError }}</div>
      <div v-else-if="!upcomingSessions.length">No sessions scheduled.</div>
      <ul v-else class="sessionList">
        <li v-for="s in upcomingSessions" :key="s.id" class="sessionItem">
          <div class="tooltip-container">
            <button class= "invisibleButton sessionTitle" @click="router.push(`/campaign/${s.campaignId}`)">{{ s.campaignTitle || 'Campaign' }}
              <div class="sessionDate">{{ formatDateTime(s.plannedSession, s.plannedSessionTime) }}</div></button>
            <span class="tooltip-text">Go to Campaign</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
    <!-- <VDatePicker v-model="date" mode="dateTime" hide-time-header :attributes="attributes" /> -->
  <!-- Pay Attention -->

  <br />
  <h2>Your Campaigns</h2>

  <div class="filters">
    <div class="dropdown">
      <select v-model="selectedRoleFilter">
        <option value="All_Campaigns">All Campaigns</option>
        <option value="Campaigns_You_Play_In">Player</option>
        <option value="Campaigns_You_Run">Dungeon Master</option>
      </select>
    </div>
    <input
      class="searchInput"
      type="search"
      placeholder="Search campaigns by name or code..."
      v-model="searchTerm"
    />
  </div>
  <div class="CardSpacing fourCols">  
    <div class="Card statusCard parchmentCard" v-if="loadingCampaigns">Loading your campaigns...</div>
    <div class="Card statusCard parchmentCard" v-else-if="campaignsError">{{ campaignsError }}</div>
    <div class="Card statusCard parchmentCard" v-else-if="myCampaigns.length === 0">You are not in any campaigns yet.</div>
    <div class="Card statusCard parchmentCard" v-else-if="!filteredCampaigns.length">No campaigns match your search.</div>
    <button
      v-else
      type="button"
      class="parchmentButton campaignCardButton"
      v-for="c in filteredCampaigns"
      :key="c.id"
      :data-role="c.role"
      @click="openCampaignModal(c)"
    >
      <div class="cardTitle">{{ c.title }}</div>
      <div class="cardMeta">Role: {{ c.role }}</div>
      <div class="cardMeta">Code: {{ c.joinCode || '—' }}</div>
      <span
        class="badgeWrap"
        :class="c.role === 'DM' ? 'dmBadge' : 'playerBadge'"
      >
        <img
          class="roleBadge"
          :src="c.role === 'DM' ? crownUrl : playerShieldUrl"
          :alt="c.role === 'DM' ? 'Dungeon Master' : 'Player'"
        />
      </span>
    </button>
  </div>

  <!-- Create Campaign Modal -->
  <div id="id03" class="modal" :style="{ display: showCreateModal ? 'flex' : 'none' }">
    <div class="popup">
      <form class="popuptxt" @submit.prevent="submitCampaign">
        <br>
        <br>
        <br>
      <p>Name your Campaign.</p>
      <input type="text" placeholder="Enter Campaign Name" v-model="campaignName" name="cname">
      <br><br><br>
      <div class="options"><button class = "popupButton" @click="sparkleSound" type="submit">Submit</button>
      <button class = "popupButton" type="button" @click="showCreateModal = false">Cancel</button></div>
    </form>
    </div>
  </div>

  <!-- Join Campaign Modal -->
  <div id="id04" class="modal" :style="{ display: showJoinModal ? 'flex' : 'none' }">
    <div class="popup">
      <form class="popuptxt" @submit.prevent="joinCampaign">
      <br><br><br>
      <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
      <br>
      <input type="text" placeholder="Enter Campaign Code" v-model="joinCode" name="ccode">
      <br><br>
      <div class="options"><button class = "popupButton" type="submit">Join</button>
      <button class = "popupButton" type="button" @click="showJoinModal = false">Cancel</button></div>
    </form>
    </div>
  </div>

  <!-- Campaign detail modal -->
  <div class="modal" v-if="showCampaignModal" :style="{ display: showCampaignModal ? 'flex' : 'none' }">
    <div class="popup">
      <div class="popuptxt">
        <h3>{{ selectedCampaign?.title }}</h3>
        <p v-if="selectedCampaign">Role: {{ selectedCampaign.role }} | Join Code: {{ selectedCampaign.joinCode || '—' }}</p>
        <br>
        <h4>Members:</h4>
        <div v-if="membersLoading">Loading members...</div>
        <ul v-else class="memberList">
          <li v-for="m in sortedMembers" :key="m.userId">
            <strong>{{ m.username }}</strong> — {{ m.role }}
          </li>
          <li v-if="!selectedMembers.length">No members yet.</li>
        </ul>
        <div class=options><button class="popupButton" @click="selectedCampaign && router.push(`/campaign/${selectedCampaign.id}`)">Open Campaign</button>
        <button class="popupButton" type="button" @click="closeCampaignModal">Close</button></div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
//vue imports
import { ref, computed, onMounted } from 'vue'
// router import
import { useRouter } from 'vue-router'
import { sounds } from '../buttonSounds.js';
import { apiFetch } from '../lib/api'
const router = useRouter()

import Welcome from '../components/Welcome.vue'
import {fetchUsername, checkShowTutorial} from '../lib/dataHelper.js';
import { jwtDecode } from 'jwt-decode';

// Image imports
import crownUrl from '../assets/images/icons/Crownthing.png'
import playerShieldUrl from '../assets/images/icons/Shieldthing.png'


// main data and state
const showCreateModal = ref(false)
const showJoinModal = ref(false)
const joinCode = ref('')
const campaignName = ref('')
const myCampaigns = ref([])
const loadingCampaigns = ref(false)
const campaignsError = ref('')
const showCampaignModal = ref(false)
const selectedCampaign = ref(null)
const selectedMembers = ref([])
const membersLoading = ref(false)
const selectedDate = ref(new Date())
const schedules = ref([])
const loadingSchedules = ref(false)
const scheduleError = ref('')
const loadingTutorial = ref(false)
const tutorialError = ref('')
const showWelcome = ref(false)
const searchTerm = ref('')
const username = ref('')
const selectedRoleFilter = ref('All_Campaigns')
const roleMap = computed(() => {
  const map = {}
  myCampaigns.value.forEach(c => {
    if (c.id) map[c.id] = c.role || 'Player'
  })
  return map
})

onMounted(() => {
  loadMyCampaigns()
  loadMySchedules()
  checkWelcomeTutorial()
  getUsername()
})

//token handling for getting Username 
const token = localStorage.getItem("authToken");
const decoded = jwtDecode(token);
const userId = decoded.id;
defineProps(['id']);

async function getUsername() {
  try {
    const token = localStorage.getItem("authToken")

    if (!token) {
      console.warn("No auth token found")
      username.value = "Traveler"
      return
    }

    const decoded = jwtDecode(token)

    if (!decoded?.id) {
      console.warn("Token missing user id")
      username.value = "Traveler"
      return
    }

    const usernameResult = await fetchUsername(decoded.id)
    username.value = usernameResult?.username || "Traveler"
  }
  catch (err) {
    console.error("Username fetch failed:", err)
    username.value = "Traveler"
  }
}


// sound effect for logging in
async function sparkleSound() {  
  sounds.sparkle.currentTime = 0 // restart if already playing
  sounds.sparkle.play()
}

// Campaign creation handler
async function submitCampaign() {
  if (!campaignName.value) {
    alert('Please enter a name')
    return
  }

  const response = await apiFetch('/data/campaign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      title: campaignName.value,
      roleName: 'DM',
      selectedCharacter: null
    })
  })

  const result = await response.json()

  if (result.valid && result.campaign && result.campaign.id) {
    await loadMyCampaigns()
    router.push(`/campaign/${result.campaign.id}`)
  } else {
    console.error('No campaign ID returned:', result)
  }
}

// Campaign joining handler
async function joinCampaign() {
  if (!joinCode.value) {
    alert('Please enter a campaign code')
    return
  }

  const response = await apiFetch('/data/campaign/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ joinCode: joinCode.value })
  })

  const result = await response.json()

  if (result.valid && result.campaign && result.campaign.id) {
    await loadMyCampaigns()
    router.push(`/campaign/${result.campaign.id}`)
    showJoinModal.value = false
  } else {
    alert('Failed to join campaign. Please check the join code and try again.')
  }
}

// Load user's campaigns 
async function loadMyCampaigns() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    campaignsError.value = 'Please log in to see your campaigns.'
    return
  }

  campaignsError.value = ''
  loadingCampaigns.value = true
  try {
    const res = await apiFetch('/data/campaign/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load campaigns')
    myCampaigns.value = body.campaigns || []
  } catch (err) {
    console.error('loadMyCampaigns failed:', err)
    campaignsError.value = err.message || 'Failed to load campaigns.'
  } finally {
    loadingCampaigns.value = false
  }
}

// Load user's scheduled sessions
async function loadMySchedules() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    scheduleError.value = 'Please log in to see your schedules.'
    return
  }
  loadingSchedules.value = true
  scheduleError.value = ''
  try {
    const res = await apiFetch('/data/schedule/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load schedule.')
    schedules.value = body.schedule || []
  } catch (err) {
    console.error('loadMySchedules failed:', err)
    scheduleError.value = err.message || 'Failed to load schedule.'
  } finally {
    loadingSchedules.value = false
  }
}

// Check if welcome tutorial should be shown
async function checkWelcomeTutorial() {
 
  //variable from database that determines if the tutorial should be shown or not. If true, the tutorial will be shown. If false, the tutorial will be skipped.
const result= await checkShowTutorial(userId);
  if (result.tag === true) {
    tutorialError.value=''
  try {
    showWelcome.value = true;

  } catch (err) {
    console.error('checkWelcomeTutorial failed:', err)
    tutorialError.value = err.message || 'Failed to check tutorial status.'
  }

  } else {
    console.log("No! TUTORIAL");
    return;
  }
}

// Open campaign detail modal
async function openCampaignModal(campaign) {
  selectedCampaign.value = campaign
  selectedMembers.value = []
  showCampaignModal.value = true
  membersLoading.value = true
  try {
    const res = await apiFetch(`/data/campaign/${campaign.id}/members`)
    const body = await res.json()
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load members')
    selectedMembers.value = body.members || []
  } catch (err) {
    console.error('load members failed:', err)
  } finally {
    membersLoading.value = false
  }
}

const sortedMembers = computed(() => {
  const roleOrder = {
    "DM": 0,
    "Co DM": 1,
    "Player": 2
  }

  return [...selectedMembers.value].sort((a, b) => {
    return roleOrder[a.role] - roleOrder[b.role]
  })
})

// Close campaign detail modal
function closeCampaignModal() {
  showCampaignModal.value = false
  selectedCampaign.value = null
  selectedMembers.value = []
}

// Campaign filtering based on role
async function CampaignSort() {
  const dropdown = document.getElementById('dropdown').value;
  if(dropdown === 'All_Campaigns'){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='block');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='block');
  }
  else if(dropdown === 'Campaigns_You_Play_In'){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='none');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='block');
  }
  else if(dropdown === 'Campaigns_You_Run'){
    document.querySelectorAll('[data-role="DM"]').forEach(el => el.style.display='block');
    document.querySelectorAll('[data-role="Player"]').forEach(el => el.style.display='none');
  }
}

// VCalendar Attributes driven by scheduled sessions
const attributes = computed(() => {
  const now = new Date()
  const map = schedules.value.reduce((acc, s) => {
    if (!s.plannedSession) return acc
    const dt = combineDateTime(s.plannedSession, s.plannedSessionTime)
    if (!dt || dt < now) return acc
    const dayKey = dt.toDateString()
    if (!acc[dayKey]) acc[dayKey] = new Map()
    const key = s.campaignId || s.campaignTitle || 'Campaign'
    const role = roleMap.value[key] || roleMap.value[s.campaignId] || 'Player'
    const existing = acc[dayKey].get(key)
    if (!existing || dt < existing._dateObj) {
      acc[dayKey].set(key, { ...s, _dateObj: dt, _role: role })
    }
    return acc
  }, {})

  const dmDates = []
  const playerDates = []
  const mixedDates = []
  const popovers = []

  Object.values(map).forEach(byCampaign => {
    const entries = Array.from(byCampaign.values())
    const roles = new Set(entries.map(e => e._role))
    const firstDate = entries[0]?._dateObj
    if (!firstDate) return

    if (roles.has('DM') && roles.has('Player')) {
      mixedDates.push(firstDate)
    } else if (roles.has('DM')) {
      dmDates.push(firstDate)
    } else {
      playerDates.push(firstDate)
    }

    popovers.push({
      date: firstDate,
      label: entries
        .map(l => `${l.campaignTitle || 'Campaign'}: ${formatDateTime(l.plannedSession, l.plannedSessionTime)}`)
        .join('\n')
    })
  })

  const attrs = []
  if (dmDates.length) attrs.push({ highlight: { fillMode: 'solid', contentClass: 'dmHighlight' }, dates: dmDates })
  if (playerDates.length) attrs.push({ highlight: { fillMode: 'solid', contentClass: 'playerHighlight' }, dates: playerDates })
  if (mixedDates.length) attrs.push({ highlight: { fillMode: 'solid', contentClass: 'mixedHighlight' }, dates: mixedDates })

  popovers.forEach(p => {
    attrs.push({
      dates: [p.date],
      popover: { label: p.label }
    })
  })

  return attrs
})

const date = ref(new Date());

// Helper to check if a scheduled session is upcoming
function isUpcomingSession(schedule) {
  const dt = combineDateTime(schedule.plannedSession, schedule.plannedSessionTime)
  return dt ? dt.getTime() >= Date.now() : false
}

// Format date and time for display
function formatDateTime(dateStr, timeStr) {
  const dt = combineDateTime(dateStr, timeStr)
  if (!dt) return '-'
  return dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const upcomingSessions = computed(() =>
  schedules.value
    .filter(s => s.plannedSession && isUpcomingSession(s))
    .sort((a, b) => {
      const ta = combineDateTime(a.plannedSession, a.plannedSessionTime)?.getTime() || 0
      const tb = combineDateTime(b.plannedSession, b.plannedSessionTime)?.getTime() || 0
      return ta - tb
    })
)

const filteredCampaigns = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  // Build latest session lookup
  const latest = {}

  schedules.value.forEach(s => {
    if (!s.plannedSession) return

    const time = combineDateTime(
      s.plannedSession,
      s.plannedSessionTime
    )?.getTime()

    if (!time) return

    if (!latest[s.campaignId] || time > latest[s.campaignId]) {
      latest[s.campaignId] = time
    }
  })

  return [...myCampaigns.value]
    .filter(c => {
      if (selectedRoleFilter.value === 'Campaigns_You_Play_In') return c.role === 'Player'
      if (selectedRoleFilter.value === 'Campaigns_You_Run') return c.role === 'DM' || c.role === 'Co DM'
      return true
    })
    .filter(c => {
      if (!term) return true
      const title = (c.title || '').toLowerCase()
      const code = (c.joinCode || '').toLowerCase()
      return title.includes(term) || code.includes(term)
    })
    .sort((a, b) => {
      const now = Date.now()

      const ta = latest[a.id] || 0
      const tb = latest[b.id] || 0

      const diffA = Math.abs(ta - now)
      const diffB = Math.abs(tb - now)

      return diffA - diffB // closest to now first
    })
})

// Combine date and time strings into a Date object
function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return null
  const t = timeStr || '00:00'
  return new Date(`${dateStr}T${t}`)
}

//Button Click
document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.querySelector('.vc-container'); // adjust to your actual parent container class

  if (!calendar) return;

  calendar.addEventListener('click', event => {
    const button = event.target.closest('div[role="button"]');
    if (!button) return; // not a date cell

    const label = button.getAttribute('aria-label');
    console.log('Clicked:', label);
    // Add your click handling logic here
  });

  calendar.addEventListener('keydown', event => {
    const button = event.target.closest('div[role="button"]');
    if (!button) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click(); // triggers same logic as click
      // You can also log or handle the key event specifically if needed
    }
  });
});

</script>


<style scoped>
input {
  min-width: 250px;
  width: 80vw !important;
}

.Greetings {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 2.5rem;
}

.ChoosePath {
  display: flex;
  justify-content: center;
  gap: 10px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}

.parchmentButton{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  min-width: 230px;
}

.buttonImg{
  width:25px;
  height:25px;
  margin-right: 18px;
  margin-bottom: 0px;
}

.CardSpacing {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 1.5rem 0;
}

.fourCols {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.parchmentCard {
  background-color: var(--vt-c-parchment);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background: radial-gradient(
    circle at center, rgba(0, 0, 0, 0) 60%, /* center */ #ffe9b1 100% /* outside */), 
    url('../assets/PaperTextureCalm.png'
  );
  background-blend-mode: multiply;
  border: 1px solid var(--vt-c-bronze);
  color: var(--vt-c-navy);
  border-radius: 10px;
}

.campaignCardButton {
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 4px;
  padding: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: transform 120ms ease, box-shadow 120ms ease;
  position: relative;
}

.campaignCardButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0,0,0,0.22);
  z-index: 1;
}

.cardTitle {
  font-weight: 700;
  margin-bottom: 6px;
}

.cardMeta {
  font-size: 0.9rem;
  opacity: 0.85;
}

.statusCard {
  text-align: center;
  padding: 16px;
}

.badgeWrap {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  box-shadow: 0 3px 10px rgba(0,0,0,0.28);
}

.roleBadge {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
}

.dmBadge {
  background: #cfa23c;
  color: #cfa23c;
}

.playerBadge {
  background: #6b4c2f;
  color: #6b4c2f;
}

.roleBadge {
  color: inherit;
}

.memberList {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}

.memberList li {
  margin: 4px 0;
}

/* Ensure calendar popover respects newline-separated labels */
:deep(.vc-popover-content) {
  white-space: pre-line;
}

/* Role-based highlights */
:deep(.dmHighlight) {
  background: #cfa23c !important;
  color: #000 !important;
  border-radius: 50% !important;
}

:deep(.playerHighlight) {
  background: #6b4c2f !important;
  color: #fff !important;
  border-radius: 50% !important;
}

:deep(.mixedHighlight) {
  background: linear-gradient(90deg, #cfa23c 50%, #6b4c2f 50%) !important;
  color: #000 !important;
  border-radius: 50% !important;
}

.calendarRow {
  display: flex;
  gap: 6rem;
  align-items: center;
  margin-bottom: 4vh;
}

.calendarList {
  flex: 1;
  min-width: 550px;
  min-height: 274px;
  padding: 10px;
  border: 1px solid #d2c2a6;
  border-radius: 10px;
  backdrop-filter: blur(1px);
  color: var(--vt-c-golden);
}

.calendarList h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.4rem;
  color: var(--vt-c-red);
}

.sessionList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.sessionItem {
  border-top: 1px solid #d2c2a6;
  padding-top: 10px;
  background-color: #E3CFA830;
  background-size: 80% 75%;
  border-radius: 12px;
}

.sessionTitle {
  font-weight: 700;
  color: var(--vt-c-golden);
}

.sessionDate {
  font-size: 0.95rem;
  margin-top: 2px;
}

.invisibleButton:hover {
  color: var(--vt-c-red);
}

.filters {

  select:hover {
    background-color: var(--vt-c-grey);
  }

  select:active {
    background-color: var(--vt-c-dark-grey);
  }

  input:hover {
    background-color: var(--vt-c-grey);
  }
}

@media (max-width: 1100px) {
  .ChoosePath {
    display: grid;
    gap: 50px;
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }

  .calendarRow {
    gap: 6vw;
  }

  .fourCols {
    grid-template-columns: repeat(2, minmax(330px, 1fr));
    gap: 20px;
  }

  .parchmentButton {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .calendarRow {
    flex-direction: column;
  }

   .calendarList {
    min-width: 550px;
   }

  .calendarContainer {
    width: 65%;
  }

  .ChoosePath {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width:100%;
  }

  .fourCols {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }

  .parchmentButton {
    justify-content: left;
  }

  .buttonImg {
    margin-right: 38px;
  }

  .bookImg {
    margin-right: 33px;
  }
}

@media (max-width: 760px) {
  .CardSpacing {
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  }

  .calendarList {
    min-width: 450px;
  }

  .ChoosePath {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .Greetings h1 {
    font-size: 1.4rem;
  }

  .Greetings p {
    font-size: 0.95rem;
  }

  .calendarList {
    min-width: 400px;
  }

  .calendarList h3 {
    margin-bottom: 12px;
  }
}

@media (max-width: 450px) {
  
  .calendarList {
    min-width: 325px;
    font-size: 0.8rem;
  }

 .calendarContainer {
    width: 75%;
  }

  .calendarList h3 {
    font-size: 1rem;
  }

  .CardSpacing {
    margin-right: 1rem;
  }

}

@media (max-width: 370px) {
  
  .calendarList {
    min-width: 300px;
  }

 .calendarContainer {
    width: 85%;
  }

}

@media (max-width: 340px) {
  
  .calendarList {
    min-width: 270px;
  }

 .calendarContainer {
    width: 98%;
  }

}

/*@media (max-width: 900px) {
  .calendarRow {
    flex-direction: column;
  }

  .calendarContainer,
  .calendarList {
    width: 100%;
  }

  .ChoosePath {
    flex-direction: column;
    gap: 16px;
  }

  .fourCols {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .buttonImg {
    margin-right: 12px;
  }
}

@media (max-width: 760px) {
  .CardSpacing {
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  }

  .ChoosePath {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .Greetings h1 {
    font-size: 1.4rem;
  }

  .Greetings p {
    font-size: 0.95rem;
  }

  .calendarList h3 {
    margin-bottom: 4px;
  }
}*/

.corner {
  position: absolute;
  width: 150px;
  height: 150px;
  z-index:2; 
}

.corner.top-left {
  top: 0;
  left: 0;
  transform: translate(-10%, -10%);
}

.corner.top-right {
  top: 0;
  right: 0;
  transform: translate(10%, -10%);
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  transform: translate(-10%, 10%);
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  transform: translate(10%, 10%);
}

</style>
