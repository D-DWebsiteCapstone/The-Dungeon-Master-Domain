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
          placeholder="Search conditions, stats, cover…"
          @input="onSearch"
        />
        <button v-if="search" class="clearSearch" @click="search = ''; activeSearch = false">✕</button>
      </div>
  
      <!-- Search results -->
      <div v-if="activeSearch" class="searchResults">
        <div v-if="searchResults.length === 0" class="no-results">No results for "{{ search }}"</div>
        <div v-else>
          <div v-for="r in searchResults" :key="r.key" class="searchResult" @click="jumpTo(r.section)">
            <span class="result-section">{{ r.section }}</span>
            <span class="result-label">{{ r.label }}</span>
            <span class="result-preview">{{ r.preview }}</span>
          </div>
        </div>
      </div>
  
      <!-- Section tabs -->
      <div class="tabBar" v-if="!activeSearch">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
  
      <!-- ── CONDITIONS ── -->
      <section v-if="activeTab === 'conditions' && !activeSearch" class="section" ref="conditions">
        <div class="conditionGrid">
          <div
            v-for="(c, i) in reference.conditions"
            :key="c.name"
            class="conditionCard"
            :style="{ animationDelay: `${i * 30}ms` }"
            :class="{ expanded: expandedCondition === c.name }"
            @click="expandedCondition = expandedCondition === c.name ? null : c.name"
          >
            <div class="condition-header">
              <span class="condition-name">{{ c.name }}</span>
              <span class="condition-toggle">{{ expandedCondition === c.name ? '▲' : '▼' }}</span>
            </div>
            <ul v-if="expandedCondition === c.name" class="condition-effects">
              <li v-for="e in c.effects" :key="e">{{ e }}</li>
            </ul>
          </div>
        </div>
      </section>
  
      <!-- ── COMBAT ── -->
      <section v-if="activeTab === 'combat' && !activeSearch" class="section" ref="combat">
        <div class="referenceList">
          <div
            v-for="(item, i) in reference.combat"
            :key="item.label"
            class="referenceRow"
            :style="{ animationDelay: `${i * 25}ms` }"
          >
            <span class="ref-label">{{ item.label }}</span>
            <span class="ref-desc">{{ item.description }}</span>
          </div>
        </div>
      </section>
  
      <!-- ── DICE ── -->
      <section v-if="activeTab === 'dice' && !activeSearch" class="section" ref="dice">
        <div class="diceGrid">
          <div
            v-for="(d, i) in reference.dice"
            :key="d.die"
            class="diceCard"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <div class="die-face">{{ d.die }}</div>
            <div class="die-avg">avg <strong>{{ d.avg }}</strong></div>
            <p class="die-uses">{{ d.uses }}</p>
          </div>
        </div>
      </section>
  
      <!-- ── ABILITIES ── -->
      <section v-if="activeTab === 'abilities' && !activeSearch" class="section" ref="abilities">
        <div class="abilityGrid">
          <div
            v-for="(a, i) in reference.abilities"
            :key="a.stat"
            class="abilityCard"
            :style="{ animationDelay: `${i * 35}ms` }"
          >
            <div class="ability-abbr">{{ a.abbr }}</div>
            <div class="ability-name">{{ a.stat }}</div>
            <div class="ability-skills"><em>Skills:</em> {{ a.skills }}</div>
            <div class="ability-uses">{{ a.uses }}</div>
          </div>
        </div>
      </section>
  
      <!-- ── SPELLCASTING ── -->
      <section v-if="activeTab === 'spells' && !activeSearch" class="section" ref="spells">
        <div class="referenceList">
          <div
            v-for="(item, i) in reference.spellcasting"
            :key="item.label"
            class="referenceRow"
            :style="{ animationDelay: `${i * 25}ms` }"
          >
            <span class="ref-label">{{ item.label }}</span>
            <span class="ref-desc">{{ item.description }}</span>
          </div>
        </div>
        <h4 class="sub-heading">Cover</h4>
        <div class="referenceList">
          <div v-for="c in reference.cover" :key="c.type" class="referenceRow">
            <span class="ref-label">{{ c.type }}</span>
            <span class="ref-desc"><strong>{{ c.bonus }}</strong> — {{ c.example }}</span>
          </div>
        </div>
      </section>
  
      <!-- ── MOVEMENT ── -->
      <section v-if="activeTab === 'movement' && !activeSearch" class="section" ref="movement">
        <div class="referenceList">
          <div
            v-for="(item, i) in reference.movement"
            :key="item.label"
            class="referenceRow"
            :style="{ animationDelay: `${i * 25}ms` }"
          >
            <span class="ref-label">{{ item.label }}</span>
            <span class="ref-desc">{{ item.description }}</span>
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
          <button class="btn btn-primary roller-btn" @click="rollDice">Roll {{ roller.count }}d{{ roller.sides }}{{ roller.modifier >= 0 ? '+' : '' }}{{ roller.modifier || '' }}</button>
  
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
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { reference } from '../lib/dndReference'

  import CampaignMenu from './CampaignMenus.vue'
  
  const route = useRoute()
  const router = useRouter()
  const campaignId = route.params.campaignId
  
  const tabs = [
    { key: 'conditions', label: 'Conditions',   icon: '🤕' },
    { key: 'combat',     label: 'Combat',        icon: '⚔️' },
    { key: 'dice',       label: 'Dice Tables',   icon: '🎲' },
    { key: 'abilities',  label: 'Abilities',     icon: '💪' },
    { key: 'spells',     label: 'Spellcasting',  icon: '✨' },
    { key: 'movement',   label: 'Movement',      icon: '🏃' },
    { key: 'roller',     label: 'Dice Roller',   icon: '🎰' },
  ]
  
  const activeTab = ref('conditions')
  const expandedCondition = ref(null)
  
  // ── Search ──
  const search = ref('')
  const activeSearch = ref(false)
  
  const searchResults = computed(() => {
    if (!search.value.trim()) return []
    const q = search.value.toLowerCase()
    const results = []
  
    reference.conditions.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.effects.some(e => e.toLowerCase().includes(q))) {
        results.push({ key: c.name, section: 'Conditions', label: c.name, preview: c.effects[0] })
      }
    })
    reference.combat.forEach(c => {
      if (c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({ key: c.label, section: 'Combat', label: c.label, preview: c.description.slice(0, 60) + '…' })
      }
    })
    reference.spellcasting.forEach(c => {
      if (c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({ key: c.label, section: 'Spellcasting', label: c.label, preview: c.description.slice(0, 60) + '…' })
      }
    })
    reference.movement.forEach(c => {
      if (c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({ key: c.label, section: 'Movement', label: c.label, preview: c.description.slice(0, 60) + '…' })
      }
    })
    reference.abilities.forEach(a => {
      if (a.stat.toLowerCase().includes(q) || a.skills.toLowerCase().includes(q)) {
        results.push({ key: a.stat, section: 'Abilities', label: a.stat, preview: a.skills })
      }
    })
  
    return results
  })
  
  function onSearch() {
    activeSearch.value = search.value.trim().length > 0
  }
  
  function jumpTo(section) {
    search.value = ''
    activeSearch.value = false
    const map = { Conditions: 'conditions', Combat: 'combat', Spellcasting: 'spells', Movement: 'movement', Abilities: 'abilities' }
    activeTab.value = map[section] || 'conditions'
  }
  
  // ── Dice Roller ──
  const roller = ref({ count: 1, sides: 20, modifier: 0 })
  const rollResult = ref(null)
  const rollHistory = ref([])
  
  function rollDice() {
    const rolls = Array.from({ length: roller.value.count }, () =>
      Math.floor(Math.random() * roller.value.sides) + 1
    )
    const total = rolls.reduce((a, b) => a + b, 0) + (roller.value.modifier || 0)
    rollResult.value = { rolls, total }
    rollHistory.value.unshift(total)
    if (rollHistory.value.length > 10) rollHistory.value.pop()
  }
  </script>
  
  <style scoped>
  .layout {
  display: flex;
  align-items: flex-start;
}
.campaignPage {
  flex: 1;
  min-width: 0; /* VERY important for preventing overflow issues */
}
  .page-header {
    text-align: center;
    margin: 2rem 0 1.5rem;
  }
  .page-title {
    font-size: 2rem;
    color: var(--vt-c-parchment);
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
    background: rgba(0, 0, 0, 0.527);
    border: 1px solid var(--vt-c-bronze);
    border-radius: 10px;
    color: var(--vt-c-golden);
    padding: 12px 40px 12px 16px;
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .searchInput:focus { outline: none; border-color: var(--vt-c-golden); box-shadow: 0 0 0 3px rgba(192, 192, 106, 0.12); }
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
    grid-template-columns: 110px 1fr;
    grid-template-rows: auto auto;
    gap: 2px 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--vt-c-dark-parchment);
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
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .tab {
    background: rgba(0, 0, 0, 0.543);
    border: 1px solid rgba(192,168,106,0.2);
    border-radius: 8px;
    color: var(--vt-c-dark-parchment);
    position: relative;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    font-family: Cinzel, serif;
    transition: all 0.2s ease;

    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  /* Hover = lift + glow */
  .tab:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(78, 19, 19, 0.929);
    filter: brightness(1.2);
  }

  /* Click = drop */
  .tab:active {
    transform: translateY(3px); /* drops below baseline */
    box-shadow: 0 2px 5px rgba(0,0,0,0.6);
    filter: brightness(0.95);
  }

  /* Hover (only if NOT active) */
  .tab:not(.active):hover {
    transform: translateY(-4px);
    filter: brightness(1.2);
  }

  /* Active state (locked in) */
  .tab.active {
    transform: translateY(2px); /* slightly pressed */
    filter: brightness(1.1);
    box-shadow: 0 2px 6px rgba(0,0,0,0.6);
    pointer-events: none;

    /* subtle outer glow */
    box-shadow:
      0 0 8px rgba(123, 34, 34, 0.861),
      0 2px 6px rgba(0, 0, 0, 0.6);

    /* slight color lift */
    filter: brightness(1.05);
  }

  /* Prevent hover from affecting active */
  .tab.active:hover {
    transform: translateY(2px); /* stays pressed */
    filter: brightness(1.1);
  }

  /* ── Section ── */
  .section {
    max-width: 500px;
    min-width: 85%;
    margin: 0 auto;
    padding-bottom: 4rem;
  }
  
  /* ── Conditions ── */
  .conditionGrid {
    display: grid;
  
    width: 100%;
    grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
    gap: 0.85rem;
  }
  .conditionCard {
    background: linear-gradient(145deg, rgba(30,25,15,0.95), rgba(20,17,10,0.98));
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    border: 1px solid rgba(192,168,106,0.2);
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
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .conditionCard:hover, .conditionCard.expanded { 
    border-color: var(--vt-c-parchment); 
  }
  .conditionCard.expanded { transform: none;  }
  .condition-header { display: flex; justify-content: space-between; align-items: center; }
  .condition-name { color: var(--vt-c-golden); font-weight: 700; font-family: Cinzel, serif; }
  .condition-toggle { color: var(--vt-c-parchment); font-size: 0.75rem; }
  .condition-effects {
    margin: 0.75rem 0 0;
    padding-left: 1.2rem;
    color: #a09070;
    font-size: 0.85rem;
    text-align: left;
    line-height: 1.65;
  }
  .condition-effects li { margin-bottom: 0.3rem; }
  
  /* ── Reference rows ── */
  .referenceList { display: flex; flex-direction: column; gap: 0.6rem; }
  .referenceRow {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 0 1.5rem;
    background: linear-gradient(145deg, rgba(30,25,15,0.95), rgba(20,17,10,0.98));
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
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
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
    background: linear-gradient(145deg, rgba(30, 25, 15, 0.95), rgba(20, 17, 10, 0.98));
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    border: 1px solid rgba(192,168,106,0.2);
    border-radius: 12px;
    padding: 1.25rem 1rem;
    text-align: center;
    position: relative;
    animation: fadeUp 0.35s ease both;
    transition: border-color 0.2s, transform 0.2s;
  }
  .diceCard::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .die-face { font-size: 2rem; font-weight: 900; color: var(--vt-c-parchment); font-family: Cinzel, serif; }
  .die-avg  { color: var(--vt-c-dark-parchment); font-size: 0.8rem; margin: 0.25rem 0 0.75rem; }
  .die-avg strong { color: var(--vt-c-golden); }
  .die-uses { color: var(--vt-c-parchment); font-size: 0.78rem; line-height: 1.5; margin: 0; }
  
  /* ── Abilities ── */
  .abilityGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }
  .abilityCard {
    background: linear-gradient(145deg, rgba(30,25,15,0.95), rgba(20,17,10,0.98));
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    border: 1px solid rgba(192,168,106,0.2);
    border-radius: 12px;
    padding: 1.25rem;
    position: relative;
    animation: fadeUp 0.35s ease both;
    transition: border-color 0.2s;
  }
  .abilityCard::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .ability-abbr  { font-size: 1.6rem; font-weight: 900; color: var(--vt-c-parchment); font-family: Cinzel, serif; }
  .ability-name  { color: var(--vt-c-golden); font-weight: 700; margin: 0.15rem 0 0.6rem; }
  .ability-skills { color: var(--vt-c-dark-parchment); font-size: 0.8rem; margin-bottom: 0.5rem; font-style: italic; }
  .ability-uses  { color: #a09070; font-size: 0.85rem; line-height: 1.55; }
  
  /* ── Dice Roller ── */
  .rollerBox {
    max-width: 520px;
    margin: 0 auto;
    background: linear-gradient(145deg, rgba(30,25,15,0.95), rgba(20,17,10,0.98));
    box-shadow:
      0 10px 25px rgba(0,0,0,0.7),
      inset 0 1px 2px rgba(255,255,255,0.05),
      inset 0 -3px 6px rgba(0,0,0,0.6);
    border: 1px solid rgba(192,168,106,0.3);
    border-radius: 16px;
    position: relative;
    padding: 1.5rem;
    text-align: center;
  }
  .rollerBox::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12;
    background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
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
  .roller-input option { background: var(--vt-c-grey);}
  
  .roller-btn { font-size: 1.05rem; padding: 12px 32px; }
  
  .rollResult { margin-top: 1.75rem; }
  .roll-total {
    font-size: 4rem;
    font-weight: 900;
    color: var(--vt-c-parchment); 
    font-family: Cinzel, serif;
    line-height: 1;
    text-shadow: 0 0 30px rgba(192,168,106,0.4);
    animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
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
  
  /* ── Shared ── */
  .btn {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 9px 22px;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
  .btn-primary {  
    background: var(--vt-c-parchment);
    color: var(--vt-c-dark-brown);

    background: linear-gradient(
      145deg,
      #f7e7a3 0%,
      #e4c76a 30%,
      #c9a645 50%,
      #a67c1f 70%,
      #e8d18a 100%
    );

    box-shadow:
      inset 0 2px 3px rgba(255,255,255,0.6),
      inset 0 -3px 5px rgba(0,0,0,0.25),
      0 4px 10px rgba(0,0,0,0.35);

    text-shadow:
      0 0.75px 0 rgba(255,255,255,0.6),
      0 -0.75px 0 rgba(0,0,0,0.3);
  }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 700px) {
    .referenceRow { grid-template-columns: 1fr; gap: 0.3rem; }
    .tabBar { gap: 6px; }
    .tab { padding: 7px 12px; font-size: 0.8rem; }
  }

  @media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}
  </style>