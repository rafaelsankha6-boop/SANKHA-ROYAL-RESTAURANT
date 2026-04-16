const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

console.log("🔥 SERVER STARTED");

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Restaurant Backend Working 🚀");
});

/* ================= MENU ================= */

// GET MENU
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM menu", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// ADD MENU
app.post("/api/menu", (req, res) => {
  const { name, price, image, category } = req.body;

  db.query(
    "INSERT INTO menu (name, price, image, category) VALUES (?, ?, ?, ?)",
    [name, price, image, category],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Food added 🍔" });
    }
  );
});

// DELETE MENU
app.delete("/api/menu/:id", (req, res) => {
  db.query("DELETE FROM menu WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Deleted ✅" });
  });
});

// UPDATE MENU
app.put("/api/menu/:id", (req, res) => {
  const { name, price, image, category } = req.body;

  db.query(
    "UPDATE menu SET name = ?, price = ?, image = ?, category = ? WHERE id = ?",
    [name, price, image, category, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Updated ✏️" });
    }
  );
});

/* ================= ORDERS ================= */

// CREATE ORDER
app.post("/api/orders", (req, res) => {
  const { items, total } = req.body;

  db.query(
    "INSERT INTO orders (items, total, status) VALUES (?, ?, ?)",
    [JSON.stringify(items), total, "Pending"],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Order placed 🍔" });
    }
  );
});

// GET ORDERS
app.get("/api/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id", (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Status updated 🔥" });
    }
  );
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
