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
import { routerKey, useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../../lib/api.js';
import { ref, onMounted } from 'vue'

const router = useRouter();
const route = useRoute();

//states
const selectedClass = ref(null)
const levelRows = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    const classSlug = route.params.classSlug;

    try{
       const res = await fetch(`https://api.open5e.com/v1/classes/${classSlug}/`)
    if (!res.ok) throw new Error(`Class not found: ${classSlug}`);
    const data = await res.json();
    
    selectedClass.value = data;

    const lines = data.table
        .split('\n')
        .filter(line => line.trim().startsWith('|'));

        const dataRows = lines.slice(2);
       let globalIndex = 0;

levelRows.value = dataRows.map((line, i) => {
  const cells = line.split('|').map(c => c.trim()).filter(Boolean);
  const featuresRaw = cells[2] ?? '';

  const features = featuresRaw
    .split(',')
    .map(f => f.trim())
    .filter(f => f && f !== '-')
    .map(name => ({
      name,
      id: globalIndex++   // 👈 UNIQUE ID
    }));

  return {
    level: i + 1,
    prof_bonus: cells[1] ?? '',
    features
  }
});

    }catch(error){
        error.value = `Failed to load class: ${err.message}`;
    } finally{
        loading.value = false;
    }
})

async function testButton(){

    
}

function back(){
    router.back();
}

</script>