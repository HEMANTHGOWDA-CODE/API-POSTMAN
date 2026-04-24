const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const fileRoutes = require('./routes/fileRoutes.js');
const authRoutes = require('./routes/authRouter.js');

dotenv.config();




// middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// connect DB


connectDB();

// test route
app.get('/', (req, res) => {
    res.send("API is running 🚀");
});

// server
const PORT = process.env.PORT || 3000;


app.use('/api/files', fileRoutes);

app.use('/api/auth',authRoutes  );

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});