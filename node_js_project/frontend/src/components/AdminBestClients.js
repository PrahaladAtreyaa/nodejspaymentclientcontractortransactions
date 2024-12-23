// src/components/AdminBestClients.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

function AdminBestClients() {
  const [adminStartDate, setAdminStartDate] = useState('');
  const [adminEndDate, setAdminEndDate] = useState('');
  const [bestClients, setBestClients] = useState([]);
  const [clientsLimit, setClientsLimit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getBestClients = async () => {
    if (!adminStartDate || !adminEndDate) {
      setErrorMessage('Please select both start and end dates.');
      setSnackbarOpen(true);
      return;
    }
    if (clientsLimit <= 0) {
      setErrorMessage('Limit must be greater than zero.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/admin/best-clients', {
        params: {
          start: adminStartDate,
          end: adminEndDate,
          limit: clientsLimit,
        },
      });
      setBestClients(res.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while fetching the best clients.'
      );
      setSnackbarOpen(true);
      setBestClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6">Admin - Get Best Clients</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={adminStartDate}
          onChange={(e) => setAdminStartDate(e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={adminEndDate}
          onChange={(e) => setAdminEndDate(e.target.value)}
        />
        <TextField
          label="Limit"
          type="number"
          fullWidth
          value={clientsLimit}
          onChange={(e) => setClientsLimit(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={getBestClients} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Best Clients'}
      </Button>
      {bestClients.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Best Clients:</Typography>
          <pre>{JSON.stringify(bestClients, null, 2)}</pre>
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminBestClients;
