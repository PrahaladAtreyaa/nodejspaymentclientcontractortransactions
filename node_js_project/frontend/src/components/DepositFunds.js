// src/components/DepositFunds.js
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

function DepositFunds({ profileId, setProfileId }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const depositFunds = async () => {
    if (!profileId || !depositAmount) {
      setErrorMessage('Please enter both Profile ID and Amount.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (parseFloat(depositAmount) <= 0) {
      setErrorMessage('Deposit amount must be greater than zero.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:3001/balances/deposit/${profileId}`,
        {
          amount: parseFloat(depositAmount),
        },
        {
          headers: {
            profile_id: profileId,
          },
        }
      );
      setSuccessMessage(`${res.data.message} New balance: $${res.data.balance}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while processing the deposit.'
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
      <Typography variant="h6">Deposit Funds</Typography>
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
          label="Amount"
          variant="outlined"
          fullWidth
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={depositFunds} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Deposit'}
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

export default DepositFunds;
