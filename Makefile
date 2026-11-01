.PHONY: app auth test-ui test-api test test-smoke test-regression test-ci

# Default to dev if they just type `make test` without an ENV
ENV ?= dev

app:
	@echo "Trade Desk Lite app is managed in the practice-app folder!"

auth:
	ENV=$(ENV) npm run auth:save

test-ui:
	ENV=$(ENV) npm run test -- --tags "@ui"

test-api:
	ENV=$(ENV) npm run test -- --tags "@api"

# NEW: Profile-driven shortcuts!
test-smoke:
	ENV=$(ENV) npm run test -- -p smoke

test-regression:
	ENV=$(ENV) npm run test -- -p regression

test-ci:
	ENV=$(ENV) npm run test -- -p ci

test:
ifdef TAGS
	ENV=$(ENV) npm run test -- --tags "$(TAGS)"
else
	ENV=$(ENV) npm run test
endif