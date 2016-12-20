#!/bin/bash

src=src
code=$(cat package.json | grep name | cut -d ":" -f2 | tr -d '",' | tr -d ' ')
zip -r -X "src/${code}.zip"
aws lambda update-function-code --function-name "${code}" --zip-file "fileb://src/${code}.zip" --profile leeyen

aws s3 sync --exclude .DS_Store frontend s3://leeyen-ebooks/ --profile leeyen