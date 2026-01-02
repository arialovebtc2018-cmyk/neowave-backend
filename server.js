const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');

dotenv.config();
const app = express();

// اجزای ضروری
app.use(express.json());
app.use(cors());

// اتصال به دیتابیس
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected Successfully"))
    .catch((err) => console.log("❌ DB Connection Error:", err));

// مسیرها
app.use('/api/auth', authRoute);

// روشن کردن سرور
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});