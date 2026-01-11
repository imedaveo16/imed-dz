import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, Navigation, AlertOctagon, Check, Hand } from 'lucide-react';
import { MAPBOX_TOKEN, MAP_DEFAULT_CENTER } from '../constants';
import { Coordinates } from '../types';
import { useLanguage } from '../LanguageContext';

interface MapPickerProps {
  location: Coordinates | null;
  onLocationSelect: (coords: Coordinates) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ location, onLocationSelect }) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [manualFallbackUsed, setManualFallbackUsed] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example')) {
      console.warn("Invalid Mapbox Token. Map functionality might be limited.");
    }

    // Check for WebGL support
    if (!mapboxgl.supported()) {
        console.warn('WebGL is not supported in this browser. Switching to fallback view.');
        setMapError(true);
        return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Standard style
        center: [MAP_DEFAULT_CENTER.lng, MAP_DEFAULT_CENTER.lat],
        zoom: 11,
        pitch: 45, // 3D tilt
        bearing: -17.6,
        antialias: true
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        const m = map.current!;

        // Add 3D buildings
        if (!m.getLayer('3d-buildings')) {
            const layers = m.getStyle()?.layers;
            const labelLayerId = layers?.find(
                (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
            )?.id;

            m.addLayer(
                {
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 13,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId
            );
        }

        // Add 3D terrain source
        try {
            m.addSource('mapbox-dem', {
              'type': 'raster-dem',
              'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
              'tileSize': 512,
              'maxzoom': 14
            });
            m.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        } catch (err) {
            console.warn("Could not add terrain source:", err);
        }
      });

      map.current.on('click', (e) => {
        handleMapClick(e.lngLat.lat, e.lngLat.lng);
      });

      map.current.on('error', (e) => {
        console.warn("Mapbox error event:", e);
        if (e.error && (e.error.message?.includes('WebGL') || e.error.message?.includes('not supported'))) {
            setMapError(true);
        }
      });

    } catch (e) {
      console.error("Error initializing map:", e);
      setMapError(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when location prop changes
  useEffect(() => {
    if (!location) return;

    // If map exists, update marker
    if (map.current && mapLoaded) {
        if (!marker.current) {
          marker.current = new mapboxgl.Marker({ color: '#dc2626', scale: 1.2 })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);
          
          map.current.flyTo({
            center: [location.lng, location.lat],
            zoom: 16,
            essential: true
          });
        } else {
          marker.current.setLngLat([location.lng, location.lat]);
        }
    }
  }, [location, mapLoaded]);

  const handleMapClick = (lat: number, lng: number) => {
    onLocationSelect({ lat, lng });
  };

  const handleManualSelect = () => {
    setIsLocating(false);
    if (map.current) {
        map.current.flyTo({
            center: [MAP_DEFAULT_CENTER.lng, MAP_DEFAULT_CENTER.lat],
            zoom: 11,
            essential: true
        });
    }
  };

  const handleGeolocation = (showError = true, enableHighAccuracy = true) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      if (showError) alert(t('gpsFailed'));
      setIsLocating(false);
      handleManualSelect(); // Fallback to manual
      return;
    }

    const success = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect({ lat: latitude, lng: longitude });
        setIsLocating(false);
        setManualFallbackUsed(true);
        
        // Fly to location if map exists
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            essential: true
          });
        }
    };

    const error = (err: GeolocationPositionError) => {
        if (enableHighAccuracy && err.code === 3) {
            handleGeolocation(showError, false);
            return;
        }
        if (showError) {
           alert(`${t('gpsFailed')}`);
        }
        setIsLocating(false);
        // Ensure map is usable if GPS fails
        if (map.current) {
            map.current.flyTo({
                center: [MAP_DEFAULT_CENTER.lng, MAP_DEFAULT_CENTER.lat],
                zoom: 11
            });
        }
    };

    navigator.geolocation.getCurrentPosition(success, error, { 
        enableHighAccuracy, 
        timeout: enableHighAccuracy ? 10000 : 20000, 
        maximumAge: 0 
    });
  };

  useEffect(() => {
    if (!location) {
      handleGeolocation(false, true); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFallbackLocation = () => {
      onLocationSelect(MAP_DEFAULT_CENTER);
      setManualFallbackUsed(true);
  };

  if (mapError) {
      return (
        <div className="flex flex-col items-center justify-center h-80 w-full rounded-2xl p-4 text-center text-slate-500 bg-slate-100 border-2 border-slate-200 border-dashed">
            {location && manualFallbackUsed ? (
                <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-lg text-slate-800">{t('locLocated')}</p>
                    <p className="text-sm text-slate-600 mb-4">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    <button 
                        type="button"
                        onClick={() => handleGeolocation(true, true)}
                        className="text-primary underline text-sm"
                    >
                        {t('updateLoc')}
                    </button>
                </>
            ) : (
                <>
                    <AlertOctagon className="w-10 h-10 mb-2 text-red-400 opacity-80" />
                    <p className="font-semibold text-slate-700">{t('mapError')}</p>
                    <p className="text-sm mt-1 mb-4 max-w-xs mx-auto">
                    {t('mapErrorDesc')}
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button 
                            type="button"
                            onClick={() => handleGeolocation(true, true)}
                            disabled={isLocating}
                            className="flex items-center justify-center w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-slate-700 font-bold hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            {isLocating ? (
                                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin ml-2" />
                            ) : (
                                <Navigation className="w-5 h-5 ml-2 text-primary" />
                            )}
                            {t('useCurrentLoc')}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={handleFallbackLocation}
                            className="text-slate-500 text-sm hover:text-slate-700 underline"
                        >
                            {t('useDefaultLoc')}
                        </button>
                    </div>
                </>
            )}
        </div>
      );
  }

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* GPS Button */}
            <button
                type="button"
                onClick={() => handleGeolocation(true, true)}
                disabled={isLocating}
                className="bg-white p-3 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-primary border border-slate-100"
                title={t('useCurrentLoc')}
            >
                {isLocating ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                <Navigation className="w-6 h-6" />
                )}
            </button>
            
            {/* Manual Selection Button */}
            <button
                type="button"
                onClick={handleManualSelect}
                className="bg-white p-3 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-slate-700 border border-slate-100"
                title={t('manualSel')}
            >
                <Hand className="w-6 h-6" />
            </button>
        </div>

        {/* Instructions Overlay */}
        {!location && mapLoaded && (
        <div className="absolute bottom-4 left-0 right-0 mx-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 text-center z-10 pointer-events-none">
            <div className="flex items-center justify-center text-sm font-semibold text-slate-700">
            <MapPin className="w-4 h-4 ml-2 text-primary" />
            {t('mapInstruction')}
            </div>
        </div>
        )}
    </div>
  );
};