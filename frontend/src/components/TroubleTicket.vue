<template>
  <button @click="openHelpModal()">Help Button</button>

  <!-- Help modal -->
  <div v-if="showHelpModal" class="popup">
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
          <input type="text" id="Description" placeholder="Description">
          <button class="popupButton" type="button" @click="submitTroubleTicket">Submit</button>
          <button class="popupButton" type="button" :disabled="helpSaving" @click="closeHelpModal">Close</button>
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