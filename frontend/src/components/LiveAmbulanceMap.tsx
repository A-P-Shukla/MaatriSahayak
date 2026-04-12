import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression, LatLng } from 'leaflet';
import { Box, Typography, Chip, Paper, Stack, LinearProgress, Avatar } from '@mui/material';
import { LocalHospital, Speed, Timer, Navigation } from '@mui/icons-material';
import type { Ambulance } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface AnimatedAmbulance extends Ambulance {
    animatedPosition: LatLng;
    targetPosition: LatLng;
    route: LatLng[];
    eta: number; // minutes
    distanceRemaining: number; // km
}

interface LiveAmbulanceMapProps {
    ambulances: Ambulance[];
    center?: LatLngExpression;
    zoom?: number;
    height?: string | number;
}

// Simulate route between two points
const generateRoute = (start: LatLng, end: LatLng, points: number = 20): LatLng[] => {
    const route: LatLng[] = [];
    for (let i = 0; i <= points; i++) {
        const ratio = i / points;
        const lat = start.lat + (end.lat - start.lat) * ratio + (Math.random() - 0.5) * 0.002;
        const lng = start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.002;
        route.push(new LatLng(lat, lng));
    }
    return route;
};

// Calculate distance between two points (Haversine formula)
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

const LiveAmbulanceMap: React.FC<LiveAmbulanceMapProps> = ({
    ambulances,
    center = [26.8467, 80.9462],
    zoom = 12,
    height = '600px',
}) => {
    const [animatedAmbulances, setAnimatedAmbulances] = useState<AnimatedAmbulance[]>([]);
    const animationFrameRef = useRef<number>();

    // Initialize animated ambulances with mock destinations
    useEffect(() => {
        const initialized = ambulances
            .filter(a => a.current_location)
            .map((ambulance) => {
                const currentPos = new LatLng(
                    ambulance.current_location!.latitude,
                    ambulance.current_location!.longitude
                );

                // Generate a random destination (hospital)
                const destLat = currentPos.lat + (Math.random() - 0.5) * 0.05;
                const destLng = currentPos.lng + (Math.random() - 0.5) * 0.05;
                const destination = new LatLng(destLat, destLng);

                const route = generateRoute(currentPos, destination);
                const distance = calculateDistance(currentPos.lat, currentPos.lng, destLat, destLng);
                const avgSpeed = 40 + Math.random() * 20; // 40-60 km/h
                const eta = (distance / avgSpeed) * 60; // minutes

                return {
                    ...ambulance,
                    animatedPosition: currentPos,
                    targetPosition: destination,
                    route,
                    eta: Math.round(eta),
                    distanceRemaining: parseFloat(distance.toFixed(2)),
                };
            });

        setAnimatedAmbulances(initialized);
    }, [ambulances]);

    // Animate ambulance movement
    useEffect(() => {
        let lastTime = Date.now();
        const speed = 0.0001; // Movement speed

        const animate = () => {
            const now = Date.now();
            const delta = (now - lastTime) / 1000; // seconds
            lastTime = now;

            setAnimatedAmbulances(prev =>
                prev.map(ambulance => {
                    const current = ambulance.animatedPosition;
                    const target = ambulance.targetPosition;

                    // Calculate direction
                    const latDiff = target.lat - current.lat;
                    const lngDiff = target.lng - current.lng;
                    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                    // If close to target, generate new target
                    if (distance < 0.001) {
                        const newDestLat = current.lat + (Math.random() - 0.5) * 0.05;
                        const newDestLng = current.lng + (Math.random() - 0.5) * 0.05;
                        const newTarget = new LatLng(newDestLat, newDestLng);
                        const newRoute = generateRoute(current, newTarget);
                        const newDistance = calculateDistance(current.lat, current.lng, newDestLat, newDestLng);
                        const avgSpeed = 40 + Math.random() * 20;

                        return {
                            ...ambulance,
                            targetPosition: newTarget,
                            route: newRoute,
                            eta: Math.round((newDistance / avgSpeed) * 60),
                            distanceRemaining: parseFloat(newDistance.toFixed(2)),
                        };
                    }

                    // Move towards target
                    const moveSpeed = speed * delta * 60;
                    const newLat = current.lat + (latDiff / distance) * moveSpeed;
                    const newLng = current.lng + (lngDiff / distance) * moveSpeed;

                    // Update ETA and distance
                    const newDistance = calculateDistance(newLat, newLng, target.lat, target.lng);
                    const avgSpeed = 40 + Math.random() * 10;
                    const newEta = Math.max(1, Math.round((newDistance / avgSpeed) * 60));

                    return {
                        ...ambulance,
                        animatedPosition: new LatLng(newLat, newLng),
                        eta: newEta,
                        distanceRemaining: parseFloat(newDistance.toFixed(2)),
                    };
                })
            );

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Custom ambulance icon
    const getAmbulanceIcon = (status: string, isMoving: boolean) => {
        const colors: Record<string, string> = {
            available: '#4caf50',
            dispatched: '#ff9800',
            busy: '#f44336',
            maintenance: '#9e9e9e',
        };

        const color = colors[status.toLowerCase()] || '#2196f3';
        const pulseAnimation = isMoving ? `
      <animate attributeName="r" values="10;12;10" dur="1s" repeatCount="indefinite"/>
    ` : '';

        return new Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <circle cx="20" cy="20" r="10" fill="${color}" opacity="0.3">
            ${pulseAnimation}
          </circle>
          <circle cx="20" cy="20" r="14" fill="${color}" filter="url(#shadow)"/>
          <path d="M15 20 L20 15 L25 20 L20 18 L20 25 Z" fill="white"/>
          <circle cx="20" cy="20" r="2" fill="white"/>
        </svg>
      `)}`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
        });
    };

    // Hospital icon
    const hospitalIcon = new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="#1B6B4A" stroke="white" stroke-width="2"/>
        <path d="M16 8 L16 24 M8 16 L24 16" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

    return (
        <Box sx={{ height, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {animatedAmbulances.map((ambulance) => {
                    const isMoving = ambulance.status.toLowerCase() === 'dispatched' || ambulance.status.toLowerCase() === 'busy';

                    return (
                        <React.Fragment key={ambulance.ambulance_id}>
                            {/* Route line */}
                            {isMoving && (
                                <Polyline
                                    positions={ambulance.route.map(p => [p.lat, p.lng])}
                                    color="#1B6B4A"
                                    weight={3}
                                    opacity={0.6}
                                    dashArray="10, 10"
                                />
                            )}

                            {/* Destination marker */}
                            {isMoving && (
                                <Marker
                                    position={[ambulance.targetPosition.lat, ambulance.targetPosition.lng]}
                                    icon={hospitalIcon}
                                >
                                    <Popup>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Destination Hospital
                                        </Typography>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Ambulance marker */}
                            <Marker
                                position={[ambulance.animatedPosition.lat, ambulance.animatedPosition.lng]}
                                icon={getAmbulanceIcon(ambulance.status, isMoving)}
                            >
                                <Popup>
                                    <Paper elevation={0} sx={{ p: 2, minWidth: 280 }}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: '#1B6B4A', width: 48, height: 48 }}>
                                                    <LocalHospital />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>
                                                        {ambulance.vehicle_number}
                                                    </Typography>
                                                    <Chip
                                                        label={ambulance.status.toUpperCase()}
                                                        size="small"
                                                        color={ambulance.status.toLowerCase() === 'available' ? 'success' :
                                                            ambulance.status.toLowerCase() === 'dispatched' ? 'warning' : 'error'}
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                </Box>
                                            </Box>

                                            {isMoving && (
                                                <>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Timer fontSize="small" color="action" />
                                                            <Typography variant="body2" fontWeight={600}>
                                                                ETA: {ambulance.eta} minutes
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.max(0, 100 - (ambulance.eta / 30) * 100)}
                                                            sx={{ height: 6, borderRadius: 3 }}
                                                        />
                                                    </Box>

                                                    <Stack direction="row" spacing={2}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                                <Navigation fontSize="small" color="action" />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Distance
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {ambulance.distanceRemaining} km
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                                <Speed fontSize="small" color="action" />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Speed
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {ambulance.speed || 45} km/h
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </>
                                            )}

                                            <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Driver: {ambulance.driver_name}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Phone: {ambulance.driver_phone}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    District: {ambulance.district}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Live indicator overlay */}
            <Paper
                elevation={3}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                }}
            >
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#4CAF50',
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }}
                />
                <Typography variant="caption" fontWeight={700} color="text.primary">
                    LIVE TRACKING
                </Typography>
            </Paper>
        </Box>
    );
};

export default LiveAmbulanceMap;
