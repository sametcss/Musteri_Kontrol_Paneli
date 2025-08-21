import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { trTR } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr'; // Türkçe için

// Components
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Countries from './pages/Countries';
import VisaTypes from './pages/VisaTypes';
import Offices from './pages/Offices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Theme Context oluşturma
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  // Tema durumu - localStorage'dan yükle, yoksa light tema kullan
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Light tema ayarları - Turizm acentası için modern ve ferah
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#2563eb', // Modern mavi
        light: '#60a5fa',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#0891b2', // Turkuaz
        light: '#06b6d4',
        dark: '#0e7490',
      },
      background: {
        default: '#f8fafc', // Daha beyaza yakın, göz yormayan
        paper: '#ffffff',
      },
      text: {
        primary: '#1f2937', // Daha soft siyah
        secondary: '#6b7280',
      },
      success: {
        main: '#059669',
        light: '#10b981',
      },
      warning: {
        main: '#d97706',
        light: '#f59e0b',
      },
      error: {
        main: '#dc2626',
        light: '#ef4444',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        color: '#1f2937',
      },
      h6: {
        fontWeight: 600,
        color: '#1f2937',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#2563eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  }, trTR);

  // Dark tema ayarları - Turizm acentası için modern ve göz yormayan
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#3b82f6', // Daha parlak mavi
        light: '#60a5fa',
        dark: '#2563eb',
      },
      secondary: {
        main: '#06b6d4', // Turkuaz
        light: '#22d3ee',
        dark: '#0891b2',
      },
      background: {
        default: '#0f172a', // Daha soft koyu mavi
        paper: '#1e293b', // Daha açık gri-mavi karışımı
      },
      text: {
        primary: '#f1f5f9', // Daha soft beyaz
        secondary: '#cbd5e1', // Daha açık gri
      },
      success: {
        main: '#22c55e',
        light: '#4ade80',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        color: '#f1f5f9',
      },
      h6: {
        fontWeight: 600,
        color: '#f1f5f9',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            borderBottom: '1px solid #334155',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1e293b',
            borderRight: '1px solid #334155',
            color: '#f1f5f9',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: '#334155',
              '& .MuiListItemIcon-root': {
                color: '#3b82f6',
              },
              '& .MuiListItemText-primary': {
                color: '#3b82f6',
                fontWeight: 'bold',
              },
            },
            '&:hover': {
              backgroundColor: '#2d3748',
              borderRadius: '8px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#475569',
              },
              '&:hover fieldset': {
                borderColor: '#64748b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: '#334155',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#2d3748 !important',
            },
            '& .MuiTableCell-root': {
              borderColor: '#334155',
            },
          },
        },
      },
    },
  }, trTR);

  // Aktif temayı seç
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
  <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
    <ThemeProvider theme={currentTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/visa-types" element={<VisaTypes />} />
              <Route path="/offices" element={<Offices />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  </ThemeContext.Provider>
);
}

export default App;