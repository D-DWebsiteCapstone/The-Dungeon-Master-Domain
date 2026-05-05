<template>
    <div class="levelPage" v-sound>
        <div class=topBar>
            <button class="backButton" @click="back()">
                Back</button>
            <h1 class="className" v-if="selectedClass">{{ selectedClass.name }}</h1>
        </div>
        <div v-if="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
    
        <table class="table" v-if="levelRows.length > 0 && !loading">
            <thead class="tableHeader">
                <tr>
                    <th>Level</th>
                    <th>Proficiency Bonus</th>
                    <th>Features</th>
                </tr>
            </thead>
            <tbody class="tableContent">
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

<style scoped>
.topBar {
   display: inline;
   position: relative;
   width: 100%;
   margin-bottom: 2rem;
}

.backButton{
    position: absolute;
    top: 0px;
    left: 0px;
}

table {
    border: 2px solid var(--vt-c-dark-brown);
       box-shadow: 0 0 30px #cabc8f;
    border-collapse: collapse; /* Merges adjacent cell borders */
    color: var(--vt-c-dark-brown)
}

.tableHeader {
    min-height: 30px;
}

th {
    background-color: #cabc8f;
    padding: 8px;
}

tr:nth-child(even) { background-color:#cabc8f ;}
tr:nth-child(odd) { background-color: #ded0a1; }

td { padding: 2px 2px;}

a { color: var(--vt-c-dark-brown);  font-size: 0.9rem; padding: 2px; }

@media (max-width: 400px) {
    table {
        width: 100%;
    }

    a {
        font-size: 0.7rem;
    }
}

</style>