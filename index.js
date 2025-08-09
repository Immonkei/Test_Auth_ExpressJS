const express = require('express');
const connectDB = require('./db');



const app = express();
app.use(express.json());


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
