<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRecaps')" :class="{ active: route.path === '/CampaignRecaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMaps')" :class="{ active: route.path === '/CampaignMaps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRules')" :class="{ active: route.path === '/CampaignRules' }">Rules</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMembers')" :class="{ active: route.path === '/CampaignMembers' }">Members</button>
  </nav>

  <div class="campaignPage" v-sound>
    <h2>Welcome to Your Campaign!</h2>
    <p>Here you can see all members of the campaign, remove players, and delete the campaign</p>

    <div class="corner-container">
      <img class = "corner bottom-left" src="../assets/images/goldCornerBottomLeft.png" alt="corner decoration" />
      <img class = "corner bottom-right" src="../assets/images/goldCornerBottomRight.png" alt="corner decoration" />
      <img class = "corner top-right" src="../assets/images/goldCornerTopRight.png" alt="corner decoration" />
      <img class = "corner top-left" src="../assets/images/goldCornerTopLeft.png" alt="corner decoration" />
      <div class = "table-container">
        <div class="table">
          <div class="table-header">
            <div>Name</div>
            <div>Role</div>
            <div>Manage</div>
          </div>
          

            <div v-for="u in user" :key="u.id" class="table-row">
              <div>{{ u.name }}</div>
              <div>{{ u.role }}</div>
              <div>
                <!---Add quill on paper to manage permissions -->
                <button class="tableButton" @click="openPermissionsModal(u)"><img class="imgQuill" src="../assets/images/Quill-WarmWhite.png" /></button>
                <!--Make remove player button into a gravestone img -->
                <button class="tableButton" @click="openRemoveModal(u)"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="inlineButtons">
      <button class = "parchmentButton" @click="openBanUser()">Ban User</button>
      <button class = "parchmentButton">Delete Campaign</button>
    </div>

    <!--Popup to remove players from the campaign-->
    <div v-if="showRemoveModal" id="removePlayer" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Are you sure you want to remove <strong>{{ selectedUser?.name }}</strong>?</p>
          <br>
          <br>
          <!--This remove function only occurs visually...get rid of it later-->
          <button class="popupButton" @click="confirmRemoveUser()">Remove</button> 
          <button class="popupButton" @click="showRemoveModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!--Popup to change permissions for players in the campaign-->
    <div v-if="showPermissionsModal" id="playerPermissions" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Select the permissions for <strong>{{ selectedUser?.name }}</strong>.</p>
          <br>
          <div class="radio-group">
            <label class="custom-radio">
              <input type="radio" name="role" value="Player"  v-model="selectedRole">
              <span class="radio-mark"></span>
              Player
            </label>

            <label class="custom-radio">
              <input type="radio" name="role" value="Co DM"  v-model="selectedRole">
              <span class="radio-mark"></span>
              Co-DM
            </label>
          </div>
          <br>
          <br>
          <!--This remove function only occurs visually...it is useless-->
          <button class="popupButton" @click="confirmPermissions()">Submit</button> 
          <button class="popupButton" @click="showPermissionsModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!--Popup to ban nasty wasty users from the campaign-->
        <div v-if="showBanModal" id="banUser" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Please type the username of the player you wish to ban from this campaign.</p>
          <br>
          <br>
          <!--This remove function only occurs visually...get rid of it later-->  
          <input type="text" placeholder="User"> 
          <button class="popupButton" @click="confirmBanUser()">Ban User</button>
          <button class="popupButton" @click="showBanModal = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';

const route = useRoute()
const router = useRouter()

// ------------------------------
// Placeholder API functions
// Replace these with actual API calls later
// ------------------------------

async function fetchUserFromDatabase() {
  // Replace with actual: const res = await fetch('/api/User')
  //TODO DAMIEN FOR FUNCTIONALITY: I want there to be a warning in place cause there is supposed
  //to be a DM for every campaign. 
  // Also though, the players shouldn't be able to do this. Are we dealing with that this sprint?
  return [
    { id: 1, name: "Will", role: "DM" },
    { id: 2, name: "Carter", role: "Player" },
    { id: 3, name: "Connor", role: "Player" },
    { id: 4, name: "Damien", role: "Player" },
    { id: 5, name: "Melissa", role: "Player" }

  ];
}

