const WHATSAPP_NUMBER = "50686548537";

// ✅ URL pública de tu sitio (GitHub Pages)
const PUBLIC_BASE_URL = "https://strom5005.github.io/strom/"; // con slash al final

const productsGrid = document.getElementById("productsGrid");
const resultCount = document.getElementById("resultCount");

const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const sexFilter = document.getElementById("sexFilter");
const typeFilter = document.getElementById("typeFilter");
const clearFilters = document.getElementById("clearFilters");

// Modal IDs
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalWhatsApp = document.getElementById("modalWhatsApp");

let products = [];
let filtered = [];

function formatCRC(n) {
  return "₡" + Number(n || 0).toLocaleString("es-CR");
}

function normalizePath(path) {
  // convierte "\" a "/" y quita slashes iniciales
  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function buildPublicUrl(path) {
  // arma URL absoluta a tu GitHub Pages
  return `${PUBLIC_BASE_URL}${normalizePath(path)}`;
}

function buildWhatsAppLink(p) {
  // ✅ Link público a la imagen para que WhatsApp haga mini-preview
  //const imageUrl = buildPublicUrl(p.imagen);

  const txt = [
    "Hola 👋",
    "Me interesa esta colonia:",
    "",
    `🧴 ${p.nombre}`,
    `🏷️ ${p.marca}`,
    `💰 ${formatCRC(p.precio)}`,
    "",
    imageUrl,
    "",
    "¿Está disponible?"
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
}

function openModal(p) {
  modalTitle.textContent = `${p.nombre} — ${p.marca}`;
  modalMeta.textContent = `${p.genero} • ${p.tipo}`;
  modalDesc.textContent = p.descripcion || "Sin descripción.";
  modalPrice.textContent = formatCRC(p.precio);

  // ✅ imagen absoluta para que siempre cargue bien
  modalImg.src = buildPublicUrl(p.imagen);

  modalWhatsApp.href = buildWhatsAppLink(p);

  // tu CSS usa .active
  modalOverlay.classList.add("active");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function closeModalFn() {
  modalOverlay.classList.remove("active");
  modalOverlay.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeModalFn);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModalFn();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModalFn();
});

function render(list) {
  productsGrid.innerHTML = "";
  resultCount.textContent = list.length;

  if (list.length === 0) {
    productsGrid.innerHTML = `<p style="color:#bbb;">No hay productos con esos filtros.</p>`;
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    // ✅ en el grid puede ser relativo o absoluto; lo dejo absoluto para evitar fallos
    const imgSrc = buildPublicUrl(p.imagen);

    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="precio">${formatCRC(p.precio)}</p>
      <button type="button" class="btn primary btn-card">Información</button>
    `;

    card.querySelector("button").addEventListener("click", () => openModal(p));
    productsGrid.appendChild(card);
  });
}

function applyFilters() {
  const min = Number(minPrice.value || 0);
  const max = Number(maxPrice.value || 0);
  const sex = sexFilter.value;
  const type = typeFilter.value;

  filtered = products.filter((p) => {
    const price = Number(p.precio || 0);

    const okMin = !minPrice.value ? true : price >= min;
    const okMax = !maxPrice.value ? true : price <= max;

    const okSex = sex === "all" ? true : p.genero === sex;
    const okType = type === "all" ? true : p.tipo === type;

    return okMin && okMax && okSex && okType;
  });

  render(filtered);
}

clearFilters.addEventListener("click", (e) => {
  e.preventDefault();
  minPrice.value = "";
  maxPrice.value = "";
  sexFilter.value = "all";
  typeFilter.value = "all";
  applyFilters();
});

[minPrice, maxPrice].forEach((el) => el.addEventListener("input", applyFilters));
[sexFilter, typeFilter].forEach((el) => el.addEventListener("change", applyFilters));

async function loadProducts() {
  try {
    // ✅ si catalogo.json queda en el root, esto está perfecto
    const res = await fetch("catalogo.json", { cache: "no-store" });
    const data = await res.json();

    products = (Array.isArray(data) ? data : []).map((p) => ({
      id_perfume: Number(p.id_perfume),
      nombre: (p.nombre ?? "").toString(),
      marca: (p.marca ?? "").toString(),
      genero: (p.genero ?? "").toString(),
      tipo: (p.tipo ?? "").toString(),
      descripcion: (p.descripcion ?? "").toString(),
      precio: Number(p.precio || 0),
      imagen: normalizePath(p.imagen ?? "")
    }));

    applyFilters();
  } catch (err) {
    productsGrid.innerHTML = `<p style="color:#ff5858;">No se pudo cargar el catálogo.</p>`;
    resultCount.textContent = "0";
    console.error(err);
  }
}

loadProducts();
