#!/bin/bash

# USPS LOT NAV V11 Backup Script
# Creates secure MongoDB archive

DATE=$(date +%Y-%m-%d-%H%M)
BACKUP_DIR="/opt/usps-backups"
mkdir -p $BACKUP_DIR

echo "Starting USPS MongoDB backup..."

docker exec usps-mongo mongodump --archive > $BACKUP_DIR/usps-lot-nav-v11-$DATE.archive

echo "Backup complete: $BACKUP_DIR/usps-lot-nav-v11-$DATE.archive"

# OPTIONAL: Sync backup to USPS cloud vault (GovCloud or internal)
# aws s3 cp $BACKUP_DIR/usps-lot-nav-v11-$DATE.archive s3://usps-lot-backups/
