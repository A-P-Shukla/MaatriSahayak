import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, Grid, Chip, Divider, LinearProgress, CircularProgress, Stack,
} from '@mui/material';
import { Download, TrendingUp, Clock, CheckCircle, AlertTriangle, MapPin, Activity, Building2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCloudAnalytics, useComputedAnalytics } from '../hooks/useAnalytics';
import type { DateRangePreset } from '../types/analytics';

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  primary: '#1B6B4A',
  blue: '#0277BD',
  purple: '#6A1B9A',
  orange: '#E65100',
};

const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.error];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangePreset>('last_30_days');

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

  const { data: cloudData, isLoading: cloudLoading, isError: cloudError } = useCloudAnalytics();
  const { data: computed, isLoading: computedLoading, isError: computedError } = useComputedAnalytics(filters);

  const isLoading = cloudLoading || computedLoading;
  const isError = cloudError || computedError;

  const fmt = (s: number) => `${Math.round(s / 60)}m`;
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
      bg: 'linear-gradient(135deg, #1B6B4A 0%, #2E9E6E 100%)',
      lightBg: '#E8F5EE',
    },
    {
      label: 'Avg Response Time',
      value: computed ? fmtSec(computed.avg_response_time_seconds) : 'N/A',
      sub: `${computed?.outcomes.total || 0} emergencies`,
      icon: <Clock size={20} />,
      color: COLORS.blue,
      bg: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
      lightBg: '#E3F2FD',
    },
    {
      label: 'Completion Rate',
      value: computed ? `${computed.outcomes.completion_rate}%` : 'N/A',
      sub: `${computed?.outcomes.completed || 0} completed`,
      icon: <CheckCircle size={20} />,
      color: COLORS.success,
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      lightBg: '#D1FAE5',
    },
    {
      label: 'Ambulance Utilization',
      value: `${cloudData?.ambulance_stats?.utilization_percentage || 0}%`,
      sub: `${cloudData?.ambulance_stats?.available || 0} available`,
      icon: <AlertTriangle size={20} />,
      color: COLORS.orange,
      bg: 'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
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
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', pb: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4,
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px', mb: 0.5 }}>
            Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time performance metrics and insights 
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={handleExport}
          sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 2, flexShrink: 0 }}
        >
          Export CSV
        </Button>
      </Box>

      {isError && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Unable to load analytics data. Please check your connection and try again.
        </Alert>
      )}

      {/* Period selector */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ minWidth: 90 }}>
            Report Period
          </Typography>
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
            label={`${filters.start_date} → ${filters.end_date}`}
            size="small"
            sx={{ bgcolor: '#F5F5F5', color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} sm={6} md={3} key={i}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 }, borderRadius: 3,
                border: '1px solid', borderColor: 'divider',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${k.color}22`, borderColor: k.color },
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, background: k.bg, borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 }, borderRadius: 2.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: k.lightBg, color: k.color,
                }}>
                  {k.icon}
                </Box>
              </Box>
              <Typography fontWeight={800} sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, lineHeight: 1, mb: 0.4, letterSpacing: '-1px' }}>
                {k.value}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.3 }}>{k.label}</Typography>
              <Typography variant="caption" color="text.secondary">{k.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Response Time Trend */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color={COLORS.blue} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>Response Time Trend</Typography>
                <Typography variant="caption" color="text.secondary">Average emergency response time</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 2.5 }}>
              {computed && computed.response_time_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={computed.response_time_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip formatter={(v: number) => [`${v} min`, 'Avg Response']} />
                    <Legend />
                    <Line type="monotone" dataKey="avg_response_min" stroke={COLORS.blue} strokeWidth={2.5} name="Avg Response (min)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">No data available for selected period</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Severity Breakdown Pie */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color={COLORS.orange} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>Severity Breakdown</Typography>
                <Typography variant="caption" color="text.secondary">Emergency severity levels</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 2.5 }}>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Volume Trend */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color={COLORS.primary} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>Emergency Volume</Typography>
                <Typography variant="caption" color="text.secondary">Daily events by status</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 2.5 }}>
              {computed && computed.volume_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={computed.volume_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill={COLORS.success} name="Completed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="active" stackId="a" fill={COLORS.warning} name="Active" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">No data available for selected period</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* District Performance */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color={COLORS.purple} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>District Performance</Typography>
                <Typography variant="caption" color="text.secondary">Completion rate by district</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ p: 2, flex: 1, overflowY: 'auto', maxHeight: 300 }}>
              {computed && computed.by_district.length > 0 ? (
                computed.by_district.map((d) => {
                  const rateColor = d.completion_rate >= 90 ? COLORS.success : d.completion_rate >= 70 ? COLORS.warning : COLORS.error;
                  return (
                    <Box key={d.district} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{d.district}</Typography>
                          <Chip label={`${d.count} cases`} size="small"
                            sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F5F5F5', color: 'text.secondary' }} />
                        </Box>
                        <Typography variant="caption" fontWeight={800} sx={{ color: rateColor }}>
                          {d.completion_rate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={d.completion_rate}
                        sx={{
                          height: 5, borderRadius: 3, bgcolor: rateColor + '20',
                          '& .MuiLinearProgress-bar': { bgcolor: rateColor, borderRadius: 3 },
                        }}
                      />
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">No district data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* System Stats */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color={COLORS.blue} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>Ambulance Fleet</Typography>
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
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color={COLORS.purple} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>Hospital Capacity</Typography>
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
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color={COLORS.primary} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>Key Insights</Typography>
            <Typography variant="caption" color="text.secondary">Real-time observations from AWS cloud</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {insights.map((insight, i) => (
            <Box key={i} sx={{
              p: 1.5, borderRadius: 2, bgcolor: '#FAFAFA',
              border: '1px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.primary, flexShrink: 0 }} />
              <Typography variant="body2">{insight}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;
