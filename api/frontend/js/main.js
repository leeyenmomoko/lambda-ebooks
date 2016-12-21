console.log('main');

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'ap-northeast-1'; // Region

var authenticationData = {
    Username : 'leeyen',
    Password : 'Valenhsu0307',
};
var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
var poolData = {
  UserPoolId : 'ap-northeast-1_3DBv3cgQp',
  ClientId : '4bl1bfpgrbcd0v9qpjjfpuoje2'
};
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
var userData = {
    Username : 'leeyen',
    Pool : userPool
};
var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

cognitoUser.authenticateUser(authenticationDetails, {
  onSuccess: function (result) {
    console.log(result);
    // User authentication was successful
    var apigClient = apigClientFactory.newClient();
    var params = {
      // This is where any modeled request parameters should be added.
      // The key is the parameter name, as it is defined in the API in API Gateway.
      // param0: '',
      // param1: ''
    };

    var body = {
      // This is where you define the body of the request,
      "url": "http://ck101.com/thread-3728942-1-1.html",
      "title": "未來天王",
      "author": "陳詞懶調"
    };

    var additionalParams = {
      // If there are any unmodeled query parameters or headers that must be
      //   sent with the request, add them here.
      headers: {
        // param0: '',
        // param1: ''
      },
      queryParams: {
        // param0: '',
        // param1: ''
      }
    };

    apigClient.ebookAPIPost(params, body, additionalParams)
    .then(function(result){
      console.log(result);
      // Add success callback code here.
    }).catch( function(result){
      // Add error callback code here.
    });
  },

  onFailure: function(err) {
    // User authentication was not successful
  },

  mfaRequired: function(codeDeliveryDetails) {
    // MFA is required to complete user authentication.
    // Get the code from user and call
    cognitoUser.sendMFACode(mfaCode, this);
  },

  newPasswordRequired: function(userAttributes, requiredAttributes) {
    // User was signed up by an admin and must provide new
    // password and required attributes, if any, to complete
    // authentication.

    // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user.
    // Required attributes according to schema, which don’t have any values yet, will have blank values.
    // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.

    var attributesData = {
      nickname: 'YenZ'
    };
    // Get these details and call
    // newPassword: password that user has given
    // attributesData: object with key as attribute name and value that the user has given.
    cognitoUser.completeNewPasswordChallenge('Valenhsu0307', attributesData, this);
  }
});