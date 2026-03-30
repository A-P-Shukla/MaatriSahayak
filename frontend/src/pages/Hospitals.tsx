import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Divider, Tooltip, MenuItem,
} from '@mui/material';
import {
  Search, Building2, BedDouble, Phone, MapPin,
  Pencil, Plus, Navigation, Clock, LocateFixed, Star,
} from 'lucide-react';
import { getHospitals, updateHospitalCapacity, registerHospital, type Hospital } from '../services/hospital';
import useAuth from '../hooks/useAuth';

const Hospitals: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHospitals();
      setHospitals(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

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
      const data = await getHospitals({ latitude: lat, longitude: lng });
      setNearbyHospitals(data as any);
    } catch (e: any) {
      setNearbyError(e.message ?? 'Failed to fetch nearby hospitals');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setNearbyError('Geolocation not supported by your browser'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setNearbyLat(String(pos.coords.latitude)); setNearbyLng(String(pos.coords.longitude)); setNearbyError(null); },
      () => setNearbyError('Unable to retrieve your location')
    );
  };

  const handleUpdateCapacity = async () => {
    if (!editHospital) return;
    const beds = parseInt(newBeds);
    if (isNaN(beds) || beds < 0) { setEditError('Enter a valid number'); return; }
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await updateHospitalCapacity(editHospital.id, { available_maternity_beds: beds });
      setHospitals((prev) => prev.map((h) => h.id === updated.id ? updated : h));
      setEditHospital(null);
    } catch (e: any) {
      setEditError(e.message ?? 'Update failed');
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

  const isGovtHospital = (h: Hospital) => ['District', 'Medical_College', 'CHC', 'PHC'].includes(h.type);

  const districts = useMemo(() => {
    const unique = Array.from(new Set(hospitals.map(h => h.district))).sort();
    return unique;
  }, [hospitals]);

  const sortedHospitals = useMemo(() => {
    const userDistrict = user?.district;
    if (!userDistrict) return hospitals;

    const govtInDistrict = hospitals.filter(h => isGovtHospital(h) && h.district === userDistrict);
    const others = hospitals.filter(h => !(isGovtHospital(h) && h.district === userDistrict));
    
    return [...govtInDistrict, ...others];
  }, [hospitals, user?.district]);

  const filtered = sortedHospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.district.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = districtFilter === 'all' || h.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const stats = {
    total: hospitals.length,
    totalBeds: hospitals.reduce((s, h) => s + h.maternity_beds, 0),
    availableBeds: hospitals.reduce((s, h) => s + h.available_maternity_beds, 0),
    full: hospitals.filter((h) => h.available_maternity_beds === 0).length,
  };

  const getBedColor = (h: Hospital): 'success' | 'warning' | 'error' => {
    const pct = h.maternity_beds > 0 ? h.available_maternity_beds / h.maternity_beds : 0;
    if (pct > 0.4) return 'success';
    if (pct > 0) return 'warning';
    return 'error';
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

  const HospitalCard = ({ h }: { h: Hospital }) => {
    const isGovt = isGovtHospital(h);
    const isOfficerDistrict = user?.district === h.district;
    const isPriority = isGovt && isOfficerDistrict;
    
    return (
      <Card elevation={0} sx={{ 
        border: isPriority ? '2px solid #1B6B4A' : '1px solid #d1fae5', 
        borderRadius: 3, 
        mb: 2,
        bgcolor: isPriority ? '#f0faf7' : '#fff'
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={1.5}>
            <Building2 size={20} color="#1B6B4A" />
            <Box flex={1} minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography fontWeight={700} noWrap>{h.name}</Typography>
                {isPriority && <Star size={14} color="#1B6B4A" fill="#1B6B4A" />}
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption" color="text.secondary">{h.type}</Typography>
                {isGovt && <Chip label="Govt" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.6rem', height: 16 }} />}
              </Stack>
            </Box>
            <Chip
              label={`${h.available_maternity_beds}/${h.maternity_beds} beds`}
              color={getBedColor(h)} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }}
            />
          </Stack>
        <Stack direction="row" spacing={2} flexWrap="wrap" mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <MapPin size={14} color="#9e9e9e" />
            <Typography variant="caption" color="text.secondary">{h.district}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Phone size={14} color="#9e9e9e" />
            <Typography variant="caption" color="text.secondary">{h.contact_number}</Typography>
          </Stack>
        </Stack>
        <Button size="small" variant="outlined" startIcon={<Pencil size={14} />}
          onClick={() => { setEditHospital(h); setNewBeds(String(h.available_maternity_beds)); setEditError(null); }}
          sx={{ borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Update Beds
        </Button>
      </CardContent>
    </Card>
    );
  };

  return (
    <Box>
      {/* Nearby Hospitals Section */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3, bgcolor: '#f0faf7' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Navigation size={20} color="#1B6B4A" />
            <Box>
              <Typography fontWeight={700} color="#0f172a">Find Nearby Hospitals</Typography>
              <Typography variant="caption" color="text.secondary">Enter your location to see hospitals sorted by distance</Typography>
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
              {nearbyHospitals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>No hospitals found</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {nearbyHospitals.map((h: any, idx: number) => (
                    <Card key={h.id} elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 2.5, bgcolor: '#fff' }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                          <Box sx={{ minWidth: 28, height: 28, borderRadius: '50%', bgcolor: '#1B6B4A', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2 }}>
                            <Typography variant="caption" fontWeight={800} color="#fff">{idx + 1}</Typography>
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                              <Typography fontWeight={700} fontSize="0.9rem">{h.name}</Typography>
                              <Chip label={h.type} size="small" sx={{ bgcolor: '#f0faf7', color: '#1B6B4A', fontWeight: 600, fontSize: '0.65rem' }} />
                              <Chip label={`${h.available_maternity_beds}/${h.maternity_beds} beds`} color={getBedColor(h)} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                            </Stack>
                            <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <MapPin size={13} color="#9e9e9e" />
                                <Typography variant="caption" color="text.secondary">{h.district}</Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Phone size={13} color="#9e9e9e" />
                                <Typography variant="caption" color="text.secondary">{h.contact_number}</Typography>
                              </Stack>
                              {h.distance_km != null && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Navigation size={13} color="#0d9488" />
                                  <Typography variant="caption" fontWeight={700} color="#0d9488">{h.distance_km} km away</Typography>
                                </Stack>
                              )}
                              {h.estimated_time_minutes != null && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Clock size={13} color="#0d9488" />
                                  <Typography variant="caption" fontWeight={700} color="#0d9488">~{h.estimated_time_minutes} min</Typography>
                                </Stack>
                              )}
                            </Stack>
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

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">Hospitals</Typography>
          <Typography variant="body2" color="text.secondary">Manage hospital capacity and registrations</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { setAddOpen(true); setAddError(null); }}
          sx={{ bgcolor: '#1B6B4A', '&:hover': { bgcolor: '#0F4A32' }, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
          Add Hospital
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total Hospitals', value: stats.total, color: '#1B6B4A', bg: '#f0faf7' },
          { label: 'Total Beds', value: stats.totalBeds, color: '#0d9488', bg: '#f0fdf4' },
          { label: 'Available Beds', value: stats.availableBeds, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Fully Occupied', value: stats.full, color: '#dc2626', bg: '#fef2f2' },
        ].map((s) => (
          <Card key={s.label} elevation={0} sx={{ border: `1px solid ${s.bg}`, bgcolor: s.bg, borderRadius: 2.5, flex: '1 1 120px', minWidth: 100 }}>
            <CardContent sx={{ p: '12px 16px !important', textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField fullWidth placeholder="Search by name or district..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#0d9488" /></InputAdornment> }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#d1fae5' }, '&:hover fieldset': { borderColor: '#0d9488' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } } }}
        />
        <TextField
          select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#d1fae5' }, '&:hover fieldset': { borderColor: '#0d9488' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } } }}
        >
          <MenuItem value="all">All Districts</MenuItem>
          {user?.district && <MenuItem value={user.district}>{user.district} (My District)</MenuItem>}
          {districts.filter(d => d !== user?.district).map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: '#0d9488' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Building2 size={56} color="#d1fae5" />
          <Typography color="text.secondary">No hospitals found</Typography>
        </Box>
      ) : isMobile ? (
        <Box>{filtered.map((h) => <HospitalCard key={h.id} h={h} />)}</Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0faf7' }}>
                {['Hospital', 'District', 'Type', 'Contact', 'Maternity Beds', 'Available', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#1B6B4A', fontSize: '0.8rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((h) => {
                const isGovt = isGovtHospital(h);
                const isOfficerDistrict = user?.district === h.district;
                const isPriority = isGovt && isOfficerDistrict;
                
                return (
                  <TableRow key={h.id} hover sx={{ '&:hover': { bgcolor: '#f0faf7' }, bgcolor: isPriority ? '#f0faf7' : 'transparent' }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Building2 size={18} color="#1B6B4A" />
                        <Typography fontWeight={600} fontSize="0.9rem">{h.name}</Typography>
                        {isPriority && <Star size={14} color="#1B6B4A" fill="#1B6B4A" />}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{h.district}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip label={h.type} size="small" sx={{ bgcolor: '#f0faf7', color: '#1B6B4A', fontWeight: 600, fontSize: '0.7rem' }} />
                        {isGovt && <Chip label="Govt" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.65rem' }} />}
                      </Stack>
                    </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{h.contact_number}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.maternity_beds}</TableCell>
                  <TableCell>
                    <Chip label={h.available_maternity_beds} color={getBedColor(h)} size="small"
                      icon={<BedDouble size={12} />}
                      sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<Pencil size={13} />}
                      onClick={() => { setEditHospital(h); setNewBeds(String(h.available_maternity_beds)); setEditError(null); }}
                      sx={{ borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
                      Update Beds
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Update Beds Dialog */}
      <Dialog open={!!editHospital} onClose={() => setEditHospital(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Update Available Beds</DialogTitle>
        <DialogContent>
          {editHospital && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>{editHospital.name}</Typography>
              {editError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{editError}</Alert>}
              <TextField fullWidth label="Available Maternity Beds" type="number"
                value={newBeds} onChange={(e) => setNewBeds(e.target.value)}
                inputProps={{ min: 0, max: editHospital.maternity_beds }}
                helperText={`Total capacity: ${editHospital.maternity_beds}`}
                sx={fldSx} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditHospital(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
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
  );
};

export default Hospitals;
