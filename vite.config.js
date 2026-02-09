import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// Plugin to save parsing report for Claude to read
const parsingReportPlugin = () => ({
  name: 'parsing-report-saver',
  configureServer(server) {
    server.middlewares.use('/api/save-parsing-report', (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const reportPath = path.join(process.cwd(), 'parsing-report.json')
            fs.writeFileSync(reportPath, body)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
            console.log('\n[Parsing Report] Saved to parsing-report.json - Claude can now read it\n')
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      } else {
        res.writeHead(405)
        res.end()
      }
    })
  }
})

export default defineConfig({
  plugins: [
    parsingReportPlugin(),
    react(),
    VitePWA({
      registerType: 'prompt',
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'HIDC Dashboard',
        short_name: 'HIDC',
        description: 'Hazard Identification & Data Control - HSE Analytics Platform',
        theme_color: '#3478f6',
        background_color: '#0f1117',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'xlsx']
        }
      }
    }
  }
})
