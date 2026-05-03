<template>
  <div class="layout">
    <CampaignMenu :campaignId="campaignId" />
  
    <div class="campaignPage" v-sound>
      <div class="page-header">
        <h2 class="page-title">Campaign Messages</h2>
        <p class="page-subtitle">Announcements from your Dungeon Master</p>
      </div>
  
      <!-- Loading -->
      <div v-if="loading" class="state-box">
        <span class="spinner"></span>
        <p>Loading messages…</p>
      </div>
  
      <!-- Error -->
      <div v-if="error" class="error-msg">{{ error }}</div>
  
      <!-- DM compose box -->
      <div v-if="isDM && !loading" class="composeBox">
        <h3 class="compose-title">New Announcement</h3>
        <textarea
          v-model="newMessage"
          class="compose-input"
          placeholder="Write your message to the party…"
          rows="4"
          maxlength="2000"
          @keydown.ctrl.enter="sendMessage"
        />
        <div class="compose-footer">
          <span class="char-count">{{ newMessage.length }} / 2000</span>
          <button
            class="btn btn-primary"
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
          >
            {{ sending ? 'Sending…' : 'Send to Party' }}
          </button>
        </div>
      </div>
  
      <!-- Empty state -->
      <div v-if="!loading && messages.length === 0" class="state-box empty-box">
        <div class="empty-icon">
          <img alt="Scroll" src="../assets/images/icons/Quill-Parchment.png">
        </div>
        <p>No messages yet.</p>
        <p v-if="!isDM" class="empty-hint">Your DM hasn't sent any announcements.</p>
      </div>
  
      <!-- Messages list -->
      <div v-else-if="!loading" class="messageList">
        <div
          v-for="(msg, i) in [...messages].reverse()"
          :key="msg.id"
          class="messageCard"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <!-- Header -->
          <div class="msg-header">
            <div class="msg-sender-wrap">
              <div class="msg-seal">{{ msg.senderName.charAt(0).toUpperCase() }}</div>
              <div>
                <p class="msg-sender">{{ msg.senderName }}</p>
                <p class="msg-role">Dungeon Master</p>
              </div>
            </div>
            <div class="msg-header-right">
              <span class="msg-time">{{ formatDate(msg.created_at) }}</span>
              <button
                v-if="isDM"
                class="icon-btn delete-btn"
                title="Delete message"
                @click="confirmDelete(msg.id)"
              >
              X<!-- <img alt="Delete" src="../assets/images/icons/Grave-WarmWhite.png"> -->
            </button>
            </div>
          </div>
  
          <!-- Content -->
          <p class="msg-content">{{ msg.content }}</p>
        </div>
      </div>
    </div>
  </div>
    <!-- DELETE MODAL -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
        <div class="modal-box modal-danger">
          <div class="danger-icon">⚠️</div>
          <h3 class="modal-title danger-title">Delete Message</h3>
          <p class="modal-body-text">Are you sure? This cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-cancel" @click="closeDeleteModal">Cancel</button>
            <button class="btn btn-delete" @click="deleteMessage" :disabled="sending">
              {{ sending ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { apiFetch } from '../lib/api'
  import CampaignMenu from './CampaignMenus.vue'
  
  const route = useRoute()
  const router = useRouter()
  const campaignId = route.params.campaignId
  
  const messages = ref([])
  const loading = ref(true)
  const sending = ref(false)
  const error = ref('')
  const newMessage = ref('')
  const isDM = ref(false)
  const members = ref([])
  
  const showDeleteModal = ref(false)
  const deletingId = ref(null)
  
  onMounted(async () => {
    await checkIfDm()
    await loadMessages()
  })
  
  // ── DM check (same pattern as your other views) ──
  const checkIfDm = async () => {
    try {
      const res = await apiFetch(`/data/campaign/${campaignId}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      const result = await res.json()
      if (result.valid) {
        members.value = result.members
        const currentUserId = JSON.parse(atob(localStorage.getItem('authToken').split('.')[1])).id
        const me = result.members.find(m => m.userId === currentUserId)
        isDM.value = me?.role === 'DM'
      }
    } catch (e) {
      console.error('Failed to check DM status:', e)
    }
  }
  
  // ── Load messages ──
  async function loadMessages() {
    loading.value = true
    error.value = ''
    try {
      const res = await apiFetch(`/data/campaign/${campaignId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      messages.value = data.valid ? data.messages : []
    } catch {
      error.value = 'Failed to load messages.'
    } finally {
      loading.value = false
    }
  }
  
  // ── Send message ──
  async function sendMessage() {
    if (!newMessage.value.trim() || sending.value) return
    sending.value = true
    error.value = ''
    try {
      const res = await apiFetch(`/data/campaign/${campaignId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ content: newMessage.value })
      })
      if (!res.ok) throw new Error()
      newMessage.value = ''
      await loadMessages()
    } catch {
      error.value = 'Failed to send message.'
    } finally {
      sending.value = false
    }
  }
  
  // ── Delete ──
  function confirmDelete(id) {
    deletingId.value = id
    showDeleteModal.value = true
  }
  
  function closeDeleteModal() {
    showDeleteModal.value = false
    deletingId.value = null
  }
  
  async function deleteMessage() {
    if (!deletingId.value || sending.value) return
    sending.value = true
    try {
      const res = await apiFetch(`/data/message/${deletingId.value}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      if (!res.ok) throw new Error()
      await loadMessages()
      closeDeleteModal()
    } catch {
      error.value = 'Failed to delete message.'
    } finally {
      sending.value = false
    }
  }
  
  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }
  </script>
  
  <style scoped>
  .page-header {
    text-align: center;
    margin: 0rem 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    color: var(--vt-c-golden);
    margin: 0;
    letter-spacing: 0.04em;
  }
  
  .page-subtitle {
    color: var(--vt-c-dark-parchment);
    font-style: italic;
    margin: 0.4rem 0 0;
    font-size: 0.95rem;
  }
  
  /* ── Compose box ── */
  .composeBox {
    max-width: 720px;
    margin: 0 auto 2.5rem;
    background: linear-gradient(145deg, rgba(30, 27, 26, 0.95), rgba(20, 17, 17, 0.98));
    border: 1px solid #e8c173b9;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    animation: cardFadeIn 0.4s ease both;
    z-index: 1;
  }

  .compose-title {
    color: var(--vt-c-parchment);
    font-family: Cinzel, serif;
    margin: 0 0 1rem;
    font-size: 1rem;
  }
  
  .compose-input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid #3a3020;
    border-radius: 8px;
    color: #e8d5a0;
    padding: 12px 14px;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .composeBox::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12;
  background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
  pointer-events: none;
  z-index: 0;
  }
    
  .compose-input:focus {
    outline: none;
    border-color: var(--vt-c-parchment);
    box-shadow: 0 0 0 3px rgba(192, 168, 106, 0.12);
  }
  
  .compose-input::placeholder { color: #6a5a40; }
  
  .compose-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  
  .char-count {
    color: #6a5a40;
    font-size: 0.75rem;
    margin-right: 8px;
  }
  
  /* ── Message list ── */
  .messageList {
    max-width: 750px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 3rem;
  }
  
  .messageCard {
    background: linear-gradient(145deg, rgba(30, 27, 26, 0.95), rgba(20, 17, 17, 0.98));
    border: 1px solid #e8c173b9;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    animation: cardFadeIn 0.35s ease both;
    transition: border-color 0.2s ease;
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    animation: cardFadeIn 0.4s ease both;
    z-index: 1;
  }

  .messageCard::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .messageCard::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;

    box-shadow:
      0 0 12px rgba(255, 215, 120, 0.655),
      0 0 24px rgba(255, 215, 120, 0.509);

    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 2;
  }

  .messageCard:hover::after {
    opacity: 1;
  }

  .messageCard:hover {
    border-color: rgba(192, 168, 106, 0.7);
    transform: translateY(-3px) scale(1.01);
    box-shadow:
      0 16px 30px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
  }

  .messageCard:hover .icon-btn { opacity: 1; }

  @keyframes cardFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  
  .msg-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.85rem;
    gap: 1rem;
  }
  
  .msg-sender-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .msg-seal {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: radial-gradient(circle, #3a2e1a, #1e1810);
    border: 2px solid var(--vt-c-dark-parchment);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c6a965d0;
    font-size: 1.1rem;
    font-weight: 700;
    font-family: Georgia, serif;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgb(0, 0, 0), inset 0 1px 0 rgba(192,168,106,0.2);
    text-shadow: 0 0 6px rgba(241, 225, 183, 0.422);
  }
  
  .msg-sender {
    color: var(--vt-c-golden);
    font-weight: 700;
    font-size: 0.95rem;
    display: block;
  }
  
  .msg-role {
    color: var(--vt-c-parchment);
    font-size: 0.72rem;
    font-style: italic;
    display: block;
  }
  
  .msg-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  
  .msg-time {
    color: var(--vt-c-dark-parchment);
    font-size: 0.75rem;
    white-space: nowrap;
  }
  
  .msg-content {
    color: var(--vt-c-parchment);
    line-height: 1.75;
    font-size: 0.95rem;
    white-space: pre-wrap;
    margin: 0;
  }
  
  /* ── Buttons ── */
  .btn {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 9px 22px;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'Cinzel', serif;
  }

  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-primary {
    background: var(--vt-c-parchment);
    color: var(--vt-c-dark-brown);

    background: linear-gradient(
      145deg,
      #f7e7a3 0%,
      #e4c76a 30%,
      #c9a645 50%,
      #a67c1f 70%,
      #e8d18a 100%
    );

    box-shadow:
      inset 0 2px 3px rgba(255,255,255,0.6),
      inset 0 -3px 5px rgba(0,0,0,0.25),
      0 4px 10px rgba(0,0,0,0.35);

    text-shadow:
      0 0.75px 0 rgba(255,255,255,0.6),
      0 -0.75px 0 rgba(0,0,0,0.3);
  }
  .btn-primary:hover:not(:disabled) { background: #d4b87a; }
  .btn-delete   { background: var(--vt-c-red); color: var(--vt-c-warm-white); }
  .btn-delete:hover:not(:disabled) { background: #cd4646; }
  .btn-cancel   { background: var(--vt-c-dark-grey); color: var(--vt-c-warm-white); border: 1px solid #555; }
  .btn-cancel:hover:not(:disabled) { background: #4a453f; }
  
  .icon-btn {
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s;
    background: var(--vt-c-red);
    color: var(--vt-c-warm-white);
    opacity: 0;
  }
  .icon-btn img{ height: 24px; width: 24px; }
  .icon-btn:hover { transform: scale(1.15); background: rgba(224, 68, 68, 0.5); }
  
  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.88);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    padding: 1rem;
  }
  
  .modal-box {
    background: linear-gradient(160deg, #1e1912, #151209);
    border: 1px solid rgba(192, 168, 106, 0.45);
    border-radius: 14px;
    padding: 2rem;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 24px 80px rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: modalIn 0.2s ease;
  }
  
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  .modal-danger  { border-color: rgba(224, 68, 68, 0.5); }
  .modal-title   { color: var(--vt-c-parchment); text-align: center; margin: 0 0 8px; font-size: 1.2rem; font-family: Georgia, serif; }
  .danger-title  { color: #e04444; }
  .danger-icon   { text-align: center; font-size: 2rem; }
  .modal-body-text { color: #bbb; text-align: center; line-height: 1.6; margin: 0; }
  .modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 12px; }
  
  /* ── States ── */
  .state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 4rem 2rem;
    color: #8a7a5a;
    font-style: italic;
  }
  
  .empty-box {
    background: rgba(0,0,0,0.25);
    border-radius: 16px;
    border: 2px dashed var(--vt-c-dark-parchment);
    max-width: 350px;
    min-width: 250px;
    width: fit-content;
    margin: 3rem auto;
    padding: 2rem;
  }
  
  .empty-icon img { height: 60px; width: 60px;}
  .empty-hint  { color: var(--vt-c-dark-parchment); font-size: 0.85rem; margin: 0; }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(192, 168, 106, 0.2);
    border-top-color: var(--vt-c-parchment);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .error-msg {
    color: #ff7777;
    background: rgba(255,68,68,0.08);
    border: 1px solid rgba(255,68,68,0.3);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    text-align: center;
    max-width: 500px;
    margin: 1rem auto;
  }
  
  @media (max-width: 600px) {
    .composeBox, .messageList { padding: 1rem; }
    .msg-header { flex-direction: column; gap: 0.5rem; }
    .msg-sender, .msg-role {  text-align: left;  }
    .icon-btn {  position: absolute; top: 1rem; right: 1rem; }
    .msg-header-right { align-self: left; }
    .icon-btn { opacity: 1;}
  }

  @media (max-width: 550px) {
  .campaignPage { margin-left: 10px;}
}
  </style>