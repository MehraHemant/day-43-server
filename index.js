import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import personRouter from './Routes/personRoutes.js'
import { errorHandler, notFound } from "./Middleware/errorHandler.js";
const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({ origin: true }));

app.use('/api/user', personRouter)

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("Connect to MongoDB"))
);
