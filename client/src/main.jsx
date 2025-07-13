// client/src/main.jsx - FINAL THEMED VERSION

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { SnackbarProvider } from 'notistack';
// --- Our New Imports ---
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js'; // Import our new theme file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The ThemeProvider makes our custom theme available to every component */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline is a MUI component that resets and normalizes browser styles */}
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
            <App />
          </SnackbarProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
