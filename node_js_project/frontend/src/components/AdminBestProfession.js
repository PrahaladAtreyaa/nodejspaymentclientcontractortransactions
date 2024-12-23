// src/components/AdminBestProfession.js
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

function AdminBestProfession() {
  const [adminStartDate, setAdminStartDate] = useState('');
  const [adminEndDate, setAdminEndDate] = useState('');
  const [bestProfession, setBestProfession] = useState('');
  const [totalEarned, setTotalEarned] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getBestProfession = async () => {
    if (!adminStartDate || !adminEndDate) {
      setErrorMessage('Please select both start and end dates.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/admin/best-profession', {
        params: {
          start: adminStartDate,
          end: adminEndDate,
        },
      });
      setBestProfession(res.data.profession);
      setTotalEarned(res.data.total_earned);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while fetching the best profession.'
      );
      setSnackbarOpen(true);
      setBestProfession('');
      setTotalEarned('');
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
      <Typography variant="h6">Admin - Get Best Profession</Typography>
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
      </Box>
      <Button variant="contained" onClick={getBestProfession} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Best Profession'}
      </Button>
      {bestProfession && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Best Profession:</Typography>
          <Typography>
            {bestProfession} (Total Earned: ${totalEarned})
          </Typography>
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

export default AdminBestProfession;
