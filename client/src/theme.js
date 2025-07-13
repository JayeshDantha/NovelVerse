// client/src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5D4037', // A warm, dark brown - like a leather book cover
    },
    secondary: {
      main: '#00796B', // A deep, calming teal
    },
    background: {
      default: '#F5F5F5', // A soft, light grey instead of stark white
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Merriweather", "Georgia", serif', // Our new literary font
    h1: { fontFamily: '"Merriweather", "Georgia", serif' },
    h2: { fontFamily: '"Merriweather", "Georgia", serif' },
    h3: { fontFamily: '"Merriweather", "Georgia", serif' },
    h4: { fontFamily: '"Merriweather", "Georgia", serif', fontWeight: 700 },
    h5: { fontFamily: '"Merriweather", "Georgia", serif', fontWeight: 700 },
    h6: { fontFamily: '"Merriweather", "Georgia", serif', fontWeight: 700 },
  },
  components: {
    // We can add component-specific style overrides here
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px', // Makes all buttons rounded by default
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default theme;
