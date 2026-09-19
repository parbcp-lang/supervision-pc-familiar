const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

// Tamaño máximo para recibir una captura
app.use(express.json({ limit: "15mb" }));

// Última captura recibida
let ultimaCaptura = null;
let ultimaFecha = null;

// Página principal
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Supervisión familiar</title>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f3f4f6;
  color: #222;
}

header {
  background: #1f2937;
  color: white;
  padding: 18px 25px;
}

.container {
  max-width: 1100px;
  margin: 25px auto;
  padding: 0 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

.estado {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 20px;
  background: #dcfce7;
  color: #166534;
  font-weight: bold;
}

img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #ddd;
}

button {
  border: 0;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  background: #2563eb;
  color: white;
  font-size: 15px;
}

button:hover {
  background: #1d4ed8;
}

.mensaje {
  color: #666;
}
</style>
</head>

<body>

<header>
  <h2>Supervisión familiar</h2>
  <div>Panel de supervisión con consentimiento</div>
</header>

<div class="container">

  <div class="card">
    <h3>Estado del dispositivo</h3>
    <span class="estado">Sistema activo</span>
    <p id="fecha">Esperando información...</p>
  </div>

  <div class="card">
    <h3>Captura de pantalla</h3>

    <button onclick="actualizarCaptura()">
      Actualizar captura
    </button>

    <p id="mensaje" class="mensaje">
      No se ha recibido ninguna captura.
    </p>

    <img id="captura"
         style="display:none;"
         alt="Última captura autorizada">
  </div>

</div>

<script>

async function actualizarCaptura() {

  try {

    const respuesta = await fetch("/api/screenshot");

    const datos = await respuesta.json();

    const imagen = document.getElementById("captura");
    const mensaje = document.getElementById("mensaje");
    const fecha = document.getElementById("fecha");

    if (datos.image) {

      imagen.src = datos.image;
      imagen.style.display = "block";

      mensaje.textContent = "Última captura recibida.";

      fecha.textContent =
        "Última actualización: " +
        (datos.date || "desconocida");

    } else {

      imagen.style.display = "none";

      mensaje.textContent =
        "Todavía no se ha recibido ninguna captura.";
    }

  } catch (error) {

    document.getElementById("mensaje").textContent =
      "No fue posible consultar el dispositivo.";

  }

}

actualizarCaptura();

</script>

</body>
</html>
  `);
});

// Consultar última captura
app.get("/api/screenshot", (req, res) => {

  res.json({
    image: ultimaCaptura,
    date: ultimaFecha
  });

});

// Recibir una captura desde el programa autorizado
app.post("/api/screenshot", (req, res) => {

  const { image } = req.body;

  if (!image || typeof image !== "string") {

    return res.status(400).json({
      ok: false,
      error: "No se recibió una imagen válida."
    });

  }

  ultimaCaptura = image;
  ultimaFecha = new Date().toLocaleString("es-CO");

  res.json({
    ok: true,
    message: "Captura recibida correctamente.",
    date: ultimaFecha
  });

});

// Estado del servidor
app.get("/health", (req, res) => {

  res.json({
    ok: true,
    servicio: "supervision-familiar"
  });

});

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Servidor de supervisión iniciado en el puerto ${PORT}`
  );

});
