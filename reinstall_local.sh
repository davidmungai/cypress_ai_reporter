#!/bin/bash
set -e

# Ensure we are in the directory where the script is located
cd "$(dirname "$0")"

echo "Building cypress-ai-reporter..."
cd cypress_ai_reporter
npm run build
npm pack
PACKAGE_FILE=$(ls cypress-ai-reporter-*.tgz)
echo "Packed: $PACKAGE_FILE"

echo "Installing in example project..."
cd ../example
npm install "../cypress_ai_reporter/$PACKAGE_FILE"

echo "Done! Package rebuilt and reinstalled."
