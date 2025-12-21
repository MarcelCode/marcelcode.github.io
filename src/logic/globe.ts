import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function calculateGlobeZoom(containerElement: HTMLElement): number {
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;

    const minDimension = Math.min(width, height);
    const fillFactor = 0.8;

    return Math.log2(minDimension / (256 * fillFactor));
}

const zoom = calculateGlobeZoom(document.getElementById('header-map')!)

const map = new maplibregl.Map({
    container: 'header-map',
    zoom: zoom,
    interactive: false,
    style: {
        'version': 8,
        'projection': {
            'type': 'globe'
        },
        'sources': {
            'satellite': {
                'tiles': ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'],
                'type': 'raster',
                'attribution': '© <a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless</a> by <a href="https://eox.at" target="_blank">EOX IT Services GmbH</a>'
            },
        },
        'layers': [
            {
                'id': 'Satellite',
                'type': 'raster',
                'source': 'satellite',
                'paint': {
                    'raster-opacity': 0,
                    'raster-opacity-transition': {
                        duration: 1000,
                        delay: 0
                    }
                }
            },
        ],
        'sky': {
            'atmosphere-blend': 0,
        }
    },
    fadeDuration: 0  // Disable tile fade-in for instant appearance once loaded
});

map.on('load', () => {
    map.once('idle', () => {
        map.setPaintProperty('Satellite', 'raster-opacity', 1);

        map.setSky({
            'atmosphere-blend': 0.3
        });
    });

    let longitude = 0;
    let mouseX = 0;
    let mouseY = 0;
    let currentParallaxLng = 0;
    let currentParallaxLat = 0;
    let isMouseMoving = false;
    let mouseTimeout: number;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        // Normalize mouse position to -1 to 1 range
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;

        isMouseMoving = true;

        // Reset timeout
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 200); // Resume rotation 150ms after mouse stops
    });

    function rotateGlobe() {
        // Only auto-rotate when mouse is not moving
        if (!isMouseMoving) {
            longitude = (longitude - 0.1) % 360;
        }

        const targetParallaxLng = mouseX * 30; // Adjust multiplier for effect strength
        const targetParallaxLat = -mouseY * 30; // Negative to invert vertical movement

        // Smoothly interpolate towards target (lerp with factor 0.05 for smooth transition)
        const lerpFactor = 0.05;
        currentParallaxLng += (targetParallaxLng - currentParallaxLng) * lerpFactor;
        currentParallaxLat += (targetParallaxLat - currentParallaxLat) * lerpFactor;

        map.setCenter([longitude + currentParallaxLng, currentParallaxLat]);
        requestAnimationFrame(rotateGlobe);
    }

    rotateGlobe();
});

window.addEventListener('resize', () => {
    const newZoom = calculateGlobeZoom(document.getElementById('header-map')!);
    map.setZoom(newZoom);
});