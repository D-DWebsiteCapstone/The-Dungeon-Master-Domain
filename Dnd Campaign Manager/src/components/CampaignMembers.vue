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
    <p>Here you can see all members of the campaign and change permissions</p>

  
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
        <button @click="deleteUser(user.id)">Remove Player</button>
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
  return [
    { id: 1, name: "Will", role: "DM" },
    { id: 2, name: "Carter", role: "Player" },
    { id: 2, name: "Connor", role: "Player" },
    { id: 2, name: "Damien", role: "Player" }
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
//const campaignId = route.params.id

// Define reactive state for campaign data
//const campaignData = ref(null)

// Fetch campaign info when page loads
// onMounted(async () => {
//   try {
//     const response = await fetch(`https://localhost:3000/data/campaign/${campaignId}`)
//     const result = await response.json()
//     if (result.valid) {
//       campaignData.value = result.campaign
//       console.log('Campaign data loaded:', result.campaign)
//     } else {
//       console.error('Failed to load campaign:', result.message)
//     }
//   } catch (err) {
//     console.error('Error fetching campaign:', err)
//   }
// })
</script>
<style scoped>

.members-grid {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 0px;
  background: url('../assets/PaperTextureCalm.png');
  padding: 20px;
  border-radius: 12px;
  max-width: 900px;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  padding: 8px;
  border-bottom: 1px solid #eaeaea;
  align-items: center;
}

.table-header {
  background: #f7f7f7;
  font-weight: bold;
  font-size: 22px;
}

</style>