export async function uploadProfileImage(supabaseAdmin, dataUrl, createdBy) {
    // Guard: must be a base64 data-URL
    if (!dataUrl || typeof dataUrl !== 'string') {
        throw new Error(`uploadProfileImage: expected a string, got ${typeof dataUrl}`)
    }
    if (!dataUrl.startsWith('data:')) {
        throw new Error(`uploadProfileImage: expected base64 data-URL, got: ${dataUrl.substring(0, 80)}`)
    }

    const [meta, base64] = dataUrl.split(',')
    if (!meta || !base64) {
        throw new Error(`uploadProfileImage: could not split data-URL, value starts with: ${dataUrl.substring(0, 80)}`)
    }

    const mimeType = meta.match(/:(.*?);/)?.[1]
    if (!mimeType) throw new Error(`uploadProfileImage: could not parse mimeType from: ${meta}`)

    const extension = mimeType.split('/')[1]
    const byteCharacters = atob(base64)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([byteArray], { type: mimeType })

    const filePath = `profile_images/${createdBy}/${Date.now()}.${extension}`

    const { error } = await supabaseAdmin.storage
        .from('profile-picture')
        .upload(filePath, blob, { contentType: mimeType, upsert: false })

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data } = supabaseAdmin.storage
        .from('profile-picture')
        .getPublicUrl(filePath)

    return data.publicUrl
}

export async function uploadCharacterImage(supabaseAdmin, dataUrl, createdBy) {
    // Guard: must be a base64 data-URL
    if (!dataUrl || typeof dataUrl !== 'string') {
        throw new Error(`uploadCharacterImage: expected a string, got ${typeof dataUrl}`)
    }
    if (!dataUrl.startsWith('data:')) {
        throw new Error(`uploadCharacterImage: expected base64 data-URL, got: ${dataUrl.substring(0, 80)}`)
    }

    const [meta, base64] = dataUrl.split(',')
    if (!meta || !base64) {
        throw new Error(`uploadCharacterImage: could not split data-URL, value starts with: ${dataUrl.substring(0, 80)}`)
    }

    const mimeType = meta.match(/:(.*?);/)?.[1]
    if (!mimeType) throw new Error(`uploadCharacterImage: could not parse mimeType from: ${meta}`)

    const extension = mimeType.split('/')[1]
    const byteCharacters = atob(base64)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([byteArray], { type: mimeType })

    const filePath = `characters/${createdBy}/${Date.now()}.${extension}`

    const { error } = await supabaseAdmin.storage
        .from('character-images')
        .upload(filePath, blob, { contentType: mimeType, upsert: false })

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data } = supabaseAdmin.storage
        .from('character-images')
        .getPublicUrl(filePath)

    return data.publicUrl
}