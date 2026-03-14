const geoapifyApiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

if (!geoapifyApiKey) {
    console.warn('Geoapify API key is missing. Add EXPO_PUBLIC_GEOAPIFY_API_KEY to your .env file.');
}

export const GEOAPIFY_API_KEY = geoapifyApiKey;

export const buildGeoapifyStaticMapUrl = ({
    latitude,
    longitude,
    zoom = 15,
    width = 800,
    height = 600,
    markerColor = '#f48c25',
    markers,
} = {}) => {
    if (!geoapifyApiKey) {
        return null;
    }

    const validMarkers = Array.isArray(markers)
        ? markers.filter(item => item?.latitude != null && item?.longitude != null)
        : [];
    const fallbackMarker = latitude != null && longitude != null
        ? [{ latitude, longitude, color: markerColor }]
        : [];
    const allMarkers = validMarkers.length > 0 ? validMarkers : fallbackMarker;

    if (allMarkers.length === 0) {
        return null;
    }

    const centerLat = latitude ?? allMarkers[0].latitude;
    const centerLng = longitude ?? allMarkers[0].longitude;
    const markerParams = allMarkers
        .map(item => {
            const color = item.color || markerColor;
            const marker = `lonlat:${item.longitude},${item.latitude};color:${color};size:medium`;
            return `marker=${encodeURIComponent(marker)}`;
        })
        .join('&');

    return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${centerLng},${centerLat}&zoom=${zoom}&scaleFactor=2&${markerParams}&apiKey=${geoapifyApiKey}`;
};

export const buildGeoapifyAutocompleteUrl = text => {
    if (!geoapifyApiKey || !text?.trim()) {
        return null;
    }

    return `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text.trim())}&limit=5&apiKey=${geoapifyApiKey}`;
};
