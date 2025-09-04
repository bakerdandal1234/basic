const express = require('express')
const app = express()
require('dotenv').config();
const session = require('express-session')
const cookieParser = require("cookie-parser");
const rootRoutes = require('./routes/authRoutes')
const authRouter = require("./routes/Socialite")
const roleRoutes = require('./routes/roleRoutes')
const corsMiddleware = require("./security/cors");
app.use(corsMiddleware);
const rateLimit = require("./security/rateLimit");
app.use(rateLimit); // استخدام middleware تحديد معدل الطلبات

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);





app.use(express.json())
app.use(cookieParser()); // هنا
require('dotenv').config()
app.use(rootRoutes)
app.use("/auth", authRouter);
app.use("/roles", roleRoutes);


const oauth = require("./config/oauth");
app.use(oauth.initialize());



// 1. Connect to MongoDB
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  }) , console.log('✔️ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

