node -e "
const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Local server is running</h1>');
}).listen(8080, () => console.log('Listening on http://localhost:8080'));
"
