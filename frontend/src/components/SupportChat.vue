<template>
  <div v-if ="showChatModal">

  </div>
  <div v-else>
    <button class="invisibleButton AIChat" @click="openChatModal()">
      <img alt="RatSquirrel" src="../assets/Rat-Squirrel.png" width="40" height="40"/> </img>
    </button>
  </div>

  <!-- Help modal -->
  <div v-if="showChatModal" class="modal">
    <div class="chatBox">
      <div class="header"><h4>How can I help?</h4></div> 
        <div class="chatMessageBox">
          <p v-if="chatStatus" class="error">{{ chatStatus }}</p>
          <div v-if="chatLoading">Loading chat...</div>
          <div v-else>

            <div class="message">
              <p>Hey rat, how ya doin?</p>
            </div>


          </div>

          
          <div class="modal-actions">
            <button class="popupButton" type="button" @click="closeChatModal">X</button>
          </div>
        </div>
        <div class="chatBar"><input type="text" id="Type" placeholder="Type here..."></div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {fetchUsername, fetchEmail, submitTicket} from '../lib/dataHelper.js';
import { jwtDecode } from 'jwt-decode';

//token handling
function getUserID(){
  const token = localStorage.getItem("authToken");
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  return userId;
}

defineProps(['id']);

// Help modal state
const showChatModal = ref(false);
const chatStatus = ref('');
const chatLoading = ref(false);
const chatText = ref('');
const chatSaving = ref(false);

function openChatModal() {
  showChatModal.value = true;
  chatLoading.value = true;
  chatStatus.value = '';
  
  // Simulate loading (remove this in production)
  setTimeout(() => {
    chatLoading.value = false;
  }, 500)
}

function closeChatModal() {
  showChatModal.value = false;
  chatStatus.value = '';
  chatText.value = '';
}


</script>

<style scoped>
.modal {
  justify-content: right;
  align-items: right;
}

.AIChat{
  position: fixed;
  z-index: 20;
  bottom: 0;
  right: 0;
}

.chatBox {
  display: inline;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 20%;
  height: 100%;
  background: var(--vt-c-dark-grey);
}

.chatMessageBox {
  background: var(--vt-c-grey);
  width: 95%;
  height: 85%;
  margin: auto;
}

textarea {
  width: 90%;
  height: 100px;
  margin-top:10px;
  font-family: "Cinzel", serif;
  color: var(--vt-c-navy);
  resize: vertical;
  background-color: var(--vt-c-golden);
  border-radius: 5px;
  border: 1px solid var(--vt-c-bronze);
}

input {
  width:90%;
  color: var(--vt-c-navy);
  background-color: var(--vt-c-golden);
  font-family: "Cinzel", serif;
}

textarea::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

input::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

textarea:focus {
  outline: none;
  border-color: var(--vt-c-red);
  color: var(--vt-c-red);
}

input:focus {
  color: var(--vt-c-red);
}

@media (max-width: 730px)  { 
button {
  width: 30px;
}
}

h4 {
  margin-bottom: 10px;
  padding-bottom: 0;
  color: var(--vt-c-golden);
}

</style>