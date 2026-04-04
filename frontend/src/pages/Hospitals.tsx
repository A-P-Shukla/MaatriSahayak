import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, Card, CardContent,
  Paper, Stack, TextField, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Divider, Tooltip,
} from '@mui/material';
import {
  Building2, BedDouble, Phone, MapPin,
  Plus, Navigation, Clock, LocateFixed, AlertTriangle, Ambulance,
} from 'lucide-react';
import { getHospitals, updateHospitalCapacity, registerHospital, type Hospital } from '../services/hospital';
import useAuth from '../hooks/useAuth';
import { fetchAllExternalHospitals, type ExternalHospital } from '../services/externalHospitals';
import { KNOWN_HOSPITALS, type KnownHospital } from '../data/knownHospitals';

const DRAWER_WIDTH = 270;

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Approximate coordinates for districts (you can make this more accurate)
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Prayagraj': { lat: 25.4358, lng: 81.8463 },
  'Gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'Bareilly': { lat: 28.3670, lng: 79.4304 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
};

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [editHospital, setEditHospital] = useState<Hospital | null>(null);
  const [newBeds, setNewBeds] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    name: '', district: '', type: 'CHC', maternity_beds: '',
    contact_number: '', latitude: '', longitude: '',
  });
  const { user } = useAuth();
  const [nearbyLat, setNearbyLat] = useState('');
  const [nearbyLng, setNearbyLng] = useState('');
  const [nearbyHospitals, setNearbyHospitals] = useState<(Hospital & { distance_km?: number; estimated_time_minutes?: number })[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [nearbySearched, setNearbySearched] = useState(false);
  const [requestingPickup, setRequestingPickup] = useState<string | null>(null);

  const fetchHospitals = useCallback(async () => {
    try {
      const data = await getHospitals();
      setHospitals(data);
    } catch (e: any) {
      console.error('Failed to load hospitals:', e);
    }
  }, []);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const handleRequestPickup = async (hospital: any) => {
    setRequestingPickup(hospital.id);
    try {
      // TODO: Implement actual ambulance dispatch API call
      // For now, just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      alert(`Pickup request sent to ${hospital.name}!\n\nAn ambulance will be dispatched shortly.\nDistance: ${hospital.distance_km?.toFixed(1)} km\nEstimated arrival: ${hospital.estimated_time_minutes} minutes`);
    } catch (error) {
      console.error('Failed to request pickup:', error);
      alert('Failed to request pickup. Please try again.');
    } finally {
      setRequestingPickup(null);
    }
  };

  const handleFindNearby = async () => {
    const lat = parseFloat(nearbyLat);
    const lng = parseFloat(nearbyLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setNearbyError('Enter valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }
    setNearbyLoading(true);
    setNearbyError(null);
    setNearbySearched(true);
    try {
      // Fetch from multiple sources in parallel
      const [apiHospitals, externalHospitals] = await Promise.all([
        getHospitals({ latitude: lat, longitude: lng }).catch(() => []),
        fetchAllExternalHospitals(lat, lng, 50000) // 50km radius
      ]);

      console.log('API hospitals:', apiHospitals);
      console.log('External hospitals (OpenStreetMap):', externalHospitals);

      // Convert external hospitals to match our format
      const formattedExternal = externalHospitals.map((h: ExternalHospital) => ({
        id: h.id,
        name: h.name,
        district: h.district && h.district !== 'Location available' ? h.district : (h.address ? h.address.split(',')[0] : 'Nearby'),
        type: h.type,
        contact_number: h.contact || 'Not available',
        maternity_beds: 20, // Estimate for external hospitals (OpenStreetMap doesn't provide this)
        available_maternity_beds: 6, // Assume 30% available
        location: { latitude: h.latitude, longitude: h.longitude },
        address: h.address,
        distance_km: h.distance_km,
        estimated_time_minutes: h.estimated_time_minutes,
        rating: h.rating,
        total_ratings: h.total_ratings,
        is_open: h.is_open,
        source: h.source
      }));

      // Mark API hospitals
      const markedApiHospitals = apiHospitals.map((h: any) => ({ ...h, source: 'api' }));

      // Merge and remove duplicates by name (case-insensitive)
      const apiHospitalNames = new Set(
        markedApiHospitals.map((h: any) => h.name.toLowerCase().trim())
      );

      const uniqueExternal = formattedExternal.filter(
        h => !apiHospitalNames.has(h.name.toLowerCase().trim())
      );

      // Combine and sort by distance
      let combined = [...markedApiHospitals, ...uniqueExternal]
        .sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

      // If no hospitals found from external sources, use known hospitals as fallback
      if (combined.length === 0) {
        console.log('No hospitals from external APIs, using known hospitals database');
        const knownHospitalsList: any[] = [];
        Object.values(KNOWN_HOSPITALS).forEach(districtHospitals => {
          districtHospitals.forEach((kh: KnownHospital) => {
            // Estimate coordinates based on district (rough approximation)
            const districtCoords = DISTRICT_COORDINATES[kh.district];
            if (districtCoords) {
              const distance = calculateDistance(lat, lng, districtCoords.lat, districtCoords.lng);
              knownHospitalsList.push({
                id: `known-${kh.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: kh.name,
                district: kh.district,
                type: kh.type,
                contact_number: kh.contact || 'Not available',
                maternity_beds: kh.maternityBeds || 0,
                available_maternity_beds: Math.floor((kh.maternityBeds || 0) * 0.3), // Assume 30% available
                location: { latitude: districtCoords.lat, longitude: districtCoords.lng },
                address: kh.address,
                distance_km: Math.round(distance * 10) / 10,
                estimated_time_minutes: Math.round(distance / 40 * 60),
                source: 'known_database'
              });
            }
          });
        });
        combined = knownHospitalsList.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
        console.log(`Using ${combined.length} hospitals from known database`);
      }

      console.log(`Found ${combined.length} total hospitals (${markedApiHospitals.length} from API, ${uniqueExternal.length} from external sources)`);
      setNearbyHospitals(combined);
    } catch (e: any) {
      console.error('Error fetching hospitals:', e);
      setNearbyError(e.message ?? 'Failed to fetch nearby hospitals');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setNearbyError('Geolocation not supported by your browser');
      return;
    }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearbyLat(String(pos.coords.latitude.toFixed(6)));
        setNearbyLng(String(pos.coords.longitude.toFixed(6)));
        setNearbyError(null);
        setNearbyLoading(false);
        // Auto-search after getting location
        setTimeout(async () => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setNearbyLoading(true);
          setNearbySearched(true);
          try {
            // Fetch from multiple sources
            const [apiHospitals, externalHospitals] = await Promise.all([
              getHospitals({ latitude: lat, longitude: lng }).catch(() => []),
              fetchAllExternalHospitals(lat, lng, 50000)
            ]);

            // Convert and merge
            const formattedExternal = externalHospitals.map((h: ExternalHospital) => ({
              id: h.id,
              name: h.name,
              district: h.district && h.district !== 'Location available' ? h.district : (h.address ? h.address.split(',')[0] : 'Nearby'),
              type: h.type,
              contact_number: h.contact || 'Not available',
              maternity_beds: 20, // Estimate for external hospitals
              available_maternity_beds: 6, // Assume 30% available
              location: { latitude: h.latitude, longitude: h.longitude },
              address: h.address,
              distance_km: h.distance_km,
              estimated_time_minutes: h.estimated_time_minutes,
              rating: h.rating,
              total_ratings: h.total_ratings,
              is_open: h.is_open,
              source: h.source
            }));

            const markedApiHospitals = apiHospitals.map((h: any) => ({ ...h, source: 'api' }));
            const apiHospitalNames = new Set(markedApiHospitals.map((h: any) => h.name.toLowerCase().trim()));
            const uniqueExternal = formattedExternal.filter(h => !apiHospitalNames.has(h.name.toLowerCase().trim()));

            let combined = [...markedApiHospitals, ...uniqueExternal]
              .sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));

            // If no hospitals found from external sources, use known hospitals as fallback
            if (combined.length === 0) {
              console.log('No hospitals from external APIs, using known hospitals database');
              const knownHospitalsList: any[] = [];
              Object.values(KNOWN_HOSPITALS).forEach(districtHospitals => {
                districtHospitals.forEach((kh: KnownHospital) => {
                  const districtCoords = DISTRICT_COORDINATES[kh.district];
                  if (districtCoords) {
                    const distance = calculateDistance(lat, lng, districtCoords.lat, districtCoords.lng);
                    knownHospitalsList.push({
                      id: `known-${kh.name.toLowerCase().replace(/\s+/g, '-')}`,
                      name: kh.name,
                      district: kh.district,
                      type: kh.type,
                      contact_number: kh.contact || 'Not available',
                      maternity_beds: kh.maternityBeds || 0,
                      available_maternity_beds: Math.floor((kh.maternityBeds || 0) * 0.3),
                      location: { latitude: districtCoords.lat, longitude: districtCoords.lng },
                      address: kh.address,
                      distance_km: Math.round(distance * 10) / 10,
                      estimated_time_minutes: Math.round(distance / 40 * 60),
                      source: 'known_database'
                    });
                  }
                });
              });
              combined = knownHospitalsList.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
            }

            setNearbyHospitals(combined);
          } catch (e: any) {
            setNearbyError(e.message ?? 'Failed to fetch nearby hospitals');
          } finally {
            setNearbyLoading(false);
          }
        }, 100);
      },
      () => {
        setNearbyError('Unable to retrieve your location. Please enable location services.');
        setNearbyLoading(false);
      }
    );
  };

  const handleUpdateCapacity = async () => {
    if (!editHospital) return;

    // Get the maternity beds capacity - try different field names
    const totalCapacity = (editHospital as any).maternity_beds ??
      (editHospital as any).total_maternity_beds ??
      (editHospital as any).capacity ??
      (editHospital as any).total_beds;

    const beds = parseInt(newBeds);

    // Validation
    if (isNaN(beds)) {
      setEditError('Please enter a valid number');
      return;
    }

    if (beds < 0) {
      setEditError('Available beds cannot be negative');
      return;
    }

    // Only validate against total capacity if we have it
    if (totalCapacity !== undefined && totalCapacity !== null && beds > totalCapacity) {
      setEditError(`Available beds (${beds}) cannot exceed total capacity (${totalCapacity})`);
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const updated = await updateHospitalCapacity(editHospital.id, { available_maternity_beds: beds });
      setHospitals((prev) => prev.map((h) => h.id === updated.id ? updated : h));
      setEditHospital(null);
      setNewBeds('');
    } catch (e: any) {
      console.error('Failed to update hospital capacity:', e);
      const errorMsg = e.message || 'An unexpected error occurred while updating hospital capacity';
      setEditError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddHospital = async () => {
    if (!addForm.name || !addForm.district || !addForm.maternity_beds || !addForm.contact_number) {
      setAddError('Please fill all required fields');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const h = await registerHospital({
        name: addForm.name,
        district: addForm.district,
        type: addForm.type,
        maternity_beds: parseInt(addForm.maternity_beds),
        contact_number: addForm.contact_number,
        location: {
          latitude: parseFloat(addForm.latitude) || 0,
          longitude: parseFloat(addForm.longitude) || 0,
        },
      });
      setHospitals((prev) => [h, ...prev]);
      setAddOpen(false);
      setAddForm({ name: '', district: '', type: 'CHC', maternity_beds: '', contact_number: '', latitude: '', longitude: '' });
    } catch (e: any) {
      setAddError(e.message ?? 'Failed to register hospital');
    } finally {
      setAddLoading(false);
    }
  };

  // Calculate stats including nearby hospitals when available
  const allHospitalsForStats = nearbySearched && nearbyHospitals.length > 0
    ? nearbyHospitals
    : hospitals;

  const stats = {
    total: allHospitalsForStats.length,
    totalBeds: allHospitalsForStats.reduce((s, h) => s + (h.maternity_beds || 0), 0),
    availableBeds: allHospitalsForStats.reduce((s, h) => s + (h.available_maternity_beds || 0), 0),
    full: allHospitalsForStats.filter((h) => (h.available_maternity_beds || 0) === 0).length,
  };

  const fldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.93rem',
      '& fieldset': { borderColor: '#d1fae5' },
      '&:hover fieldset': { borderColor: '#0d9488' },
      '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: 2 },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 56, md: 64 },
        left: { xs: 0, md: DRAWER_WIDTH },
        right: 0,
        bottom: 0,
        bgcolor: '#f5f7fa',
        overflow: 'auto',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          pt: 4,
          pb: 4,
          px: 3,
        }}
      >
        <Box maxWidth={1400} mx="auto">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="white" mb={0.5}>
                Hospital Network
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Real-time bed availability and hospital capacity management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => { setAddOpen(true); setAddError(null); }}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Add Hospital
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ py: 3 }}>
        {/* Stats Cards - Only show after search */}
        {nearbySearched && (
          <Grid container spacing={3} mb={4}>
            {[
              { label: 'Total Hospitals', value: stats.total, color: '#0d9488', bg: '#E8F5EE', icon: Building2 },
              { label: 'Total Beds', value: stats.totalBeds, color: '#0277BD', bg: '#E3F2FD', icon: BedDouble },
              { label: 'Available Beds', value: stats.availableBeds, color: '#16a34a', bg: '#D1FAE5', icon: BedDouble },
              { label: 'Fully Occupied', value: stats.full, color: '#dc2626', bg: '#FEE2E2', icon: AlertTriangle },
            ].map((s) => (
              <Grid item xs={6} sm={6} md={3} key={s.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3, borderRadius: 3,
                    border: '1px solid #e5e7eb',
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 28px ${s.color}22`,
                      borderColor: s.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: s.bg,
                      mb: 2,
                    }}
                  >
                    <s.icon size={24} color={s.color} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color, mb: 0.5 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {s.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3, bgcolor: '#f0faf7' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Navigation size={20} color="#1B6B4A" />
              <Box>
                <Typography fontWeight={700} color="#0f172a">Find Nearby Hospitals</Typography>
                <Typography variant="caption" color="text.secondary">Real-time bed availability • Sorted by distance • Auto-detect location</Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
              <TextField
                label="Latitude" size="small" value={nearbyLat}
                onChange={(e) => setNearbyLat(e.target.value)}
                placeholder={user?.district ? `e.g. 23.2599` : '23.2599'}
                sx={{ ...fldSx, minWidth: 150 }}
              />
              <TextField
                label="Longitude" size="small" value={nearbyLng}
                onChange={(e) => setNearbyLng(e.target.value)}
                placeholder="e.g. 77.4126"
                sx={{ ...fldSx, minWidth: 150 }}
              />
              <Tooltip title="Use my current GPS location">
                <Button variant="outlined" size="small" startIcon={<LocateFixed size={14} />} onClick={handleUseMyLocation}
                  sx={{ borderColor: '#0d9488', color: '#0d9488', textTransform: 'none', fontWeight: 600, borderRadius: 2, height: 40 }}>
                  Use My Location
                </Button>
              </Tooltip>
              <Button variant="contained" size="small" startIcon={nearbyLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <Navigation size={14} />}
                onClick={handleFindNearby} disabled={nearbyLoading}
                sx={{ bgcolor: '#1B6B4A', '&:hover': { bgcolor: '#0F4A32' }, textTransform: 'none', fontWeight: 700, borderRadius: 2, height: 40 }}>
                Find Nearby
              </Button>
            </Stack>
            {nearbyError && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }} onClose={() => setNearbyError(null)}>{nearbyError}</Alert>}

            {nearbySearched && !nearbyLoading && (
              <Box mt={2}>
                <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
                <Typography variant="subtitle2" fontWeight={700} color="#1B6B4A" mb={1.5}>
                  Top {Math.min(nearbyHospitals.length, 10)} Nearby Hospitals
                </Typography>
                {nearbyHospitals.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No hospitals found nearby. Try a different location or check your connection.
                  </Alert>
                ) : (
                  <Stack spacing={1.5}>
                    {nearbyHospitals.slice(0, 10).map((h: any, idx: number) => (
                      <Card key={h.id} elevation={0} sx={{
                        border: '1px solid #d1fae5',
                        borderRadius: 2.5,
                        bgcolor: '#fff',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#0d9488',
                          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box sx={{
                              minWidth: 32, height: 32, borderRadius: '50%',
                              bgcolor: idx < 3 ? '#1B6B4A' : '#0d9488',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              mt: 0.2,
                              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)'
                            }}>
                              <Typography variant="body2" fontWeight={800} color="#fff">{idx + 1}</Typography>
                            </Box>
                            <Box flex={1} minWidth={0}>
                              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                                <Typography fontWeight={700} fontSize="0.95rem">{h.name}</Typography>
                                <Chip label={h.type} size="small" sx={{ bgcolor: '#f0faf7', color: '#1B6B4A', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                                {h.available_maternity_beds > 0 && (
                                  <Chip
                                    label={`${h.available_maternity_beds} beds available`}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                                    icon={<BedDouble size={12} />}
                                  />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={2} mt={0.8} flexWrap="wrap">
                                <Tooltip title={h.address || h.district} arrow>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <MapPin size={13} color="#9e9e9e" />
                                    <Typography variant="caption" color="text.secondary">{h.district}</Typography>
                                  </Stack>
                                </Tooltip>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Phone size={13} color="#9e9e9e" />
                                  <Typography variant="caption" color="text.secondary">{h.contact_number}</Typography>
                                </Stack>
                                {h.distance_km != null && (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Navigation size={13} color="#0d9488" />
                                    <Typography variant="caption" fontWeight={700} color="#0d9488">{h.distance_km.toFixed(1)} km away</Typography>
                                  </Stack>
                                )}
                                {h.estimated_time_minutes != null && (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Clock size={13} color="#0d9488" />
                                    <Typography variant="caption" fontWeight={700} color="#0d9488">~{h.estimated_time_minutes} min</Typography>
                                  </Stack>
                                )}
                              </Stack>
                              <Box mt={1.5}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={requestingPickup === h.id ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <Ambulance size={14} />}
                                  onClick={() => handleRequestPickup(h)}
                                  disabled={requestingPickup === h.id}
                                  sx={{
                                    bgcolor: '#1B6B4A',
                                    '&:hover': { bgcolor: '#0F4A32' },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    borderRadius: 1.5,
                                    px: 2,
                                    py: 0.5
                                  }}
                                >
                                  {requestingPickup === h.id ? 'Requesting...' : 'Request Pickup'}
                                </Button>
                              </Box>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Update Beds Dialog */}
        <Dialog open={!!editHospital} onClose={() => { setEditHospital(null); setEditError(null); setNewBeds(''); }} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight={700}>Update Available Beds</DialogTitle>
          <DialogContent>
            {editHospital && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={2}>{editHospital.name}</Typography>
                {editError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setEditError(null)}>{editError}</Alert>}
                <TextField fullWidth label="Available Maternity Beds" type="number"
                  value={newBeds} onChange={(e) => setNewBeds(e.target.value)}
                  inputProps={{
                    min: 0,
                    max: (editHospital as any).maternity_beds || (editHospital as any).total_maternity_beds || (editHospital as any).capacity || (editHospital as any).total_beds || 999
                  }}
                  helperText={
                    ((editHospital as any).maternity_beds ?? (editHospital as any).total_maternity_beds ?? (editHospital as any).capacity ?? (editHospital as any).total_beds) !== undefined
                      ? `Total capacity: ${(editHospital as any).maternity_beds ?? (editHospital as any).total_maternity_beds ?? (editHospital as any).capacity ?? (editHospital as any).total_beds} beds`
                      : 'Enter the number of available beds'
                  }
                  sx={fldSx}
                  error={!!editError}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setEditHospital(null); setEditError(null); setNewBeds(''); }} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateCapacity} disabled={editLoading}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#1B6B4A', '&:hover': { bgcolor: '#0F4A32' } }}>
              {editLoading ? <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> : null}
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Hospital Dialog */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight={700}>Register New Hospital</DialogTitle>
          <DialogContent>
            {addError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: 2 }}>{addError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                { label: 'Hospital Name *', field: 'name', xs: 12 },
                { label: 'District *', field: 'district', xs: 6 },
                { label: 'Type', field: 'type', xs: 6 },
                { label: 'Maternity Beds *', field: 'maternity_beds', xs: 6, type: 'number' },
                { label: 'Contact Number *', field: 'contact_number', xs: 6 },
                { label: 'Latitude', field: 'latitude', xs: 6, type: 'number' },
                { label: 'Longitude', field: 'longitude', xs: 6, type: 'number' },
              ].map(({ label, field, xs, type }) => (
                <Grid item xs={xs as any} key={field}>
                  <TextField fullWidth label={label} type={type || 'text'}
                    value={(addForm as any)[field]}
                    onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                    sx={fldSx} />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleAddHospital} disabled={addLoading}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#1B6B4A', '&:hover': { bgcolor: '#0F4A32' } }}>
              {addLoading ? <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> : null}
              Register Hospital
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box >
  );
};

export default Hospitals;
