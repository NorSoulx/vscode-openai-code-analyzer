#!/bin/bash

# Check if OPENAI_API_KEY is set, warn and abort if not
if [[ -z "${OPENAI_API_KEY}" ]]; then
  echo "Error: OPENAI_API_KEY environment variable is not set."
  echo "Please set the OPENAI_API_KEY environment variable and try again."
  exit 1
fi

docker build --build-arg OPENAI_API_KEY=$OPENAI_API_KEY -t vscode-openai-code-analyzer .
