'use strict';

console.log('Loading function');
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

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

    switch (event.httpMethod) {
      case 'DELETE':
        dynamo.deleteItem(JSON.parse(event.body), done);
        break;
      case 'GET':
        dynamo.scan(params, done);
        break;
      case 'POST':
        let validRequest = true;
        if(event.body){
          for(field in validFields){
            if(validRequest && validFields[field] === 'required' && typeof event.body[field] === 'undefined'){
              validRequest = false;
            }
          }
        }
        else{
          validRequest = false;
        }

        if(validRequest){
          // http://ck101.com/thread-1321314-1-1.html
          let regex = /^http:\/\/(ck101)\.com\/thread-([0-9]*)-1-1.html/;
          dynamo.putItem(JSON.parse(event.body), done);
        }
        else{
          done('invalid inputs', '');
        }
        break;
      case 'PUT':
        dynamo.updateItem(JSON.parse(event.body), done);
        break;
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
  };
