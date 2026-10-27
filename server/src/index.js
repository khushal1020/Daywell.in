import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import entryRoutes from './routes/entries.js'
const app=express()
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({limit:'10kb'}))
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:100,standardHeaders:true,legacyHeaders:false}))
app.get('/api/health',(req,res)=>res.json({status:'ok'}))
app.use('/api/auth',authRoutes)
app.use('/api/entries',entryRoutes)
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Something went wrong on the server.'})})
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret === 'replace_this_with_a_long_random_secret' || jwtSecret.length < 32) {
  console.error('JWT_SECRET must be set to a random value of at least 32 characters before starting the API.')
  process.exit(1)
}

const port = Number(process.env.PORT || 5000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT value "${process.env.PORT}". Set PORT to a number between 1 and 65535.`)
  process.exit(1)
}

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/daywell')
  await new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Daywell API listening on http://localhost:${port}`)
      resolve()
    })
    server.once('error', reject)
  })
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.error(`Could not start API: port ${port} is already in use. Stop the process using that port or set PORT to an available port.`)
  } else if (mongoose.connection.readyState !== 1) {
    console.error('Could not connect to MongoDB:', error.message)
  } else {
    console.error('Could not start API server:', error.message)
  }
  await mongoose.disconnect()
  process.exit(1)
}
