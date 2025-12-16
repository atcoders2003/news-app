#!/bin/sh
set -e
cd ..
npm ci
npm run build
rm -rf src/dist || true
cp -r dist src/dist
