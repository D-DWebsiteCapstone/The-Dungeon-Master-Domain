import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import scrollReset from './scrollReset.js'
import router from './router/index.js'
import soundDirective from './v-sound.js';

const app = createApp(App)
app.use(VCalendar, {}) 
app.use(router)
app.directive('sound', soundDirective)
app.directive('scroll-reset', scrollReset)

app.mount('#app')