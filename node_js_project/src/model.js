const { Sequelize, Model } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

class Profile extends Model {}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
    },
  },
  {
    sequelize,
    modelName: 'Profile',
  }
);

class Contract extends Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  }
);

class Job extends Model {}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  }
);

Profile.hasMany(Contract, { as: 'ContractsAsContractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor', foreignKey: 'ContractorId' });
Profile.hasMany(Contract, { as: 'ContractsAsClient', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client', foreignKey: 'ClientId' });
Contract.hasMany(Job, { as: 'Jobs' });
Job.belongsTo(Contract, { as: 'Contract', foreignKey: 'ContractId' });

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
