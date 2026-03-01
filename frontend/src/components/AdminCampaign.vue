<template>
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
    </button>
  </div>
</template>

  <script>
    import{ ref, computed, onMounted} from 'vue';
    import {useRouter} from 'vue-router';
    import {apiFetch} from '../lib/api';
    const router = useRouter();

    const selectedCampaign = ref(null);
    const selectedMembers = ref([]);
    const showCampaignModal = ref(false);
    const membersLoading = ref(false);

    onMounted(() => {
        loadMyCampaigns();
    })
    
    //open the campaign modal
    async function openCampaignModal(campaign) {
  selectedCampaign.value = campaign;
  selectedMembers.value = [];
  showCampaignModal.value = true;
  membersLoading.value = true;
  try {
    const res = await apiFetch(`/data/campaign/list-all`);
    const body = await res.json();
    if (!res.ok || !body.valid) throw new Error(body.message || 'Failed to load members');
    selectedMembers.value = body.members || [];
  } catch (err) {
    console.error('load members failed:', err);
  } finally {
    membersLoading.value = false;
  }
}

// Close campaign detail modal
function closeCampaignModal() {
  showCampaignModal.value = false;
  selectedCampaign.value = null;
  selectedMembers.value = [];
}

// Filtered campaigns based on search and role filter
const filteredCampaigns = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return myCampaigns.value
    .filter(c => {
      if (selectedRoleFilter.value === 'Campaigns_You_Play_In') return c.role === 'Player'
      if (selectedRoleFilter.value === 'Campaigns_You_Run') return c.role === 'DM'
      return true
    })
    .filter(c => {
      if (!term) return true
      const title = (c.title || '').toLowerCase()
      const code = (c.joinCode || '').toLowerCase()
      return title.includes(term) || code.includes(term)
    })
})
  </script>