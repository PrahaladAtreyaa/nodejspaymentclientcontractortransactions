// src/components/GetUnpaidJobs.js
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

function GetUnpaidJobs({ profileId, setProfileId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getUnpaidJobs = async () => {
    if (!profileId) {
      setErrorMessage('Please enter your Profile ID.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/jobs/unpaid', {
        headers: {
          profile_id: profileId,
        },
      });
      setJobs(res.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while fetching unpaid jobs.'
      );
      setSnackbarOpen(true);
      setJobs([]);
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
      <Typography variant="h6">Get Unpaid Jobs</Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        label="Profile ID"
        variant="outlined"
        fullWidth
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={getUnpaidJobs} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Get Unpaid Jobs'}
      </Button>
      {jobs.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Unpaid Jobs:</Typography>
          <pre>{JSON.stringify(jobs, null, 2)}</pre>
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

export default GetUnpaidJobs;
