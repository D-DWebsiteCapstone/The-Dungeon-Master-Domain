<template>
  <div v-if ="showChatModal">

  </div>
  <div v-else>
    <button class="invisibleButton AIChat" @click="openChatModal()">
      <img alt="RatSquirrel" src="../assets/Rat-Squirrel-Outline.png" width="45" height="45"/>
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
              <p>Hey, you. You're finally awake.</p>
              <p>I just need a longer message here to see how this will react to being multiple lines
                 high. Hopefully, it will do what I want.</p>
            </div>



          </div>

        
        </div>

        <div class="chatBar"><input type="text" id="Type" placeholder="Type here..."></div>
        <div class="modal-actions">
          <button class="popupButton" type="button" @click="closeChatModal">X</button>
        </div>
        <div class="chatRat">
          <img alt="RatSquirrel" src="../assets/Rat-Squirrel-Outline.png" width="45" height="45"/>
        </div>
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
.chatBar{
  position: absolute;
  bottom: 0px;
  width: 100%;
}
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
  position: relative;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 35vw;
  height: 100%;
  background: var(--vt-c-dark-grey);
}

.chatMessageBox {
  background: var(--vt-c-grey);
  border-radius: 7px;
  width: 90%;
  height: 85%;
  /* justify-content: center;
  display: inline-flex; */
  display: flex;
  margin: auto;
  padding: 10px;
  align-items: end;
  gap: 1rem;
  overflow-y: scroll;
}

.message {
  margin: auto;
  min-width: 100%;
  height: fit-content;
  max-height: 200px;
  
  p{
  background: var(--vt-c-warm-white);
  border: solid 2px var(--vt-c-navy);
  border-radius: 5px;
  margin-bottom: 5px;
  margin-top: 1rem;
  padding: 3px;
  color: var(--vt-c-navy);
  }

}

p {
  font-size: 0.75rem;
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
  font-size: 0.75rem;
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


h4 {
  margin-bottom: 10px;
  padding-bottom: 0;
  color: var(--vt-c-warm-white);
}

.popupButton {
  position: absolute;
  background: var(--vt-c-navy);
  color: var(--vt-c-golden);
  padding: 5px 0px;
  bottom: 10px;;
  left: -50px;
  background-color: var(--vt-c-navy);
  border-radius: 10px;
  color: var(--vt-c-golden);
  min-width: 40px !important;
  max-width: 40px;
}

.chatRat {
  position: absolute;
  transform: scaleX(-1);
  bottom: 50px;;
  left: -35px;
}


@media (max-width: 730px)  { 
  .chatBox {
    width: 50vw;
  }
  button {
    width: 30px;
  }
}


@media (max-width: 480px) {
  .chatBox {
    width: 80vw;
  }

    .popupButton {
      min-width: 30px !important;
      max-width: 30px;
      left: -35px;
    }
}

</style>