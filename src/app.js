import express from "express";
import bodyParser from "body-parser";
import mailRoutes from "./routes/mailRoutes.js";
import { requestIdMiddleware } from "./middleware/requestId.js";

const app = express();

// request_id + timing deben ir ANTES del body-parser
app.use(requestIdMiddleware);

app.use(bodyParser.json({ limit: "25mb" })); // necesario para base64
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

app.use("/api/mail", mailRoutes);

export default app;
