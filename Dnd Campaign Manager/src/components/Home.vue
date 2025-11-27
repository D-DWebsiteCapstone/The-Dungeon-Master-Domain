<template>
<div class="homePage" v-sound>
  <div class="Greetings">
    <h1>Welcome Traveler!</h1>
    <br>
    <p>To begin on your adventure, please choose a path forward:</p>
  </div>
  
  <!-- Pay Attention -->
  <div class="calendarContainer" >
    <VCalendar transparent borderless v-model="selectedDate" :attributes="attributes" />
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
      <button class = "popupButton" type="submit">Submit</button>
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
        <p>Members</p>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

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

onMounted(() => {
  loadMyCampaigns()
})

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

// VCalendar Attributes
const attributes = ref([
  {
    highlight: 'red',
    dates: [  
      new Date(),
    ],
},
  {
    highlight: 'blue',
    dates: [
      new Date(2025, 9, 28),
      new Date(2025, 10, 2),
    ],
  },
]);

const date = ref(new Date());

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

.memberList {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}

.memberList li {
  margin: 4px 0;
}

</style>
