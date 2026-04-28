require("dotenv").config();
const express = require('express');
const errorHandler= require('./middleware/errorHandler');
const app = express();
app.use(express.json());
const taskRoutes = require('./routes/taskRoutes');
const authRoutes= require('./routes/authRoutes');
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 