import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import userRoutes from './src/route/userRoutes.js'
import productRoutes from './src/route/productRoutes.js'
import orderRoutes from './src/route/orderRoutes.js'

const app = express();
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    sameSite: 'none' // Allow cross-origin cookies
  }
}));
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.1.9:3000'],
  credentials: true // Enable sending cookies cross-origin
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World');
})

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);

app.listen(3001, () => {
  console.log('Server is running http://localhost:3001');
})