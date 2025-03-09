const express = require('express');
const cors = require('cors');

const app = express();
const port = 5001;

// Enable CORS for all requests
app.use(cors());

// Use express.json() to parse incoming request bodies
app.use(express.json());

// Error handling middleware for invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        console.error('Invalid JSON:', err);
        return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
});

// Onboarding API endpoint
app.post('/api/onboard', (req, res) => {
    const { name, email } = req.body;
    
    // Check if required fields are present
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Log the onboarding request (you can replace this with DB logic later)
    console.log(`New onboarding request: ${name}, ${email}`);
    
    // Respond with success message
    res.json({ message: 'Onboarding successful! Welcome aboard.' });
});

// Start the server
app.listen(port, () => {
    console.log(`Onboarding API listening at http://localhost:${port}`);
});
