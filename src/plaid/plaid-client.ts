import * as plaid from 'plaid';

const client = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret:
    process.env.PLAID_ENV === 'development'
      ? process.env.PLAID_SECRET_DEVELOPMENT
      : process.env.PLAID_SECRET_SANDBOX,
  env: plaid.environments[process.env.PLAID_ENV],
  options: {
    version: '2019-05-29',
  },
});

export default client;