async function deleteUserFromDatabase(id) {
  // Replace with actual fetch DELETE.
  return { success: true };
}

// ------------------------------
// Component Logic
// ------------------------------

const user = ref([]);

const showRemoveModal = ref(false);
const showPermissionsModal = ref(false);
const showBanModal = ref(false);
const selectedUser = ref(null);
const selectedRole = ref('')

function openRemoveModal(u) {
  selectedUser.value = u;
  showRemoveModal.value = true;
}

function openPermissionsModal(u) {
  selectedUser.value = u;
  showPermissionsModal.value = true;

  selectedRole.value = u.role;
}

function openBanUser() {
  showBanModal.value = true;
}

function confirmPermissions() {
  if (!selectedUser.value) return;

  // Save change to that specific user
  selectedUser.value.role = selectedRole.value;

  showPermissionsModal.value = false;
  selectedUser.value = null;
}

// Visual delete only
function confirmRemoveUser() {
  if (!selectedUser.value) return;
  // Remove user from table
  user.value = user.value.filter(u => u.id !== selectedUser.value.id);
  // Close modal
  showRemoveModal.value = false;
  selectedUser.value = null;
}

// Visual delete only
function confirmBanUser() {
  if (!selectedUser.value) return;
  // Remove user from table -- Eventually should confirm player exists and is not the DM
  user.value = user.value.filter(u => u.id !== selectedUser.value.id);
  // Close modal
  showBanModal.value = false;
  selectedUser.value = null;
}

async function loadUser() {
  user.value = await fetchUserFromDatabase();
}

onMounted(() => {
  const saved = localStorage.getItem('selectedRole');
  if (saved) selectedRole.value = saved;
});

onMounted(() => {
  loadUser();
});

// Get the campaign ID from the URL (/campaign/:id)
const campaignId = route.params.id

// Define reactive state for campaign data
const campaignData = ref(null)

//Fetch campaign info when page loads
onMounted(async () => {
  try {
    const response = await fetch(`https://localhost:3000/data/campaign/${campaignId}`)
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
})
</script>
<style scoped>

.corner-container {
  margin-top:10vh;
  margin-bottom:10vh;
  width: 100%;
  max-width: 700px;
  min-height:300px;
  position:relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  background: transparent;
  border-collapse: collapse;
  border-radius: 12px;  
  box-shadow: 0 0 30px var(--vt-c-bronze); /* warm glow */
  padding: 20px;
  background: rgba(0,0,0,0.25); /* ultra transparent */
  backdrop-filter: blur(3px);
}

.corner {
  position: absolute;
  width: 150px;
  height: 150px;
  z-index:20; 
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


.table-container {
  width: 100%;
  overflow-x: auto;
}

.table{
  margin: auto;
  padding: 20px;
  justify-content: center;
  align-items:center;
  box-sizing: border-box;
  color: var(--vt-c-warm-white);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr);
  border-bottom: 1px solid var(--vt-c-warm-white);
}

.table-header > div,
.table-row > div {
  text-align: left;
  white-space: nowrap;  
  overflow: hidden;
  text-overflow: ellipsis;
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

.imgQuill {
  width: 40px;
  height: 40px;
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

::v-deep(.modal){
  display:flex;
}

.inlineButtons {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}


/* Hide the original radio */
.custom-radio input[type="radio"] {
  display: none;
}

/* The wrapper aligns circle + text inline */
.custom-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 10px;
  margin-left: 2rem;
}

/* Custom radio circle */
.radio-mark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--vt-c-dark-brown);
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  position: relative;
  transition: border-color .2s;
}

/* Filled inner dot (hidden until checked) */
.radio-mark::after {
  content: "";
  width: 10px;
  height: 10px;
  background: var(--vt-c-navy);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform .2s ease;
}

/* When checked */
.custom-radio input[type="radio"]:checked + .radio-mark {
  border-color: var(--vt-c-navy);
}

.custom-radio input[type="radio"]:checked + .radio-mark::after {
  transform: translate(-50%, -50%) scale(1);
}


</style>