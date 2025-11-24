<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/Recaps')" :class="{ active: route.path === '/Recaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/Maps')" :class="{ active: route.path === '/Maps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/Rules')" :class="{ active: route.path === '/Rules' }">Rules</button>
<button class="invisibleButton" 
  @click="router.push(`/campaign/${campaignId}/members`)"
  :class="{ active: route.path.includes('/CampaignMembers') }">
  Members
</button>
  </nav>

  <div class="campaignPage" v-sound>
    <h2>Welcome to Your Campaign!</h2>
    <p>Here you can see all members of the campaign,change permissions, and delete the campaign</p>

    <div class="table-container">
      <div class="table">
        <div class="table-header">
          <div>Name</div>
          <div>Role</div>
          <div>Remove</div>
          </div>
      <div 
         v-for="member in members" 
          :key="member.userId" 
          class="table-row"
  >
    <div>{{ member.username }}</div>
    <div>{{ member.role }}</div>
    <div>
      <button class="popupButton" @click="deleteUser(member.userId)">
        Remove
      </button>
    </div>
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

.table{
  margin-top:10vh;
  width: 100%;
  max-width: 900px;
  min-width: 200px; 
  margin: auto;
  padding: 20px;
  justify-content: center;
  align-items:center;
  box-sizing: border-box;
  color: var(--vt-c-dark-brown);
}

.table-container {
  margin-top:10vh;
  margin-bottom:10vh;
  max-width: 900px;
  width: 100%;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  background-color: var(--vt-c-parchment);
  background-blend-mode: multiply;
  background: radial-gradient(
    circle at center, rgba(0, 0, 0, 0) 60%, /* center */ #ffe9b1 100% /* outside */), 
    url('../assets/PaperTextureCalm.png'
  );
  border: 2px solid var(--vt-c-dark-brown);
  border-radius: 12px;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr);
  border-bottom: 1px solid var(--vt-c-dark-brown);
}

.table-header > div,
.table-row > div {
  text-align: center;
  white-space: nowrap;  
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-header {
  font-weight: bold;
  font-size: 22px;
  border-bottom: 2px solid var(--vt-c-dark-brown);
}

</style>