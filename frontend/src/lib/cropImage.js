/* Recorta una imagen al centro y la exporta a dimensiones sociales concretas. */
export const recortarImagen = async (archivo, anchoDestino, altoDestino) => {
  const urlTemporal = URL.createObjectURL(archivo);

  try {
    const imagen = await new Promise((resolve, reject) => {
      const elemento = new Image();
      elemento.onload = () => resolve(elemento);
      elemento.onerror = () => reject(new Error("No se pudo abrir la imagen."));
      elemento.src = urlTemporal;
    });

    const canvas = document.createElement("canvas");
    canvas.width = anchoDestino;
    canvas.height = altoDestino;
    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("No se pudo preparar la imagen.");

    const proporcionDestino = anchoDestino / altoDestino;
    const proporcionOrigen = imagen.naturalWidth / imagen.naturalHeight;
    let anchoOrigen = imagen.naturalWidth;
    let altoOrigen = imagen.naturalHeight;
    let xOrigen = 0;
    let yOrigen = 0;

    if (proporcionOrigen > proporcionDestino) {
      anchoOrigen = altoOrigen * proporcionDestino;
      xOrigen = (imagen.naturalWidth - anchoOrigen) / 2;
    } else {
      altoOrigen = anchoOrigen / proporcionDestino;
      yOrigen = (imagen.naturalHeight - altoOrigen) / 2;
    }

    contexto.fillStyle = "#fff";
    contexto.fillRect(0, 0, anchoDestino, altoDestino);
    contexto.drawImage(
      imagen,
      xOrigen,
      yOrigen,
      anchoOrigen,
      altoOrigen,
      0,
      0,
      anchoDestino,
      altoDestino,
    );

    let blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88),
    );
    if (!blob) {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.88),
      );
    }
    if (!blob) throw new Error("No se pudo exportar la imagen.");

    const extensiones = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = extensiones[blob.type] ?? "jpg";
    const nombreBase = archivo.name.replace(/\.[^.]+$/, "") || "imagen";
    return new File([blob], `${nombreBase}.${extension}`, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(urlTemporal);
  }
};

export const convertirArchivoADataUrl = (archivo) =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () =>
      typeof lector.result === "string"
        ? resolve(lector.result)
        : reject(new Error("No se pudo leer el archivo."));
    lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
    lector.readAsDataURL(archivo);
  });
