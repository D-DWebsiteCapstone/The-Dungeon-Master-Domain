import Express from 'express'
import Groq from 'groq-sdk'

const router = new Express.Router()

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY in backend environment')
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

router.post('/chat/stream', async (req, res) => {
  try {
    const { message, model = 'openai/gpt-oss-120b' } = req.body || {}

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ valid: false, message: 'message is required' })
    }

    const groq = getGroqClient()

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Only respond to Dungeons and Dragons questions'
        },
        {
          role: 'user',
          content: message.trim()
        }
      ],
      model,
      temperature: 1,
      max_completion_tokens: 1000,
      top_p: 1,
      stream: true,
      stop: null
    })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || ''
      if (delta) {
        res.write(delta)
      }
    }

    return res.end()
  } catch (error) {
    console.error('[AI] Groq streaming failed:')
    console.error('Error message:', error?.message)
    console.error('Error code:', error?.code)
    console.error('Full error:', error)
    if (!res.headersSent) {
      return res.status(500).json({ valid: false, message: error?.message || 'AI streaming failed' })
    }
    return res.end()
  }
})

export default router
