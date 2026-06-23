const http = require('http');
const httpProxy = require('http-proxy');

const VITE_PORT = 5001;
const PROXY_PORT = 5000;

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('error', (err, req, res) => {
  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: `http://localhost:${VITE_PORT}` });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: `http://localhost:${VITE_PORT}` });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy listening on port ${PROXY_PORT}, forwarding to Vite on port ${VITE_PORT}`);
});
