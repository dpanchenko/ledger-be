# Template Serive

## Description

Example of regular service

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
$ npm run start:dev
```

## Running the app in docker

Run application locally fully in docker with all env
```bash
# development and watch mode
$ npm run docker:local
```

## Test

```bash
# unit tests
$ npm run test:unit
```

Serve `http://localhost:8080/swagger`
