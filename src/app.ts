import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";

const app: Application = express();

// ✅ CORS config — allow all origins safely (works with credentials)
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); // allow all origins dynamically
    },
    credentials: true,
    exposedHeaders: ["Card-Number"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Bookish app server running!");
});

app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app;