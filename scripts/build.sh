#!/bin/env bash

set -e

echo "Copy files to dist..."
rm -rf ./dist
mkdir dist
cp metadata.json ./dist
cp src/* ./dist
echo "Done."