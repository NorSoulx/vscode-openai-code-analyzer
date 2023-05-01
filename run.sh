#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Clone the repository
git clone https://github.com/NorSoulx/vscode-openai-code-analyzer.git

# Change to the repository directory
cd vscode-openai-code-analyzer

# Install dependencies and run the package and test scripts
npm install
npm run package
npm test

# Print a message if the tests were successful
echo "The 'npm test' was successful."

