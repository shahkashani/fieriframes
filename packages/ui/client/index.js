import { ThemeProvider, createTheme } from '@mui/material';

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
