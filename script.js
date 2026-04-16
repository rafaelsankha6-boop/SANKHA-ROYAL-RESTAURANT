/* ================= LOGIN (BACKEND) ================= */

function login(){
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: user, password: pass })
  })
  .then(res => {
    if(!res.ok) throw new Error();
    return res.json();
  })
  .then(data => {
    localStorage.setItem("loggedIn", "true");

    document.getElementById("loginSection").classList.remove("active");
    document.getElementById("app").style.display = "block";

    show("menu");
    alert(data.message);
  })
  .catch(() => alert("Wrong login ❌"));
}

function logout(){
  localStorage.removeItem("loggedIn");
  location.reload();
}

/* ================= CHECK LOGIN ================= */

function checkLogin(){
  const ok = localStorage.getItem("loggedIn");

  if(ok === "true"){
    document.getElementById("loginSection").classList.remove("active");
    document.getElementById("app").style.display = "block";
    show("menu");
  } else {
    document.getElementById("app").style.display = "none";
    document.getElementById("loginSection").classList.add("active");
  }
}

/* ================= DATA ================= */

let menu = [];
let cart = [];
let orders = [];
let editIndex = null;
let editId = null;

/* ELEMENTS */
const menuDiv = document.getElementById("menu");
const cartDiv = document.getElementById("cart");
const totalEl = document.getElementById("total");

/* ================= NAV ================= */

function show(page){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(page + "Section").classList.add("active");

  if(page === "menu") loadMenu();
  if(page === "orders") loadOrders();
}

/* ================= MENU ================= */

function loadMenu(){
  fetch("http://localhost:5000/api/menu")
    .then(res => res.json())
    .then(data => {
      menu = data;
      renderMenu();
    });
}

function renderMenu(){
  menuDiv.innerHTML = "";

  menu.forEach((item)=>{
    menuDiv.innerHTML += `
      <div class="card">
        <img src="${item.image}">
        <h3>${item.name}</h3>
        <p>${item.price} TZS</p>
        <small>${item.category}</small><br>

        <button onclick="add(${item.id})">Add</button>
        <button onclick="edit(${item.id})">Edit</button>
        <button onclick="del(${item.id})">Delete</button>
      </div>
    `;
  });
}

/* ================= SAVE / UPDATE FOOD ================= */

function saveFood(){
  const food = {
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value,
    category: document.getElementById("category").value
  };

  if(!food.name || !food.price || !food.image){
    alert("Fill all fields");
    return;
  }

  // 🔥 UPDATE
  if(editId){
    fetch(`http://localhost:5000/api/menu/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      editId = null;
      loadMenu();
    });
  } 
  // 🔥 CREATE
  else {
    fetch("http://localhost:5000/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadMenu();
    });
  }
}

/* ================= EDIT ================= */

function edit(id){
  const item = menu.find(m => m.id === id);

  document.getElementById("name").value = item.name;
  document.getElementById("price").value = item.price;
  document.getElementById("image").value = item.image;
  document.getElementById("category").value = item.category;

  editId = id;

  show("admin");
}

/* ================= DELETE ================= */

function del(id){
  if(!confirm("Delete this food?")) return;

  fetch(`http://localhost:5000/api/menu/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadMenu();
  });
}

/* ================= CART ================= */

function add(id){
  const item = menu.find(m => m.id === id);
  cart.push(item);
  updateCart();
}

function updateCart(){
  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item,i)=>{
    cartDiv.innerHTML += `
      <p>${item.name} - ${item.price}
      <button onclick="remove(${i})">X</button></p>
    `;
    total += item.price;
  });

  totalEl.innerText = total;
}

function remove(i){
  cart.splice(i,1);
  updateCart();
}

/* ================= CHECKOUT ================= */

function checkout(){
  if(cart.length === 0){
    alert("Cart empty");
    return;
  }

  const order = {
    items: cart,
    total: cart.reduce((a,b)=>a+b.price,0)
  };

  fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);

    cart = [];
    updateCart();
    loadOrders();
  });
}

/* ================= LOAD ORDERS ================= */

function loadOrders(){
  fetch("http://localhost:5000/api/orders")
    .then(res => res.json())
    .then(data => {
      orders = data;
      renderOrders();
    });
}

/* ================= UPDATE ORDER STATUS ================= */

function updateStatus(id){
  const status = prompt("Enter status: Pending / Cooking / Ready / Delivered");

  if(!status) return;

  fetch(`http://localhost:5000/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadOrders();
  });
}

/* ================= RENDER ORDERS ================= */

function renderOrders(){
  const div = document.getElementById("orders");
  div.innerHTML = "";

  orders.forEach(o=>{
    const items = JSON.parse(o.items);

    div.innerHTML += `
      <div class="order">
        <h4>Order #${o.id}</h4>
        <p>Total: ${o.total} TZS</p>
        <p>Status: ${o.status}</p>
        <p>${items.map(i=>i.name).join(", ")}</p>
        <button onclick="updateStatus(${o.id})">Update Status</button>
      </div>
    `;
  });
}

/* ================= INIT ================= */

checkLogin();
loadMenu();