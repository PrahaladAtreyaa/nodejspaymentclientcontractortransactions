// src/components/GetContracts.js
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

function GetContracts({ profileId, setProfileId }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getContracts = async () => {
    if (!profileId) {
      setErrorMessage('Please enter your Profile ID.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/contracts', {
        headers: {
          profile_id: profileId,
        },
      });
      setContracts(res.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while fetching contracts.'
      );
      setSnackbarOpen(true);
      setContracts([]);
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
      <Typography variant="h6">Get Non-Terminated Contracts</Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        label="Profile ID"
        variant="outlined"
        fullWidth
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={getContracts} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Contracts'}
      </Button>
      {contracts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Contracts:</Typography>
          <pre>{JSON.stringify(contracts, null, 2)}</pre>
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

export default GetContracts;
