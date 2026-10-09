import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { render } from 'preact'
import { App } from './app.tsx'
import './app.css'
import './index.css'

const theme = createTheme()

render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('app')!,
)
