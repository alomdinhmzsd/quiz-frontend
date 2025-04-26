/**
 * theme.js - Material-UI Theme Configuration
 *
 * Defines the custom dark theme for the application using Material-UI.
 * Includes:
 * - Color palette (dark mode)
 * - Typography settings
 * - Custom component styles
 *
 * Used in App.js via ThemeProvider
 */

import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#9c27b0', // Purple
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter for surfaces
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600, // Semi-bold for h4
    },
    h5: {
      fontWeight: 500, // Medium for h5
    },
  },
});
