import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Typography,
  Collapse,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Refresh,
  ExpandMore,
  ExpandLess,
  Add,
  FileDownload
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CustomerFilters = ({ 
  onFiltersChange, 
  onAddCustomer, 
  onExport,
  countries = [],
  visaTypes = [],
  offices = []
}) => {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    visaType: '',
    office: '',
    priority: '',
    status: 'active'
  });
  
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Filter değişimlerini handle et
  const handleFilterChange = (field, value) => {
    console.log('🔍 Filter değişti:', field, '=', value);
    const newFilters = { ...filters, [field]: value };
    console.log('🔍 Yeni filters objesi:', newFilters);
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      country: '',
      visaType: '',
      office: '',
      priority: '',
      status: 'active'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Aktif filtre sayısı
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== 'active').length;
  };

  // Ülke bayrağı
  const getCountryFlag = (countryCode) => {
    const flags = {
      'GER': '🇩🇪',
      'USA': '🇺🇸',
      'GBR': '🇬🇧',
      'FRA': '🇫🇷',
      'ITA': '🇮🇹',
      'ESP': '🇪🇸'
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 3,
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        border: isDarkMode ? '1px solid #334155' : 'none',
        borderRadius: 3
      }}
    >
      {/* Ana Filtre Çubuğu */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Arama */}
          <Box sx={{ flexGrow: 1, minWidth: 300 }}>
            <TextField
              fullWidth
              placeholder="Müşteri ara (ad, soyad, pasaport no)..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: filters.search && (
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <Clear />
                  </IconButton>
                )
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                  '&::placeholder': {
                    color: isDarkMode ? '#94a3b8' : '#666666',
                  }
                }
              }}
            />
          </Box>

          {/* Hızlı Filtreler */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#cbd5e1' : '#666666',
                },
                '& .MuiSelect-select': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                }
              }}
            >
              <InputLabel>Ülke</InputLabel>
              <Select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                label="Ülke"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: isDarkMode ? '1px solid #334155' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#f1f5f9' : '#333333',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#475569' : '#bbdefb',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {getCountryFlag(country.code)} {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#cbd5e1' : '#666666',
                },
                '& .MuiSelect-select': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                }
              }}
            >
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Öncelik"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: isDarkMode ? '1px solid #334155' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#f1f5f9' : '#333333',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#475569' : '#bbdefb',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="5">⭐⭐⭐⭐⭐ Çok Acil</MenuItem>
                <MenuItem value="4">⭐⭐⭐⭐ Acil</MenuItem>
                <MenuItem value="3">⭐⭐⭐ Normal</MenuItem>
                <MenuItem value="2">⭐⭐ Düşük</MenuItem>
                <MenuItem value="1">⭐ Çok Düşük</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Sağ Taraf - Butonlar */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setExpanded(!expanded)}
              color={getActiveFilterCount() > 0 ? 'primary' : 'inherit'}
              sx={{
                borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                color: isDarkMode ? '#f1f5f9' : '#333333',
                '&:hover': {
                  borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                },
                ...(getActiveFilterCount() > 0 && {
                  borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  color: isDarkMode ? '#3b82f6' : '#1976d2',
                })
              }}
            >
              Filtreler {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{
                borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                color: isDarkMode ? '#f1f5f9' : '#333333',
                '&:hover': {
                  borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                },
              }}
            >
              Yenile
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={onExport}
              sx={{
                borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                color: isDarkMode ? '#f1f5f9' : '#333333',
                '&:hover': {
                  borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                },
              }}
            >
              Dışa Aktar
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddCustomer}
              sx={{
                backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#2563eb' : '#1565c0',
                },
              }}
            >
              Yeni Müşteri
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Gelişmiş Filtreler */}
      <Collapse in={expanded}>
        <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e0e0e0' }} />
        <Box sx={{ 
          p: 2, 
          backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12
        }}>
          <Typography 
            variant="subtitle2" 
            gutterBottom
            sx={{ color: isDarkMode ? '#f1f5f9' : '#333333' }}
          >
            Gelişmiş Filtreler
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Vize Türü */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#334155' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#cbd5e1' : '#666666',
                },
                '& .MuiSelect-select': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                }
              }}
            >
              <InputLabel>Vize Türü</InputLabel>
              <Select
                value={filters.visaType}
                onChange={(e) => handleFilterChange('visaType', e.target.value)}
                label="Vize Türü"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: isDarkMode ? '1px solid #334155' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#f1f5f9' : '#333333',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#475569' : '#bbdefb',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {visaTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ofis */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#334155' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#cbd5e1' : '#666666',
                },
                '& .MuiSelect-select': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                }
              }}
            >
              <InputLabel>Ofis</InputLabel>
              <Select
                value={filters.office}
                onChange={(e) => handleFilterChange('office', e.target.value)}
                label="Ofis"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: isDarkMode ? '1px solid #334155' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#f1f5f9' : '#333333',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#475569' : '#bbdefb',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {offices.map((office) => (
                  <MenuItem key={office.id} value={office.id}>
                    {office.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Durum */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#334155' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? '#475569' : '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#cbd5e1' : '#666666',
                },
                '& .MuiSelect-select': {
                  color: isDarkMode ? '#f1f5f9' : '#333333',
                }
              }}
            >
              <InputLabel>Durum</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Durum"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      border: isDarkMode ? '1px solid #334155' : 'none',
                      '& .MuiMenuItem-root': {
                        color: isDarkMode ? '#f1f5f9' : '#333333',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#475569' : '#bbdefb',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="active">✅ Aktif</MenuItem>
                <MenuItem value="completed">🎉 Tamamlanan</MenuItem>
                <MenuItem value="cancelled">❌ İptal</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{
                borderColor: isDarkMode ? '#475569' : '#e0e0e0',
                color: isDarkMode ? '#f1f5f9' : '#333333',
                '&:hover': {
                  borderColor: isDarkMode ? '#64748b' : '#b0b0b0',
                  backgroundColor: isDarkMode ? '#334155' : '#f5f5f5',
                },
              }}
            >
              Filtreleri Temizle
            </Button>
          </Box>

          {/* Aktif Filtreler Gösterimi */}
          {getActiveFilterCount() > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ color: isDarkMode ? '#94a3b8' : '#666666' }}
              >
                Aktif Filtreler:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {filters.search && (
                  <Chip
                    label={`Arama: ${filters.search}`}
                    size="small"
                    onDelete={() => handleFilterChange('search', '')}
                    sx={{
                      backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                      color: isDarkMode ? '#f1f5f9' : '#1976d2',
                      '& .MuiChip-deleteIcon': {
                        color: isDarkMode ? '#cbd5e1' : '#1976d2',
                      },
                    }}
                  />
                )}
                {filters.country && (
                  <Chip
                    label={`Ülke: ${countries.find(c => c.id == filters.country)?.name}`}
                    size="small"
                    onDelete={() => handleFilterChange('country', '')}
                    sx={{
                      backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                      color: isDarkMode ? '#f1f5f9' : '#1976d2',
                      '& .MuiChip-deleteIcon': {
                        color: isDarkMode ? '#cbd5e1' : '#1976d2',
                      },
                    }}
                  />
                )}
                {filters.priority && (
                  <Chip
                    label={`Öncelik: ${filters.priority} yıldız`}
                    size="small"
                    onDelete={() => handleFilterChange('priority', '')}
                    sx={{
                      backgroundColor: isDarkMode ? '#334155' : '#e3f2fd',
                      color: isDarkMode ? '#f1f5f9' : '#1976d2',
                      '& .MuiChip-deleteIcon': {
                        color: isDarkMode ? '#cbd5e1' : '#1976d2',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CustomerFilters;