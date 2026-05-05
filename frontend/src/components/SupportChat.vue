<template>
  <div v-if="!showChatModal">
    <button class="invisibleButton AIChat" @click="openChatModal()">
      <img alt="RatSquirrel" src="../assets/Rat-Squirrel-Outline.png" width="45" height="45" />
    </button>
  </div>

  <div v-if="showChatModal" class="modal">
    <div class="chatBox">
      <div class="header"><h4>How can I help?</h4></div>
      <div class="chatMessageBox" ref="messageBox">
        <div class="spacer"></div>
        <p v-if="chatStatus" class="error">{{ chatStatus }}</p>
        <div class="message">
          <p v-for="(msg, index) in messages" :key="`${msg.role}-${index}`" :class="msg.role">
            {{ msg.content }}
          </p>
          <p v-if="chatLoading" class="assistant">Thinking...</p>
        </div>
      </div>

      <div class="chatBar">
        <input
          v-model="userInput"
          type="text"
          id="Type"
          placeholder="Ask a D&D question..."
          @keydown.enter="sendMessage"
        />
        <button class="sendButton" type="button" :disabled="chatLoading" @click="sendMessage">
          <img alt="send" src="../assets/images/icons/SoloQuill-WarmWhite.png">
        </button>
      </div>

      <div class="modal-actions">
        <button class="popupButton" type="button" @click="closeChatModal">X</button>
      </div>
      <div class="chatRat">
        <img alt="RatSquirrel" src="../assets/Rat-Squirrel-Outline.png" width="45" height="45" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiUrl } from '../lib/api.js'
import { nextTick, watch } from 'vue'

const messageBox = ref(null)
const showChatModal = ref(false)
const chatStatus = ref('')
const chatLoading = ref(false)
const userInput = ref('')
const messages = ref([])

function openChatModal() {
  showChatModal.value = true
  chatStatus.value = ''

  if (messages.value.length === 0) {
    messages.value.push({ role: 'assistant', content: 'Ask me anything about Dungeons and Dragons.' })
  }
}

function closeChatModal() {
  showChatModal.value = false
  chatStatus.value = ''
}

async function sendMessage() {
  const messageText = userInput.value.trim()
  if (!messageText || chatLoading.value) return

  messages.value.push({ role: 'user', content: messageText })
  userInput.value = ''
  chatStatus.value = ''
  chatLoading.value = true

  const aiMessage = { role: 'assistant', content: '' }
  messages.value.push(aiMessage)

  try {
    const response = await fetch(apiUrl('/ai/chat/stream'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText })
    })

    if (!response.ok || !response.body) {
      throw new Error('Failed to get chat response')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      aiMessage.content += decoder.decode(value, { stream: true })
      await nextTick()
      scrollToBottom()
      messages.value = [...messages.value]
    }
  } catch (error) {
    console.error('Support chat failed:', error)
    chatStatus.value = 'Unable to reach AI chat right now.'
    aiMessage.content = 'I could not respond. Please try again in a moment.'
  } finally {
    chatLoading.value = false
  }
}
function scrollToBottom() {
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight
  }
}

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>

.modal {
  justify-content: right;
  align-items: right;
  max-height: 100%;
}

.AIChat {
  position: fixed;
  z-index: 20;
  bottom: 12px;
  right: 0;
}

.chatBox {
  display: inline;
  position: relative;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 35vw;
  height: 100vh;
  background: var(--vt-c-dark-grey);
}

.chatMessageBox {
  background: var(--vt-c-grey);
  border-radius: 7px;
  width: 92%;
  height: 87%;
  display: flex;
  margin: auto;
  padding: 10px;
  gap: 1rem;

  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  overflow-y: auto;
}

.spacer {
  flex: 1;
}

.message {
  display: flex;
  flex-direction: column;
  width: 100%;

}

.message p {
  background: var(--vt-c-warm-white);
  border: solid 2px var(--vt-c-navy);
  border-radius: 5px;
  margin-bottom: 5px;
  margin-top: 1rem;
  padding: 3px;
  color: var(--vt-c-navy);
}

.user {
  margin-left: 20%;
}

.assistant {
  margin-right: 20%;
}

p {
  font-size: 0.75rem;
}

.chatBar {
  position: absolute;
  bottom: 2px;
  left: 6px;
  width: calc(100% - 6px);
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
}

input {
  width: calc(100% - 30px);
  color: var(--vt-c-navy);
  background-color: var(--vt-c-golden);
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  margin-bottom: 0;
  margin-top: 0px;
}

.sendButton {
  margin-top: 0px;
  width: 25px;
  height: 25px;
  background: var(--vt-c-navy);
  padding: 0;
}

.sendButton img {
  width: 20px;
  height: 20px;
}

input::placeholder {
  outline: none;
  color: var(--vt-c-navy);
}

input:focus {
  color: var(--vt-c-red);
}

h4 {
  margin-bottom: 8px;
  padding-bottom: 0;
  color: var(--vt-c-warm-white);
}

.popupButton {
  position: absolute;
  background: var(--vt-c-navy);
  color: var(--vt-c-golden);
  padding: 5px 0;
  bottom: 10px;
  left: -50px;
  border-radius: 10px;
  min-width: 40px !important;
  max-width: 40px;
}

.chatRat {
  position: absolute;
  transform: scaleX(-1);
  bottom: 50px;
  left: -35px;
}

@media (max-width: 730px) {
  .chatBox {
    width: 50vw;
  }

  .popupButton {
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