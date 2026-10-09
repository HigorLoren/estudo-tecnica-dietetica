import { Button, Container, Paper, Typography } from '@mui/material'

export function App() {
  return (
    <Container component="main" maxWidth="sm" className="app">
      <Paper elevation={2} className="card">
        <Typography variant="overline" color="primary">
          Preact + TypeScript + MUI
        </Typography>
        <Typography variant="h3" component="h1">
          Projeto pronto
        </Typography>
        <Typography color="text.secondary">
          Edite <code>src/app.tsx</code> para começar.
        </Typography>
        <Button variant="contained">Ação de exemplo</Button>
      </Paper>
    </Container>
  )
}
