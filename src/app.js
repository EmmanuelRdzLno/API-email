import express from "express";
import bodyParser from "body-parser";
import mailRoutes from "./routes/mailRoutes.js";

const app = express();

app.use(bodyParser.json({ limit: "25mb" })); // 🔴 IMPORTANTE para base64
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

app.use("/api/mail", mailRoutes);

export default app;
