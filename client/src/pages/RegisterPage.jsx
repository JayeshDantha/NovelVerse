import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link, Paper, Divider } from '@mui/material';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import GoogleIcon from '@mui/icons-material/Google';

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/register', formData);
      login(response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || 'An error occurred');
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
            Create Your Account
          </Typography>
          <Typography sx={{ color: 'grey.400' }}>
            Join the NovelVerse community.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            onChange={handleChange}
            InputLabelProps={{ sx: { color: 'grey.400' } }}
            sx={{ input: { color: 'white' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
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
            Sign Up
          </Button>
          <Divider sx={{ my: 2, color: 'grey.500' }}>OR</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ color: 'white', borderColor: 'grey.600', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
          >
            Sign up with Google
          </Button>
          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'grey.400' }}>
                {"Already have an account? Sign In"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </AuthLayout>
  );
}

export default RegisterPage;
