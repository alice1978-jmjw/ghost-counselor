import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function freeAiMiddlewarePlugin() {
  return {
    name: 'free-ai-middleware',
    configureServer(server) {
      server.middlewares.use('/api/free-ai', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let rawBody = ''
        req.on('data', (chunk) => {
          rawBody += chunk
        })
        req.on('end', async () => {
          try {
            const upstream = await fetch('https://text.pollinations.ai/openai', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GhostCareerCounselor/1.0'
              },
              body: rawBody
            })

            const text = await upstream.text()
            res.statusCode = upstream.status
            res.setHeader('Content-Type', 'application/json')
            res.end(text)
          } catch (err) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), freeAiMiddlewarePlugin()]
})
