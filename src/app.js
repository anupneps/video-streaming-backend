import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: '50kb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '50kb'
}));

app.use(express.static('public'));
app.use(cookieParser());
app.get("/hello", (req, res)=> {
    res.send("Welcome !!")
})

//routes import

import userRouter from './routes/users.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)

export default app;
