import express from "express";
import bodyParser from "body-parser";
import mailRoutes from "./routes/mailRoutes.js";

const app = express();
app.use(bodyParser.json());

// Rutas principales
app.use("/api/mail", mailRoutes);

export default app;
