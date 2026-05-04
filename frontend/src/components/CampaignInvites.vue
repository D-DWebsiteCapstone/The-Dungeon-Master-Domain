<template>
  <div class="layout">
    <CampaignMenu :campaignId="campaignId" />
    <div class="campaignPage">
      <h2>The following travellers wish to join you on your journey:</h2>

      <!-- <button class="parchmentButton" @click="testRemoveInvite()">Test Remove Invite</button>
      <button class="parchmentButton" @click="testAddInvite()">Test Add Invite</button> -->

      <div class="CardSpacing fourCols">
        <div class="Card statusCard parchmentCard" v-if="loading">Loading your invites...</div>
        <div class="Card statusCard parchmentCard" v-else-if="error">{{ error }}</div>
        <div class="Card statusCard parchmentCard" v-else-if="pendingInvites.length === 0">No pending invites.</div>

        <button
          v-else
          v-for="invite in pendingInvites"
          :key="invite.id"
          type="button"
          class="parchmentButton campaignCardButton"
          @click="openInviteModal(invite)"
        >
          <div class="inviteCardInner">
            <img
              :src="invite.profilePicture"
              :alt="invite.username"
              class="invitePfp"
            />
            <div class="inviteUsername">{{ invite.username }}</div>
          </div>
        </button>
      </div>

      <!-- Modal -->
      <div class="modal" v-if="showInviteModal && selectedInvite">
        <div class="parchmentCard">
          <img :src="selectedInvite.profilePicture" :alt="selectedInvite.username" class="invitePfp" />
          <h2>{{ selectedInvite.username }} wants to join!</h2>
          <div v-if="actionError" class="error">{{ actionError }}</div>
          <div class="modalActions">
            <button class="parchmentButton" :disabled="actionLoading" @click="handleAction('accept')">Accept</button>
            <button class="parchmentButton" :disabled="actionLoading" @click="handleAction('decline')">Decline</button>
            <button class="parchmentButton" @click="closeModal()">Cancel</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../lib/api.js'
import CampaignMenu from './CampaignMenus.vue'

  const route = useRoute()
  const router = useRouter()
  const campaignId = route.params.campaignId

  //States
  const loading = ref(false);
  const error = ref(null);
  const pendingInvites= ref([]);
  const showInviteModal = ref(false);
  const selectedInvite = ref(null);
  const actionLoading = ref(false);
  const actionError = ref(null);


  //Modal Handlers
  
  //openInvite
  function openInviteModal(invite){
    selectedInvite.value = invite;
    showInviteModal.value = true;
  }

  //Close invite
  function closeModal() {
  showInviteModal.value = false;
  selectedInvite.value = null;
  actionError.value = null; // clear any previous error
}


async function handleAction(action) {
  actionLoading.value = true;
  actionError.value = null;
  try {
    const token = localStorage.getItem('authToken')
    await apiFetch(`/data/invites/${campaignId}/${selectedInvite.value.id}/${action}`, { 
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== selectedInvite.value.id);
    closeModal();
  } catch (err) {
    actionError.value = 'Something went wrong. Please try again.';
  } finally {
    actionLoading.value = false;
  }
}

async function loadInvites() {
  loading.value = true
  try {
    const res = await apiFetch(`/data/getInvites/${campaignId}`)
    const data = await res.json()
    pendingInvites.value = data.invites ?? [] // fallback to empty array
  } catch (err) {
    error.value = 'Failed to load invites'
    pendingInvites.value = [] // also fallback on error
  } finally {
    loading.value = false
  }
}

async function testRemoveInvite(){
  await apiFetch('/data/testRemove', {method: 'POST'});
}

async function testAddInvite(){
  await apiFetch('/data/testAdd', {method: 'POST'});
}


onMounted(() => {
  loadInvites();
});



</script>
<style>
.inviteCardInner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.invitePfp {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.inviteUsername {
  font-size: 1rem;
  font-weight: bold;
}
</style>