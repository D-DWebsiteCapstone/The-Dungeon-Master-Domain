import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

import router from './router/index.js'

const app = createApp(App)
app.use(VCalendar, {}) 
app.use(router)
app.mount('#app')