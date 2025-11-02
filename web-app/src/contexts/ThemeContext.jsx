import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const ColorModeContext = createContext({ toggleColorMode: () => {} })

export const useColorMode = () => useContext(ColorModeContext)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode')
    return savedMode || 'light'
  })

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
      mode,
    }),
    [mode]
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          },
          background: {
            default: mode === 'light' ? '#f0f2f5' : '#18191a',
            paper: mode === 'light' ? '#ffffff' : '#242526',
          },
          divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 2px rgba(0, 0, 0, 0.1)' 
                  : '0 1px 2px rgba(0, 0, 0, 0.3)',
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  )
}
