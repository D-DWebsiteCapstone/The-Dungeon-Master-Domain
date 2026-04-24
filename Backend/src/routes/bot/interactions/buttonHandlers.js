import { DBClient } from '../../../data/supabaseController.js'

export async function handleButton(interaction) {
  console.log('handleButton called, customId:', interaction.customId)
  console.log('Discord user ID:', interaction.user.id)

  const [action, campaignId] = interaction.customId.split(':')
  if (action !== 'join_campaign') return

  await interaction.deferReply({ ephemeral: true })

  const discordUserId = interaction.user.id

  try {
    console.log('Querying for discord_user_id:', discordUserId)
    
    const { data: user, error } = await DBClient
      .from('Users')
      .select('*')
      .eq('discord_user_id', discordUserId)
      .maybeSingle()

    console.log('User query result:', JSON.stringify(user, null, 2))
    console.log('User query error:', error)

    if (error || !user) {
      return interaction.editReply({
        content: 'No account found! Connect your Discord at yourcampaignsite.com'
      })
    }

    const { data: existing } = await DBClient
      .from('inCampaign')
      .select('*')
      .eq('userId', user.userid)
      .eq('campaignId', campaignId)
      .maybeSingle()

    if (existing) {
      return interaction.editReply({
        content: 'You are already in this campaign!'
      })
    }

    const { error: insertError } = await DBClient
      .from('inCampaign')
      .insert([{ userId: user.userid, campaignId, Role: 'Player' }])

    if (insertError) {
      console.error('Insert error:', insertError)
      return interaction.editReply({
        content: 'Something went wrong joining the campaign. Please try again.'
      })
    }

    await interaction.editReply({
      content: `✅ You've joined the campaign! Check it out on the site.`
    })

  } catch (err) {
    console.error('buttonHandlers error:', err)
    await interaction.editReply({
      content: 'Something went wrong. Please try again.'
    })
  }
}