# 🚀 Trade Desk Lite - Automation Framework

An enterprise-grade BDD automation framework built with **Playwright**, **Cucumber**, and **TypeScript**. 
It features a Hybrid testing architecture, multi-role authentication, and dynamic data generation.

## 📋 Prerequisites
* **Node.js**: We use the version specified in the `.nvmrc` file.
* **Practice App**: The application under test must be running. Navigate to the `practice-app/` folder next to this framework and start it!

## 🛠️ Setup & Installation
1. Install all dependencies:
    bash
    ```npm install```
2. Set up your environment variables:
   * Copy `env/.env.example` to create `env/.env.dev` and `env/.env.qa`.
   * Add the required URLs (e.g., `BASE_URL=http://localhost:3100`).

## 🔐 Authentication
Before running the tests, you must generate the session cookies for the Trader and Approver roles. Ensure the backend is running, then execute: 
  bash
  ```make auth```
*(This generates the role sessions inside the `auth/` folder).*

## 🧪 Running the Tests
We use a `Makefile` to make execution incredibly simple! By default, tests run against `dev`.

* **Run Smoke Tests:** `make test-smoke`
* **Run UI Tests:** `make test-ui`
* **Run API Tests:** `make test-api`
* **Run CI Suite (Skips @wip):** `make test-ci`
* **Run against QA environment:** `make test ENV=qa TAGS=@hybrid`

## 📊 Viewing Results
After a test run, our framework automatically generates rich HTML reports.
Open this file in your browser to view screenshots of any failures:
👉 `reports/cucumber-report.html`

## 🏗️ Architecture (Writing Tests)
1. **Features (`features/`)**: BDD Scenarios tagged with roles (e.g., `@as-trader`).
2. **Steps (`src/steps/`)**: Thin glue code. No locators here!
3. **Actions (`src/actions/`)**: Reusable business flows (e.g., `OrderActions.placeOrder()`).
4. **Pages (`src/pages/`)**: Strict Playwright Web-First locators and UI interactions.
5. **Data (`src/data/`)**: Dynamic `DataFactory` for JSON generation.
