import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { HttpsProxyAgent } from 'https-proxy-agent';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Configure the external HTTP proxy agent
const PROXY_USER = process.env.PROXY_USER || 'bishek';
const PROXY_PASS = process.env.PROXY_PASS || 'password';
const PROXY_HOST = process.env.PROXY_HOST || '72.60.220.128';
const PROXY_PORT = process.env.PROXY_PORT || '8080';

const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// Proxy middleware to intercept and forward requests
// Frontend usage: fetch('http://localhost:3001/proxy?url=https://api.example.com/data')
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Missing or invalid target URL in "url" query parameter' });
  }

  const targetUrlObj = new URL(targetUrl);
  
  createProxyMiddleware({
    target: targetUrlObj.origin,
    changeOrigin: true,
    agent: proxyAgent,
    pathRewrite: () => targetUrlObj.pathname + targetUrlObj.search,
    onProxyReq: () => {
      // Optional: log or modify headers
      console.log(`[Proxy] Forwarding request to: ${targetUrl}`);
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] ${err.message}`);
      res.status(500).json({ error: 'Proxy forwarding failed', details: err.message });
    }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Outbound traffic routed via: ${PROXY_HOST}:${PROXY_PORT}`);
});
