# IloviaCapital Frontend

React + Tailwind CSS frontend for the IloviaCapital member portal.

## Setup

```bash
npm install
npm run dev
```

Make sure the backend is running at `http://localhost:5000`.

## Features

- **Member Portal**: Dashboard, Transactions, Loans, Account, Messages
- **Admin Panel**: Overview, Loan Management, Member List
- **Auth**: Login, Register, PIN Change
- **Transactions**: Deposit, Withdraw, Bank Transfer, Airtime, Utility Payments
- **Loans**: Apply, Track, Repay, Guarantor Requests

## Folder Structure

```
src/
  api/         - Axios instance + API service functions
  components/
    layout/    - Sidebar, Header, DashboardLayout
    ui/        - StatCard, Modal, Badge, etc.
  context/     - AuthContext
  pages/
    auth/      - Login, Register
    dashboard/ - Home dashboard
    transactions/
    loans/
    account/
    messages/
    admin/     - Admin overview, loan management
```
