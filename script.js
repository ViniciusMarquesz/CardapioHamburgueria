const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

// Modal
function openCartModal() {
  cartModal.style.display = "flex";
  updateCartModal();
}

function closeCartModal() {
  cartModal.style.display = "none";
}

cartBtn.addEventListener("click", openCartModal);

cartModal.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    closeCartModal();
  }
});

closeModalBtn.addEventListener("click", closeCartModal);

// Adicionar ao carrinho
menu.addEventListener("click", (event) => {
  const parentButton = event.target.closest(".add-to-cart-btn");

  if (!parentButton) return;

  const name = parentButton.getAttribute("data-name");
  const price = Number(parentButton.getAttribute("data-price"));

  addToCart(name, price);
});

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

// =======================
// Atualizar carrinho
// =======================
function updateCartModal() {
  cartItemsContainer.innerHTML = "";

  let total = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;

    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );

    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">
            ${item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <button class="remove-cart" data-name="${item.name}">
          Remover
        </button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.textContent = totalItems;
}

// Remover item
cartItemsContainer.addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-cart")) return;

  const name = event.target.getAttribute("data-name");
  removeItemCart(name);
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index === -1) return;

  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  updateCartModal();
}

// Endereço
addressInput.addEventListener("input", (event) => {
  if (event.target.value.trim() !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "O restaurante está fechado",
      duration: 3000,
      destination: "https://github.com/apvarun/toastify-js",
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) return;

  if (addressInput.value.trim() === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  const cartItems = cart
    .map((item) => {
      return `- ${item.name}
Qtd: ${item.quantity}
Preço: ${item.price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
`;
    })
    .join("\n");

  // Total
  const total = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  // Endereço
  const address = addressInput.value.trim();

  const message = encodeURIComponent(
    `Pedido Vm Burger

Itens:
${cartItems}
Total: ${total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}

Endereço de entrega:
${address}
`
  );

  const phone = "16991215014";

  window.open(`https://wa.me/${phone}?text=${message}`);

  Toastify({
    text: "Pedido enviado com sucesso",
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "#ef4444",
    },
  }).showToast();

  cart = [];
  updateCartModal();
  cartCounter.textContent = 0;
  addressInput.value = "";

  closeCartModal();
});

// Horário de funcionamento
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();

  return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.add("bg-red-500");
  spanItem.classList.remove("bg-green-600");
}
