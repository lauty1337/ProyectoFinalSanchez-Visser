
const productosGrid = document.getElementById("productos-grid");
const resumenProductos = document.getElementById("resumen-productos");

const carritoLista = document.getElementById("carrito-lista");
const carritoVacio = document.getElementById("carrito-vacio");
const carritoTotal = document.getElementById("carrito-total");
const carritoBadge = document.getElementById("carrito-badge");

const btnVaciar = document.getElementById("btn-vaciar");
const btnConfirmar = document.getElementById("btn-confirmar");

let productos = [];
let carrito = [];


function formatearPrecio(valor) {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0
  });
}


document.addEventListener("DOMContentLoaded", () => {
  cargarCarritoDesdeStorage();
  cargarProductos();
});



function cargarProductos() {
  fetch("./productos.json")
    .then((respuesta) => respuesta.json())
    .then((data) => {
      productos = data;
      renderizarProductos();
    })
    .catch((error) => {
      console.error("Error al cargar productos:", error);
      resumenProductos.textContent =
        "No se pudo cargar el stock. Intentá nuevamente más tarde.";
    });
}

function renderizarProductos() {
  if (!Array.isArray(productos) || productos.length === 0) {
    productosGrid.innerHTML = "";
    resumenProductos.textContent = "No hay productos cargados en este momento.";
    return;
  }

  productosGrid.innerHTML = "";

  productos.forEach((producto) => {
    const card = document.createElement("article");
    card.className =
      "flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-xs";

    const stockTexto =
      producto.stock > 0 ? `Stock: ${producto.stock} un.` : "Sin stock";

    const estadoClase =
      producto.stock > 0 ? "text-emerald-600" : "text-slate-400";

    card.innerHTML = `
      <header class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-900">${producto.modelo}</h3>
        <p class="text-[11px] text-slate-500">
          ${producto.capacidad} · ${producto.color}
        </p>
      </header>

      <dl class="mt-4 space-y-1 text-[11px] text-slate-600">
        <div class="flex justify-between">
          <dt class="text-slate-500">Precio</dt>
          <dd class="font-semibold">$ ${formatearPrecio(producto.precio)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Estado</dt>
          <dd class="${estadoClase} font-medium">${stockTexto}</dd>
        </div>
      </dl>

      <div class="mt-4">
        <button
          type="button"
          data-id="${producto.id}"
          class="btn-agregar inline-flex w-full justify-center rounded-full border border-slate-900 px-3 py-2 text-[11px] font-medium text-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          ${producto.stock === 0 ? "disabled" : ""}
        >
          Agregar al carrito
        </button>
      </div>
    `;

    productosGrid.appendChild(card);
  });

  resumenProductos.textContent = `${productos.length} modelo(s) cargado(s).`;


  const botonesAgregar = document.querySelectorAll(".btn-agregar");
  botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      agregarAlCarrito(id);
    });
  });
}



function agregarAlCarrito(idProducto) {
  const producto = productos.find((item) => item.id === idProducto);
  if (!producto) {
    return;
  }

  const enCarrito = carrito.find((item) => item.id === idProducto);

  const stockDisponible = producto.stock;
  const cantidadActual = enCarrito ? enCarrito.cantidad : 0;

  if (cantidadActual + 1 > stockDisponible) {
    alert("No hay más stock disponible para este modelo.");
    return;
  }

  if (enCarrito) {
    enCarrito.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      modelo: producto.modelo,
      capacidad: producto.capacidad,
      color: producto.color,
      precio: producto.precio,
      cantidad: 1
    });
  }

  guardarCarritoEnStorage();
  renderizarCarrito();
}

