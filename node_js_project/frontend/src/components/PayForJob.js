// src/components/PayForJob.js
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

function PayForJob({ profileId, setProfileId }) {
  const [payJobId, setPayJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const payForJob = async () => {
    if (!profileId || !payJobId) {
      setErrorMessage('Please enter both Profile ID and Job ID.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3001/jobs/${payJobId}/pay`, null, {
        headers: {
          profile_id: profileId,
        },
      });
      setSuccessMessage(res.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while processing the payment.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      <Typography variant="h6">Pay for a Job</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Profile ID (Client)"
          variant="outlined"
          fullWidth
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        />
        <TextField
          label="Job ID"
          variant="outlined"
          fullWidth
          value={payJobId}
          onChange={(e) => setPayJobId(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={payForJob} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Pay for Job'}
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
          {snackbarSeverity === 'error' ? errorMessage : successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PayForJob;
