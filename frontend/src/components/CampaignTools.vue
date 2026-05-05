<template>
  <div class="layout">
    <CampaignMenu :campaignId="campaignId" />

    <div class="campaignPage" v-sound>
      <div class="page-header">
        <h2 class="page-title">Reference & Tools</h2>
        <p class="page-subtitle">Quick access to rules, tables and guides</p>
      </div>

      <!-- Search -->
      <div class="searchWrap">
        <input
          v-model="search"
          class="searchInput"
          placeholder="Search conditions, spells, monsters…"
          @input="onSearch"
          @keydown.enter="runSearch"
        />
        <button v-if="search" class="clearSearch" @click="clearSearch">✕</button>
      </div>

      <!-- Search results from Open5e -->
      <div v-if="activeSearch" class="searchResults">
        <div v-if="searchLoading" class="no-results">Searching Open5e…</div>
        <div v-else-if="searchResults.length === 0" class="no-results">No results for "{{ search }}"</div>
        <div v-else>
          <div
            v-for="r in searchResults"
            :key="r.slug"
            class="searchResult"
            @click="openSearchDetail(r)"
          >
            <span class="result-section">{{ r.document__title || r.type }}</span>
            <span class="result-label">{{ r.name }}</span>
            <span class="result-preview">{{ truncate(r.desc || r.description || '', 80) }}</span>
          </div>
        </div>
      </div>

      <!-- Search detail modal -->
      <Teleport to="body">
        <div v-if="searchDetail" class="modal-backdrop" @click.self="searchDetail = null">
          <div class="modal-box">
            <h3 class="modal-title">{{ searchDetail.name }}</h3>
            <p class="detail-source">{{ searchDetail.document__title }}</p>
            <div class="detail-scroll">
              <p class="detail-text">{{ searchDetail.desc || searchDetail.description || 'No description available.' }}</p>
            </div>
            <div class="modal-actions">
              <button class="btn btn-cancel" @click="searchDetail = null">Close</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Section tabs -->
      <div class="tabBar" v-if="!activeSearch">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── CONDITIONS ── -->
      <section v-if="activeTab === 'conditions' && !activeSearch" class="section">
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading…</div>
        <div v-else class="conditionGrid">
          <div
            v-for="(c, i) in conditions"
            :key="c.slug"
            class="conditionCard"
            :style="{ animationDelay: `${i * 30}ms` }"
            :class="{ expanded: expandedCondition === c.slug }"
            @click="expandedCondition = expandedCondition === c.slug ? null : c.slug"
          >
            <div class="condition-header">
              <span class="condition-name">{{ c.name }}</span>
              <span class="condition-toggle">{{ expandedCondition === c.slug ? '▲' : '▼' }}</span>
            </div>
            <div v-if="expandedCondition === c.slug" class="condition-desc">
              {{ c.desc }}
            </div>
          </div>
        </div>
      </section>

      <!-- ── SPELLS ── -->
      <section v-if="activeTab === 'spells' && !activeSearch" class="section">
        <div class="filter-row">
          <select v-model="spellFilters.level" class="roller-input" @change="loadSpells">
            <option value="">All Levels</option>
            <option v-for="l in 9" :key="l" :value="l">Level {{ l }}</option>
            <option value="0">Cantrip</option>
          </select>
          <select v-model="spellFilters.school" class="roller-input" @change="loadSpells">
            <option value="">All Schools</option>
            <option v-for="s in spellSchools" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading spells…</div>
        <div v-else class="referenceList">
          <div
            v-for="spell in spells"
            :key="spell.slug"
            class="referenceRow clickable"
            @click="openDetail(spell, 'spell')"
          >
            <span class="ref-label">{{ spell.name }}</span>
            <span class="ref-desc">
              {{ spell.school }} · Lvl {{ spell.level_int === 0 ? 'Cantrip' : spell.level_int }}
              · {{ spell.casting_time }}
              <em v-if="spell.concentration === 'yes'"> · Concentration</em>
            </span>
          </div>
        </div>
        <div class="pagination">
          <button class="btn btn-cancel" :disabled="spellPage <= 1" @click="spellPage--; loadSpells()">← Prev</button>
          <span class="page-indicator">Page {{ spellPage }}</span>
          <button class="btn btn-cancel" :disabled="spells.length < 20" @click="spellPage++; loadSpells()">Next →</button>
        </div>
      </section>

      <!-- ── MONSTERS ── -->
      <section v-if="activeTab === 'monsters' && !activeSearch" class="section">
        <div class="filter-row">
          <select v-model="monsterFilters.cr" class="roller-input" @change="loadMonsters">
            <option value="">All CR</option>
            <option v-for="cr in crValues" :key="cr" :value="cr">CR {{ cr }}</option>
          </select>
          <select v-model="monsterFilters.type" class="roller-input" @change="loadMonsters">
            <option value="">All Types</option>
            <option v-for="t in monsterTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading monsters…</div>
        <div v-else class="referenceList">
          <div
            v-for="m in monsters"
            :key="m.slug"
            class="referenceRow clickable"
            @click="openDetail(m, 'monster')"
          >
            <span class="ref-label">{{ m.name }}</span>
            <span class="ref-desc">
              CR {{ m.challenge_rating }} · {{ m.type }} · {{ m.size }}
              · HP {{ m.hit_points }} · AC {{ m.armor_class }}
            </span>
          </div>
        </div>
        <div class="pagination">
          <button class="btn btn-cancel" :disabled="monsterPage <= 1" @click="monsterPage--; loadMonsters()">← Prev</button>
          <span class="page-indicator">Page {{ monsterPage }}</span>
          <button class="btn btn-cancel" :disabled="monsters.length < 20" @click="monsterPage++; loadMonsters()">Next →</button>
        </div>
      </section>

      <!-- ── MAGIC ITEMS ── -->
      <section v-if="activeTab === 'items' && !activeSearch" class="section">
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading items…</div>
        <div v-else class="referenceList">
          <div
            v-for="item in magicItems"
            :key="item.slug"
            class="referenceRow clickable"
            @click="openDetail(item, 'item')"
          >
            <span class="ref-label">{{ item.name }}</span>
            <span class="ref-desc">{{ item.type }} · {{ item.rarity }}</span>
          </div>
        </div>
        <div class="pagination">
          <button class="btn btn-cancel" :disabled="itemPage <= 1" @click="itemPage--; loadItems()">← Prev</button>
          <span class="page-indicator">Page {{ itemPage }}</span>
          <button class="btn btn-cancel" :disabled="magicItems.length < 20" @click="itemPage++; loadItems()">Next →</button>
        </div>
      </section>

      <!-- ── COMBAT (static — rules don't change) ── -->
      <section v-if="activeTab === 'combat' && !activeSearch" class="section">
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading combat rules…</div>
        <div v-else class="referenceList">
          <div
            v-for="(item, i) in combatReference"
            :key="item.label"
            class="referenceRow"
            :style="{ animationDelay: `${i * 25}ms` }"
          >
            <span class="ref-label">{{ item.label }}</span>
            <span class="ref-desc">{{ item.description }}</span>
          </div>
        </div>
      </section>

      <!-- ── DICE TABLES (static) ── -->
      <section v-if="activeTab === 'dice' && !activeSearch" class="section">
        <div v-if="tabLoading" class="tab-loading"><span class="spinner"></span> Loading dice data…</div>
        <div v-else class="diceGrid">
          <div v-for="(d, i) in diceReference" :key="d.die" class="diceCard" :style="{ animationDelay: `${i * 40}ms` }">
            <div class="die-face">{{ d.die }}</div>
            <div class="die-avg">avg <strong>{{ d.avg }}</strong></div>
            <p class="die-uses">{{ d.uses }}</p>
          </div>
        </div>
      </section>

      <!-- ── DICE ROLLER ── -->
      <section v-if="activeTab === 'roller' && !activeSearch" class="section">
        <div class="rollerBox">
          <h3 class="roller-title">Dice Roller</h3>
          <div class="rollerControls">
            <div class="roller-group">
              <label class="roller-label">Number of dice</label>
              <input v-model.number="roller.count" type="number" min="1" max="20" class="roller-input short" />
            </div>
            <div class="roller-group">
              <label class="roller-label">Die type</label>
              <select v-model.number="roller.sides" class="roller-input">
                <option v-for="s in [4,6,8,10,12,20,100]" :key="s" :value="s">d{{ s }}</option>
              </select>
            </div>
            <div class="roller-group">
              <label class="roller-label">Modifier</label>
              <input v-model.number="roller.modifier" type="number" class="roller-input short" />
            </div>
          </div>
          <button class="btn btn-primary roller-btn" @click="rollDice">
            Roll {{ roller.count }}d{{ roller.sides }}{{ roller.modifier >= 0 ? '+' : '' }}{{ roller.modifier || '' }}
          </button>
          <div v-if="rollResult" class="rollResult">
            <div class="roll-total">{{ rollResult.total }}</div>
            <div class="roll-breakdown">
              Rolls: [{{ rollResult.rolls.join(', ') }}]
              <span v-if="roller.modifier"> {{ roller.modifier >= 0 ? '+' : '' }}{{ roller.modifier }} modifier</span>
            </div>
            <div class="roll-history">
              <span v-for="(r, i) in rollHistory.slice(0, 5)" :key="i" class="history-chip">{{ r }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── DETAIL MODAL (spells / monsters / items) ── -->
      <Teleport to="body">
        <div v-if="detailItem" class="modal-backdrop" @click.self="detailItem = null">
          <div class="modal-box detail-modal">
            <h3 class="modal-title">{{ detailItem.name }}</h3>
            <p class="detail-source">{{ detailItem.document__title }}</p>

            <!-- Spell detail -->
            <template v-if="detailType === 'spell'">
              <div class="detail-grid">
                <span class="dg-label">Level</span><span class="dg-val">{{ detailItem.level_int === 0 ? 'Cantrip' : detailItem.level_int }}</span>
                <span class="dg-label">School</span><span class="dg-val">{{ detailItem.school }}</span>
                <span class="dg-label">Casting Time</span><span class="dg-val">{{ detailItem.casting_time }}</span>
                <span class="dg-label">Range</span><span class="dg-val">{{ detailItem.range }}</span>
                <span class="dg-label">Duration</span><span class="dg-val">{{ detailItem.duration }}</span>
                <span class="dg-label">Components</span><span class="dg-val">{{ detailItem.components }}</span>
                <span class="dg-label">Concentration</span><span class="dg-val">{{ detailItem.concentration }}</span>
                <span class="dg-label">Classes</span><span class="dg-val">{{ detailItem.dnd_class }}</span>
              </div>
            </template>

            <!-- Monster detail -->
            <template v-if="detailType === 'monster'">
              <div class="detail-grid">
                <span class="dg-label">CR</span><span class="dg-val">{{ detailItem.challenge_rating }}</span>
                <span class="dg-label">Type</span><span class="dg-val">{{ detailItem.type }} · {{ detailItem.size }}</span>
                <span class="dg-label">HP</span><span class="dg-val">{{ detailItem.hit_points }} ({{ detailItem.hit_dice }})</span>
                <span class="dg-label">AC</span><span class="dg-val">{{ detailItem.armor_class }}</span>
                <span class="dg-label">Speed</span><span class="dg-val">{{ detailItem.speed?.walk || '—' }} ft</span>
                <span class="dg-label">STR/DEX/CON</span><span class="dg-val">{{ detailItem.strength }}/{{ detailItem.dexterity }}/{{ detailItem.constitution }}</span>
                <span class="dg-label">INT/WIS/CHA</span><span class="dg-val">{{ detailItem.intelligence }}/{{ detailItem.wisdom }}/{{ detailItem.charisma }}</span>
                <span class="dg-label">Senses</span><span class="dg-val">{{ detailItem.senses || '—' }}</span>
                <span class="dg-label">Languages</span><span class="dg-val">{{ detailItem.languages || '—' }}</span>
              </div>
            </template>

            <!-- Item detail -->
            <template v-if="detailType === 'item'">
              <div class="detail-grid">
                <span class="dg-label">Type</span><span class="dg-val">{{ detailItem.type }}</span>
                <span class="dg-label">Rarity</span><span class="dg-val">{{ detailItem.rarity }}</span>
                <span class="dg-label">Attunement</span><span class="dg-val">{{ detailItem.requires_attunement || 'No' }}</span>
              </div>
            </template>

            <div class="detail-scroll">
              <p class="detail-text">{{ detailItem.desc || detailItem.description || 'No description available.' }}</p>
            </div>
            <div class="modal-actions">
              <button class="btn btn-cancel" @click="detailItem = null">Close</button>
            </div>
          </div>
        </div>
      </Teleport>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CampaignMenu from './CampaignMenus.vue'
import { apiUrl } from '../lib/api.js'

const route = useRoute()
const campaignId = route.params.campaignId

// ── Tabs ──
const tabs = [
  { key: 'conditions', label: 'Conditions',   icon: '🤕' },
  { key: 'spells',     label: 'Spells',        icon: '✨' },
  { key: 'monsters',   label: 'Monsters',      icon: '🐉' },
  { key: 'items',      label: 'Magic Items',   icon: '⚗️' },
  { key: 'combat',     label: 'Combat',        icon: '⚔️' },
  { key: 'dice',       label: 'Dice Tables',   icon: '🎲' },
  { key: 'roller',     label: 'Dice Roller',   icon: '🎰' },
]

const activeTab = ref('conditions')
const tabLoading = ref(false)
const expandedCondition = ref(null)

// ── Open5e data ──
const conditions = ref([])
const spells = ref([])
const monsters = ref([])
const magicItems = ref([])

const spellFilters = ref({ level: '', school: '' })
const monsterFilters = ref({ cr: '', type: '' })
const spellPage = ref(1)
const monsterPage = ref(1)
const itemPage = ref(1)

const spellSchools = ref([])
const monsterTypes = ref([])
const crValues = ref([])

// Static references (will be loaded from backend)
const combatReference = ref([])
const diceReference = ref([])

// ── Search ──
const search = ref('')
const activeSearch = ref(false)
const searchLoading = ref(false)
const searchResults = ref([])
const searchDetail = ref(null)

// ── Detail modal ──
const detailItem = ref(null)
const detailType = ref('')

// ── Dice roller ──
const roller = ref({ count: 1, sides: 20, modifier: 0 })
const rollResult = ref(null)
const rollHistory = ref([])

// ── API helpers ──
async function apiFetch(endpoint, options = {}) {
  const url = apiUrl(`/data${endpoint}`)
  const response = await fetch(url, options)
  const data = await response.json()
  if (!data.valid) throw new Error(data.message || 'API error')
  return data.data
}

async function loadMetadata() {
  try {
    const metadata = await apiFetch('/metadata')
    spellSchools.value = metadata.spellSchools || []
    monsterTypes.value = metadata.monsterTypes || []
    crValues.value = metadata.crValues || []
  } catch (error) {
    console.error('Failed to load metadata:', error)
  }
}

async function loadReferences() {
  try {
    const references = await apiFetch('/references')
    combatReference.value = references.combatReference || []
    diceReference.value = references.diceReference || []
  } catch (error) {
    console.error('Failed to load references:', error)
  }
}

async function loadConditions() {
  tabLoading.value = true
  try {
    const data = await apiFetch('/conditions?limit=100')
    conditions.value = data || []
  } catch (error) {
    console.error('Failed to load conditions:', error)
    conditions.value = []
  } finally {
    tabLoading.value = false
  }
}

async function loadSpells() {
  tabLoading.value = true
  try {
    const offset = (spellPage.value - 1) * 20
    let url = `/spells?limit=20&offset=${offset}`
    if (spellFilters.value.level !== '') url += `&level_int=${spellFilters.value.level}`
    if (spellFilters.value.school) url += `&school=${encodeURIComponent(spellFilters.value.school)}`
    const data = await apiFetch(url)
    spells.value = data || []
  } catch (error) {
    console.error('Failed to load spells:', error)
    spells.value = []
  } finally {
    tabLoading.value = false
  }
}

async function loadMonsters() {
  tabLoading.value = true
  try {
    const offset = (monsterPage.value - 1) * 20
    let url = `/monsters?limit=20&offset=${offset}`
    if (monsterFilters.value.cr) url += `&challenge_rating=${monsterFilters.value.cr}`
    if (monsterFilters.value.type) url += `&type=${encodeURIComponent(monsterFilters.value.type)}`
    const data = await apiFetch(url)
    monsters.value = data || []
  } catch (error) {
    console.error('Failed to load monsters:', error)
    monsters.value = []
  } finally {
    tabLoading.value = false
  }
}

async function loadItems() {
  tabLoading.value = true
  try {
    const offset = (itemPage.value - 1) * 20
    const data = await apiFetch(`/items?limit=20&offset=${offset}`)
    magicItems.value = data || []
  } catch (error) {
    console.error('Failed to load items:', error)
    magicItems.value = []
  } finally {
    tabLoading.value = false
  }
}

async function switchTab(key) {
  activeTab.value = key
  if (key === 'conditions' && conditions.value.length === 0) {
    await loadConditions()
  } else if (key === 'spells' && spells.value.length === 0) {
    await loadSpells()
  } else if (key === 'monsters' && monsters.value.length === 0) {
    await loadMonsters()
  } else if (key === 'items' && magicItems.value.length === 0) {
    await loadItems()
  } else if (key === 'combat' && combatReference.value.length === 0) {
    await loadReferences()
  } else if (key === 'dice' && diceReference.value.length === 0) {
    await loadReferences()
  }
}

// ── Search ──
let searchDebounce = null
function onSearch() {
  if (!search.value.trim()) { 
    activeSearch.value = false
    searchResults.value = []
    return 
  }
  activeSearch.value = true
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(runSearch, 400)
}

async function runSearch() {
  if (!search.value.trim()) return
  searchLoading.value = true
  searchResults.value = []
  try {
    const data = await apiFetch(`/search?query=${encodeURIComponent(search.value)}&limit=20`)
    searchResults.value = data || []
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

function clearSearch() {
  search.value = ''
  activeSearch.value = false
  searchResults.value = []
}

function openSearchDetail(r) {
  searchDetail.value = r
}

// ── Detail modal ──
function openDetail(item, type) {
  detailItem.value = item
  detailType.value = type
}

// ── Dice roller ──
function rollDice() {
  const rolls = Array.from({ length: roller.value.count }, () =>
    Math.floor(Math.random() * roller.value.sides) + 1
  )
  const total = rolls.reduce((a, b) => a + b, 0) + (roller.value.modifier || 0)
  rollResult.value = { rolls, total }
  rollHistory.value.unshift(total)
  if (rollHistory.value.length > 10) rollHistory.value.pop()
}

// ── Utils ──
function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

onMounted(async () => {
  await Promise.all([loadMetadata(), loadReferences()])
  await loadConditions()
})
</script>

<style scoped>
.layout {
  display: flex;
  align-items: flex-start;
}
.campaignPage {
  flex: 1;
  min-width: 0;
}

.page-header {
  text-align: center;
  margin: 0 0 1.5rem;
}
.page-title {
  font-size: 2rem;
  color: var(--vt-c-golden);
  margin: 0;
  letter-spacing: 0.04em;
}
.page-subtitle {
  color: var(--vt-c-dark-parchment);
  font-style: italic;
  margin: 0.4rem 0 0;
  font-size: 0.95rem;
}

/* ── Search ── */
.searchWrap {
  position: relative;
  width: 80%;
  max-width: 550px;
  margin: 0 auto 1.5rem;
}
.searchInput {
  width: 100%;
  background: rgba(0,0,0,0.527);
  border: 1px solid var(--vt-c-bronze);
  border-radius: 10px;
  color: var(--vt-c-golden);
  padding: 12px 40px 12px 16px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.searchInput:focus { outline: none; border-color: var(--vt-c-golden); box-shadow: 0 0 0 3px rgba(192,192,106,0.12); }
.searchInput::placeholder { color: #756447a0; }
.clearSearch {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  color: var(--vt-c-dark-parchment); cursor: pointer; font-size: 1rem;
}

.searchResults {
  max-width: 560px;
  margin: 0 auto 2rem;
  background: rgba(20,17,10,0.97);
  border: 1px solid var(--vt-c-bronze);
  border-radius: 10px;
  overflow: hidden;
}
.no-results { padding: 1.5rem; text-align: center; color: var(--vt-c-dark-parchment); font-style: italic; }
.searchResult {
  display: grid;
  grid-template-columns: 130px 1fr;
  grid-template-rows: auto auto;
  gap: 2px 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(192,168,106,0.1);
  cursor: pointer;
  transition: background 0.15s;
}
.searchResult:hover { background: rgba(192,168,106,0.07); }
.result-section { color: var(--vt-c-golden); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; grid-row: 1; }
.result-label   { color: var(--vt-c-golden); font-weight: 700; font-size: 0.9rem; grid-row: 1; }
.result-preview { color: var(--vt-c-parchment); font-size: 0.8rem; grid-column: 2; grid-row: 2; }

/* ── Tabs ── */
.tabBar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.tab {
  background: rgba(0,0,0,0.543);
  border: 1px solid rgba(192,168,106,0.2);
  border-radius: 8px;
  color: var(--vt-c-dark-parchment);
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: Cinzel, serif;
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.tab:hover:not(.active) { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(78,19,19,0.929); filter: brightness(1.2); }
.tab:active { transform: translateY(3px); box-shadow: 0 2px 5px rgba(0,0,0,0.6); filter: brightness(0.95); }
.tab.active {
  transform: translateY(2px);
  pointer-events: none;
  box-shadow: 0 0 8px rgba(123,34,34,0.861), 0 2px 6px rgba(0,0,0,0.6);
  filter: brightness(1.05);
}

/* ── Section ── */
.section {
  max-width: 500px;
  min-width: 85%;
  margin: 0 auto;
  padding-bottom: 4rem;
}

.tab-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 3rem;
  color: var(--vt-c-dark-parchment);
  font-style: italic;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.clickable { cursor: pointer; }
.clickable:hover { border-color: var(--vt-c-golden) !important; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 1.5rem;
}
.page-indicator { color: var(--vt-c-dark-parchment); font-size: 0.85rem; }

/* ── Conditions ── */
.conditionGrid {
  display: grid;
  width: 100%;
  grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
  gap: 0.85rem;
}
.conditionCard {
  background: linear-gradient(145deg, rgba(30,27,26,0.95), rgba(20,17,17,0.98));
  box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -3px 6px rgba(0,0,0,0.6);
  border: 1px solid rgba(192,168,106,0.2);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  animation: fadeUp 0.35s ease both;
}
.conditionCard::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: radial-gradient(ellipse at top left, rgba(192,168,106,0.05), transparent 60%);
  pointer-events: none;
}
.conditionCard:hover, .conditionCard.expanded { border-color: var(--vt-c-parchment); }
.condition-header { display: flex; justify-content: space-between; align-items: center; }
.condition-name { color: var(--vt-c-golden); font-weight: 700; font-family: Cinzel, serif; }
.condition-toggle { color: var(--vt-c-parchment); font-size: 0.75rem; }
.condition-desc {
  margin-top: 0.75rem;
  color: #a09070;
  font-size: 0.85rem;
  line-height: 1.65;
  text-align: left;
}

/* ── Reference rows ── */
.referenceList { display: flex; flex-direction: column; gap: 0.6rem; }
.referenceRow {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 0 1.5rem;
  background: linear-gradient(145deg, rgba(30,27,26,0.95), rgba(20,17,17,0.98));
  border: 1px solid rgba(192,168,106,0.15);
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  position: relative;
  align-items: start;
  animation: fadeUp 0.3s ease both;
  transition: border-color 0.2s;
}
.referenceRow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: radial-gradient(ellipse at top left, rgba(192,168,106,0.05), transparent 60%);
  pointer-events: none;
}
.ref-label { color: var(--vt-c-parchment); font-weight: 700; font-size: 0.9rem; font-family: Cinzel, serif; }
.ref-desc  { color: #a09070; font-size: 0.88rem; line-height: 1.6; }
.sub-heading { color: var(--vt-c-parchment); font-family: Cinzel, serif; margin: 2rem 0 1rem; font-size: 1.05rem; }

/* ── Dice ── */
.diceGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}
.diceCard {
  background: linear-gradient(145deg, rgba(30,27,26,0.95), rgba(20,17,17,0.98));
  box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -3px 6px rgba(0,0,0,0.6);
  border: 1px solid rgba(192,168,106,0.2);
  border-radius: 12px;
  padding: 1.25rem 1rem;
  text-align: center;
  position: relative;
  animation: fadeUp 0.35s ease both;
  transition: border-color 0.2s, transform 0.2s;
}
.die-face { font-size: 2rem; font-weight: 900; color: var(--vt-c-parchment); font-family: Cinzel, serif; }
.die-avg  { color: var(--vt-c-dark-parchment); font-size: 0.8rem; margin: 0.25rem 0 0.75rem; }
.die-avg strong { color: var(--vt-c-golden); }
.die-uses { color: var(--vt-c-parchment); font-size: 0.78rem; line-height: 1.5; margin: 0; }

/* ── Dice Roller ── */
.rollerBox {
  max-width: 520px;
  margin: 0 auto;
  background: linear-gradient(145deg, rgba(30,27,26,0.95), rgba(20,17,17,0.98));
  box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05), inset 0 -3px 6px rgba(0,0,0,0.6);
  border: 1px solid rgba(192,168,106,0.3);
  border-radius: 16px;
  position: relative;
  padding: 1.5rem;
  text-align: center;
}
.roller-title { color: var(--vt-c-parchment); font-family: Cinzel, serif; margin: 0 0 1.5rem; font-size: 1.2rem; }
.rollerControls { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
.roller-group { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.roller-label { color: var(--vt-c-dark-parchment); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
.roller-input {
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--vt-c-bronze);
  border-radius: 6px;
  color: var(--vt-c-golden);
  padding: 8px 12px;
  font-size: 1rem;
  width: 100px;
  transition: border-color 0.2s;
}
.roller-input.short { width: 70px; }
.roller-input:focus { outline: none; border-color: var(--vt-c-parchment); }
.roller-input option { background: var(--vt-c-grey); }
.roller-btn { font-size: 1.05rem; padding: 12px 32px; }
.rollResult { margin-top: 1.75rem; }
.roll-total {
  font-size: 4rem; font-weight: 900;
  color: var(--vt-c-parchment); font-family: Cinzel, serif;
  line-height: 1;
  text-shadow: 0 0 30px rgba(192,168,106,0.4);
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.roll-breakdown { color: var(--vt-c-dark-parchment); font-size: 0.85rem; margin: 0.5rem 0 1rem; }
.roll-history { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.history-chip {
  background: rgba(192,168,106,0.1);
  border: 1px solid rgba(192,168,106,0.2);
  color: var(--vt-c-dark-parchment);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.78rem;
}

/* ── Detail modal ── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.88);
  display: flex; justify-content: center; align-items: center;
  z-index: 99999; padding: 1rem;
}
.modal-box {
  background: linear-gradient(160deg, #1e1912, #151209);
  border: 1px solid rgba(192,168,106,0.45);
  border-radius: 14px; padding: 2rem;
  max-width: 540px; width: 100%;
  box-shadow: 0 24px 80px rgba(0,0,0,0.9);
  display: flex; flex-direction: column; gap: 10px;
  animation: modalIn 0.2s ease;
}
@keyframes modalIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.modal-title { color: var(--vt-c-golden); text-align: center; margin: 0; font-size: 1.3rem; font-family: Cinzel, serif; }
.detail-source { color: #6a5a40; font-size: 0.75rem; text-align: center; font-style: italic; margin: 0; }

.detail-grid {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 6px 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 4px 0;
}
.dg-label { color: var(--vt-c-golden); font-size: 0.78rem; font-weight: 700; font-family: Cinzel, serif; }
.dg-val   { color: #c8b88a; font-size: 0.82rem; }

.detail-scroll {
  max-height: 220px;
  overflow-y: auto;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.detail-scroll::-webkit-scrollbar { width: 4px; }
.detail-scroll::-webkit-scrollbar-thumb { background: rgba(192,168,106,0.3); border-radius: 2px; }
.detail-text { color: #c8b88a; line-height: 1.75; font-size: 0.88rem; margin: 0; white-space: pre-wrap; }
.modal-actions { display: flex; justify-content: center; margin-top: 4px; }

/* ── Buttons ── */
.btn {
  border: none; border-radius: 6px; cursor: pointer;
  font-weight: 700; font-size: 0.9rem; padding: 9px 22px;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  display: inline-flex; align-items: center; gap: 5px;
}
.btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary {
  background: linear-gradient(145deg, #f7e7a3 0%, #e4c76a 30%, #c9a645 50%, #a67c1f 70%, #e8d18a 100%);
  color: var(--vt-c-dark-brown);
  box-shadow: inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 5px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.35);
}
.btn-cancel { background: #3a3530; color: #ccc; border: 1px solid #555; }
.btn-cancel:hover:not(:disabled) { background: #4a453f; }

/* ── Spinner ── */
.spinner {
  width: 22px; height: 22px;
  border: 3px solid rgba(192,168,106,0.2);
  border-top-color: var(--vt-c-golden);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 700px) {
  .referenceRow { grid-template-columns: 1fr; gap: 0.3rem; }
  .tabBar { gap: 6px; }
  .tab { padding: 7px 12px; font-size: 0.8rem; }
  .detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 550px) {
  .layout { display: block; }
}
</style>
