<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/Recaps')" :class="{ active: route.path === '/Recaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/Maps')" :class="{ active: route.path === '/Maps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/Rules')" :class="{ active: route.path === '/Rules' }">Rules</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMembers')" :class="{ active: route.path === '/CampaignMembers' }">Members</button>
  </nav>

  <div class="campaignPage" v-sound>
    <h2>Welcome to Your Campaign!</h2>
    <p>Here you can see all members of the campaign, change permissions, and delete the campaign</p>

    <div class="corner-container">
      <img class = "corner" src="../assets/images/goldCorner.png" alt="corner decoration">
      <div class = "table-container">
        <div class="table">
          <div class="table-header">
            <div>Name</div>
            <div>Role</div>
            <div>Remove</div>
          </div>
          

            <div v-for="user in user" :key="user.id" class="table-row">
              <div>{{ user.name }}</div>
              <div>{{ user.role }}</div>
              <div>
                <!---I'll make this have a confirmation popup---->
                <button class = "popupButton" @click="deleteUser(user.id)">Remove Player</button>
              </div>
          </div>
        </div>
      </div>
    </div>
    <button class = "parchmentButton">DELETE CAMPAIGN</button>
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
  return [
    { id: 1, name: "Will", role: "DM" },
    { id: 2, name: "Carter", role: "Player" },
    { id: 3, name: "Connor", role: "Player" },
    { id: 4, name: "Damien", role: "Player" }
  ];
}

async function deleteUserFromDatabase(id) {
  // Replace with actual fetch DELETE
  return { success: true };
}

// ------------------------------
// Component Logic
// ------------------------------

const user = ref([]);

async function loadUser() {
  user.value = await fetchUserFromDatabase();
}

async function deleteUser(id) {
  const result = await deleteUserFromDatabase(id);

  if (result.success) {
    user.value = user.value.filter(u => u.id !== id);
  } else {
    alert("Failed to delete User");
  }
}

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
  position:relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  background: transparent;
  border-collapse: collapse;
  border-radius: 12px;  
  box-shadow: 0 0 30px var(--vt-c-blue); /* warm glow */
  padding: 20px;
  background: rgba(0,0,0,0.25); /* ultra transparent */
  backdrop-filter: blur(3px);
}

.corner {
  position: absolute;
  width: 150px;
  height: 150px;
  top:245px;
  left:-15px;
  z-index:20; 
}

.table-container {
  width: 100%;
  overflow-x: auto;
  /*
  background: rgba(255, 240, 210, 0.05); 
  box-shadow: 0 0 30px rgba(0,0,0,0.5) inset;
  border-radius: 10px;
  background-color: var(--vt-c-parchment);
  background-blend-mode: multiply;
  background: radial-gradient( 
    circle at center, rgba(0, 0, 0, 0) 60%,  #ffe9b1 100% ), 
    url('../assets/PaperTextureCalm.png'
  );
  border: 2px solid var(--vt-c-dark-brown);
*/
}

.table{
  /* margin-top:10vh;
  width: 100%;
  max-width: 900px;
  min-width: 200px;  */
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
  /* border-bottom: 2px solid var(--vt-c-dark-brown); */
}

.popupButton {
  padding-left:0;
}

</style>