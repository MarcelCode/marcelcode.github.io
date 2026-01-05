import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

async function initGlobe() {
    function calculateGlobeZoom(containerElement: HTMLElement): number {
        const width = containerElement.clientWidth;
        const height = containerElement.clientHeight;

        const minDimension = Math.min(width, height);
        const fillFactor = 0.8;

        return Math.log2(minDimension / (256 * fillFactor));
    }

    const containerEl = document.getElementById('header-map')!
    const zoom = calculateGlobeZoom(containerEl)

    const map = new maplibregl.Map({
        container: 'header-map',
        zoom: zoom,
        interactive: false,
        style: {
            version: 8,
            projection: { type: 'globe' },
            sources: {
                satellite: {
                    tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'],
                    type: 'raster'
                },
            },
            layers: [
                {
                    id: 'background',
                    type: 'background',
                    paint: {
                        'background-color': 'rgba(0,0,0,0)'
                    }
                },
                {
                    id: 'Satellite',
                    type: 'raster',
                    source: 'satellite',
                    paint: {
                        'raster-opacity': 0,
                        'raster-opacity-transition': { duration: 1000, delay: 0 }
                    }
                },
            ],
            sky: { 'atmosphere-blend': 0 }
        },
        fadeDuration: 0,
        attributionControl: false
    });

    // Reveal only after first frame is actually rendered (prevents the white flicker)
    map.once('render', () => {
        containerEl.classList.add('globe-ready')
    })

    map.on('load', () => {
        map.setPaintProperty('Satellite', 'raster-opacity', 1);
        map.setSky({ 'atmosphere-blend': 0.3 });

        let longitude = 0;
        let mouseX = 0;
        let mouseY = 0;
        let currentParallaxLng = 0;
        let currentParallaxLat = 0;
        let isMouseMoving = false;
        let mouseTimeout: number;
        let isGlobeVisible = true;
        let animationFrameId: number;

        const observer = new IntersectionObserver(
            (entries) => {
                isGlobeVisible = entries[0].isIntersecting;
                if (isGlobeVisible && !animationFrameId) {
                    rotateGlobe();
                }
            },
            { threshold: 0 }
        );
        observer.observe(containerEl);

        let lastMouseUpdate = 0;
        const mouseUpdateInterval = 16;

        const header = document.querySelector('header');
        header?.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseUpdate < mouseUpdateInterval) return;
            lastMouseUpdate = now;

            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            isMouseMoving = true;

            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                isMouseMoving = false;
            }, 200);
        });

        function rotateGlobe() {
            if (!isGlobeVisible) {
                animationFrameId = 0;
                return;
            }

            if (!isMouseMoving) {
                longitude = (longitude - 0.1) % 360;
            }

            const targetParallaxLng = mouseX * 30;
            const targetParallaxLat = -mouseY * 30;

            const lerpFactor = 0.05;
            currentParallaxLng += (targetParallaxLng - currentParallaxLng) * lerpFactor;
            currentParallaxLat += (targetParallaxLat - currentParallaxLat) * lerpFactor;

            map.setCenter([longitude + currentParallaxLng, currentParallaxLat]);
            animationFrameId = requestAnimationFrame(rotateGlobe);
        }

        rotateGlobe();
    });

    window.addEventListener('resize', () => {
        const newZoom = calculateGlobeZoom(containerEl);
        map.setZoom(newZoom);
    });
}

initGlobe();