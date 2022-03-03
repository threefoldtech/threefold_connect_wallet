#!/bin/bash

echo "Starting up..."
echo "flagsmith env key : $FLAGSMITH_ENVIROMENT_KEY"


nginx -g 'daemon off;' &
# Start the first process
node /app/apps/backend/src/index.js &


# Start the second process

#nginx -t &

# Wait for any process to exit
wait -n
echo "oh no"
# Exit with status of process that exited first
exit $?
