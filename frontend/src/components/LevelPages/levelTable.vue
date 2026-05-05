<template>
    <div class="levelPage" v-sound>
        <button class="parchmentButton back-btn" @click="back()">Back</button>
        <h1 v-if="selectedClass">{{ selectedClass.name }}</h1>
        <div v-if="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
    
        <table v-if="levelRows.length > 0 && !loading">
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Proficiency Bonus</th>
                    <th>Features</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in levelRows" :key="row.level">
                    <td>{{ row.level }}</td>
                    <td>{{ row.prof_bonus }}</td>
                    <td>
                        <span v-for="(feature, index) in row.features" :key="index">
                            <router-link
                                :to="{ name: 'feature', params: { id: feature.id } }"
                                target="_blank"
                                class="feature-link"
                            >
                            {{ feature.name }}
                            </router-link>
                            <span v-if="index < row.features.length - 1">, </span>
                        </span>
                        <span v-if="row.features.length === 0">-</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { featureStore } from '@/stores/featureStore'

const router = useRouter()
const route = useRoute()

const selectedClass = ref(null)
const levelRows = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    const classSlug = route.params.classSlug

    try {
        const res = await fetch(`https://api.open5e.com/v1/classes/${classSlug}/`)
        if (!res.ok) throw new Error(`Class not found: ${classSlug}`)
        const data = await res.json()

        selectedClass.value = data

        const lines = data.table
            .split('\n')
            .filter(line => line.trim().startsWith('|'))

        // Find the Features column dynamically from the header
        const headerCells = lines[0].split('|').map(c => c.trim()).filter(Boolean)
        const featuresIndex = headerCells.findIndex(h => h.toLowerCase() === 'features')

        // Look up feature description from the class desc markdown
        function getFeatureDesc(name) {
            const regex = new RegExp(`###\\s+${name}\\s*\\n([\\s\\S]*?)(?=###|$)`, 'i')
            const match = data.desc.match(regex)
            return match ? match[1].trim() : 'No description available.'
        }

        const dataRows = lines.slice(2)
        let globalIndex = 0

        const rows = dataRows.map((line, i) => {
            const cells = line.split('|').map(c => c.trim()).filter(Boolean)
            const featuresRaw = cells[featuresIndex] ?? ''

            const features = featuresRaw
                .split(',')
                .map(f => f.trim())
                .filter(f => f && f !== '-')
                .map(name => ({
                    name,
                    id: globalIndex++,
                    desc: getFeatureDesc(name)
                }))

            return {
                level: i + 1,
                prof_bonus: cells[1] ?? '',
                features
            }
        })

        levelRows.value = rows

        // Flatten all features and save to store so FeaturesPage can find them
        const allFeatures = rows.flatMap(row => row.features)
        featureStore.setFeatures(allFeatures)

    } catch (err) {
        error.value = `Failed to load class: ${err.message}`
    } finally {
        loading.value = false
    }
})

function back() {
    router.back()
}
</script>