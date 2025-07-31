import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import EditProfile from '../components/settings/EditProfile';

const SettingsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <EditProfile />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
