const express = require('express');
const path = require('path');

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import and register API routes
async function setupRoutes() {
  try {
    // Import the compiled routes from dist folder
    const { registerRoutes } = require('./dist/server/routes.js');
    const server = await registerRoutes(app);

    // Serve static files from dist/client
    app.use(express.static(path.join(__dirname, 'dist', 'client')));

    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
      } else {
        res.status(404).json({ message: 'API endpoint not found' });
      }
    });

    return server;
  } catch (error) {
    console.error('Error setting up routes:', error);

    // Fallback: just serve static files if routes fail
    app.use(express.static(path.join(__dirname, 'dist', 'client')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
    });

    return app;
  }
}

// Start server
setupRoutes().then((server) => {
  const port = process.env.PORT || 5000;

  if (server.listen) {
    server.listen(port, '0.0.0.0', () => {
      console.log(`Production server running on port ${port}`);
    });
  } else {
    server.listen(port, '0.0.0.0', () => {
      console.log(`Production server running on port ${port}`);
    });
  }
}).catch((error) => {
  console.error('Failed to start production server:', error);
  process.exit(1);
});