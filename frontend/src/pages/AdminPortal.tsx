import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    TextField,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    CircularProgress,
} from '@mui/material';
import {
    Shield,
    Users,
    Truck,
    Clock,
    Search,
    Filter,
    Download,
    RefreshCw,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    district?: string;
    status: string;
    verificationStatus?: string;
    created_at: string;
    role?: string;
}

const AdminPortal: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'officers' | 'asha' | 'drivers'>('officers');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');

    // Check if user is admin only
    React.useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch ASHA Workers
    const { data: ashaWorkers, isLoading: loadingAsha, refetch: refetchAsha } = useQuery({
        queryKey: ['admin-asha'],
        queryFn: async () => {
            const response = await api.get('/asha/list');
            return response.data.data || [];
        },
    });

    // Fetch Drivers
    const { data: drivers, isLoading: loadingDrivers, refetch: refetchDrivers } = useQuery({
        queryKey: ['admin-drivers'],
        queryFn: async () => {
            const response = await api.get('/drivers/list');
            return response.data.data || [];
        },
    });

    // Mock Officers data (replace with actual API call)
    const officers = [
        {
            id: '1',
            name: 'Dr. Rajesh Kumar',
            email: 'rajesh.kumar@health.gov.in',
            phone: '+91-9876543210',
            district: 'Mumbai',
            status: 'ACTIVE',
            role: 'DISTRICT_OFFICER',
            created_at: '2024-01-15T10:30:00Z',
        },
    ];

    const handleRefresh = () => {
        refetchAsha();
        refetchDrivers();
    };

    const handleApprove = async (userId: string, userType: string) => {
        try {
            // API call to approve user
            console.log(`Approving ${userType} user:`, userId);
            handleRefresh();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const handleSuspend = async (userId: string, userType: string) => {
        try {
            // API call to suspend user
            console.log(`Suspending ${userType} user:`, userId);
            handleRefresh();
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };

    const handleDelete = async (userId: string, userType: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // API call to delete user
                console.log(`Deleting ${userType} user:`, userId);
                handleRefresh();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const filterUsers = (users: User[]) => {
        return users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.district && user.district.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus =
                filterStatus === 'ALL' ||
                user.status === filterStatus ||
                user.verificationStatus === filterStatus;
            return matchesSearch && matchesStatus;
        });
    };

    const getStatusChip = (status: string) => {
        const statusMap: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
            ACTIVE: { color: 'success', icon: <CheckCircle size={16} /> },
            APPROVED: { color: 'success', icon: <CheckCircle size={16} /> },
            PENDING: { color: 'warning', icon: <Clock size={16} /> },
            SUSPENDED: { color: 'error', icon: <XCircle size={16} /> },
        };

        const statusStyle = statusMap[status] || statusMap.PENDING;

        return (
            <Chip
                label={status}
                color={statusStyle.color}
                size="small"
                icon={statusStyle.icon as any}
                sx={{ fontWeight: 600 }}
            />
        );
    };

    const renderUserTable = (users: User[], userType: string) => {
        const filteredUsers = filterUsers(users);
        const isLoading = userType === 'asha' ? loadingAsha : loadingDrivers;

        if (isLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                    <CircularProgress />
                </Box>
            );
        }

        if (filteredUsers.length === 0) {
            return (
                <Box textAlign="center" py={6}>
                    <Users size={48} style={{ color: '#9e9e9e', margin: '0 auto 16px' }} />
                    <Typography color="text.secondary">No {userType} found</Typography>
                </Box>
            );
        }

        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>District</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        {user.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.district || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {getStatusChip(user.verificationStatus || user.status)}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Box display="flex" justifyContent="flex-end" gap={1}>
                                        {(user.verificationStatus === 'PENDING' || user.status === 'PENDING') && (
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleApprove(user.id, userType)}
                                                title="Approve"
                                            >
                                                <CheckCircle size={20} />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            color="warning"
                                            onClick={() => handleSuspend(user.id, userType)}
                                            title="Suspend"
                                        >
                                            <XCircle size={20} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => navigate(`/${userType}/${user.id}`)}
                                            title="View Details"
                                        >
                                            <Eye size={20} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(user.id, userType)}
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const stats = {
        totalOfficers: officers.length,
        totalAsha: ashaWorkers?.length || 0,
        totalDrivers: drivers?.length || 0,
        pendingApprovals:
            (ashaWorkers?.filter((w: User) => w.verificationStatus === 'PENDING').length || 0) +
            (drivers?.filter((d: User) => d.verificationStatus === 'PENDING').length || 0),
    };

    return (
        <Box>
            {/* Header */}
            <Box mb={4}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Shield size={32} style={{ color: '#1B6B4A' }} />
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                Admin Portal
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage officers, ASHA workers, and ambulance drivers
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={18} />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        bgcolor: 'primary.light',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Shield size={24} style={{ color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Officers
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalOfficers}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        bgcolor: 'success.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Users size={24} style={{ color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        ASHA Workers
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalAsha}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        bgcolor: 'info.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Truck size={24} style={{ color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Drivers
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalDrivers}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        bgcolor: 'warning.main',
                                        borderRadius: 2,
                                        p: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Clock size={24} style={{ color: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.pendingApprovals}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Content */}
            <Paper>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        value="officers"
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Shield size={20} />
                                District Officers
                            </Box>
                        }
                    />
                    <Tab
                        value="asha"
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Users size={20} />
                                ASHA Workers
                            </Box>
                        }
                    />
                    <Tab
                        value="drivers"
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Truck size={20} />
                                Ambulance Drivers
                            </Box>
                        }
                    />
                </Tabs>

                {/* Filters */}
                <Box p={3} borderBottom={1} borderColor="divider">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, email, or district..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={20} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Select
                                fullWidth
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Filter size={20} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Download size={18} />}
                            >
                                Export
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Table Content */}
                <Box p={3}>
                    {activeTab === 'officers' && renderUserTable(officers, 'officers')}
                    {activeTab === 'asha' && renderUserTable(ashaWorkers || [], 'asha')}
                    {activeTab === 'drivers' && renderUserTable(drivers || [], 'drivers')}
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminPortal;
