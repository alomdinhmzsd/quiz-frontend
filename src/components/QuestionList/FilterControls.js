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

export default function FilterControls({ filters, onChange, domains }) {
  return (
    <Stack direction='row' spacing={2} sx={{ mb: 4 }} alignItems='center'>
      <TextField
        label='Search questions or IDs'
        variant='outlined'
        size='small'
        value={filters.searchTerm}
        onChange={(e) => onChange('searchTerm', e.target.value)}
        sx={{ flex: 2 }}
      />

      <FormControl sx={{ minWidth: 180 }} size='small'>
        <InputLabel>Domain</InputLabel>
        <Select
          value={filters.domain}
          label='Domain'
          onChange={(e) => onChange('domain', e.target.value)}>
          <MenuItem value='all'>All Domains</MenuItem>
          {domains.map((domain) => (
            <MenuItem key={domain} value={domain}>
              {domain}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={filters.sortOrder}
        exclusive
        onChange={(e, newOrder) => newOrder && onChange('sortOrder', newOrder)}
        size='small'>
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
