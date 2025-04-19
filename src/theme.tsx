"use client"

import { createTheme } from "@mui/material"

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#2c3752",
      paper: "#374262",
    },
    primary: {
      main: "#fdf16d",
    },
    secondary: {
      main: "#ffb6c1",
    },
  },
  typography: {
    fontFamily: "'Futura BT', sans-serif",
    h1: {
      fontWeight: 700,
    },
  },
})

export default theme
