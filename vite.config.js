import { createHash } from 'node:crypto'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const PASSCODE_SALT = 'ghost-counselor-gate-v1:'

function hashServerPasscode(raw) {
  const clean = String(raw || '').trim()
  if (!clean) return ''
  return createHash('sha256').update(`${PASSCODE_SALT}${clean}`).digest('hex')
}

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

export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_ private passcodes) only inside Node at dev/build time.
  // Plaintext JUDGE_PASSCODE and DEV_PASSCODE are NEVER embedded into the client bundle — only their SHA-256 digests.
  const env = loadEnv(mode, process.cwd(), '')
  const judgePassHash =
    hashServerPasscode(env.JUDGE_PASSCODE) || String(env.VITE_JUDGE_PASS_HASH || '').trim().toLowerCase()
  const devPassHash =
    hashServerPasscode(env.DEV_PASSCODE) || String(env.VITE_DEV_PASS_HASH || '').trim().toLowerCase()

  return {
    base: './',
    plugins: [react(), freeAiMiddlewarePlugin()],
    define: {
      __JUDGE_PASS_HASH__: JSON.stringify(judgePassHash),
      __DEV_PASS_HASH__: JSON.stringify(devPassHash)
    }
  }
})
