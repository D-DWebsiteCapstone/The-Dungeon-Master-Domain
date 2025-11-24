<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRecaps')" :class="{ active: route.path === '/CampaignRecaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMaps')" :class="{ active: route.path === '/CampaignMaps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRules')" :class="{ active: route.path === '/CampaignRules' }">Rules</button>
<button class="invisibleButton" 
  @click="router.push(`/campaign/${campaignId}/members`)"
  :class="{ active: route.path.includes('/CampaignMembers') }">
  Members
</button>
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
                <div class="tooltip-container">
                  <button class="tableButton" @click="openPermissionsModal(u)"><img class="imgQuill" src="../assets/images/Quill-WarmWhite.png" /></button>
                  <span class="tooltip-text">Edit Permissions</span>
                </div>
                <!--Make remove player button into a gravestone img -->
                <div class="tooltip-container">
                  <button class="tableButton" @click="openRemoveModal(u)"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button>
                  <span class="tooltip-text">Remove player</span>
                </div>
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
// Get the campaign ID from the URL (/campaign/:id)

const campaignId = route.params.campaignId

const members = ref([])

async function loadMembers() {
  try {
    const res = await fetch(`https://127.0.0.1:3000/data/campaign/${campaignId}/members`);
    const result = await res.json();

    if (result.valid) {
      members.value = result.members;
    } else {
      members.value = [];
    }

  } catch (e) {
    console.error("Failed to load campaign members:", e);
    members.value = [];
  }
}

async function deleteUser(id) {
  // You'll add this backend route later
  console.log("TODO: Delete user", id)
}

onMounted(() => {
  loadMembers()
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


.table-container {
  width: 100%;
  padding:20px;
  overflow-x: auto;
}

.table{
  margin: auto;
  width: 100%;
  min-width: 475px;
  justify-content: center;
  align-items:center;
  box-sizing: border-box;
  color: var(--vt-c-warm-white);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  border-bottom: 1px solid var(--vt-c-warm-white);
}

.table-header > div,
.table-row > div {
  text-align: left;
  white-space: nowrap;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.table-row > div:nth-child(3) {
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

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  width: 150px;
  background-color: var(--vt-c-golden);
  color: var(--vt-c-red);
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 30; /* Ensure it appears above other content */
  bottom: 96%; /* Example: Position above the button */
  left: 45%;
  /*margin-left: -60px;  Half of the width to center it */
  transition: opacity 0.3s ease;
  font-size: 12px
}

.tooltip-container button:hover + .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/*.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%; /* Position below the tooltip text 
  left: 50%;
  margin-left: -5px; /* Half of the arrow width 
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent; /* Color of the arrow 
} */


</style>