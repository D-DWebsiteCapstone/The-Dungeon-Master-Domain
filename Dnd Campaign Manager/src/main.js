import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import scrollReset from './scrollReset.js'
import router from './router/index.js'

const app = createApp(App)
app.use(router)
app.directive('scroll-reset', scrollReset)
app.mount('#app')