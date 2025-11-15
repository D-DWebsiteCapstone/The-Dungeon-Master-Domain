import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import TopBar from '../components/TopBar.vue'
import TopBarLogin from '../components/TopBarLogin.vue'
import CharPage from '../components/CharPage.vue' 
import Campaign from '../components/Campaign.vue' 
import CampaignMembers from '../components/CampaignMembers.vue'
import Account from '../components/Account.vue' 
import Verify from '../components/Verify.vue'
import Reset from '../components/Reset.vue'

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/CharPage', name: 'CharPage', component: CharPage, meta: { requiresAuth: true } },
  { path: '/TopBar', name: 'TopBar', component: TopBar },
  { path: '/TopBarLogin', name: 'TopBarLogin', component: TopBarLogin },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign, props: true, meta: { requiresAuth: true } },
  {path: '/CampaignMembers', name: 'CampaignMembers', component: CampaignMembers},
  { path: '/Account', name: 'Account', component: Account, meta: { requiresAuth: true } },
  {path: '/verify', name: 'Verify', component: Verify},
  {path: '/reset', name: 'Reset', component: Reset}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('authToken')

  if (to.meta.requiresAuth && !token) {
    next('/Login')
  } else {
    // Optional — verify token is valid and user verified
    if (token && to.meta.requiresAuth) {
      const valid = await fetch('https://localhost:3000/user/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok)
      if (!valid) {
        localStorage.removeItem('authToken')
        next('/Login')
        return
      }
    }
    next()
  }
})

export default router