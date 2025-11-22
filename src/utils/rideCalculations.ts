export type RideDetails = {
  distanceKm: number;
  durationMinutes: number;
  cost: number;
  driverEarning: number;
  platformFee: number;
  fallback?: boolean;
};

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const EARTH_RADIUS_KM = 6371;
const FALLBACK_SPEED_KMPH = 40;

const toTwoDecimals = (value: number) => Number(value.toFixed(2));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const haversineDistanceKm = (startLat: number, startLon: number, destLat: number, destLon: number) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(destLat - startLat);
  const dLon = toRadians(destLon - startLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(startLat)) * Math.cos(toRadians(destLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const buildResult = (distanceKm: number, durationMinutes: number, fallback = false): RideDetails => {
  const cost = toTwoDecimals(distanceKm * 10);
  const driverEarning = toTwoDecimals(cost * 0.9);
  const platformFee = toTwoDecimals(cost * 0.1);

  return {
    distanceKm: toTwoDecimals(distanceKm),
    durationMinutes,
    cost,
    driverEarning,
    platformFee,
    fallback: fallback || undefined,
  };
};

export const calculateRideDetails = async (
  startLat: number,
  startLon: number,
  destLat: number,
  destLon: number
): Promise<RideDetails> => {
  const url = `${OSRM_BASE_URL}/${startLon},${startLat};${destLon},${destLat}?overview=false`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM request failed with status ${response.status}`);
      }

      const data = await response.json();
      const firstRoute = data?.routes?.[0];

      if (!firstRoute) {
        throw new Error('OSRM response missing route data');
      }

      const distanceKm = firstRoute.distance / 1000;
      const durationMinutes = Math.max(1, Math.round(firstRoute.duration / 60));

      return buildResult(distanceKm, durationMinutes);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  const fallbackDistance = Math.max(haversineDistanceKm(startLat, startLon, destLat, destLon), 0.5);
  const durationMinutes = Math.max(1, Math.round((fallbackDistance / FALLBACK_SPEED_KMPH) * 60));

  if (!fallbackDistance || Number.isNaN(fallbackDistance)) {
    throw lastError instanceof Error ? lastError : new Error('OSRM request failed and fallback unavailable');
  }

  return buildResult(fallbackDistance, durationMinutes, true);
};

