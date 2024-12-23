// src/app.js

const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const { Op, Transaction, fn, col, literal } = require('sequelize');

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Endpoints

// GET /contracts/:id
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const profileId = req.profile.id;
  try {
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
      },
    });
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    res.json(contract);
  } catch (error) {
    console.error('Error in GET /contracts/:id:', error);
    res.status(500).json({ error: 'An error occurred while fetching the contract.' });
  }
});

// GET /contracts
app.get('/contracts', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const profileId = req.profile.id;
  try {
    const contracts = await Contract.findAll({
      where: {
        [Op.and]: [
          { status: { [Op.not]: 'terminated' } },
          {
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
          },
        ],
      },
    });
    res.json(contracts);
  } catch (error) {
    console.error('Error in GET /contracts:', error);
    res.status(500).json({ error: 'An error occurred while fetching contracts.' });
  }
});

// GET /jobs/unpaid
app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get('models');
  const profileId = req.profile.id;
  try {
    const jobs = await Job.findAll({
      where: {
        paid: false,
      },
      include: [
        {
          model: Contract,
          as: 'Contract',
          where: {
            status: 'in_progress',
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
          },
        },
      ],
    });

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'No unpaid jobs found for this profile.' });
    }

    res.json(jobs);
  } catch (error) {
    console.error('Error in GET /jobs/unpaid:', error);
    res.status(500).json({ error: 'An error occurred while fetching unpaid jobs.' });
  }
});

// POST /jobs/:job_id/pay
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const { Job, Contract, Profile } = req.app.get('models');
  const { job_id } = req.params;
  const profileId = req.profile.id;

  // Only clients can pay for jobs
  if (req.profile.type !== 'client') {
    return res.status(403).json({ error: 'Only clients can pay for jobs.' });
  }

  const t = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

  try {
    const job = await Job.findOne({
      where: { id: job_id },
      include: [
        {
          model: Contract,
          as: 'Contract',
          where: {
            ClientId: profileId,
            status: 'in_progress',
          },
          include: [
            {
              model: Profile,
              as: 'Contractor',
            },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!job) {
      await t.rollback();
      return res.status(404).json({ error: 'Job not found or not associated with the client.' });
    }

    if (job.paid) {
      await t.rollback();
      return res.status(400).json({ error: 'Job is already paid.' });
    }

    const client = await Profile.findOne({ where: { id: profileId }, transaction: t, lock: t.LOCK.UPDATE });
    const contractor = job.Contract.Contractor;

    if (client.balance < job.price) {
      await t.rollback();
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    // Update balances
    client.balance -= job.price;
    contractor.balance += job.price;

    // Mark job as paid
    job.paid = true;
    job.paymentDate = new Date();

    // Save changes
    await client.save({ transaction: t });
    await contractor.save({ transaction: t });
    await job.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Payment successful.' });
  } catch (error) {
    await t.rollback();
    console.error('Error in POST /jobs/:job_id/pay:', error);
    res.status(500).json({ error: 'An error occurred while processing the payment.' });
  }
});

// POST /balances/deposit/:userId
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
  const { Job, Contract, Profile } = req.app.get('models');
  const { userId } = req.params;
  const { amount } = req.body;

  // Only clients can deposit into their own account
  if (req.profile.type !== 'client') {
    return res.status(403).json({ error: 'Only clients can deposit into their account.' });
  }

  if (req.profile.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'You can only deposit into your own account.' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be greater than zero.' });
  }

  const t = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE });

  try {
    const client = await Profile.findOne({ where: { id: userId }, transaction: t, lock: t.LOCK.UPDATE });

    if (!client) {
      await t.rollback();
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Calculate total unpaid jobs to pay
    const unpaidJobs = await Job.findAll({
      where: { paid: false },
      include: [
        {
          model: Contract,
          as: 'Contract',
          where: {
            ClientId: userId,
            status: 'in_progress',
          },
        },
      ],
      transaction: t,
    });

    const totalToPay = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
    const maxDeposit = totalToPay * 0.25;

    if (amount > maxDeposit) {
      await t.rollback();
      return res.status(400).json({
        error: `Deposit amount exceeds the maximum allowed (${maxDeposit}).`,
      });
    }

    client.balance += amount;
    await client.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Deposit successful.', balance: client.balance });
  } catch (error) {
    await t.rollback();
    console.error('Error in POST /balances/deposit/:userId:', error);
    res.status(500).json({ error: 'An error occurred while processing the deposit.' });
  }
});

// GET /admin/best-profession
app.get('/admin/best-profession', async (req, res) => {
  const { Job, Contract, Profile } = req.app.get('models');
  const { start, end } = req.query;

  try {
    // Validate start and end dates
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required.' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ error: 'Start date must be before end date.' });
    }

    const result = await Job.findAll({
      attributes: [
        [col('Contract.Contractor.profession'), 'profession'],
        [fn('sum', col('price')), 'total_earned'],
      ],
      where: {
        paid: true,
        paymentDate: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: Contract,
          as: 'Contract',
          attributes: [],
          include: [
            {
              model: Profile,
              as: 'Contractor',
              attributes: [],
            },
          ],
        },
      ],
      group: ['Contract.Contractor.profession'],
      order: [[literal('total_earned'), 'DESC']],
      limit: 1,
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No data found for the given date range.' });
    }

    res.json({
      profession: result[0].dataValues.profession,
      total_earned: parseFloat(result[0].dataValues.total_earned),
    });
  } catch (error) {
    console.error('Error in GET /admin/best-profession:', error);
    res.status(500).json({ error: 'An error occurred while fetching the best profession.' });
  }
});

// GET /admin/best-clients
app.get('/admin/best-clients', async (req, res) => {
  const { Job, Contract, Profile } = req.app.get('models');
  let { start, end, limit = 2 } = req.query;

  try {
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required.' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ error: 'Start date must be before end date.' });
    }

    limit = parseInt(limit);
    if (isNaN(limit) || limit <= 0) {
      limit = 2; // Default limit
    }

    const clients = await Job.findAll({
      attributes: [
        [col('Contract.Client.id'), 'id'],
        [fn('sum', col('price')), 'paid'],
        [fn('concat', col('Contract.Client.firstName'), ' ', col('Contract.Client.lastName')), 'fullName'],
      ],
      where: {
        paid: true,
        paymentDate: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: Contract,
          as: 'Contract',
          attributes: [],
          include: [
            {
              model: Profile,
              as: 'Client',
              attributes: [],
            },
          ],
        },
      ],
      group: ['Contract.Client.id'],
      order: [[literal('paid'), 'DESC']],
      limit: limit,
    });

    if (clients.length === 0) {
      return res.status(404).json({ error: 'No data found for the given date range.' });
    }

    const formattedClients = clients.map((client) => ({
      id: client.dataValues.id,
      fullName: client.dataValues.fullName,
      paid: parseFloat(client.dataValues.paid),
    }));

    res.json(formattedClients);
  } catch (error) {
    console.error('Error in GET /admin/best-clients:', error);
    res.status(500).json({ error: 'An error occurred while fetching the best clients.' });
  }
});

module.exports = app;
