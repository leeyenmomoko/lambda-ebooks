'use strict';

console.log('Loading function');
const AWS = require("aws-sdk");
const sourceTable = 'ebook-source';
const ebookTable = 'ebooks';

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
  //let dynamo = new doc.DynamoDB();
  let dynamodb = new AWS.DynamoDB.DocumentClient();
  console.log('Received event:', JSON.stringify(event, null, 2));

  let params = {
    TableName: 'ebooks'
  };
  let validFields = {
    "url": 'required',
    "title": '',
    "author": ''
  };

  let operation = (inputs, done) => {
    switch (event.httpMethod) {
      case 'DELETE':
        dynamodb.delete({
          TableName: ebookTable,
          Key: {
            source: inputs.source,
            id: inputs.id
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
            done(null, { message: inputs.source + '-' + inputs.id + ' deleted'});
          }
        });
        break;
      case 'GET':
        dynamodb.get({
          TableName: ebookTable,
          Key: {
            source: inputs.source,
            id: inputs.id,
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
            done(null, data);
          }
        });
        break;
      case 'POST':
        dynamodb.put({
          TableName: ebookTable,
          Item: {
            source: inputs.source,
            id: inputs.id,
            chapter: 0,
            title: inputs.title,
            author: inputs.author,
            status: 'waiting',
            createdAt: new Date().getTime(),
            lastModified: new Date().getTime()
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
            done(null, { message: inputs.source + '-' + inputs.id + ' added' });
          }
        });
        break;
      case 'PUT':
        let params = {
          TableName: ebookTable,
          Key: {
            source: inputs.source,
            id: inputs.id
          },
          AttributeUpdates: {
            status: {
              Value: 'waiting'
            },
            lastModified: {
              Value: new Date().getTime()
            }
          }
        };
        if(typeof inputs.author === 'string'){
          params.AttributeUpdates.author = {
            Value: inputs.author
          };
        }
        if(typeof inputs.title === 'string'){
          params.AttributeUpdates.title = {
            Value: inputs.title
          };
        }

        dynamodb.update(params, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
            done(null, { message: inputs.source + '-' + inputs.id + ' updated' });
          }
        });
        //dynamodb.updateItem(JSON.parse(event.body), done);
        break;
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
  };

  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let regex = /^http:\/\/(ck101)\.com\/thread-([0-9]*)-([0-9]*)-1.html/;
  let regexResult = null;
  let validRequest = true;
  let urlFields = null;
  let inputs = {};

  event.body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  if(event.body && typeof event.body === 'object'){
    console.log('body exist ');
    for(let field in validFields){
      if(validRequest && typeof validFields[field] === 'string'){
        switch(validFields[field]){
          case 'required':
            if(typeof event.body[field] === 'undefined'){
              console.log('require field:' + field + ' not found');
              validRequest = false;
            }
            break;
        }
        if(validRequest){
          inputs[field] = event.body[field];
        }
      }
    }
    if(validRequest){
      urlFields = event.body.url.match(regex);
      if(urlFields.length !== 4){
        validRequest = false
      }
      else{
        inputs['source'] = urlFields[1];
        inputs['id'] = parseInt(urlFields[2], 10);
      }
    }
  }
  else{
    validRequest = false;
  }

  if(validRequest){
    console.log('read source config');
    var sourceParams = {
      TableName: sourceTable,
      Key:{
        "source": inputs.source
      }
    };
    dynamodb.get(sourceParams, function(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      }
      else{
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        operation(inputs, done);
      }
    });

  }
  else{
    done('invalid inputs', '');
  }

};

if (process.argv.length >= 3) {
  AWS.config.update({region: "ap-northeast-1"});
  var credentials = new AWS.SharedIniFileCredentials({profile: 'leeyen'});
  AWS.config.credentials = credentials;
  let event = {
    "httpMethod": process.argv[2],
    "body": {
      "url": "http://ck101.com/thread-3728942-1-1.html",
      "title": "未來天王",
      "author": "陳詞懶調"
    }
  };
  exports.handler(event, '', '');
}
