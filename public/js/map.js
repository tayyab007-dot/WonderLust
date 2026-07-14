// public/js/map.js

// 1. Grab the map element containing our embedded database values
const mapDomElement = document.getElementById('map');

// 2. Safely parse variables from the DOM attributes
const mapCoordinates = JSON.parse(mapDomElement.getAttribute('data-coordinates'));
const listingTitle = mapDomElement.getAttribute('data-title');
const listingLocation = mapDomElement.getAttribute('data-location');

// 3. Align coordinates (MongoDB [longitude, latitude] vs Leaflet [latitude, longitude])
const defaultCenter = (mapCoordinates && mapCoordinates.length === 2 && (mapCoordinates[0] !== 0 || mapCoordinates[1] !== 0))
    ? [mapCoordinates[1], mapCoordinates[0]]
    : [51.505, -0.09]; // Fallback to London center if coordinates are empty

// 4. Initialize map object targeting our container
const map = L.map('map').setView(defaultCenter, 13);

// 5. Load free open-source OpenStreetMap base tile layers
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 6. Drop marker pin onto coordinate destination
const marker = L.marker(defaultCenter).addTo(map);

// 7. Bind descriptive popups with typography matching your site styles
marker.bindPopup(`
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 150px;">
        <h6 style="font-weight: 700; margin: 0 0 4px 0; color: #212529;">${listingTitle}</h6>
        <p style="color: #6c757d; margin: 0; font-size: 0.85rem;">${listingLocation}</p>
    </div>
`).openPopup();