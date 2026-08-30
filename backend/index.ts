import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { authRouter } from './src/modules/auth/auth.route';
import { dataRouter } from './src/modules/user-data/data.route';
import { functions, inngest } from './src/inngest';
import { errorHandler } from './src/common/middleware/error.middleware';

const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions,
  })
);

app.use(clerkMiddleware());

app.use('/auth', authRouter);
app.use('/data', dataRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 5000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
