# Filter Components

Reusable filter components for consistent filtering UI across the application.

## Components

### FilterBar

A container component that provides consistent styling and layout for filter sections.

**Props:**
- `title` (string, optional): Title for the filter section. Default: "Filters"
- `children` (ReactNode): Filter components to display
- `onClear` (function, optional): Callback when "Clear All" button is clicked
- `showClearButton` (boolean, optional): Whether to show the clear button. Default: true
- `elevation` (number, optional): Paper elevation. Default: 0

**Example:**
```tsx
<FilterBar
  title="Search & Filter"
  onClear={() => {
    setFilters({});
    setSearchQuery('');
  }}
>
  <SearchInput value={searchQuery} onChange={setSearchQuery} />
  <StatusFilter options={statusOptions} selectedValue={status} onChange={setStatus} />
</FilterBar>
```

---

### SearchInput

A search input with debounce functionality to prevent excessive API calls.

**Props:**
- `value` (string): Current search value
- `onChange` (function): Callback when value changes (debounced)
- `placeholder` (string, optional): Placeholder text. Default: "Search..."
- `debounceMs` (number, optional): Debounce delay in milliseconds. Default: 300
- `fullWidth` (boolean, optional): Whether to take full width. Default: false
- `size` ('small' | 'medium', optional): Input size. Default: 'small'

**Example:**
```tsx
<SearchInput
  value={searchQuery}
  onChange={(value) => {
    setSearchQuery(value);
    setPage(0); // Reset pagination
  }}
  placeholder="Search by patient name..."
  debounceMs={500}
/>
```

---

### DateRangePicker

A component for selecting date ranges with start and end dates.

**Props:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `onStartDateChange` (function): Callback when start date changes
- `onEndDateChange` (function): Callback when end date changes
- `size` ('small' | 'medium', optional): Input size. Default: 'small'

**Example:**
```tsx
<DateRangePicker
  startDate={filters.start_date || ''}
  endDate={filters.end_date || ''}
  onStartDateChange={(date) => setFilters({ ...filters, start_date: date })}
  onEndDateChange={(date) => setFilters({ ...filters, end_date: date })}
/>
```

---

### StatusFilter

A chip-based filter for selecting status values.

**Props:**
- `options` (StatusOption[]): Array of status options
  - `value` (string): Option value
  - `label` (string): Display label
  - `color` (MUI color, optional): Chip color when selected
- `selectedValue` (string): Currently selected value
- `onChange` (function): Callback when selection changes
- `label` (string, optional): Label above the chips
- `allowClear` (boolean, optional): Allow deselecting by clicking again. Default: true

**Example:**
```tsx
<StatusFilter
  label="Filter by Status"
  options={[
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'completed', label: 'Completed', color: 'default' },
  ]}
  selectedValue={filters.status || ''}
  onChange={(value) => setFilters({ ...filters, status: value })}
/>
```

---

## Complete Example

Here's a complete example combining all filter components:

```tsx
import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FilterBar from '../components/FilterBar';
import SearchInput from '../components/SearchInput';
import DateRangePicker from '../components/DateRangePicker';
import StatusFilter from '../components/StatusFilter';

const MyListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
    category: '',
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      start_date: '',
      end_date: '',
      category: '',
    });
  };

  return (
    <div>
      <FilterBar onClear={handleClearFilters}>
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items..."
        />

        {/* Status Filter */}
        <StatusFilter
          label="Status"
          options={[
            { value: 'active', label: 'Active', color: 'success' },
            { value: 'inactive', label: 'Inactive', color: 'default' },
          ]}
          selectedValue={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
        />

        {/* Date Range */}
        <DateRangePicker
          startDate={filters.start_date}
          endDate={filters.end_date}
          onStartDateChange={(date) => setFilters({ ...filters, start_date: date })}
          onEndDateChange={(date) => setFilters({ ...filters, end_date: date })}
        />

        {/* Category Dropdown */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="cat1">Category 1</MenuItem>
            <MenuItem value="cat2">Category 2</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      {/* Your list content here */}
    </div>
  );
};
```

## Best Practices

1. **Debounce Search**: Always use SearchInput for text search to avoid excessive API calls
2. **Reset Pagination**: When filters change, reset pagination to page 0
3. **Clear All**: Provide a clear all function to reset all filters at once
4. **Consistent Layout**: Use FilterBar to maintain consistent filter section styling
5. **Visual Feedback**: Use StatusFilter chips for better visual indication of selected filters
6. **Date Validation**: DateRangePicker automatically validates that end date is after start date

## Integration with API

Filter components work seamlessly with React Query hooks:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['items', filters, searchQuery],
  queryFn: () => fetchItems({ ...filters, search: searchQuery }),
});
```

The query will automatically refetch when filters or search query changes.
