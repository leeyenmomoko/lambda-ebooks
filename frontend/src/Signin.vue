<template>
  <div class="container">
    <form>
      <div class="form-group row">
        <label for="username" class="offset-sm-1 col-sm-2 col-form-label">Username</label>
        <div class="col-sm-8">
          <input v-model="username" type="text" class="form-control" id="username" placeholder="Username">
        </div>
      </div>
      <div class="form-group row">
        <label for="inputPassword3" class="offset-sm-1 col-sm-2 col-form-label">Password</label>
        <div class="col-sm-8">
          <input v-model="password" type="password" class="form-control" id="inputPassword3" placeholder="Password">
        </div>
      </div>
      <div class="form-group row">
        <div class="offset-sm-3 col-sm-8">
          <button v-on:click="signin()" type="submit" class="btn btn-primary">Sign in</button>
        </div>
      </div>
    </form>

    <modal v-if="showModal" @close="showModal = false">
      <h3 slot="header">Change your password</h3>
      <form slot="body">
        <div class="form-group row">
          <label for="nickName" class="offset-sm-1 col-sm-4 col-form-label">Nick name</label>
          <div class="col-sm-6">
            <input v-model="nickName" type="text" class="form-control" id="nickName" placeholder="Nick name">
          </div>
        </div>
        <div class="form-group row">
          <label for="newPassword" class="offset-sm-1 col-sm-4 col-form-label">New Password</label>
          <div class="col-sm-6">
            <input v-model="newPassword" type="password" class="form-control" id="newPassword" placeholder="New password">
          </div>
        </div>
        <div class="form-group row">
          <div class="offset-sm-3 col-sm-8">
            <button v-on:click="changeNewPassword()" type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </form>
    </modal>
  </div>
</template>
<script>
module.exports = {
  data: function(){
    var data = {
      signined: null,
      username: '',
      password: '',
      newPassword: '',
      showModal: false,
      cognitoUser: null,
      cognitoUserPool: null,
    };
    AWS.config.region = 'ap-northeast-1'; // Region
    var poolData = {
      UserPoolId : 'ap-northeast-1_BatBeM5ST',
      ClientId : '2plkvul3157upvcuq8vob7rc4t'
    };
    data.cognitoUserPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    data.cognitoUser = data.cognitoUserPool.getCurrentUser();

    if(data.cognitoUser != null) {
      data.cognitoUser.getSession(function(err, session) {
        if (err) {
          alert(err);
          return;
        }
        console.log('session validity: ' + session.isValid());
        if(session.isValid()){
          data.signined = true;
        }
      });
    }

    return data;
  },
  methods: {
    signin(){
      var _this = this;

      var authenticationData = {
          Username : this.username,
          Password : this.password,
      };
      var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
      var userData = {
          Username : this.username,
          Pool : this.cognitoUserPool
      };

      this.cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
      this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          console.log(result);
          // User authentication was successful
          _this.saveToken(result);
        },

        onFailure: function(err) {
          // User authentication was not successful
        },

        mfaRequired: function(codeDeliveryDetails) {
          // MFA is required to complete user authentication.
          // Get the code from user and call
          _this.cognitoUser.sendMFACode(_this.mfaCode, this);
        },

        newPasswordRequired: function(userAttributes, requiredAttributes) {
          console.log('newPassword');
          _this.showModal = true;
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user.
          // Required attributes according to schema, which don’t have any values yet, will have blank values.
          // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.

          // var attributesData = {
          //   nickname: 'YenZ'
          // };
          // Get these details and call NfrGDyKU8wXcyeaZwzNJjsbV
          // newPassword: password that user has given
          // attributesData: object with key as attribute name and value that the user has given.
          //cognitoUser.completeNewPasswordChallenge('Valenhsu0307', attributesData, this);
        }
      });
    },
    changeNewPassword(){
      var attributesData = {};
      this.cognitoUser.completeNewPasswordChallenge(this.newPassword, attributesData, {
        onSuccess: function(result){
          console.log(result);
          this.saveToken(result);
        },
        onFailure: function(err) {
          alert(err.message);
          console.log(err);
          // User authentication was not successful
        }
      });
    },
    saveToken(AuthenticationData){
      AuthenticationData.expire = new Date(new Date().getTime() + AuthenticationData.AuthenticationResult.ExpiresIn *1000);
      if(typeof Storage !== 'undefined'){
        localStorage.setItem('Authentication', JSON.stringify(AuthenticationData));
      }
      else{
        console.log('Storage not supported.');
      }
    },
    getToken(){
      if(typeof Storage !== 'undefined'){
        var Authentication = localStorage.getItem('Authentication');
        if(Authentication){
          this.Authentication = JSON.parse(Authentication);
        }
      }
      else{
        console.log('Storage not supported.');
      }
    },
    ebook(){
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
          "Authorization": result.idToken.jwtToken
          // param0: '',
          // param1: ''
        },
        queryParams: {
          // param0: '',
          // param1: ''
        }
      };

      // apigClient.ebookAPIGet(params, body, additionalParams)
      // .then(function(result){
      //   console.log(result);
      //   // Add success callback code here.
      // }).catch( function(result){
      //   // Add error callback code here.
      // });
    }
  }
};
</script>