import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Toolbar,
  Tooltip,
  Button
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Phone,
  Email,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';

const CustomerTable = ({ 
  customers = [],
  loading = false,
  onEdit, 
  onDelete, 
  onView,
  onBulkEmail,
  onBulkExport,
  onBulkDelete
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Seçim işlemleri
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = customers.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Sayfalama
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Action menu
  const handleMenuClick = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  // Ülke bayrağı emoji
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

  // Tarih formatı
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const numSelected = selected.length;
  const rowCount = customers.length;

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(customers.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, customers.length);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) => theme.palette.action.selected,
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
          >
            {numSelected} müşteri seçili
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
          >
            Müşteri Listesi ({customers.length} kayıt)
          </Typography>
        )}

        {numSelected > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toplu E-posta">
              <IconButton onClick={() => onBulkEmail?.(selected)}>
                <Email />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toplu Sil">
              <IconButton onClick={() => onBulkDelete?.(selected)} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      {/* Tablo */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Ülke</TableCell>
              <TableCell>Vize Türü</TableCell>
              <TableCell>Öncelik</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>İletişim</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => {
                const isItemSelected = isSelected(customer.id);

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, customer.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={customer.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(customer);
                          }}
                        >
                          {customer.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="subtitle2"
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(customer);
                            }}
                          >
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.passportNo}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {getCountryFlag(customer.country?.code)}
                        </Typography>
                        <Typography variant="body2">
                          {customer.country?.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip 
                        label={customer.visaType?.name}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Rating
                        value={customer.priorityLevel}
                        readOnly
                        size="small"
                        max={5}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(customer.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Telefon">
                          <IconButton size="small" color="primary">
                            <Phone fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {customer.email && (
                          <Tooltip title="E-posta">
                            <IconButton size="small" color="primary">
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, customer);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Özel Sayfalama - Bar olmayan */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="body2" color="text.secondary">
          {startIndex + 1}-{endIndex} / {customers.length} kayıt gösteriliyor
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Sayfa başına:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[5, 10, 25].map((size) => (
              <Button
                key={size}
                size="small"
                variant={rowsPerPage === size ? 'contained' : 'outlined'}
                onClick={() => handleChangeRowsPerPage(size)}
                sx={{ minWidth: 40, height: 32 }}
              >
                {size}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => handleChangePage(page - 1)}
            >
              <ChevronLeft />
            </IconButton>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    size="small"
                    variant={page === pageNum ? 'contained' : 'outlined'}
                    onClick={() => handleChangePage(pageNum)}
                    sx={{ minWidth: 40, height: 32 }}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </Box>
            
            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => handleChangePage(page + 1)}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          onView(selectedCustomer);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          Görüntüle
        </MenuItem>
        <MenuItem onClick={() => {
          onEdit(selectedCustomer);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(selectedCustomer);
          handleMenuClose();
        }}>
          <Delete sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CustomerTable;