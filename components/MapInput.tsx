import React, { useEffect, useRef } from 'react';

// Let TypeScript know that 'L' is a global variable from the Leaflet script
declare var L: any;

// A one-time setup for Leaflet icons to fix broken image paths.
try {
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
} catch (e) {
    // This might fail if the script hasn't loaded, which is fine initially.
    console.warn("Leaflet not loaded yet, cannot set default icon.", e);
}


interface MapInputProps {
    onShapeChange: (shapeGeoJSON: string, areaHectares: number) => void;
}

const MapInput: React.FC<MapInputProps> = ({ onShapeChange }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);
    const drawnItemsRef = useRef<any | null>(null);

    // Initialize map on component mount
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current);
            mapRef.current = map;

            // Use a satellite tile layer more appropriate for agriculture
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }).addTo(map);

            // Attempt to geolocate the user for a better initial view
            map.on('locationfound', (e: any) => {
                map.setView(e.latlng, 13);
            });
            map.on('locationerror', () => {
                // If geolocation fails, set a default view
                map.setView([28.61, 77.20], 5);
            });
            map.locate(); // Asynchronously gets the user's location

            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);
            drawnItemsRef.current = drawnItems;

            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    remove: true
                },
                draw: {
                    polygon: {
                        allowIntersection: false,
                        showArea: true
                    },
                    rectangle: {
                        showArea: true
                    },
                    // Disable other drawing tools
                    polyline: false,
                    circle: false,
                    marker: false,
                    circlemarker: false
                }
            });
            map.addControl(drawControl);
            
            const getAreaAndNotify = (layer: any) => {
                 // Convert area from m² to hectares
                const areaMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                const areaHectares = areaMeters / 10000;
                const geoJSON = JSON.stringify(layer.toGeoJSON());
                onShapeChange(geoJSON, areaHectares);
            }

            map.on(L.Draw.Event.CREATED, (event: any) => {
                const layer = event.layer;
                // Clear previous drawings
                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                
                // Zoom to the drawn shape for better context
                map.fitBounds(layer.getBounds(), { padding: [50, 50] });

                getAreaAndNotify(layer);
            });
            
            map.on(L.Draw.Event.EDITED, (event: any) => {
                event.layers.eachLayer((layer: any) => {
                    getAreaAndNotify(layer);
                });
            });

            map.on(L.Draw.Event.DELETED, () => {
                onShapeChange('', 0);
            });
        }

        // Cleanup function to remove the map instance
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [onShapeChange]);

    return <div ref={mapContainerRef} className="w-full h-80 rounded-lg border-2 border-gray-300" />;
};

export default MapInput;