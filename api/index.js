import app from '../src/app.js';
import connectDB from '../src/config/db.js';

// Vercel serverless function entrypoint
export default async function handler(req, res) {
  try {
    // Ensure database is connected before handling request
    await connectDB();
  } catch (err) {
    console.error('Vercel API DB Connection Error:', err);
    return res.status(500).json({ success: false, message: 'Database connection failed in serverless function', error: err.message });
  }
  
  // Hand off request to Express app
  return app(req, res);
}
