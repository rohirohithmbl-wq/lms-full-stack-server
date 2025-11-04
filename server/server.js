import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
// Parse JSON bodies for routes (except where raw is required like Stripe)
app.use(express.json())

// CORS: allow requests from the client application. Set CLIENT_URL in env for production.
const CLIENT_URL = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_URL, credentials: true }))
// Make sure preflight requests are handled
app.options('*', cors({ origin: CLIENT_URL, credentials: true }))

// Also add headers for any responses (covers error responses that may not include CORS by default)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL)
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', express.json() , clerkWebhooks)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})