const products = {
  "goat-milk-soap": {
    name: "Goat Milk Soap",
    category: "BATH & BODY",
    kicker: "GENTLE, EVERYDAY GOODNESS",
    image: "soap",
    description: "A lovely little bar for your everyday ritual. Made in small batches with goat milk and a gentle touch — every batch has its own special character.",
    more: "Homemade goat milk soap, made in small batches with care. Ask us about the current scents, ingredients and availability before ordering."
  },
  "botanical-candle": {
    name: "Botanical Candle",
    category: "HOME & HEART",
    kicker: "A MOMENT TO UNWIND",
    image: "candle",
    description: "A little pause, poured by hand. Made with essential oils and botanical inspiration to bring a softer feeling to your space.",
    more: "Candles are made with essential oils and botanical touches. Each batch can vary, so ask us about current scents and availability."
  },
  "plaster-art-kit": {
    name: "Plaster Art Kit",
    category: "MAKE & PLAY",
    kicker: "A LITTLE CREATIVE JOY",
    image: "art",
    description: "A hands-on little project made for curious minds and happy moments. A lovely way to slow down and make something of your own.",
    more: "Creative plaster art kits, made for a fun hands-on moment. Ask us about current styles, what's included and availability."
  }
};

function getBasket() {
  try {
    const basket = JSON.parse(localStorage.getItem("purple-iris-basket") || "[]");
    return Array.isArray(basket) ? basket : [];
  } catch (error) {
    console.error("Could not read the saved basket.", error);
    return [];
  }
}

function updateBasketCount() {
  const count = getBasket().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((badge) => {
    badge.textContent = String(count);
  });
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setupProductPage() {
  const detailTitle = document.querySelector("#detail-title");
  if (!detailTitle) return;
  const slug = new URLSearchParams(window.location.search).get("item") || "goat-milk-soap";
  const product = products[slug] || products["goat-milk-soap"];
  document.title = `${product.name} — Purple Iris`;
  document.querySelector("#crumb-name").textContent = product.name;
  detailTitle.innerHTML = `${product.name.replace(" ", "<br>")}<em>.</em>`;
  document.querySelector("#detail-tag").textContent = product.category;
  document.querySelector("#detail-kicker").textContent = product.kicker;
  document.querySelector("#detail-description").textContent = product.description;
  document.querySelector("#detail-more").textContent = product.more;
  const object = document.querySelector("#detail-object");
  object.className = `product-object ${product.image}-object`;
  object.innerHTML = product.image === "soap"
    ? "<span>purple<br>iris <i>✳</i></span>"
    : product.image === "candle"
      ? "<span>purple iris</span><i></i>"
      : "<span>✿</span><i>make<br>something</i>";
  document.querySelector("#detail-visual").className = `detail-visual visual-${product.image}`;
  document.querySelector("#ask-product").href = `contact.html?item=${encodeURIComponent(product.name)}`;
  document.querySelector("[data-add-product]").dataset.product = slug;
}

function setupShop() {
  const cards = [...document.querySelectorAll(".product-card")];
  if (!cards.length) return;
  let activeFilter = "all";
  const search = document.querySelector("#product-search");
  const noResults = document.querySelector(".no-results");
  const applyFilters = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matches = (activeFilter === "all" || card.dataset.category === activeFilter)
        && card.dataset.search.includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    noResults.hidden = visible > 0;
  };
  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelector(".filter-chip.active")?.classList.remove("active");
      button.classList.add("active");
      applyFilters();
    });
  });
  search.addEventListener("input", applyFilters);
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const item = params.get("item");
  if (item) {
    document.querySelector("#topic").value = "Product availability";
    document.querySelector("#message").value = `Hi! I'd love to ask about ${item}. Could you let me know what's currently available?`;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const body = encodeURIComponent(`Hello Purple Iris,\n\n${fields.get("message")}\n\nTopic: ${fields.get("topic")}\nName: ${fields.get("name")}\nReply to: ${fields.get("email")}`);
    window.location.assign(`https://wa.me/17047986840?text=${body}`);
  });
}

function setupBasket() {
  const list = document.querySelector(".basket-list");
  if (!list) return;
  const empty = document.querySelector(".basket-empty");
  const orderLink = document.querySelector(".basket-order");
  const render = () => {
    const basket = getBasket();
    list.replaceChildren();
    empty.hidden = basket.length > 0;
    orderLink.hidden = basket.length === 0;
    document.querySelector(".basket-checkout").hidden = basket.length === 0;
    basket.forEach((item) => {
      const row = document.createElement("div");
      row.className = "basket-row";
      const name = document.createElement("span");
      name.className = "basket-item-name";
      name.textContent = item.name;
      const quantity = document.createElement("span");
      quantity.className = "basket-item-quantity";
      quantity.textContent = `Qty ${item.quantity}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "basket-remove";
      remove.dataset.removeProduct = item.slug;
      remove.textContent = "Remove";
      row.append(name, quantity, remove);
      list.append(row);
    });
    const lines = basket.map((item) => `• ${item.name} × ${item.quantity}`).join("\n");
    const message = basket.length
      ? `Hello Purple Iris! I'd like to ask about this order:\n\n${lines}\n\nCould you confirm availability, pricing and order details?`
      : "";
    orderLink.href = `https://wa.me/17047986840?text=${encodeURIComponent(message)}`;
  };
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-product]");
    if (!button) return;
    const basket = getBasket().filter((item) => item.slug !== button.dataset.removeProduct);
    try {
      localStorage.setItem("purple-iris-basket", JSON.stringify(basket));
    } catch (error) {
      console.error("Could not update the saved basket.", error);
      showToast("Your browser couldn't update the bag. Please contact us to order.");
      return;
    }
    updateBasketCount();
    render();
  });
  render();
}

function setupQuantity() {
  const quantity = document.querySelector("#quantity");
  if (!quantity) return;
  document.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      quantity.value = String(Math.max(1, Math.min(20, Number(quantity.value || 1) + Number(button.dataset.quantity))));
    });
  });
  quantity.addEventListener("change", () => {
    quantity.value = String(Math.max(1, Math.min(20, Number(quantity.value || 1))));
  });
}

function setupAddToBag() {
  document.querySelectorAll("[data-add-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const slug = button.dataset.product;
      const product = products[slug];
      if (!product) {
        console.error("Cannot add an unknown product to the basket.", slug);
        showToast("Sorry, that item could not be added.");
        return;
      }
      const quantity = Math.max(1, Math.min(20, Number(document.querySelector("#quantity")?.value || 1)));
      const basket = getBasket();
      const existing = basket.find((item) => item.slug === slug);
      if (existing) existing.quantity += quantity;
      else basket.push({ slug, name: product.name, quantity });
      try {
        localStorage.setItem("purple-iris-basket", JSON.stringify(basket));
      } catch (error) {
        console.error("Could not save the basket.", error);
        showToast("Your browser couldn't save the bag. Please contact us to order.");
        return;
      }
      updateBasketCount();
      showToast(`${quantity} × ${product.name} added to your bag.`);
    });
  });
}

function setupNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    nav.classList.toggle("open", !expanded);
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

function setupReveal() {
  const targets = document.querySelectorAll(".category-card,.feature-copy,.promise-item,.values-grid article,.story-main,.contact-form,.product-card");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  targets.forEach((target) => target.classList.add("reveal"));
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
  updateBasketCount();
  setupNavigation();
  setupProductPage();
  setupShop();
  setupContactForm();
  setupBasket();
  setupQuantity();
  setupAddToBag();
  setupReveal();
});
