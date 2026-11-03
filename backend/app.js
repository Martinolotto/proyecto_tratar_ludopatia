/*
 * Entrada del servidor Express: configura JSON, registra la ruta de comprobación y escucha HTTP.
 * Los scripts dev y start de backend/package.json ejecutan este archivo.
 * Todavía no hay autenticación, operaciones funcionales ni conexión con Supabase.
 */
// Importar la dependencia instalada; ESModules permite usar import en este proyecto.
import express from "express";

// Crear la aplicación que recibirá solicitudes y ejecutará sus middlewares y rutas.
const app = express();
// Leer el puerto del entorno si existe; de lo contrario usar 3000. Esto no carga archivos .env.
const PORT = process.env.PORT || 3000;

// Middleware para interpretar solicitudes con cuerpo JSON.
// Se registra antes de las rutas: deja el contenido JSON interpretado disponible en req.body.
app.use(express.json());

// Ruta para comprobar que el servidor responde.
// app.get asocia GET / con esta función: req representa la solicitud y res la respuesta.
app.get("/", (req, res) => {
  // Enviar HTTP 200 y un objeto convertido a JSON; no consulta datos ni comprueba servicios externos.
  return res.status(200).json({
    message: "Servidor MODUS funcionando",
  });
});

// Los routers de funcionalidades se incorporarán cuando sean necesarios.

// Comenzar a escuchar conexiones; la función se ejecuta cuando el servidor inicia la escucha.
// El mensaje aparece en la terminal del servidor, no en la interfaz React.
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
