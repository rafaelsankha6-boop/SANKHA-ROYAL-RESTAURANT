/* ================= CONFIG ================= */
const API = "https://your-backend-url.onrender.com"; // ✅ production

/* ================= STATE ================= */
let menu = [];
let cart = [];
let orders = [];
let editId = null;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  loadMenu();
});

/* ================= LOGIN ================= */
function login() {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(data => {
      localStorage.setItem("user", JSON.stringify(data));

      document.getElementById("loginSection").style.display = "none";
      document.getElementById("app").style.display = "block";

      show("menu");
      alert(data.message || "Login successful");
    })
    .catch(() => alert("Wrong login ❌"));
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function checkLogin() {
  const user = localStorage.getItem("user");

  if (user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("app").style.display = "block";
    show("menu");
  } else {
    document.getElementById("app").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
  }
}

/* ================= NAV ================= */
function show(page) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

  const section = document.getElementById(page + "Section");
  if (section) section.classList.add("active");

  if (page === "menu") loadMenu();
  if (page === "orders") loadOrders();
}

/* ================= MENU ================= */
function loadMenu() {
  fetch(`${API}/api/menu`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      menu = data;
      renderMenu();
    })
    .catch(() => alert("Failed to load menu ⚠️"));
}

function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  menu.forEach(item => {
    menuDiv.innerHTML += `
      <div class="card">
        <img src="${item.image || ''}" width="100">
        <h3>${item.name}</h3>
        <p>${item.price} TZS</p>
        <small>${item.category}</small>

        <button onclick="addToCart(${item.id})">Add</button>
        <button onclick="editFood(${item.id})">Edit</button>
        <button onclick="deleteFood(${item.id})">Delete</button>
      </div>
    `;
  });
}

/* ================= CREATE / UPDATE ================= */
function saveFood() {
  const food = {
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value) || 0,
    image: document.getElementById("image").value,
    category: document.getElementById("category").value
  };

  if (!food.name || !food.price || !food.image) {
    alert("Fill all fields");
    return;
  }

  const url = editId ? `${API}/api/menu/${editId}` : `${API}/api/menu`;
  const method = editId ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(food)
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      editId = null;
      loadMenu();

      document.getElementById("name").value = "";
      document.getElementById("price").value = "";
      document.getElementById("image").value = "";
    })
    .catch(() => alert("Save failed ❌"));
}

/* ================= EDIT ================= */
function editFood(id) {
  const item = menu.find(m => m.id === id);

  if (!item) {
    alert("Item not found");
    return;
  }

  document.getElementById("name").value = item.name;
  document.getElementById("price").value = item.price;
  document.getElementById("image").value = item.image;
  document.getElementById("category").value = item.category;

  editId = id;
  show("admin");
}

/* ================= DELETE ================= */
function deleteFood(id) {
  fetch(`${API}/api/menu/${id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error();
      loadMenu();
    })
    .catch(() => alert("Delete failed ❌"));
}

/* ================= CART ================= */
function addToCart(id) {
  const item = menu.find(m => m.id === id);
  if (!item) return;

  cart.push(item);
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  let total = 0;

  cartDiv.innerHTML = "";

  cart.forEach((item, i) => {
    total += Number(item.price || 0);

    cartDiv.innerHTML += `
      <p>${item.name} - ${item.price}
      <button onclick="removeItem(${i})">X</button></p>
    `;
  });

  document.getElementById("total").innerText = total;
}

/* ================= REMOVE ITEM ================= */
function removeItem(i) {
  cart.splice(i, 1);
  renderCart();
}

/* ================= CHECKOUT ================= */
function checkout() {
  if (cart.length === 0) return alert("Cart empty");

  fetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart,
      total: cart.reduce((a, b) => a + (Number(b.price) || 0), 0)
    })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      cart = [];
      renderCart();
      loadOrders();
      alert("Order placed ✅");
    })
    .catch(() => alert("Checkout failed ❌"));
}

/* ================= ORDERS ================= */
function loadOrders() {
  fetch(`${API}/api/orders`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      orders = data;
      renderOrders();
    })
    .catch(() => alert("Failed to load orders ⚠️"));
}

function renderOrders() {
  const div = document.getElementById("orders");
  div.innerHTML = "";

  orders.forEach(o => {
    let items = [];

    try {
      items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
    } catch {
      items = [];
    }

    div.innerHTML += `
      <div class="order">
        <h4>Order #${o.id}</h4>
        <p>Total: ${o.total}</p>
        <p>Status: ${o.status}</p>
        <p>${items.map(i => i.name).join(", ")}</p>

        <button onclick="updateStatus(${o.id})">Update</button>
      </div>
    `;
  });
}

/* ================= UPDATE STATUS ================= */
function updateStatus(id) {
  const status = prompt("Enter status:");
  if (!status) return;

  fetch(`${API}/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
    .then(res => {
      if (!res.ok) throw new Error();
      loadOrders();
    })
    .catch(() => alert("Update failed ❌"));
}
