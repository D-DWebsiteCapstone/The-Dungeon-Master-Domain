<template>
  <div class="CardSpacing fourCols">
    <div class="Card statusCard parchmentCard" v-if="loadingCampaigns">Loading your campaigns...</div>
    <div class="Card statusCard parchmentCard" v-else-if="campaignsError">{{ campaignsError }}</div>
    <div class="Card statusCard parchmentCard" v-else-if="myCampaigns.length === 0">No campaigns found.</div>
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
      <div class="card7Meta">Code: {{ c.joinCode || '—' }}</div>
    </button>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from '../lib/api';

const router = useRouter();

// State
const selectedCampaign = ref(null);
const selectedMembers = ref([]);
const showCampaignModal = ref(false);
const membersLoading = ref(false);
const myCampaigns = ref([]);
const loadingCampaigns = ref(false);
const campaignsError = ref('');
const searchTerm = ref('');
const selectedRoleFilter = ref('All');

onMounted(() => {
  loadAllCampaigns();
});

// Open the campaign modal and load its members
async function openCampaignModal(campaign) {
  selectedCampaign.value = campaign;
  selectedMembers.value = [];
  showCampaignModal.value = true;
  membersLoading.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const res = await apiFetch(`/data/campaign/${campaign.id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load members');
    selectedMembers.value = body.members || [];
  } catch (err) {
    console.error('load members failed:', err);
  } finally {
    membersLoading.value = false;
  }
}

// Close campaign modal
function closeCampaignModal() {
  showCampaignModal.value = false;
  selectedCampaign.value = null;
  selectedMembers.value = [];
}

// Load all campaigns from the database
async function loadAllCampaigns() {
  campaignsError.value = '';
  loadingCampaigns.value = true;
  try {
    const token = localStorage.getItem('authToken');
    const res = await apiFetch('/data/campaign/list-all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load campaigns');
    myCampaigns.value = body.campaigns || [];
  } catch (err) {
    console.error('loadAllCampaigns failed:', err);
    campaignsError.value = err.message || 'Failed to load campaigns.';
  } finally {
    loadingCampaigns.value = false;
  }
}

// Filtered campaigns based on search term
const filteredCampaigns = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  return myCampaigns.value.filter(c => {
    if (!term) return true;
    const title = (c.title || '').toLowerCase();
    const code = (c.joinCode || '').toLowerCase();
    return title.includes(term) || code.includes(term);
  });
});
</script>

<style scoped>
.parchmentCard {
  background: radial-gradient(
    circle at center, rgba(0, 0, 0, 0) 60%,
    #ffe9b1 100%),
    url('../assets/PaperTextureCalm.png');
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

.CardSpacing {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 1.5rem 0;
}
</style>

