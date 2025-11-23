import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function calculateGlobeZoom(containerElement: HTMLElement): number {
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;

    const minDimension = Math.min(width, height);
    const fillFactor = 0.7;

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
                'tiles': ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'],
                'type': 'raster'
            },
        },
        'layers': [
            {
                'id': 'Satellite',
                'type': 'raster',
                'source': 'satellite',
            },
        ],
        'sky': {
            'atmosphere-blend': 0.3,
        }
    }
});


// Rotate the globe infinitely along the equator with parallax effect
map.on('load', () => {
    let longitude = 0;
    let mouseX = 0;
    let mouseY = 0;
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
        }, 150); // Resume rotation 150ms after mouse stops
    });

    function rotateGlobe() {
        // Only auto-rotate when mouse is not moving
        if (!isMouseMoving) {
            longitude = (longitude + 0.1) % 360;
        }

        // Add subtle parallax effect based on mouse position
        const parallaxLng = mouseX * 10; // Adjust multiplier for effect strength
        const parallaxLat = -mouseY * 10; // Negative to invert vertical movement

        map.setCenter([longitude + parallaxLng, parallaxLat]);
        requestAnimationFrame(rotateGlobe);
    }

    rotateGlobe();
});