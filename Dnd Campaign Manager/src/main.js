import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')