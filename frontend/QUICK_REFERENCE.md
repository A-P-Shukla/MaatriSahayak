# Quick Reference Guide

## 🚀 New Features at a Glance

### 1. Real-time Updates (WebSocket)
```typescript
// In any component
import { useWebSocket } from '../hooks/useWebSocket';

const { isConnected, lastMessage } = useWebSocket({ enabled: true });

// Shows "Live" badge when connected
{isConnected && <Chip label="Live" color="success" />}
```

### 2. Export Reports
```typescript
// In Analytics page
<Button onClick={handleExport}>Export Report</Button>

// Tries PDF first, falls back to CSV
// Downloads: maatrisahayak-analytics-2024-01-01-to-2024-01-31.pdf
```

### 3. Live Map Tracking
```typescript
// Already working with OpenStreetMap
<AmbulanceMap 
  ambulances={ambulances} 
  height="500px"
  onAmbulanceClick={(ambulance) => console.log(ambulance)}
/>
```

### 4. Polished Dashboard
- Flat design (no elevation)
- Color-coded hover effects
- Scrollable activity lists
- Manual refresh button
- Live connection indicator

---

## 🔧 Configuration

### .env Setup
```env
# API
VITE_API_BASE_URL=https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev

# WebSocket (NEW)
VITE_WS_URL=wss://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev

# Map (already configured)
VITE_MAP_TILES_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 📦 No New Dependencies

All features use existing packages:
- WebSocket: Native browser API
- Map: React Leaflet (already installed)
- Export: Fetch API + Blob
- UI: Material-UI (already installed)

---

## 🎨 UI Design Tokens

### Spacing
```typescript
mb: 1.5  // 12px - Item spacing
mb: 3    // 24px - Section spacing
mb: 4    // 32px - Page spacing
p: 3     // 24px - Card padding
```

### Border Radius
```typescript
borderRadius: 1    // 8px - Small elements
borderRadius: 1.5  // 12px - Medium elements
borderRadius: 2    // 16px - Cards and papers
```

### Shadows
```typescript
elevation={0}  // Flat (default)
boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'  // Hover
boxShadow: '0 4px 12px rgba(color, 0.3)'     // Quick actions
```

---

## 🔌 WebSocket Message Types

```typescript
// Emergency update
{
  type: 'emergency_update',
  data: { event_id, status, patient_name, ... }
}

// Ambulance location
{
  type: 'ambulance_location',
  data: { ambulance_id, latitude, longitude, speed, ... }
}

// Pregnancy update
{
  type: 'pregnancy_update',
  data: { pregnancy_id, risk_level, status, ... }
}

// Stats update
{
  type: 'stats_update',
  data: { total_pregnancies, active_emergencies, ... }
}
```

---

## 🗺️ Map Customization

### Change Tile Provider
```typescript
// Mapbox
<TileLayer
  url="https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={token}"
  accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
/>

// Google Maps (requires @react-google-maps/api)
<GoogleMap
  mapContainerStyle={{ width: '100%', height: '500px' }}
  center={{ lat: 26.8467, lng: 80.9462 }}
  zoom={10}
/>
```

### Custom Marker Icons
```typescript
const getAmbulanceIcon = (status: string) => {
  const colors = {
    available: '#4caf50',   // Green
    dispatched: '#ff9800',  // Orange
    busy: '#f44336',        // Red
    maintenance: '#9e9e9e', // Gray
  };
  // Returns custom SVG icon
};
```

---

## 📊 Export Formats

### CSV Structure
```
MaatriSahayak Analytics Report
Period: {start_date} to {end_date}

Key Metrics
Average Response Time,{value}
Total Emergencies,{value}
Success Rate,{value}%

Outcomes
Successful,{count}
Delayed,{count}
Failed,{count}

District Performance
District,Emergency Count,Avg Response Time,Success Rate
{district},{count},{time},{rate}%
```

### PDF (Backend)
```typescript
POST /analytics/export
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "pdf"
}
// Returns: Binary PDF file
```

---

## 🎯 Component Usage

### Dashboard with Live Updates
```typescript
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
  const { data: stats, refetch } = useDashboardStats();
  const { isConnected } = useWebSocket({ enabled: true });
  
  return (
    <>
      {isConnected && <Chip label="Live" color="success" />}
      <Button onClick={() => refetch()}>Refresh</Button>
      {/* Dashboard content */}
    </>
  );
};
```

### Live Tracking with Filters
```typescript
import { useAmbulances } from '../hooks/useAmbulances';
import AmbulanceMap from '../components/AmbulanceMap';

const LiveTracking = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: ambulances } = useAmbulances(
    statusFilter ? { status: statusFilter } : {}
  );
  
  return <AmbulanceMap ambulances={ambulances} height="500px" />;
};
```

### Analytics with Export
```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  const { data: analytics } = useAnalytics(filters);
  
  const handleExport = async () => {
    // Tries PDF, falls back to CSV
  };
  
  return <Button onClick={handleExport}>Export Report</Button>;
};
```

---

## 🧪 Testing Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 🐛 Troubleshooting

### WebSocket not connecting?
1. Check `VITE_WS_URL` in `.env`
2. Verify backend WebSocket API is deployed
3. Check browser console for errors
4. Test with `wscat -c wss://your-url`

### Map not loading?
1. Check internet connection (needs tile downloads)
2. Verify ambulances have `current_location` data
3. Check browser console for Leaflet errors
4. Try clearing browser cache

### Export not working?
1. Backend PDF export may not be implemented yet
2. CSV fallback should always work
3. Check browser console for errors
4. Verify date range is valid

### Dashboard looks odd?
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if MUI theme is loaded
4. Verify no CSS conflicts

---

## 📚 Documentation Files

- `REALTIME_FEATURES.md` - Detailed WebSocket and Map docs
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `QUICK_REFERENCE.md` - This file
- `README.md` - Project overview

---

## 🎓 Learning Resources

### WebSocket
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [AWS API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)

### React Leaflet
- [React Leaflet Docs](https://react-leaflet.js.org/)
- [Leaflet.js Docs](https://leafletjs.com/)

### Material-UI
- [MUI Components](https://mui.com/material-ui/getting-started/)
- [MUI Customization](https://mui.com/material-ui/customization/theming/)

---

**Last Updated**: January 2025
**Version**: 1.0.0
