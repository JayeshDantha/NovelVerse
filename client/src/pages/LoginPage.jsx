import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link, Paper, Divider } from '@mui/material';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import GoogleIcon from '@mui/icons-material/Google';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', formData);
      login(response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/users/auth/google';
  };

  return (
    <AuthLayout>
      <Paper
        elevation={12}
        sx={{
          p: 4,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
            NovelVerse
          </Typography>
          <Typography sx={{ color: 'grey.400' }}>
            Welcome back! Please sign in.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
            InputLabelProps={{ sx: { color: 'grey.400' } }}
            sx={{ input: { color: 'white' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={handleChange}
            InputLabelProps={{ sx: { color: 'grey.400' } }}
            sx={{ input: { color: 'white' } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign In
          </Button>
          <Divider sx={{ my: 2, color: 'grey.500' }}>OR</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ color: 'white', borderColor: 'grey.600', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
          >
            Sign in with Google
          </Button>
          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'grey.400' }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
           <Grid container justifyContent="center" sx={{ mt: 1 }}>
            <Grid item>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'grey.400' }}>
                Forgot password?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </AuthLayout>
  );
}

export default LoginPage;
