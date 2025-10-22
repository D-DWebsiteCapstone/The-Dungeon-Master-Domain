import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import TopBar from '../components/TopBar.vue'
import Campaign from '../components/Campaign.vue' // add later

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/TopBar', name: 'TopBar', component: TopBar },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router