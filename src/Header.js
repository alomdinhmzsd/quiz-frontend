import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          AWS Exam Prep
        </Typography>
        <Button color='inherit' component={Link} to='/'>
          All Questions
        </Button>
      </Toolbar>
    </AppBar>
  );
}
