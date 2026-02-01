// src/useNearbyRestaurants.js
import { useEffect, useMemo, useState } from "react";

export default function useNearbyRestaurants(radiusMiles = 5) {
  const [location, setLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const radiusMeters = useMemo(
    () => Number(radiusMiles) * 1609.34,
    [radiusMiles]
  );

  // 1) Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setError("Could not get your location.");
        setLoading(false);
      }
    );
  }, []);

  // Helper: call Places Nearby Search (New)
  const callNearby = async ({ includedTypes, rankPreference }) => {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.rating,places.formattedAddress,places.location,places.priceLevel,places.primaryType,places.types",
        },
        body: JSON.stringify({
          includedTypes,
          maxResultCount: 20,
          rankPreference, // "POPULARITY" tends to surface chains more
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              radius: radiusMeters,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Places API error ${response.status}: ${text}`);
    }

    return response.json();
  };

  // 2) Fetch nearby restaurants whenever radius OR location changes
  useEffect(() => {
    if (!location) return;

    if (!apiKey) {
      setError("Missing Google API key (VITE_GOOGLE_API_KEY).");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
      setError("Invalid radius.");
      setLoading(false);
      return;
    }

    const fetchNearby = async () => {
      setLoading(true);
      setError("");

      try {
        // More requests -> more coverage for common chains (coffee, bakery, takeaway, etc.)
        const [
          restaurantsData,
          fastFoodData,
          takeawayData,
          bakeryCafeData,
        ] = await Promise.all([
          callNearby({
            includedTypes: ["restaurant", "cafe"],
            rankPreference: "POPULARITY",
          }),
          callNearby({
            includedTypes: ["fast_food_restaurant"],
            rankPreference: "POPULARITY",
          }),
          callNearby({
            includedTypes: ["meal_takeaway", "meal_delivery"],
            rankPreference: "POPULARITY",
          }),
          callNearby({
            includedTypes: ["bakery", "coffee_shop"],
            rankPreference: "POPULARITY",
          }),
        ]);

        const allPlaces = [
          ...(restaurantsData.places || []),
          ...(fastFoodData.places || []),
          ...(takeawayData.places || []),
          ...(bakeryCafeData.places || []),
        ];

        // Merge unique by id
        const unique = new Map();
        for (const p of allPlaces) {
          if (p?.id && !unique.has(p.id)) unique.set(p.id, p);
        }

        // ✅ HARD ENFORCE RADIUS (Google can return out-of-radius places when ranking by popularity)
        const filteredByDistance = Array.from(unique.values()).filter((place) => {
          const plat = place.location?.latitude;
          const plng = place.location?.longitude;
          if (typeof plat !== "number" || typeof plng !== "number") return false;

          const dist = distanceInMeters(location.lat, location.lng, plat, plng);
          return dist <= radiusMeters;
        });

        const mapped = filteredByDistance.map((place) => ({
          id: place.id,
          name: place.displayName?.text || "Unknown restaurant",
          rating: place.rating ?? "N/A",
          address: place.formattedAddress,
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          price: mapPriceLevel(place.priceLevel),
          serviceStyle: classifyServiceType(place),
          dish_type: "General",
        }));

        setRestaurants(mapped);
      } catch (err) {
        console.error(err);
        setError("Could not load restaurants from Google.");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location, apiKey, radiusMeters]);

  return { restaurants, loading, error };
}

// ---------------- HELPERS ----------------

function mapPriceLevel(priceLevel) {
  if (!priceLevel) return 1;
  if (priceLevel === "PRICE_LEVEL_MODERATE") return 2;
  if (
    priceLevel === "PRICE_LEVEL_EXPENSIVE" ||
    priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE"
  )
    return 3;
  return 1;
}

function classifyServiceType(place) {
  const types = place.types || [];
  const primary = place.primaryType || "";
  const name = place.displayName?.text?.toLowerCase() || "";

  const hasType = (t) => types.includes(t) || primary === t;

  // 1) Force known FAST FOOD chains first (EXCEPT Dunkin)
  const fastFoodKeywords = [
    "mcdonald",
    "burger king",
    "wendy",
    "taco bell",
    "subway",
    "chick-fil-a",
    "popeyes",
    "kfc",
    "domino",
    "pizza hut",
  ];

  if (
    hasType("fast_food_restaurant") ||
    hasType("meal_takeaway") ||
    hasType("meal_delivery") ||
    fastFoodKeywords.some((k) => name.includes(k))
  ) {
    return "Fast Food";
  }

  // 2) Dunkin should stay Cafe
  if (name.includes("dunkin")) return "Cafe";

  // 3) Other category checks
  if (hasType("seafood_restaurant")) return "Seafood";

  // 4) Cafe / coffee / bakery LAST
  if (hasType("cafe") || hasType("coffee_shop") || hasType("bakery")) {
    return "Cafe";
  }

  return "Casual Dining";
}

/**
 * Returns distance in meters.
 */
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
