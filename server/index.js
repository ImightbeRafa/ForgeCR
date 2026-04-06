/* Local Express Dev Server — mirrors Vercel serverless functions */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tilopayRoutes from './routes/tilopay.js';
import emailRoutes from './routes/email.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tilopay', tilopayRoutes);
app.use('/api/email', emailRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Forge Server] Running on http://localhost:${PORT}`);
});
