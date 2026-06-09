export function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: { lat: number; lng: number }[]
): boolean {
  // Un polígono válido necesita al menos 3 puntos
  if (!polygon || polygon.length < 3) {
    return false;
  }

  let isInside = false;

  // En un plano cartesiano, la longitud es X y la latitud es Y
  const x = lng;
  const y = lat;

  // Recorremos todos los vértices del polígono
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    // Condición mágica del Ray Casting:
    // 1. Verifica si el punto Y está entre las Y's de los dos vértices.
    // 2. Calcula la intersección X de la línea y verifica si el punto está a la izquierda.
    const intersect = 
      (yi > y) !== (yj > y) && 
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    // Cada vez que cruzamos una línea del polígono, alternamos el estado
    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}