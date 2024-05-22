# Basic Multi-Currency Ledger Service

## Description

This is a basic, multi-currency ledger service. The ledger service has the ability to create ledgers, create transactions (debit/credit), record the balance, and return the balance.

## Installation

```bash
$ npm install
```

## Running the app locally

Create .env file based on .env.example and update `.env` with proper values

```bash
cp .env.example .env
```

Run application locally
```bash
# development and watch mode
$ npm run start:api:dev
$ npm run start:processing:dev

```

## Running the app in docker

Run application locally fully in docker with all env
```bash
# development and watch mode
$ docker compose up
```

Serve `http://localhost:8080/swagger`
