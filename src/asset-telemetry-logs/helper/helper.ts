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

export async function calculateTripName(
  prisma: any,
  assetId: string,
  currentIgnition: number | null | undefined,
  lastTelemetry?: { metadata?: any; tripName?: string | null } | null,
): Promise<string | null> {
  // Si el motor está apagado o no hay ignición (diferente de 1), no hay viaje activo
  if (currentIgnition !== 1) {
    return null;
  }

  // Buscamos la última telemetría real del activo con ordenamiento estricto doble:
  // 1. recordedAt descendente
  // 2. createdAt descendente (desempate fundamental para telemetrías con la misma fecha/hora registrada)
  const lastLog = await prisma.assetTelemetryLog.findFirst({
    where: { assetId },
    orderBy: [
      { recordedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  const lastMetadata = (lastLog?.metadata as Record<string, any>) || {};
  const lastIgnition = lastMetadata.ignition;

  // CASO 1: Ignición consecutiva en 1 (1, 1, 1...)
  // Si la ignición YA ESTABA en 1, NO SE INCREMENTA. Se mantiene el mismo nombre de viaje.
  if (lastIgnition === 1) {
    if (lastLog?.tripName) {
      return lastLog.tripName;
    }
    // PRUEBA POST
    const activeTrip = await prisma.assetTelemetryLog.findFirst({
      where: { assetId, tripName: { not: null } },
      orderBy:[{ recordedAt: 'desc' }],//[{ createdAt: 'desc' }] , //[{ createdAt: 'desc' }],
    });
    return activeTrip?.tripName || 'Viaje_01';
  }

  // CASO 2: Transición de 0 (o nulo) a 1 (ÚNICO MOMENTO DONDE OCURRE EL INCREMENTO)
  // Buscamos el último viaje registrado para este activo para calcular el nuevo número
  const lastTripLog = await prisma.assetTelemetryLog.findFirst({
    where: {
      assetId,
      tripName: { not: null },
    },
    orderBy: [
      { recordedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  let nextTripNumber = 1;

  if (lastTripLog?.tripName) {
    const match = lastTripLog.tripName.match(/Viaje_(\d+)/i);
    if (match && match[1]) {
      nextTripNumber = parseInt(match[1], 10) + 1;
    }
  }

  const formattedNumber = String(nextTripNumber).padStart(2, '0');
  return `Viaje_${formattedNumber}`;
}