function renderizarCarrito() {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    carritoLista.innerHTML = "";
    carritoLista.classList.add("hidden");
    carritoVacio.classList.remove("hidden");
    carritoTotal.textContent = "0";
    carritoBadge.textContent = "0";
    btnVaciar.disabled = true;
    btnConfirmar.disabled = true;
    return;
  }

  carritoLista.innerHTML = "";
  carritoLista.classList.remove("hidden");
  carritoVacio.classList.add("hidden");

  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.className =
      "flex items-start justify-between gap-2 rounded-xl border border-slate-100 px-2 py-2";

    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    cantidadTotal += item.cantidad;

    li.innerHTML = `
      <div>
        <p class="text-[11px] font-semibold text-slate-900">
          ${item.modelo} · ${item.capacidad}
        </p>
        <p class="text-[11px] text-slate-500">
          Color: ${item.color}
        </p>
        <p class="mt-1 text-[11px] text-slate-700">
          Cantidad: ${item.cantidad} · $ ${formatearPrecio(subtotal)}
        </p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <button
          type="button"
          class="btn-sumar text-[11px] text-slate-500 hover:text-slate-900"
          data-id="${item.id}"
        >
          +1
        </button>
        <button
          type="button"
          class="btn-restar text-[11px] text-slate-500 hover:text-slate-900"
          data-id="${item.id}"
        >
          -1
        </button>
        <button
          type="button"
          class="btn-eliminar text-[11px] text-red-500 hover:text-red-700"
          data-id="${item.id}"
        >
          Quitar
        </button>
      </div>
    `;

    carritoLista.appendChild(li);
  });

  carritoTotal.textContent = formatearPrecio(total);
  carritoBadge.textContent = cantidadTotal.toString();
  btnVaciar.disabled = false;
  btnConfirmar.disabled = false;


  const botonesSumar = document.querySelectorAll(".btn-sumar");
  const botonesRestar = document.querySelectorAll(".btn-restar");
  const botonesEliminar = document.querySelectorAll(".btn-eliminar");

  botonesSumar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      modificarCantidad(id, 1);
    });
  });

  botonesRestar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      modificarCantidad(id, -1);
    });
  });

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      eliminarDelCarrito(id);
    });
  });
}

function modificarCantidad(idProducto, delta) {
  const item = carrito.find((producto) => producto.id === idProducto);
  const productoStock = productos.find((producto) => producto.id === idProducto);

  if (!item || !productoStock) {
    return;
  }

  const nuevaCantidad = item.cantidad + delta;

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
    return;
  }

  if (nuevaCantidad > productoStock.stock) {
    alert("No hay más stock disponible para este modelo.");
    return;
  }

  item.cantidad = nuevaCantidad;

  guardarCarritoEnStorage();
  renderizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter((item) => item.id !== idProducto);
  guardarCarritoEnStorage();
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarritoEnStorage();
  renderizarCarrito();
}



function guardarCarritoEnStorage() {
  localStorage.setItem("carritoLautyApple", JSON.stringify(carrito));
}

function cargarCarritoDesdeStorage() {
  const carritoGuardado = localStorage.getItem("carritoLautyApple");
  if (carritoGuardado) {
    try {
      carrito = JSON.parse(carritoGuardado) || [];
    } catch (error) {
      carrito = [];
    }
  }
  renderizarCarrito();
}



btnVaciar.addEventListener("click", () => {
  const confirmar = confirm("¿Querés vaciar el carrito por completo?");
  if (confirmar) {
    vaciarCarrito();
  }
});

btnConfirmar.addEventListener("click", () => {
  if (carrito.length === 0) {
    return;
  }

  const resumen = carrito
    .map((item) => {
      return `${item.cantidad}x ${item.modelo} ${item.capacidad} (${item.color})`;
    })
    .join(" · ");

  const total = carritoTotal.textContent;

  const mensaje = encodeURIComponent(
    `Hola, vengo desde la web y quiero consultar por estos modelos:\n\n${resumen}\n\nTotal estimado: $${total}`
  );

  window.open(`https://wa.me/5492364373183?text=${mensaje}`, "_blank");
});
