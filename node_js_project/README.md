# BACKEND PROJECT

💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API.

## Data Models

> **All models are defined in src/model.js**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize.

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.

- The server is running on port 3001.

## APIs To Implement

Below is a list of the API's for the application.

1. **_GET_** `/contracts/:id` - Return the contract only if it belongs to the profile calling.

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Local setup - Windows


Windows - local machine

To seed DB:

0. Open first cmd  terminal from root folder.

1. In the repo root directory, run `npm install` to gather all dependencies.

2. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

For backend from root folder run the following commands:

1. npm install - this will install back end dependencies and create a package-lock.json file and create node_modules with downloaded dependencies

2. npm start - starts back end serve express jsr

Open a second cmd terminal from front end folder

For frontend from front end folder run the following commands:

1. npm install -  this will install front end dependencies and create a package-lock.json file and create node_modules with downloaded dependencies inside frontend folder

2. npm start - starts front end react server


Open a third cmd terminal from scripts folder

npm run seed - populates db with seedDb.js data

## Run in local

1. Swagger UI: http://localhost:3001/api-docs/

2. Deel front end: http://localhost:3000/

3. To stop run: npx kill-port 3000, npx kill-port 3001

## Testing

1. Please refer to Testing_API_Screenshots folder.

2. Unit_Tests_Pass.PNG - Unit tests run screenshot -

3. Frond_End.PNG - front end contains dropdown to select the api we want to use.

4. APIs:

   a. Get_contract_by_id - success, error, and contract not found cases.
   b. Get_Non_Terminated_Contracts - success,success_multiple_contracts, unauthorized
   c. Get_Unpaid_Jobs - Error_No_Unpaid_Jobs, Success
   d. Pay_For_A_Job - Input_errors, Input_Errors_Job_Not_Found_Or_Associated_With_Client, Input_Error_Job_Already_Paid, Payment_Success_For_Unpaid_Job
   e. Deposit_Funds - Deposit_Successful, Deposit_Not_Allowed
   f. Admin_Get_Best_Profession - Input_Date_errors,Success
   g. Admin_Get_Best_Clients - Success, Input_Date_Errors, Date_range_errors
