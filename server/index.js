  require('dotenv').config();
  
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const authRouter = require('./routes/authRoute');
  const noteRoute = require('./routes/noteRoute');

  const noteRoutes = require('./routes/noteRoute');
  
  const app = express();

  const lectureRoute = require('./routes/lectureRoute');

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(noteRoute);
  app.use(noteRoutes);

  const path = require('path');

  // Serve static files from the public folder
  app.use(express.static(path.join(__dirname, '../public')));


  //Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/lecture', lectureRoute);

  // MongoDB connection (fixed connection string)
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });
  mongoose.connection.once('open', () => {
    console.log('MongoDB connection opened!');
  });

  // Global error handler
  app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });



  // Server setup
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });