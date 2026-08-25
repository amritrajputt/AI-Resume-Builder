import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { authRouter } from './src/modules/auth/auth.route';
import { errorHandler } from './src/common/middleware.ts/error.middleware';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(clerkMiddleware());

app.use('/auth', authRouter);

// Global Error Handler
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
