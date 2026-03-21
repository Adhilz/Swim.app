const geoapifyApiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

if (!geoapifyApiKey) {
    console.warn('Geoapify API key is missing. Add EXPO_PUBLIC_GEOAPIFY_API_KEY to your .env file.');
}

export const GEOAPIFY_API_KEY = geoapifyApiKey;

/**
 * Build a Geoapify static map image URL with markers.
 */
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

/**
 * Build a Geoapify autocomplete url for searching addresses/locations.
 */
export const buildGeoapifyAutocompleteUrl = text => {
    if (!geoapifyApiKey || !text?.trim()) {
        return null;
    }

    return `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text.trim())}&limit=5&apiKey=${geoapifyApiKey}`;
};

/**
 * Fetch a routing path between two points (walking/driving).
 * Returns an array of [lat, lng] coordinate pairs for the route polyline.
 */
export const fetchRoute = async ({
    fromLat,
    fromLng,
    toLat,
    toLng,
    mode = 'drive', // 'drive', 'walk', 'bicycle', 'motorcycle'
} = {}) => {
    if (!geoapifyApiKey) return null;

    try {
        const url = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=${mode}&apiKey=${geoapifyApiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.features?.[0]?.geometry?.coordinates) {
            const coords = data.features[0].geometry.coordinates;
            // Geoapify routing returns MultiLineString: [[lng, lat], …]
            // Flatten and convert to [lat, lng] for Leaflet
            const flatCoords = coords.flat().map(([lng, lat]) => [lat, lng]);
            return flatCoords;
        }
        return null;
    } catch (err) {
        console.warn('Route fetch failed:', err.message);
        return null;
    }
};

/**
 * Build the HTML for an interactive Leaflet map rendered inside a WebView.
 * Shows store marker, user marker, delivery partner animation along a route,
 * and an ETA info box.
 */
