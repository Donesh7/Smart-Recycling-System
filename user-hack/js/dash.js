// Store Data
const products = [
  {
    id: 1,
    name: "Bamboo Cutlery Set",
    description: "100% biodegradable bamboo cutlery set with carrying case",
    price: 24.99,
    points: 250,
    image:
      "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&w=500",
  },
  {
    id: 3,
    name: "Compostable Phone Case",
    description: "100% biodegradable phone case made from plant materials",
    price: 29.99,
    points: 300,
    image:
      "https://images.unsplash.com/photo-1586941756923-830029962fd9?auto=format&fit=crop&w=500",
  },
  {
    id: 4,
    name: "Bamboo Toothbrush Set",
    description:
      "Pack of 4 biodegradable bamboo toothbrushes with charcoal bristles",
    price: 15.99,
    points: 160,
    image:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500",
  },
  {
    id: 5,
    name: "Stainless Steel Water Bottle",
    description:
      "1L double-walled insulated bottle, plastic-free and recyclable",
    price: 34.99,
    points: 350,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500",
  },

  {
    id: 7,
    name: "Beeswax Food Wraps",
    description:
      "Set of 3 reusable food wraps, natural alternative to plastic wrap",
    price: 22.99,
    points: 230,
    image:
      "https://images.unsplash.com/photo-1622467827417-bbe2237067a9?auto=format&fit=crop&w=500",
  },

  {
    id: 9,
    name: "Recycled Paper Notebook",
    description: "A5 notebook made from 100% post-consumer recycled paper",
    price: 9.99,
    points: 100,
    image:
      "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=500",
  },
];

let transactions = [];

let points = 1000;

// DOM Elements
const pointsDisplay = document.getElementById("pointsDisplay");
const productsContainer = document.getElementById("productsContainer");
const transactionsBody = document.getElementById("transactionsBody");
const storePage = document.getElementById("storePage");
const transactionsPage = document.getElementById("transactionsPage");
const showTransactions = document.getElementById("showTransactions");
const backToStore = document.getElementById("backToStore");

// Navigation
showTransactions.addEventListener("click", () => {
  storePage.classList.remove("active");
  transactionsPage.classList.add("active");
  renderTransactions();
});

backToStore.addEventListener("click", () => {
  transactionsPage.classList.remove("active");
  storePage.classList.add("active");
});

// Render Functions
function renderProducts() {
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h2 class="product-name">${product.name}</h2>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <div class="price-points">
              <p class="price">$${product.price}</p>
              <p class="points-required">${product.points} points</p>
            </div>
            <button 
              class="redeem-btn" 
              onclick="redeemProduct(${product.id})"
              ${points < product.points ? "disabled" : ""}
            >
              Redeem
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderTransactions() {
  transactionsBody.innerHTML = transactions
    .map(
      (transaction) => `
      <tr>
        <td>${transaction.date}</td>
        <td>
          <span class="transaction-type ${
            transaction.type === "purchase"
              ? "type-purchase"
              : "type-redemption"
          }">
            ${transaction.type}
          </span>
        </td>
        <td>${transaction.description}</td>
        <td class="${
          transaction.points > 0 ? "points-positive" : "points-negative"
        }">
          ${transaction.points > 0 ? "+" : ""}${transaction.points}
        </td>
      </tr>
    `
    )
    .join("");
}

// Business Logic
function updatePoints(newPoints) {
  points = newPoints;
  pointsDisplay.textContent = points;
  renderProducts(); // Re-render products to update disabled states
}

function redeemProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  if (points >= product.points) {
    const newTransaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split("T")[0],
      type: "redemption",
      points: -product.points,
      description: `Redeemed ${product.name}`,
    };

    transactions.unshift(newTransaction);
    updatePoints(points - product.points);
    alert("Successfully redeemed product!");
  } else {
    alert("Not enough points!");
  }
}

// Initial Render
renderProducts();
