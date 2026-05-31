# Loan Management System

A role-based Loan Management System developed using Next.js, Express.js, TypeScript, and MongoDB. The system manages the complete loan lifecycle from application submission to repayment collection through separate operational modules.

## Overview

The application follows a workflow where a borrower submits a loan application along with a salary slip. The application then moves through different stages handled by dedicated roles such as Sales, Sanction, Disbursement, and Collection. An Admin role has access to all modules and can monitor the overall system.

## Features

### Borrower

* Register and login
* Apply for a loan
* Upload salary slips
* View submitted loan applications

### Sales

* View incoming loan leads

### Sanction

* Review loan applications
* Approve or reject applications
* View uploaded salary slips

### Disbursement

* View approved loans
* Record loan disbursement details

### Collection

* View disbursed loans
* Record repayments using UTR numbers
* View payment history
* Track outstanding loan amounts

### Admin

* Access all modules
* Monitor loans across all stages

## Technology Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS

Backend:

* Express.js
* TypeScript
* JWT Authentication
* Role Based Access Control (RBAC)
* Multer

Database:

* MongoDB Atlas

## Default Accounts

The project includes seeded accounts for testing purposes.

Admin:
[admin@lms.com](mailto:admin@lms.com) / Admin@123

Sales:
[sales@lms.com](mailto:sales@lms.com) / Sales@123

Sanction:
[sanction@lms.com](mailto:sanction@lms.com) / Sanction@123

Disbursement:
[disbursement@lms.com](mailto:disbursement@lms.com) / Disbursement@123

Collection:
[collection@lms.com](mailto:collection@lms.com) / Collection@123

Borrower:
[borrower@lms.com](mailto:borrower@lms.com) / Borrower@123

## Project Structure

```text
LMS
├── backend
├── frontend
└── README.md
```

## Running the Project

Clone the repository and install dependencies for both frontend and backend.

Backend:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:8000
```

Frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

Copy the provided example file and create a `.env` file inside the backend directory.

```bash
cp .env.example .env
```

Update the values according to your local setup before starting the server.

## File Uploads

Salary slips are stored locally in:

```text
backend/public/uploads/salary-slips
```

Supported file types:

* PDF
* JPG
* PNG

Maximum file size:

* 5 MB

## Loan Workflow

Loan Application

→ Sales Review

→ Sanction Approval

→ Disbursement

→ Collection

→ Loan Closure

## Notes

This project was developed as part of an assignment to demonstrate authentication, role-based access control, loan processing workflows, file uploads, and payment tracking using a full-stack application.

## Live demo

Live application: https://lms-gold-kappa.vercel.app/

## Project walkthrough video

Video explanation: [ADD_VIDEO_LINK_HERE]
