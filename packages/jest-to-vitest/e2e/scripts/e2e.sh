#!/bin/bash

set -eu

# Basic use cases
yarn ts-node --project ./packages/jest-to-vitest/tsconfig.e2e.json ./packages/jest-to-vitest/src/bin.ts "**/*.jest.ts"