export const buildInteractiveMapHtml = ({
    storeLat,
    storeLng,
    storeName = 'Store',
    userLat,
    userLng,
    userLabel = 'You',
    routeCoords = null, // [[lat,lng], …]
    deliveryProgress = 0.3, // 0 → 1 how far along the route the rider is
    riderName = 'Delivery Partner',
    etaMinutes = null,
    primaryColor = '#F48C25',
} = {}) => {
    // Compute center and zoom to fit both markers
    const centerLat = (storeLat + userLat) / 2;
    const centerLng = (storeLng + userLng) / 2;

    // Estimate zoom from distance between store and user
    const latDiff = Math.abs(storeLat - userLat);
    const lngDiff = Math.abs(storeLng - userLng);
    const maxDiff = Math.max(latDiff, lngDiff);
    let zoom = 14;
    if (maxDiff > 0.1) zoom = 12;
    else if (maxDiff > 0.05) zoom = 13;
    else if (maxDiff > 0.02) zoom = 14;
    else zoom = 15;

    const routeJs = routeCoords
        ? `var routeCoords = ${JSON.stringify(routeCoords)};`
        : `var routeCoords = [[${storeLat},${storeLng}],[${userLat},${userLng}]];`;

    // Compute rider position along route
    const riderPosJs = `
        var progress = ${Math.min(1, Math.max(0, deliveryProgress))};
        var riderIdx = Math.floor(progress * (routeCoords.length - 1));
        var riderPos = routeCoords[riderIdx] || routeCoords[0];
    `;

    return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }

        .store-marker {
            background: ${primaryColor};
            border: 3px solid #fff;
            border-radius: 14px;
            width: 44px; height: 44px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 16px rgba(244,140,37,0.4);
            font-size: 20px;
        }
        .user-marker {
            background: #2D1F14;
            border: 3px solid #fff;
            border-radius: 50%;
            width: 38px; height: 38px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            font-size: 16px;
        }
        .rider-marker {
            background: ${primaryColor};
            border: 4px solid #fff;
            border-radius: 50%;
            width: 52px; height: 52px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 6px 24px rgba(244,140,37,0.5);
            font-size: 24px;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
        }
        .rider-trail {
            position: absolute;
            width: 52px; height: 52px;
            border-radius: 50%;
            border: 2px solid ${primaryColor};
            opacity: 0;
            animation: trail 2s ease-out infinite;
        }
        @keyframes trail {
            0% { transform: scale(1); opacity: 0.4; }
            100% { transform: scale(2.2); opacity: 0; }
        }

        .popup-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            text-align: center; padding: 4px 2px;
        }
        .popup-content .name { font-weight: 700; font-size: 14px; color: #2D1F14; }
        .popup-content .sub { font-size: 11px; color: #7D6856; margin-top: 2px; }

        .leaflet-control-attribution { display: none !important; }

        .eta-box {
            position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
            z-index: 1000;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px; padding: 10px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            text-align: center; min-width: 140px;
        }
        .eta-box .label { font-size: 10px; color: #7D6856; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .eta-box .time { font-size: 22px; font-weight: 800; color: ${primaryColor}; margin-top: 2px; }
        .eta-box .rider { font-size: 11px; color: #7D6856; margin-top: 2px; }

        .legend {
            position: absolute; bottom: 16px; left: 16px;
            z-index: 1000;
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(10px);
            border-radius: 14px; padding: 10px 14px;
            box-shadow: 0 3px 14px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .legend-item { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 12px; color: #2D1F14; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
    </style>
</head>
<body>
    <div id="map"></div>

    ${etaMinutes != null ? `
    <div class="eta-box">
        <div class="label">Estimated Arrival</div>
        <div class="time">${etaMinutes} min</div>
        <div class="rider">🛵 ${riderName}</div>
    </div>
    ` : ''}

    <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:${primaryColor}"></div> ${storeName}</div>
        <div class="legend-item"><div class="legend-dot" style="background:#2D1F14"></div> ${userLabel}</div>
        <div class="legend-item"><div class="legend-dot" style="background:${primaryColor};border:2px solid #fff;box-shadow:0 0 6px ${primaryColor}"></div> 🛵 Rider</div>
    </div>

    <script>
        var map = L.map('map', {
            center: [${centerLat}, ${centerLng}],
            zoom: ${zoom},
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyApiKey}', {
            maxZoom: 20,
        }).addTo(map);

        // Zoom controls on right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Store marker
        var storeIcon = L.divIcon({
            html: '<div class="store-marker">🏪</div>',
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            popupAnchor: [0, -24],
        });
        var storeMarker = L.marker([${storeLat}, ${storeLng}], { icon: storeIcon }).addTo(map);
        storeMarker.bindPopup('<div class="popup-content"><div class="name">${storeName.replace(/'/g, "\\'")}</div><div class="sub">Pickup Point</div></div>');

        // User marker
        var userIcon = L.divIcon({
            html: '<div class="user-marker">🏠</div>',
            className: '',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -22],
        });
        var userMarker = L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<div class="popup-content"><div class="name">${userLabel.replace(/'/g, "\\'")}</div><div class="sub">Delivery Address</div></div>');

        // Route
        ${routeJs}
        ${riderPosJs}

        // Draw route polyline
        if (routeCoords.length >= 2) {
            // Completed path (behind rider)
            var completedCoords = routeCoords.slice(0, riderIdx + 1);
            L.polyline(completedCoords, {
                color: '${primaryColor}',
                weight: 5,
                opacity: 0.9,
                dashArray: null,
                lineCap: 'round',
            }).addTo(map);

            // Remaining path (ahead of rider)
            var remainingCoords = routeCoords.slice(riderIdx);
            L.polyline(remainingCoords, {
                color: '${primaryColor}',
                weight: 4,
                opacity: 0.35,
                dashArray: '8, 12',
                lineCap: 'round',
            }).addTo(map);
        }

        // Rider marker
        var riderIcon = L.divIcon({
            html: '<div style="position:relative"><div class="rider-trail"></div><div class="rider-marker">🛵</div></div>',
            className: '',
            iconSize: [52, 52],
            iconAnchor: [26, 26],
            popupAnchor: [0, -30],
        });
        var riderMarker = L.marker(riderPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
        riderMarker.bindPopup('<div class="popup-content"><div class="name">${riderName.replace(/'/g, "\\'")}</div><div class="sub">On the way to you 🛵</div></div>');

        // Animate rider along the route
        var currentIdx = riderIdx;
        var animInterval = setInterval(function() {
            currentIdx++;
            if (currentIdx >= routeCoords.length) {
                currentIdx = routeCoords.length - 1;
                clearInterval(animInterval);
            }
            riderMarker.setLatLng(routeCoords[currentIdx]);
        }, 3000);

        // Fit bounds to show all markers
        var bounds = L.latLngBounds([
            [${storeLat}, ${storeLng}],
            [${userLat}, ${userLng}],
            riderPos
        ]);
        map.fitBounds(bounds.pad(0.2));
    </script>
</body>
</html>`;
};
