import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

/**
 * FilterControls component - Provides interactive controls for filtering and sorting questions
 *
 * @param {object} props - Component props
 * @param {object} props.filters - Current filter values
 * @param {function} props.onChange - Filter change handler
 * @param {array} props.domains - Available domain options
 * @returns {JSX.Element} Interactive filter controls
 */
export default function FilterControls({ filters, onChange, domains }) {
  return (
    <Stack
      direction='row'
      spacing={2}
      sx={{ mb: 4 }}
      alignItems='center'
      aria-label='Question filters'>
      {/* Search input field */}
      <TextField
        label='Search questions or IDs'
        variant='outlined'
        size='small'
        value={filters.searchTerm}
        onChange={(e) => onChange('searchTerm', e.target.value)}
        sx={{ flex: 2 }}
        inputProps={{ 'aria-label': 'Search questions' }}
      />

      {/* Domain filter dropdown */}
      <FormControl sx={{ minWidth: 180 }} size='small'>
        <InputLabel id='domain-filter-label'>Domain</InputLabel>
        <Select
          value={filters.domain}
          label='Domain'
          labelId='domain-filter-label'
          onChange={(e) => onChange('domain', e.target.value)}
          aria-label='Filter by domain'>
          <MenuItem value='all'>All Domains</MenuItem>
          {domains.map((domain) => (
            <MenuItem key={domain} value={domain}>
              {domain}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sort order toggle */}
      <ToggleButtonGroup
        value={filters.sortOrder}
        exclusive
        onChange={(e, newOrder) => newOrder && onChange('sortOrder', newOrder)}
        size='small'
        aria-label='Sort order'>
        <ToggleButton value='asc' aria-label='Sort ascending'>
          <ArrowUpwardIcon fontSize='small' />
        </ToggleButton>
        <ToggleButton value='desc' aria-label='Sort descending'>
          <ArrowDownwardIcon fontSize='small' />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
