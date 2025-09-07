import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

// middleware
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

app.get("/api/transactions/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const transactions = await sql`
        SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC
        `;

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting the transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const transactions = await sql`
        INSERT INTO transactions(user_id,title,amount,category)
        VALUES(${user_id},${title},${amount},${category})
        RETURNING *
    `;

    res.status(201).json(transactions[0]);
  } catch (error) {
    console.log("Error while creating", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is up and running on PORT: ${PORT}`);
    console.log(process.env.DATABASE_URL);
  });
});
