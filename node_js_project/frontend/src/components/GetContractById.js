// src/components/GetContractById.js
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

function GetContractById({ profileId, setProfileId }) {
  const [contractId, setContractId] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getContractById = async () => {
    if (!profileId || !contractId) {
      setErrorMessage('Please enter both Profile ID and Contract ID.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/contracts/${contractId}`, {
        headers: {
          profile_id: profileId,
        },
      });
      setContract(res.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while fetching the contract.'
      );
      setSnackbarOpen(true);
      setContract(null);
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
      <Typography variant="h6">Get Contract by ID</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Profile ID"
          variant="outlined"
          fullWidth
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        />
        <TextField
          label="Contract ID"
          variant="outlined"
          fullWidth
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={getContractById} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Contract'}
      </Button>
      {contract && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Contract Details:</Typography>
          <pre>{JSON.stringify(contract, null, 2)}</pre>
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

export default GetContractById;
