console.log('Server starting...');

const express = require('express');
console.log('Express loaded');

const app = express();
console.log('App created');

app.get('/', function(req, res) {
  console.log('Root route hit');
  res.json({ message: 'Root route working' });
});

app.get('/api/test', function(req, res) {
  console.log('Test route hit');
  res.json({ message: 'Test route working' });
});

app.listen(3005, function() {
  console.log('Server listening on port 3005');
  console.log('Try: http://localhost:3005');
});

console.log('Setup complete');