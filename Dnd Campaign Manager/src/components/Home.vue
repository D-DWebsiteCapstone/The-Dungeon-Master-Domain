<template>
<div class="homePage" v-sound>
  <div class="Greetings">
    <h1>Welcome Traveler!</h1>
    <br>
    <p>To begin on your adventure, please choose a path forward:</p>
  </div>
  
  <!-- Pay Attention -->
  <div class="calendarRow">
    <div class="calendarContainer" >
      <VCalendar transparent borderless v-model="selectedDate" :attributes="attributes" />
    </div>
    <div class="calendarList parchmentCard">
      <h3>Upcoming Sessions</h3>
      <div v-if="loadingSchedules">Loading...</div>
      <div v-else-if="scheduleError">{{ scheduleError }}</div>
      <div v-else-if="!upcomingSessions.length">No sessions scheduled.</div>
      <ul v-else class="sessionList">
        <li v-for="s in upcomingSessions" :key="s.id" class="sessionItem">
          <div class="sessionTitle">{{ s.campaignTitle || 'Campaign' }}</div>
          <div class="sessionDate">{{ formatDateTime(s.plannedSession, s.plannedSessionTime) }}</div>
        </li>
      </ul>
    </div>
  </div>
    <!-- <VDatePicker v-model="date" mode="dateTime" hide-time-header :attributes="attributes" /> -->
  <!-- Pay Attention -->

  <div class="ChoosePath">
    <button class="parchmentButton" @click="showCreateModal = true" style="width:auto;"><img class= "buttonImg" src="../assets/images/structure_watchtower.png"/>Create Campaign</button>
    <button class="parchmentButton" @click="showJoinModal = true" style="width:auto;"><img class= "buttonImg" src="../assets/images/sword.png"/>Join Campaign</button>
    <button class="parchmentButton" @click="router.push('/CharPage')"><img class= "buttonImg" src="../assets/images/chess_knight.png"/>Characters</button>
  </div>

    <h2>Your Campaigns</h2>

  <div class="dropdown">
    <select id="dropdown" @change="CampaignSort()">
      <option value="All_Campaigns">All Campaigns</option>
      <option value="Campaigns_You_Play_In">Player</option>
      <option value="Campaigns_You_Run">Dungeon Master</option>
    </select>
  </div>
  <div class="CardSpacing fourCols">  
    <div class="Card statusCard parchmentCard" v-if="loadingCampaigns">Loading your campaigns...</div>
    <div class="Card statusCard parchmentCard" v-else-if="campaignsError">{{ campaignsError }}</div>
    <div class="Card statusCard parchmentCard" v-else-if="myCampaigns.length === 0">You are not in any campaigns yet.</div>
    <button
      v-else
      type="button"
      class="parchmentButton campaignCardButton"
      v-for="c in myCampaigns"
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
  <div id="id03" class="modal" :style="{ display: showCreateModal ? 'block' : 'none' }">
    <div class="popup">
      <form class="popuptxt" @submit.prevent="submitCampaign">
      <p>Name your Campaign.</p>
      <input type="text" placeholder="Enter Campaign Name" v-model="campaignName" name="cname">
      <br>
      <br><br>
      <button class = "popupButton" @click="sparkleSound" type="submit">Submit</button>
      <button class = "popupButton" type="button" @click="showCreateModal = false">Cancel</button>
    </form>
    </div>
  </div>

  <!-- Join Campaign Modal -->
  <div id="id04" class="modal" :style="{ display: showJoinModal ? 'block' : 'none' }">
    <div class="popup">
      <form class="popuptxt" @submit.prevent="joinCampaign">
      <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
      <br>
      <input type="text" placeholder="Enter Campaign Code" v-model="joinCode" name="ccode">
      <br><br>
      <button class = "popupButton" type="submit">Join</button>
      <button class = "popupButton" type="button" @click="showJoinModal = false">Cancel</button>
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
          <li v-for="m in selectedMembers" :key="m.userId">
            <strong>{{ m.username }}</strong> — {{ m.role }}
          </li>
          <li v-if="!selectedMembers.length">No members yet.</li>
        </ul>
        <button class="popupButton" @click="selectedCampaign && router.push(`/campaign/${selectedCampaign.id}`)">Open Campaign</button>
        <button class="popupButton" type="button" @click="closeCampaignModal">Close</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sounds } from '../buttonSounds.js';
