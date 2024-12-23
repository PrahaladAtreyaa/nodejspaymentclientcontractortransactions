// src/App.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Box,
  Paper,
} from '@mui/material';
import GetContractById from './components/GetContractById';
import GetContracts from './components/GetContracts';
import GetUnpaidJobs from './components/GetUnpaidJobs';
import PayForJob from './components/PayForJob';
import DepositFunds from './components/DepositFunds';
import AdminBestProfession from './components/AdminBestProfession';
import AdminBestClients from './components/AdminBestClients';

function App() {
  const [selectedApi, setSelectedApi] = useState('');
  const [profileId, setProfileId] = useState('');

  const handleApiChange = (event) => {
    setSelectedApi(event.target.value);
  };

  const renderApiComponent = () => {
    switch (selectedApi) {
      case 'GetContractById':
        return <GetContractById profileId={profileId} setProfileId={setProfileId} />;
      case 'GetContracts':
        return <GetContracts profileId={profileId} setProfileId={setProfileId} />;
      case 'GetUnpaidJobs':
        return <GetUnpaidJobs profileId={profileId} setProfileId={setProfileId} />;
      case 'PayForJob':
        return <PayForJob profileId={profileId} setProfileId={setProfileId} />;
      case 'DepositFunds':
        return <DepositFunds profileId={profileId} setProfileId={setProfileId} />;
      case 'AdminBestProfession':
        return <AdminBestProfession />;
      case 'AdminBestClients':
        return <AdminBestClients />;
      default:
        return (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Please select an API from the dropdown menu.
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 4 }}>
        Deel API Frontend
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="api-select-label">Select API</InputLabel>
          <Select
            labelId="api-select-label"
            value={selectedApi}
            label="Select API"
            onChange={handleApiChange}
          >
            <MenuItem value="GetContractById">Get Contract by ID</MenuItem>
            <MenuItem value="GetContracts">Get Non-Terminated Contracts</MenuItem>
            <MenuItem value="GetUnpaidJobs">Get Unpaid Jobs</MenuItem>
            <MenuItem value="PayForJob">Pay for a Job</MenuItem>
            <MenuItem value="DepositFunds">Deposit Funds</MenuItem>
            <MenuItem value="AdminBestProfession">Admin - Get Best Profession</MenuItem>
            <MenuItem value="AdminBestClients">Admin - Get Best Clients</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 4 }}>{renderApiComponent()}</Box>
      </Paper>
    </Container>
  );
}

export default App;
