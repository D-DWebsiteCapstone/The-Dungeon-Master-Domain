//This script is here in case a character was created on the old version of character. Run the script and the character image should be fixed.

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

const { DBClient, supabaseAdmin } = await import('../src/data/supabaseController.js')

async function migrateImages() {
    console.log('Fetching characters with unmigrated images...')

    const { data: characters, error } = await DBClient
        .from('character')
        .select('id, name, image, image_url, "createdBy"')
        .not('image', 'is', null)

    if (error) {
        console.error('Failed to fetch characters:', error)
        process.exit(1)
    }

    console.log(`Found ${characters.length} characters to check`)

    let migrated = 0
    let skipped = 0
    let failed = 0

    for (const char of characters) {
        // Skip if already has a valid storage URL
        if (char.image_url && char.image_url.startsWith('https://') && char.image_url.includes('supabase')) {
            console.log(`[SKIP] ${char.name} - already migrated`)
            skipped++
            continue
        }

        let mimeType, imageBuffer
        try {
            // Decode hex bytea -> UTF-8 string (this gives us the data-URL string)
            const hex = char.image.replace(/^\\x/, '')
            const dataUrl = Buffer.from(hex, 'hex').toString('utf8')

            console.log(`[DEBUG] ${char.name} data-URL prefix:`, dataUrl.slice(0, 40))

            if (!dataUrl.startsWith('data:')) {
                console.warn(`[FAIL] ${char.name} - not a data-URL, got: ${dataUrl.slice(0, 80)}`)
                failed++
                continue
            }

            // Parse "data:image/png;base64,<data>"
            const [meta, base64Data] = dataUrl.split(',')
            if (!meta || !base64Data) {
                console.warn(`[FAIL] ${char.name} - could not split data-URL`)
                failed++
                continue
            }

            mimeType = meta.match(/:(.*?);/)?.[1]  // e.g. "image/png"
            if (!mimeType) {
                console.warn(`[FAIL] ${char.name} - could not parse mime type from: ${meta}`)
                failed++
                continue
            }

            imageBuffer = Buffer.from(base64Data, 'base64')
        } catch (e) {
            console.warn(`[FAIL] ${char.name} - parse error:`, e.message)
            failed++
            continue
        }

        // Map mime type to file extension
        const extensionMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
        }
        const extension = extensionMap[mimeType] ?? mimeType.split('/')[1]
        const createdBy = char['createdBy'] || 'unknown'
        const filePath = `characters/${createdBy}/${char.id}.${extension}`

        console.log(`[UPLOAD] ${char.name} - ${mimeType} (${imageBuffer.length} bytes)`)

        const { error: uploadError } = await supabaseAdmin.storage
            .from('character-images')
            .upload(filePath, imageBuffer, {
                contentType: mimeType,
                upsert: true
            })

        if (uploadError) {
            console.error(`[FAIL] ${char.name} - upload failed:`, uploadError.message)
            failed++
            continue
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('character-images')
            .getPublicUrl(filePath)

        const { error: updateError } = await DBClient
            .from('character')
            .update({ image_url: urlData.publicUrl })
            .eq('id', char.id)

        if (updateError) {
            console.error(`[FAIL] ${char.name} - DB update failed:`, updateError.message)
            failed++
            continue
        }

        console.log(`[OK] ${char.name} -> ${urlData.publicUrl}`)
        migrated++

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200))
    }

    console.log('\n--- Migration complete ---')
    console.log(`Migrated: ${migrated}`)
    console.log(`Skipped:  ${skipped}`)
    console.log(`Failed:   ${failed}`)
}

migrateImages().catch(console.error)