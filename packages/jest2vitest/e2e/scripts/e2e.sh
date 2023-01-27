#!/bin/bash

set -eu

# Basic use cases
yarn ts-node --project ./packages/jest2vitest/tsconfig.e2e.json ./packages/jest2vitest/src/bin.ts "**/*.jest.ts"
