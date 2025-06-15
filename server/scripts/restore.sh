#!/bin/bash

# USPS LOT NAV V11 Restore Script

if [ -z "$1" ]; then
  echo "Usage: restore.sh <backup-file.archive>"
  exit 1
fi

echo "Restoring USPS MongoDB from $1"

docker exec -i usps-mongo mongorestore --archive < $1

echo "Restore complete."
