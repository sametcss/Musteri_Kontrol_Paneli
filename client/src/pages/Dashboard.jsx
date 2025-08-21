import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Badge
} from '@mui/material';
import {
  Person,
  CalendarToday,
  Warning,
  CheckCircle,
  Cancel,
  Edit,
  Save,
  Clear,
  Phone,
  Email,
  Today,
  Schedule,
  AttachMoney,
  Description,
  Alarm,
  StickyNote2
} from '@mui/icons-material';
import { customersAPI } from '../services/api';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notepadText, setNotepadText] = useState('');
  const [editingNotepad, setEditingNotepad] = useState(false);
  
  // Dashboard istatistikleri
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    upcomingAppointments: 0,
    expiredVisas: 0,
    incompleteDocuments: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadDashboardData();
    loadNotepadFromStorage();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.getAll();
      const customerData = response.data.data || [];
      setCustomers(customerData);
      calculateStats(customerData);
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerData) => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const stats = {
      totalCustomers: customerData.length,
      activeCustomers: customerData.filter(c => c.status === 'active').length,
      upcomingAppointments: customerData.filter(c => 
        c.appointmentDate && 
        new Date(c.appointmentDate) <= threeDaysFromNow &&
        new Date(c.appointmentDate) >= today
      ).length,
      expiredVisas: customerData.filter(c => 
        c.visaExpiryDate && 
        new Date(c.visaExpiryDate) <= oneMonthFromNow
      ).length,
      incompleteDocuments: customerData.filter(c => !c.documentsComplete).length,
      totalRevenue: customerData.reduce((sum, c) => sum + (parseFloat(c.paidAmount) || 0), 0)
    };
    setStats(stats);
  };

  const loadNotepadFromStorage = () => {
    const savedNotes = localStorage.getItem('dashboard_notepad');
    if (savedNotes) {
      setNotepadText(savedNotes);
    }
  };

  const saveNotepadToStorage = (text) => {
    localStorage.setItem('dashboard_notepad', text);
  };

  const handleNotepadSave = () => {
    saveNotepadToStorage(notepadText);
    setEditingNotepad(false);
  };

  // Vize süresi dolacak müşteriler (1 ay içinde)
  const getExpiringVisas = () => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return customers
      .filter(customer => 
        customer.visaExpiryDate && 
        new Date(customer.visaExpiryDate) <= oneMonthFromNow &&
        new Date(customer.visaExpiryDate) >= today
      )
      .sort((a, b) => new Date(a.visaExpiryDate) - new Date(b.visaExpiryDate))
      .slice(0, 10);
  };

  // Yaklaşan randevular
  const getUpcomingAppointments = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return customers
      .filter(customer => 
        customer.appointmentDate && 
        new Date(customer.appointmentDate) <= sevenDaysFromNow &&
        new Date(customer.appointmentDate) >= today &&
        customer.appointmentStatus !== 'cancelled'
      )
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 10);
  };

  const getDaysUntilDate = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
  };

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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          📊 Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Vize yönetim sistemi genel durumu
        </Typography>
      </Box>

      {/* İstatistik Kartları - Üst kısım */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.totalCustomers}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                👥 Toplam Müşteri
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.upcomingAppointments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📅 Yaklaşan Randevu
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: '#d84315',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.expiredVisas}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ⏰ Vize Süresi Dolacak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#f57c00',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.incompleteDocuments}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ⚠️ Eksik Evrak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                ₺{(stats.totalRevenue / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                💰 Toplam Gelir
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {stats.activeCustomers}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ✅ Aktif Müşteri
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ana Dashboard İçeriği */}
      <Grid container spacing={4}>
        {/* Sol taraf - Listeler */}
        <Grid item xs={12} lg={9}>
          <Grid container spacing={3}>
            {/* Yaklaşan Randevular */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                height: 550
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 'bold'
                  }}>
                    📅 Yaklaşan Randevular
                    <Badge 
                      badgeContent={stats.upcomingAppointments} 
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: editingNotepad ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                    cursor: editingNotepad ? 'text' : 'default',
                          color: 'white'
                        }
                      }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ 
                  maxHeight: 450, 
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  <List sx={{ p: 0 }}>
                    {getUpcomingAppointments().map((customer) => {
                      const daysUntil = getDaysUntilDate(customer.appointmentDate);
                      const { date, time } = formatDateTime(customer.appointmentDate);
                      const hasIncompleteDocuments = !customer.documentsComplete;
                      
                      return (
                        <ListItem 
                          key={customer.id} 
                          sx={{ 
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: 'primary.main',
                              width: 45,
                              height: 45,
                              fontSize: '1.2rem'
                            }}>
                              {customer.firstName.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {customer.firstName} {customer.lastName}
                                </Typography>
                                <Typography variant="h6">
                                  {getCountryFlag(customer.country?.code)}
                                </Typography>
                                {hasIncompleteDocuments && (
                                  <Tooltip title="Eksik evraklar var! Randevu yaklaşıyor">
                                    <Warning color="error" fontSize="small" />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  📅 {date} • 🕐 {time}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={
                                      daysUntil === 0 ? 'Bugün' :
                                      daysUntil === 1 ? 'Yarın' :
                                      `${daysUntil} gün kaldı`
                                    }
                                    size="small"
                                    color={daysUntil <= 1 ? 'error' : daysUntil <= 3 ? 'warning' : 'info'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  {hasIncompleteDocuments && (
                                    <Chip
                                      label="Eksik Evrak"
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                    {getUpcomingAppointments().length === 0 && (
                      <ListItem sx={{ py: 4 }}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="text.secondary" align="center">
                              Yaklaşan randevu bulunmuyor
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" align="center">
                              7 gün içinde randevu olan müşteri yok
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>

            {/* Vize Süresi Dolacaklar */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                height: 550
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 'bold'
                  }}>
                    ⏰ Vize Süresi Dolacaklar
                    <Badge 
                      badgeContent={stats.expiredVisas} 
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white'
                        }
                      }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ 
                  maxHeight: 450, 
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  <List sx={{ p: 0 }}>
                    {getExpiringVisas().map((customer) => {
                      const daysUntil = getDaysUntilDate(customer.visaExpiryDate);
                      const { date } = formatDateTime(customer.visaExpiryDate);
                      
                      return (
                        <ListItem 
                          key={customer.id} 
                          sx={{ 
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            py: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: 'error.main',
                              width: 45,
                              height: 45,
                              fontSize: '1.2rem'
                            }}>
                              {customer.firstName.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {customer.firstName} {customer.lastName}
                                </Typography>
                                <Typography variant="h6">
                                  {getCountryFlag(customer.country?.code)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {customer.visaType?.name} • {customer.country?.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Vize Bitiş: {date}
                                  </Typography>
                                  <Chip
                                    label={
                                      daysUntil <= 7 ? `${daysUntil} gün kaldı` :
                                      daysUntil <= 30 ? `${daysUntil} gün kaldı` :
                                      'Yakında'
                                    }
                                    size="small"
                                    color={daysUntil <= 7 ? 'error' : daysUntil <= 15 ? 'warning' : 'info'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Telefon">
                              <IconButton size="small" color="primary">
                                <Phone fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      );
                    })}
                    {getExpiringVisas().length === 0 && (
                      <ListItem sx={{ py: 4 }}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="text.secondary" align="center">
                              Vize süresi dolacak müşteri yok
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" align="center">
                              1 ay içinde vize süresi dolacak müşteri bulunmuyor
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Sağ Taraf - Hızlı Notlar */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ 
            height: 550, 
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px solid',
            borderColor: notepadText.trim() ? 'warning.main' : 'divider',
            position: 'relative'
          }}>
            <Box sx={{ 
              p: 3, 
              background: notepadText.trim() 
                ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' 
                : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
              color: notepadText.trim() ? '#d84315' : '#4338ca'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <StickyNote2 />
                  Hızlı Notlar
                  {notepadText.trim() && (
                    <Badge 
                      color="error" 
                      variant="dot" 
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 }
                          }
                        }
                      }}
                    />
                  )}
                </Typography>
                <Box>
                  {editingNotepad ? (
                    <>
                      <Tooltip title="Kaydet">
                        <IconButton 
                          size="small" 
                          onClick={handleNotepadSave}
                          sx={{ 
                            color: 'inherit',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            mr: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          <Save fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="İptal">
                        <IconButton 
                          size="small" 
                          onClick={() => setEditingNotepad(false)}
                          sx={{ 
                            color: 'inherit',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          onClick={() => setEditingNotepad(true)}
                          sx={{ 
                            color: 'inherit',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            mr: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Temizle">
                        <IconButton 
                          size="small" 
                          onClick={() => setNotepadText('')}
                          sx={{ 
                            color: 'inherit',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: 3, height: 'calc(100% - 120px)' }}>
              <TextField
                fullWidth
                multiline
                value={notepadText}
                onChange={(e) => setNotepadText(e.target.value)}
                placeholder={`✨ Hızlı notlarınızı buraya yazın...

📝 Önemli hatırlatmalar
👥 Müşteri notları  
✅ Yapılacaklar listesi
⚡ Özel durumlar
📞 Telefon notları`}
                variant="outlined"
                InputProps={{
                  readOnly: !editingNotepad
                }}
                sx={{
                  height: '100%',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                    fontSize: '16px',
                    fontFamily: 'Inter, Arial',
                    fontWeight: 600,
                    color: 'text.primary',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& fieldset': {
                      borderColor: 'transparent'
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary !important',
                    fontWeight: '600 !important', 
                    fontSize: '16px !important',
                    opacity: '1 !important',
                    '&::placeholder': {
                      color: 'text.secondary',
                      opacity: 0.9,
                      fontSize: '15px',
                      fontWeight: 500
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;