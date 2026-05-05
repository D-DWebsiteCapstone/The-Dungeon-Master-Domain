import { reactive } from 'vue'

export const featureStore = reactive({
  features: [],

  setFeatures(list) {
    this.features = list
    localStorage.setItem('features', JSON.stringify(list))
  },

  loadFeatures() {
    const saved = localStorage.getItem('features')
    if (saved) {
      this.features = JSON.parse(saved)
    }
  },

  getFeature(id) {
    return this.features.find(f => f.id === id)
  }
})