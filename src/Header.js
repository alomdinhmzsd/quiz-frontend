/**
 * Header.js - Application Header Component
 *
 * The persistent header that appears at the top of all pages.
 * Features:
 * - Application title
 * - Navigation to all questions
 * - Domain filter dropdown menu
 *
 * Uses Material-UI components with React Router links.
 */

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  // State for managing the domain menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position='static'>
      <Toolbar>
        {/* Application title */}
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          AWS Exam Prep
        </Typography>

        {/* Link to all questions */}
        <Button color='inherit' component={Link} to='/'>
          All Questions
        </Button>

        {/* Domain filter dropdown */}
        <Button
          color='inherit'
          aria-controls='domain-menu'
          aria-haspopup='true'
          onClick={handleClick}>
          Domains
        </Button>
        <Menu
          id='domain-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}>
          {/* Domain filter options */}
          <MenuItem
            component={Link}
            to='/domain/Design Secure Applications and Architectures'
            onClick={handleClose}>
            Secure Applications
          </MenuItem>
          <MenuItem
            component={Link}
            to='/domain/Design Resilient Architectures'
            onClick={handleClose}>
            Resilient Architectures
          </MenuItem>
          <MenuItem
            component={Link}
            to='/domain/Design High-Performing Architectures'
            onClick={handleClose}>
            High-Performing
          </MenuItem>
          <MenuItem
            component={Link}
            to='/domain/Design Cost-Optimized Architectures'
            onClick={handleClose}>
            Cost-Optimized
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
