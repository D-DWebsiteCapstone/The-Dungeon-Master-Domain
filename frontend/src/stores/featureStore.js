import { reactive } from 'vue'

export const featureStore = reactive({
  setFeatures(list) {
  this.features = list
  localStorage.setItem('features', JSON.stringify(list))
},

loadFeatures() {
  const saved = localStorage.getItem('features')
  if (saved) {
    this.features = JSON.parse(saved)
  }
}
})