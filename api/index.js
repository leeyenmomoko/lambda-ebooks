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
  //console.log('Received event:', JSON.stringify(event, null, 2));

  let params = {
    TableName: 'ebooks'
  };
  let validFields = {
    "url": 'required',
    "title": 'required',
    "author": 'required'
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
  if(event.body){
    for(let field in validFields){
      if(validRequest && validFields[field] === 'required' && typeof event.body[field] === 'undefined'){
        validRequest = false;
      }
    }
    if(validRequest){
      urlFields = event.body.url.match(regex);
      if(urlFields.length !== 4){
        validRequest = false
      }
    }
  }
  else{
    validRequest = false;
  }

  if(validRequest){
    var sourceParams = {
      TableName: sourceTable,
      Key:{
        "source": urlFields[1]
      }
    };
    dynamodb.get(sourceParams, function(err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      }
      else{
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      }
    });
    switch (event.httpMethod) {
      case 'DELETE':
        dynamodb.delete({
          TableName: ebookTable,
          Key: {
            source: urlFields[1],
            id: parseInt(urlFields[2], 10)
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
          }
        });
        break;
      case 'GET':
        dynamodb.get({
          TableName: ebookTable,
          Key: {
            source: urlFields[1],
            id: parseInt(urlFields[2], 10),
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
          }
        });
        break;
      case 'POST':
        dynamodb.put({
          TableName: ebookTable,
          Item: {
            source: urlFields[1],
            id: parseInt(urlFields[2], 10),
            chapter: 0,
            title: event.body.title,
            author: event.body.author,
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
          }
        });
        break;
      case 'PUT':
        dynamodb.update({
          TableName: ebookTable,
          Key: {
            source: urlFields[1],
            id: parseInt(urlFields[2], 10)
          },
          AttributeUpdates: {
            status: {
              Value: 'waiting'
            },
            lastModified: {
              Value: new Date().getTime()
            }
          }
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
          else{
            console.log(data);
          }
        });
        //dynamodb.updateItem(JSON.parse(event.body), done);
        break;
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
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
