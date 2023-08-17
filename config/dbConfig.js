const config = {
    server: 'db-machine.cdybctdocolr.us-east-2.rds.amazonaws.com',
    database: 'dummy',
    user: 'dummy_account',
    password: 'wk8MfB',
    options: {
      encrypt: true, // Required for secure connections
      trustServerCertificate: true // For self-signed certificates
    }
  };
  
  module.exports = config;
  