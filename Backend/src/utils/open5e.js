// Backend/src/utils/open5e.js

const BASE_URL = 'https://api.open5e.com/v1';

class Open5eService {
  async fetchEndpoint(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Open5e API error: ${response.status}`);
    }
    return response.json();
  }

  async getConditions(limit = 100) {
    const data = await this.fetchEndpoint('/conditions/', { limit });
    return data;
  }

  async getSpells({ limit = 20, offset = 0, level_int = '', school = '' } = {}) {
    const params = { limit, offset };
    if (level_int !== '') params.level_int = level_int;
    if (school) params.school = school;
    const data = await this.fetchEndpoint('/spells/', params);
    return data;
  }

  async getMonsters({ limit = 20, offset = 0, challenge_rating = '', type = '' } = {}) {
    const params = { limit, offset };
    if (challenge_rating) params.challenge_rating = challenge_rating;
    if (type) params.type = type;
    const data = await this.fetchEndpoint('/monsters/', params);
    return data;
  }

  async getMagicItems({ limit = 20, offset = 0 } = {}) {
    const data = await this.fetchEndpoint('/magicitems/', { limit, offset });
    return data;
  }

  async search(query, limit = 20) {
    const data = await this.fetchEndpoint('/search/', { query, limit });
    return data;
  }

  async getSpellSchools() {
    return ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
  }

  async getMonsterTypes() {
    return ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  }

  async getCRValues() {
    return ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
  }

  async getCombatReference() {
    return [
      { label: 'Action', description: 'Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use Object' },
      { label: 'Bonus Action', description: 'Class features, some spells, two-weapon fighting' },
      { label: 'Reaction', description: 'Opportunity attack, Shield spell, Counterspell, Readied action trigger' },
      { label: 'Opportunity Attack', description: 'Triggered when a hostile creature you can see leaves your reach. Uses your reaction.' },
      { label: 'Grapple', description: 'Attack action replace: Athletics vs. target\'s Athletics or Acrobatics.' },
      { label: 'Shove', description: 'Attack action replace: Athletics vs. Athletics or Acrobatics. Knock prone or push 5ft.' },
      { label: 'Dash', description: 'Gain extra movement equal to your speed this turn.' },
      { label: 'Disengage', description: 'Movement doesn\'t provoke opportunity attacks for the rest of the turn.' },
      { label: 'Dodge', description: 'Attacks against you have disadvantage. Advantage on Dex saves.' },
      { label: 'Help', description: 'Give an ally advantage on next ability check or attack against a creature within 5ft.' },
      { label: 'Hide', description: 'Stealth check to become hidden. Must be obscured from the target.' },
      { label: 'Ready', description: 'Choose a trigger and an action. When trigger occurs, use reaction to execute.' },
      { label: 'Death Saves', description: 'Roll d20. 10+ = success. 3 successes = stable. 3 failures = dead. Nat 1 = 2 failures. Nat 20 = 1 HP.' },
      { label: 'Critical Hit', description: 'Nat 20 on attack. Roll all damage dice twice, add modifiers once.' },
      { label: 'Surprise', description: 'Cannot move or take actions on first turn. No reactions until after first turn.' }
    ];
  }

  async getDiceReference() {
    return [
      { die: 'd4', avg: 2.5, uses: 'Daggers, small spells, minor damage' },
      { die: 'd6', avg: 3.5, uses: 'Short swords, sneak attack, healing word' },
      { die: 'd8', avg: 4.5, uses: 'Longswords (versatile), cure wounds, rapiers' },
      { die: 'd10', avg: 5.5, uses: 'Longswords (two-handed), heavy crossbow' },
      { die: 'd12', avg: 6.5, uses: 'Greataxes, bardic inspiration (high level)' },
      { die: 'd20', avg: 10.5, uses: 'Attack rolls, ability checks, saving throws' },
      { die: 'd100', avg: 50.5, uses: 'Wild magic, percentile rolls, loot tables' }
    ];
  }
}

export default new Open5eService();
