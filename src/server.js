// src/server.js
import dns from 'node:dns';

// Force IPv4 resolution to prevent DNS SRV issues with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');

import env from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
