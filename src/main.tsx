import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { render } from 'preact'
import { App } from './app.tsx'
import './app.css'
import './index.css'

const theme = createTheme({
  palette: {
    primary: { main: '#236783' },
    background: { default: '#f6f9fb' },
    text: { primary: '#183648', secondary: '#637782' },
  },
  typography: { fontFamily: "'Avenir Next', 'Segoe UI', sans-serif" },
  shape: { borderRadius: 12 },
})

render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('app')!,
)
