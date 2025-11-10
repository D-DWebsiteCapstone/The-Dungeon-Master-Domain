import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import TopBar from '../components/TopBar.vue'
import TopBarLogin from '../components/TopBarLogin.vue'
import CharPage from '../components/CharPage.vue' 
import Campaign from '../components/Campaign.vue' // add later
import Account from '../components/Account.vue' 
import Verify from '../components/Verify.vue'
import Reset from '../components/Reset.vue'

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home },
  { path: '/CharPage', name: 'CharPage', component: CharPage }, // new route
  { path: '/TopBar', name: 'TopBar', component: TopBar },
  { path: '/TopBarLogin', name: 'TopBarLogin', component: TopBarLogin },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign, props: true },
  { path: '/Account', name: 'Account', component: Account },
  {path: '/verify', name: 'Verify', component: Verify},
  {path: '/reset', name: 'Reset', component: Reset}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router