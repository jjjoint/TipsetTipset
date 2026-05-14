# CLAUDE.md

## Project

Build a local-only MVP web app for Swedish Stryktipset analysis.

The app helps the user analyze weekly Stryktipset rounds using football statistics, odds, public pick percentages, Bayesian/statistical modeling, simulations, backtesting, and system generation.

The app must never submit bets automatically.

## Language

Use English for code, comments, commits, technical docs, and internal architecture.

All user-facing UI text must be in Swedish.

## Stack

Use this stack unless there is a strong technical reason not to:

- Monorepo
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Prisma
- SQLite for local MVP
- pnpm
- Vitest
- Playwright when useful
- Python is allowed for statistical modeling, simulation, and backtesting when it improves correctness or clarity.

## Working Style

Act as a senior fullstack engineer, data engineer, and probabilistic modeler.

Make progress without asking unnecessary questions.

Large refactors are allowed when they improve architecture, testability, or maintainability.

Install packages freely when useful, but keep dependencies reasonable and documented.

Prefer simple, working implementations over speculative complexity, but the probability model must be real, testable, and not just mocked.

## Product Scope

The MVP must support:

- Weekly Stryktipset round view with 13 matches
- Model probabilities for 1, X, 2
- Public pick percentages
- Value score comparing model probability vs public pick percentage
- Spik, halvgardering, helgardering, and skrälldrag recommendations
- Budget-based system generation
- Simulation for 10, 11, 12, and 13 correct
- Historical backtesting when imported historical data exists
- Clear display of data source status: live, imported, mock, or missing

## Betting and Safety Rules

Do not implement automatic bet placement.

Do not log in to Svenska Spel or any betting operator.

Do not bypass captchas, paywalls, rate limits, robots rules, API restrictions, or terms of service.

Scraping is allowed only for public pages where it is legally and technically reasonable.

When a source is uncertain, unstable, or unavailable, create an adapter interface and use mock/imported data.

## Data Architecture

All external data must go through adapters.

Create adapters for:

- Svenska Spel round data and public pick percentages
- Odds data
- Football statistics
- Historical Stryktipset results
- Manual JSON/CSV imports

Never hardcode external data directly into UI components.

Use seed data for local development.

## Modeling Rules

Implement a real probability model.

Minimum model requirements:

- Normalize odds and remove overround when odds exist
- Use priors from team strength, league baseline, home advantage, and form where available
- Use Bayesian updating when combining signals
- Include a Poisson or Dixon-Coles-inspired goal model when practical
- Produce probabilities for 1, X, 2 that sum to 1
- Estimate uncertainty or confidence per match
- Calculate value score from model probability and public pick percentage
- Support Monte Carlo simulation for generated systems

Document assumptions in code or docs when they affect results.

## MCP and Connectors

If MCP/connectors are available, inspect them before using.

Use only trusted MCP/connectors.

Allowed connector use:

- filesystem
- git
- GitHub
- browser/fetch for public documentation or public data verification
- database tools for local development
- Playwright for local testing

Do not install or use unknown MCP servers without documenting why.

Do not use MCP tools to bypass access controls.

## Repository Structure

Prefer this structure:

```txt
apps/web
packages/core
packages/data-adapters
packages/model
packages/backtest
packages/db
docs
```
