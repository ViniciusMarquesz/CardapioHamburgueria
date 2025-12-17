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
  const image = parentButton.getAttribute("data-image");


  addToCart(name, price, image);
});

function addToCart(name, price, image) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      image,
      quantity: 1,
    });
  }

  updateCartModal();
}

// Atualizar carrinho
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
  <div class="flex items-center gap-3">

    <img
      src="${item.image}"
      alt="${item.name}"
      class="w-16 h-16 rounded object-cover"
    />

    <div class="flex-1">
      <p class="font-medium">${item.name}</p>
      <p class="text-sm text-gray-600">
        ${item.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="decrease bg-red-500 text-white w-8 h-8 rounded transition active:scale-90"
        data-name="${item.name}"
      >−</button>

      <span class="font-bold">${item.quantity}</span>

      <button
        class="increase bg-green-500 text-white w-8 h-8 rounded transition active:scale-90"
        data-name="${item.name}"
      >+</button>
    </div>

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

cartItemsContainer.addEventListener("click", (event) => {
  const name = event.target.dataset.name;
  if (!name) return;

  if (event.target.classList.contains("increase")) {
    const item = cart.find((i) => i.name === name);
    item.quantity += 1;
  }

  if (event.target.classList.contains("decrease")) {
    const item = cart.find((i) => i.name === name);

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart = cart.filter((i) => i.name !== name);
    }
  }

  updateCartModal();
});

const paymentSelect = document.getElementById("payment-method");
const changeContainer = document.getElementById("change-container");

paymentSelect.addEventListener("change", () => {
  if (paymentSelect.value === "Dinheiro") {
    changeContainer.classList.remove("hidden");
  } else {
    changeContainer.classList.add("hidden");
  }
});

const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const addressContainer = document.getElementById("address-container");

orderTypeRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "Retirada" && radio.checked) {
      addressContainer.classList.add("hidden");
    } else {
      addressContainer.classList.remove("hidden");
    }
  });
});

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

  return hora >= 12 && hora < 22;
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
