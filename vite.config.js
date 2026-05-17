import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { HttpsProxyAgent } from 'https-proxy-agent'
import dotenv from 'dotenv'

dotenv.config()

// Default proxy credentials based on provided requirements
const PROXY_USER = process.env.PROXY_USER || 'bishek';
const PROXY_PASS = process.env.PROXY_PASS || 'password';
const PROXY_HOST = process.env.PROXY_HOST || '72.60.220.128';
const PROXY_PORT = process.env.PROXY_PORT || '8080';

const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
const agent = new HttpsProxyAgent(proxyUrl);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Pass all requests starting with /api to the specified external HTTP proxy
      '/api': {
        // The target should be your actual API backend URL
        target: 'https://jsonplaceholder.typicode.com', // <-- REPLACE THIS with your actual API URL
        changeOrigin: true,
        secure: false,
        agent: agent, // Use the proxy agent to route traffic through 72.60.220.128
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: rewrite path
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url, proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      // New route specifically to check public IP via proxy
      '/check-ip': {
        target: 'https://api.ipify.org',
        changeOrigin: true,
        secure: false,
        agent: agent,
        rewrite: (path) => path.replace(/^\/check-ip/, '?format=json'),
      }
    }
  }
})
