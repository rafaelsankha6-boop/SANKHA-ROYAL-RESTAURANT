const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

/* ================= SECURITY + MIDDLEWARE ================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

/* REQUEST LOGGER */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

console.log("🔥 SERVER STARTED");

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Restaurant Backend Working 🚀");
});

/* ================= MENU ================= */

// GET MENU
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(result || []);
  });
});

// ADD MENU
app.post("/api/menu", (req, res) => {
  const { name, price, image, category } = req.body;

  if (!name || price === undefined || !image || !category) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "INSERT INTO menu (name, price, image, category) VALUES (?, ?, ?, ?)",
    [name, price, image, category],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Food added 🍔" });
    }
  );
});

// UPDATE MENU
app.put("/api/menu/:id", (req, res) => {
  const { name, price, image, category } = req.body;

  if (!name || price === undefined || !image || !category) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "UPDATE menu SET name=?, price=?, image=?, category=? WHERE id=?",
    [name, price, image, category, req.params.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Updated ✏️" });
    }
  );
});

// DELETE MENU
app.delete("/api/menu/:id", (req, res) => {
  db.query("DELETE FROM menu WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Deleted ✅" });
  });
});

/* ================= ORDERS ================= */

// CREATE ORDER
app.post("/api/orders", (req, res) => {
  const { items, total } = req.body;

  if (!items || total === undefined) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const safeItems = JSON.stringify(Array.isArray(items) ? items : []);

  db.query(
    "INSERT INTO orders (items, total, status) VALUES (?, ?, ?)",
    [safeItems, total, "Pending"],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Order placed 🍔" });
    }
  );
});

// GET ORDERS
app.get("/api/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(result || []);
  });
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id", (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status required" });
  }

  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [status, req.params.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Status updated 🔥" });
    }
  );
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
