envfile := ./.env

.PHONY: help start start-no-webhooks debug sql logs stop clear-db test

# help target adapted from https://gist.github.com/prwhite/8168133#gistcomment-2278355
TARGET_MAX_CHAR_NUM=20

## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk '/^[a-zA-Z_0-9-]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")-1); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "  %-$(TARGET_MAX_CHAR_NUM)s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Build the services
build:
	docker-compose build

## Start the services
start: $(envfile)
	docker-compose up

## Shell into the main service 
sh:
	docker-compose exec main sh

## Run database migrations
sync:
	docker-compose exec main npm run typeorm:sync

## Run seed data
seed:
	docker-compose exec main npm run seed

## Restart the main service
restart-main:
	docker-compose restart main

## Stop all services
stop:
	docker-compose down

## Run end2end tests
test:
	docker-compose exec main npm run test:e2e

$(envfile):
	@echo "Error: .env file does not exist! See the README for instructions."
	@exit 1