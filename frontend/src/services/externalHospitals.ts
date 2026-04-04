/**
 * External Hospital Data Service
 * Fetches real hospital data from external APIs
 */

export interface ExternalHospital {
    id: string;
    name: string;
    address: string;
    district?: string;
    type: string;
    contact?: string;
    latitude: number;
    longitude: number;
    distance_km?: number;
    estimated_time_minutes?: number;
    rating?: number;
    total_ratings?: number;
    is_open?: boolean;
    source: 'google_places' | 'overpass' | 'government';
}

/**
 * Extract district/city from address tags
 */
const extractDistrict = (tags: any): string => {
    // Try different address fields in order of preference
    return tags['addr:city'] ||
        tags['addr:district'] ||
        tags['addr:state_district'] ||
        tags['addr:county'] ||
        tags['is_in:city'] ||
        tags['is_in:district'] ||
        'Location available';
};

/**
 * Fetch hospitals from Google Places API
 * Note: Requires REACT_APP_GOOGLE_PLACES_API_KEY in .env
 */
export const fetchGooglePlacesHospitals = async (
    latitude: number,
    longitude: number,
    radius: number = 50000 // 50km default
): Promise<ExternalHospital[]> => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        console.warn('Google Places API key not configured');
        return [];
    }

    try {
        // Use Places API Nearby Search
        // Note: Direct API calls from browser will fail due to CORS
        // You need to proxy this through your backend
        const response = await fetch(`/api/proxy/google-places?lat=${latitude}&lng=${longitude}&radius=${radius}`);

        if (!response.ok) {
            throw new Error('Failed to fetch from Google Places');
        }

        const data = await response.json();

        return (data.results || []).map((place: any) => ({
            id: `google-${place.place_id}`,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Address not available',
            type: 'Hospital',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            total_ratings: place.user_ratings_total,
            is_open: place.opening_hours?.open_now,
            contact: place.formatted_phone_number,
            source: 'google_places' as const,
        }));
    } catch (error) {
        console.error('Error fetching Google Places hospitals:', error);
        return [];
    }
};

/**
 * Fetch hospitals from OpenStreetMap Overpass API
 * This is free and doesn't require an API key
 */
export const fetchOverpassHospitals = async (
    latitude: number,
    longitude: number,
    radius: number = 50000 // 50km in meters
): Promise<ExternalHospital[]> => {
    try {
        // Overpass API query for hospitals
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
        way["amenity"="hospital"](around:${radius},${latitude},${longitude});
        relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!response.ok) {
            console.warn(`Overpass API returned status ${response.status}, using fallback data`);
            return [];
        }

        const data = await response.json();

        const hospitals: ExternalHospital[] = [];

        (data.elements || []).forEach((element: any) => {
            if (element.tags && element.tags.name) {
                const lat = element.lat || element.center?.lat;
                const lon = element.lon || element.center?.lon;

                if (lat && lon) {
                    // Calculate distance
                    const distance = calculateDistance(latitude, longitude, lat, lon);

                    // Extract district from address tags
                    const district = extractDistrict(element.tags);

                    // Build full address
                    const addressParts = [
                        element.tags['addr:housenumber'],
                        element.tags['addr:street'],
                        element.tags['addr:suburb'],
                        element.tags['addr:city'],
                        element.tags['addr:postcode']
                    ].filter(Boolean);

                    const fullAddress = addressParts.length > 0
                        ? addressParts.join(', ')
                        : `${district} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

                    hospitals.push({
                        id: `osm-${element.id}`,
                        name: element.tags.name,
                        address: fullAddress,
                        district: district,
                        type: element.tags.healthcare || element.tags.hospital || 'Hospital',
                        contact: element.tags.phone || element.tags['contact:phone'],
                        latitude: lat,
                        longitude: lon,
                        distance_km: Math.round(distance * 10) / 10,
                        estimated_time_minutes: Math.round(distance / 40 * 60),
                        source: 'overpass' as const,
                    });
                }
            }
        });

        return hospitals.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    } catch (error) {
        console.warn('Overpass API unavailable, using fallback hospital data:', error);
        return [];
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Fetch hospitals from all available sources and merge them
 */
export const fetchAllExternalHospitals = async (
    latitude: number,
    longitude: number,
    radius: number = 50000
): Promise<ExternalHospital[]> => {
    try {
        // Fetch from Overpass (OpenStreetMap) - free and no API key needed
        const overpassHospitals = await fetchOverpassHospitals(latitude, longitude, radius);

        // You can add Google Places here if you have an API key
        // const googleHospitals = await fetchGooglePlacesHospitals(latitude, longitude, radius);

        // Merge and deduplicate by name
        const allHospitals = [...overpassHospitals];
        const seen = new Set<string>();

        return allHospitals.filter(hospital => {
            const key = hospital.name.toLowerCase().trim();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        }).sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    } catch (error) {
        console.warn('Error fetching external hospitals, will use fallback data:', error);
        return [];
    }
};
