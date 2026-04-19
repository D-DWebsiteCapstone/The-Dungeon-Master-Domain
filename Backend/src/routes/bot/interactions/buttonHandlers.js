import { getDiscordID, insertInCampaign } from '../../../data/supabaseController.js'

export async function handleButton(interaction) {
  const [action, campaignId] = interaction.customId.split(':')
  if (action !== 'join_campaign') return

  const discordUserId = interaction.user.id
  const user = await getUserByDiscordId(discordUserId)

  if (!user) {
    return interaction.reply({
      content: 'No account found! Connect your Discord at dmdomain.vercel.app',
      ephemeral: true
    })
  }

  await insertInCampaign({ userId, campaignId: campaign.id, role: 'Player' })

  await interaction.reply({
    content: `✅ You've joined the campaign! Check it out on the site.`,
    ephemeral: true
  })
}