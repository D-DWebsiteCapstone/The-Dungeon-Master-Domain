<template>
  <div v-if ="showHelpModal">

  </div>
  <div v-else>
    <button class="invisibleButton helpTicket" @click="openHelpModal()">
      <img alt="helpTicket" src="../assets/images/notepad.png" width="40" height="40"/> </img>
    </button>
  </div>

  <!-- Help modal -->
  <div v-if="showHelpModal" class="modal">
    <div class="popup">
      <div class="popuptxt">
        <h3>Help Ticket</h3>
        <br>
        <h4>See any bugs/issues with the website?</h4>
        <br>
        <h4>Fill out a ticket and we will help as soon as possible.</h4>
        <p v-if="helpStatus" class="error">{{ helpStatus }}</p>
        <div v-if="helpLoading">Loading help...</div>
        <div v-else>
          <div class="modal-actions">
            <input type="text" id="Type" placeholder="Issue Type">
            <textarea type="text" id="Description" placeholder="Description"></textarea>
            <button class="popupButton" type="button" @click="submitTroubleTicket">Submit</button>
            <button class="popupButton" type="button" :disabled="helpSaving" @click="closeHelpModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {fetchUsername, fetchEmail, submitTicket} from '../lib/dataHelper.js';
import { jwtDecode } from 'jwt-decode';

//token handling 
const token = localStorage.getItem("authToken");
const decoded = jwtDecode(token);

const userId = decoded.id;

defineProps(['id']);

// Help modal state
const showHelpModal = ref(false);
const helpStatus = ref('');
const helpLoading = ref(false);
const helpText = ref('');
const helpSaving = ref(false);

function openHelpModal() {
  showHelpModal.value = true;
  helpLoading.value = true;
  helpStatus.value = '';
  
  // Simulate loading (remove this in production)
  setTimeout(() => {
    helpLoading.value = false;
  }, 500)
}

function closeHelpModal() {
  showHelpModal.value = false;
  helpStatus.value = '';
  helpText.value = '';
}

async function submitTroubleTicket(){
  //Fetches the information
  const usernameResult = await fetchUsername(userId);
  const emailResult = await fetchEmail(userId);

  //drills into the results to grab the information
  const username = usernameResult.username;
  const email = emailResult.email;

  const type = document.getElementById('Type').value;
  const description = document.getElementById('Description').value;
  submitTicket(username, email, type, description);
  window.alert("Ticket submitted successfully. Thank you for sharing the issue!");
  closeHelpModal();

}
</script>

<style scoped>
.helpTicket{
  position: fixed;
  z-index: 20;
  bottom: 0;
  right: 0;
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

</style>