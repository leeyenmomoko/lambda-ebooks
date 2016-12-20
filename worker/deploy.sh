#!/bin/bash

babel index.es7 -o index.js
src=src
code=$(cat package.json | grep name | cut -d ":" -f2 | tr -d '",' | tr -d ' ')
zip -r -X "src/${code}.zip" --exclude=output/* --exclude=src/* * --exclude=frontend/*
aws lambda update-function-code --function-name ${code} --zip-file "fileb://src/${code}.zip" --profile leeyen