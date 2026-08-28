import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { authRouter } from './src/modules/auth/auth.route';
import { dataRouter } from './src/modules/user data/data.route';
import { functions, inngest } from './src/inngest';
import { errorHandler } from './src/common/middleware.ts/error.middleware';

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(clerkMiddleware());

app.use('/auth', authRouter);
app.use('/data', dataRouter);
app.use('/api/inngest', serve({ client: inngest, functions }));

// Global Error Handler
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 5000);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