const router = useRouter()

import crownUrl from '../assets/images/Crown.svg'
import playerShieldUrl from '../assets/images/Shield.svg'

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
})

async function sparkleSound() {  
  sounds.sparkle.currentTime = 0 // restart if already playing
  sounds.sparkle.play()
}

async function submitCampaign() {
  if (!campaignName.value) {
    alert('Please enter a name')
    return
  }

  const response = await fetch('https://localhost:3000/data/campaign', {
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

async function joinCampaign() {
  if (!joinCode.value) {
    alert('Please enter a campaign code')
    return
  }

  const response = await fetch('https://localhost:3000/data/campaign/join', {
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

async function loadMyCampaigns() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    campaignsError.value = 'Please log in to see your campaigns.'
    return
  }

  campaignsError.value = ''
  loadingCampaigns.value = true
  try {
    const res = await fetch('https://localhost:3000/data/campaign/my', {
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

async function loadMySchedules() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    scheduleError.value = 'Please log in to see your schedules.'
    return
  }
  loadingSchedules.value = true
  scheduleError.value = ''
  try {
    const res = await fetch('https://localhost:3000/data/schedule/my', {
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

async function openCampaignModal(campaign) {
  selectedCampaign.value = campaign
  selectedMembers.value = []
  showCampaignModal.value = true
  membersLoading.value = true
  try {
    const res = await fetch(`https://localhost:3000/data/campaign/${campaign.id}/members`)
    const body = await res.json()
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load members')
    selectedMembers.value = body.members || []
  } catch (err) {
    console.error('load members failed:', err)
  } finally {
    membersLoading.value = false
  }
}

function closeCampaignModal() {
  showCampaignModal.value = false
  selectedCampaign.value = null
  selectedMembers.value = []
}

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
  const map = schedules.value.reduce((acc, s) => {
    if (!s.plannedSession) return acc
    const dt = combineDateTime(s.plannedSession, s.plannedSessionTime)
    if (!dt) return acc
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

function formatDateTime(dateStr, timeStr) {
  const dt = combineDateTime(dateStr, timeStr)
  if (!dt) return '-'
  return dt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const upcomingSessions = computed(() =>
  schedules.value
    .filter(s => s.plannedSession)
    .sort((a, b) => {
      const ta = combineDateTime(a.plannedSession, a.plannedSessionTime)?.getTime() || 0
      const tb = combineDateTime(b.plannedSession, b.plannedSessionTime)?.getTime() || 0
      return ta - tb
    })
)

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
.Greetings {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 2.5rem;
}

.ChoosePath {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}

.parchmentButton{
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
}

.buttonImg{
  width:25px;
  height:25px;
  margin-right: 25px;
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
  background: #f4ecd8;
  border: 1px solid #d2c2a6;
  color: #2f2416;
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
  gap: 16px;
  align-items: flex-start;
}

.calendarList {
  flex: 1;
  padding: 12px;
  border: 1px solid #d2c2a6;
  border-radius: 10px;
  background: #f4ecd8;
  color: #2f2416;
  min-width: 240px;
}

.calendarList h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.sessionList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.sessionItem {
  border-bottom: 1px solid #d2c2a6;
  padding-bottom: 6px;
}

.sessionTitle {
  font-weight: 700;
}

.sessionDate {
  font-size: 0.95rem;
  margin-top: 2px;
}

@media (max-width: 900px) {
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
}

</style>
