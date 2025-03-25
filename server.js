const express = require('express');
const path = require('path');
const app = express();

// Port where the server will listen
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Set up a route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
