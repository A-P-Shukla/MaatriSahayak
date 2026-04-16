import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, Grid, Chip, LinearProgress, CircularProgress, Stack,
  Avatar, IconButton, Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Download, TrendingUp, Clock, CheckCircle, AlertTriangle, MapPin, Activity,
  Building2, RefreshCw, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCloudAnalytics, useComputedAnalytics } from '../hooks/useAnalytics';
import type { DateRangePreset } from '../types/analytics';

const DRAWER_WIDTH = 270;

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  primary: '#0d9488',
  blue: '#0277BD',
  purple: '#6A1B9A',
  orange: '#E65100',
};

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangePreset>('last_30_days');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filters = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = dateRange === 'last_7_days' ? 7 : dateRange === 'last_90_days' ? 90 : 30;
    start.setDate(end.getDate() - days);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  }, [dateRange]);

  const { data: cloudData, isLoading: cloudLoading, isError: cloudError, refetch: refetchCloud } = useCloudAnalytics();
  const { data: computed, isLoading: computedLoading, isError: computedError, refetch: refetchComputed } = useComputedAnalytics(filters);

  const isLoading = cloudLoading || computedLoading;
  const isError = cloudError || computedError;

  // Auto-refresh every 1 second for real-time data
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetchCloud();
      refetchComputed();
      setLastRefresh(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetchCloud, refetchComputed]);

  const handleManualRefresh = () => {
    refetchCloud();
    refetchComputed();
    setLastRefresh(new Date());
  };

  const fmtSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const handleExport = async () => {
    const csv = [
      'MaatriSahayak Analytics Report',
      `Period: ${filters.start_date} to ${filters.end_date}`,
      '',
      'Key Metrics',
      `Total Pregnancies,${cloudData?.total_pregnancies || 0}`,
      `High Risk Count,${cloudData?.high_risk_count || 0}`,
      `Active Emergencies,${cloudData?.active_emergencies || 0}`,
      `Ambulance Utilization,${cloudData?.ambulance_stats?.utilization_percentage || 0}%`,
      `Hospital Occupancy,${cloudData?.hospital_capacity?.occupancy_percentage || 0}%`,
      '',
      `Avg Response Time,${computed ? fmtSec(computed.avg_response_time_seconds) : 'N/A'}`,
      `Total Emergencies,${computed?.outcomes.total || 0}`,
      `Completion Rate,${computed?.outcomes.completion_rate || 0}%`,
      '',
      'District,Count,Completed,Completion Rate',
      ...(computed?.by_district || []).map((d) => `${d.district},${d.count},${d.completed},${d.completion_rate}%`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `analytics-${filters.start_date}.csv` });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: COLORS.primary }} />
        <Typography variant="body2" color="text.secondary">Loading analytics data…</Typography>
      </Box>
    );
  }

  const kpis = [
    {
      label: 'Total Pregnancies',
      value: cloudData?.total_pregnancies || 0,
      sub: `${cloudData?.high_risk_count || 0} high-risk`,
      icon: <Activity size={20} />,
      color: COLORS.primary,
      lightBg: '#E8F5EE',
    },
    {
      label: 'Avg Response Time',
      value: computed ? fmtSec(computed.avg_response_time_seconds) : 'N/A',
      sub: `${computed?.outcomes.total || 0} emergencies`,
      icon: <Clock size={20} />,
      color: COLORS.blue,
      lightBg: '#E3F2FD',
    },
    {
      label: 'Completion Rate',
      value: computed ? `${computed.outcomes.completion_rate}%` : 'N/A',
      sub: `${computed?.outcomes.completed || 0} completed`,
      icon: <CheckCircle size={20} />,
      color: COLORS.success,
      lightBg: '#D1FAE5',
    },
    {
      label: 'Ambulance Utilization',
      value: `${cloudData?.ambulance_stats?.utilization_percentage || 0}%`,
      sub: `${cloudData?.ambulance_stats?.available || 0} available`,
      icon: <AlertTriangle size={20} />,
      color: COLORS.orange,
      lightBg: '#FFF3E0',
    },
  ];

  const insights = [
    `${cloudData?.total_pregnancies || 0} pregnancies registered, ${cloudData?.high_risk_percentage || 0}% classified as high-risk`,
    `${cloudData?.ambulance_stats?.total || 0} ambulances in fleet with ${cloudData?.ambulance_stats?.utilization_percentage || 0}% utilization`,
    `${cloudData?.hospital_capacity?.total_hospitals || 0} hospitals with ${cloudData?.hospital_capacity?.occupancy_percentage || 0}% bed occupancy`,
    computed ? `${computed.outcomes.completion_rate}% emergency completion rate over selected period` : '',
    computed && computed.by_district.length > 0
      ? `${computed.by_district[0].district} leads with ${computed.by_district[0].count} emergencies`
      : '',
  ].filter(Boolean);

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={700} color="white">
                  Analytics & Reports
                </Typography>
                <Chip
                  label="Live"
                  size="small"
                  sx={{
                    bgcolor: '#4CAF50',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 24,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Real-time performance metrics and insights • Last updated: {lastRefresh.toLocaleTimeString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <MuiTooltip title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}>
                <IconButton
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
                </IconButton>
              </MuiTooltip>
              <Button
                variant="contained"
                startIcon={<Download size={18} />}
                onClick={handleExport}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ py: 4 }}>
        {isError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Unable to load analytics data. Please check your connection and try again.
          </Alert>
        )}

        {/* Period selector */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#E8F5EE', width: 40, height: 40 }}>
                    <Calendar size={20} color={COLORS.primary} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Report Period
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select date range for analysis
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap">
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    label="Date Range"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRangePreset)}
                  >
                    <MenuItem value="last_7_days">Last 7 days</MenuItem>
                    <MenuItem value="last_30_days">Last 30 days</MenuItem>
                    <MenuItem value="last_90_days">Last 90 days</MenuItem>
                  </Select>
                </FormControl>
                <Chip
                  icon={<Calendar size={14} />}
                  label={`${filters.start_date} → ${filters.end_date}`}
                  sx={{
                    bgcolor: '#E8F5EE',
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 40,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  sx={{
                    borderColor: '#e5e7eb',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: COLORS.primary, color: COLORS.primary },
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpis.map((k, i) => (
            <Grid item xs={6} sm={6} md={3} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 28px ${k.color}22`, borderColor: k.color },
                }}
              >
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: k.lightBg, color: k.color, mb: 2,
                }}>
                  {k.icon}
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: k.color, mb: 0.5 }}>
                  {k.value}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{k.label}</Typography>
                <Typography variant="caption" color="text.secondary">{k.sub}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts row 1 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Response Time Trend */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%', bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color={COLORS.blue} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Response Time Trend</Typography>
                  <Typography variant="caption" color="text.secondary">Average emergency response time</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3 }}>
                {computed && computed.response_time_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={computed.response_time_trend}>
                      <defs>
                        <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                      <Tooltip
                        formatter={(v: number) => [`${v} min`, 'Avg Response']}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="avg_response_min"
                        stroke={COLORS.blue}
                        strokeWidth={2.5}
                        fill="url(#colorResponse)"
                        name="Avg Response (min)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Clock size={48} color="#e5e7eb" />
                    <Typography variant="body2" color="text.secondary" mt={2}>No data available for selected period</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Severity Breakdown Pie */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%', bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color={COLORS.orange} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Severity Breakdown</Typography>
                  <Typography variant="caption" color="text.secondary">Emergency severity levels</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3 }}>
                {computed ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: computed.by_severity.critical },
                          { name: 'High', value: computed.by_severity.high },
                          { name: 'Medium', value: computed.by_severity.medium },
                          { name: 'Low', value: computed.by_severity.low },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[COLORS.error, COLORS.orange, COLORS.warning, COLORS.success].map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AlertTriangle size={48} color="#e5e7eb" />
                    <Typography variant="body2" color="text.secondary" mt={2}>No data available</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts row 2 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Volume Trend */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color={COLORS.primary} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Emergency Volume</Typography>
                  <Typography variant="caption" color="text.secondary">Daily events by status</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3 }}>
                {computed && computed.volume_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={computed.volume_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill={COLORS.success} name="Completed" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="active" stackId="a" fill={COLORS.warning} name="Active" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <TrendingUp size={48} color="#e5e7eb" />
                    <Typography variant="body2" color="text.secondary" mt={2}>No data available for selected period</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* District Performance */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color={COLORS.purple} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>District Performance</Typography>
                  <Typography variant="caption" color="text.secondary">Completion rate by district</Typography>
                </Box>
              </Box>
              <Box sx={{ p: 3, flex: 1, overflowY: 'auto', maxHeight: 300 }}>
                {computed && computed.by_district.length > 0 ? (
                  computed.by_district.map((d) => {
                    const rateColor = d.completion_rate >= 90 ? COLORS.success : d.completion_rate >= 70 ? COLORS.warning : COLORS.error;
                    return (
                      <Box key={d.district} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={16} color={rateColor} />
                            <Typography variant="body2" fontWeight={600}>{d.district}</Typography>
                            <Chip label={`${d.count} cases`} size="small"
                              sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#F5F5F5', color: 'text.secondary', fontWeight: 600 }} />
                          </Box>
                          <Chip
                            label={`${d.completion_rate}%`}
                            size="small"
                            sx={{
                              height: 24,
                              bgcolor: rateColor + '20',
                              color: rateColor,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate" value={d.completion_rate}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: rateColor + '15',
                            '& .MuiLinearProgress-bar': { bgcolor: rateColor, borderRadius: 3 },
                          }}
                        />
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <MapPin size={48} color="#e5e7eb" />
                    <Typography variant="body2" color="text.secondary" mt={2}>No district data available</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* System Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: 'white' }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color={COLORS.blue} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Ambulance Fleet</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Fleet</Typography>
                  <Typography variant="h5" fontWeight={700}>{cloudData?.ambulance_stats?.total || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Available</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">{cloudData?.ambulance_stats?.available || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Busy</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">{cloudData?.ambulance_stats?.busy || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Utilization</Typography>
                  <Typography variant="h5" fontWeight={700}>{cloudData?.ambulance_stats?.utilization_percentage || 0}%</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: 'white' }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color={COLORS.purple} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Hospital Capacity</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Hospitals</Typography>
                  <Typography variant="h5" fontWeight={700}>{cloudData?.hospital_capacity?.total_hospitals || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Beds</Typography>
                  <Typography variant="h5" fontWeight={700}>{cloudData?.hospital_capacity?.total_maternity_beds || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Available Beds</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">{cloudData?.hospital_capacity?.available_maternity_beds || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Occupancy</Typography>
                  <Typography variant="h5" fontWeight={700}>{cloudData?.hospital_capacity?.occupancy_percentage || 0}%</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Key Insights */}
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: 'white' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color={COLORS.primary} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>Key Insights</Typography>
              <Typography variant="caption" color="text.secondary">Real-time observations from your system</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {insights.map((insight, i) => (
              <Box key={i} sx={{
                p: 2, borderRadius: 2, bgcolor: '#f9fafb',
                border: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', gap: 2,
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.primary, flexShrink: 0 }} />
                <Typography variant="body2">{insight}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Analytics;
