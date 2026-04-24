import { createRouter, createWebHistory } from 'vue-router'
import { apiFetch } from '../lib/api'

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
import CampaignNpcs from '../components/CampaignNpcs.vue'
import CampaignTools from '../components/CampaignTools.vue'
import CampaignMessages from '../components/CampaignMessages.vue'

import LevelUp from '../components/LevelPages/LevelUp.vue'
import Barbarian from '../components/LevelPages/Barbarian.vue'

import Account from '../components/AccountPages/Account.vue' 
import Verify from '../components/Verify.vue'
import Reset from '../components/Reset.vue'
import TroubleTicket from '../components/TroubleTicket.vue'

import AdminCampaign from '../components/AdminCampaign.vue'
import AdminCharacters from '../components/AdminCharacters.vue'

import AccountProfile from '../components/AccountPages/AccountProfile.vue'
import AccountHelp from '../components/AccountPages/AccountHelp.vue'
import AccountDiscord from '../components/AccountPages/AccountDiscord.vue'

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
  { path: '/campaign/:campaignId/npcs', name: 'CampaignNpcs', component: CampaignNpcs, props: true, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/messages', name: 'CampaignMessages', component: CampaignMessages, props: true, meta: { requiresAuth: true }},
  { path: '/campaign/:campaignId/tools', name: 'CampaignTools', component: CampaignTools, props: true, meta: { requiresAuth: true }},
  { path: "/Account",
  component: Account,
  meta: { requiresAuth: true },
  children: [
    {
      path: "",
      redirect: "/Account/profile"
    },
    {
      path: "profile",
      component: AccountProfile
    },
    {
      path: "help",
      component: AccountHelp
    },
    {
      path: "discord",
      component: AccountDiscord
    }
  ]},
  { path: '/LevelUp', name: 'LevelUp', component: LevelUp},
  { path: '/LevelUp/Barbarian', name: 'Barbarian', component: Barbarian},
  { path: '/verify', name: 'Verify', component: Verify},
  { path: '/reset', name: 'Reset', component: Reset},
  { path: '/TroubleTicket', name: 'TroubleTicket', component: TroubleTicket},
  { path: '/AdminCampaign', name: 'AdminCampaign', component: AdminCampaign},
  { path: '/AdminCharacters', redirect: '/AdminCharacters/1' },
  { path: '/AdminCharacters/:page', name: 'AdminCharacters', component: AdminCharacters }
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
