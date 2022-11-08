#!/bin/bash

set -e

if [ "$NODE_ENV" == 'development' ]; then
	npm run typeorm:sync
elif [ "$NODE_ENV" == 'production' ]; then
	npm run typeorm:run
else
	true
fi
