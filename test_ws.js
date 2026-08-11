const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000/api/v1/ws/cpu-metrics');

ws.on('open', () => {
  console.log('WebSocket connected');
  ws.send(JSON.stringify({ action: 'subscribe' }));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
  console.error('WebSocket readyState:', ws.readyState);
  ws.close();
});

ws.on('close', (code, reason) => {
  console.log('WebSocket closed:', code, reason.toString());
});

setTimeout(() => {
  console.log('Closing after 5 seconds');
  ws.close();
  process.exit(0);
}, 5000);
