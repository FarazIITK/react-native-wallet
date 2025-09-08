import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT;

async function initDB(params) {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB: ", error);
    process.exit(1); // Status code 1 means failure, 0 is success
  }
}

app.get("/", (req, res) => {
  res.send("It's working...");
});

app.use("/api/transactions", transactionsRoutes);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is up and running on PORT: ${PORT}`);
    console.log(process.env.DATABASE_URL);
  });
});
