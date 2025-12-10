import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import TopBar from '../components/TopBar.vue'
import TopBarLogin from '../components/TopBarLogin.vue'
import CharPage from '../components/CharPage.vue' 
import Campaign from '../components/Campaign.vue' 
import CampaignMembers from '../components/CampaignMembers.vue'
import CampaignMaps from '../components/CampaignMaps.vue'
import CampaignRules from '../components/CampaignRules.vue'
import CampaignRecaps from '../components/CampaignRecaps.vue'
import CampaignCharacters from '../components/CampaignCharacters.vue'
import Account from '../components/Account.vue' 
import Verify from '../components/Verify.vue'
import Reset from '../components/Reset.vue'
import { apiFetch } from '../lib/api'

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', name: 'Login', component: Login },
  { path: '/Home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/CharPage', name: 'CharPage', component: CharPage, meta: { requiresAuth: true } },
  { path: '/TopBar', name: 'TopBar', component: TopBar },
  { path: '/TopBarLogin', name: 'TopBarLogin', component: TopBarLogin },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign, props: true, meta: { requiresAuth: true } },
  { path: '/campaign/:campaignId/members', name: 'CampaignMembers', component: CampaignMembers, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/maps', name: 'CampaignMaps', component: CampaignMaps, props: true, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/characters', name: 'CampaignCharacters', component: CampaignCharacters, props: true, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/rules', name: 'CampaignRules', component: CampaignRules, props: true, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/recaps', name: 'CampaignRecaps', component: CampaignRecaps, props: true, meta: { requiresAuth: true }},
  { path: '/Account', name: 'Account', component: Account, meta: { requiresAuth: true } },
  { path: '/verify', name: 'Verify', component: Verify},
  { path: '/reset', name: 'Reset', component: Reset}
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

    if (token && to.meta.requiresAuth) {
      const valid = await apiFetch('/user/verify-token', {
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
