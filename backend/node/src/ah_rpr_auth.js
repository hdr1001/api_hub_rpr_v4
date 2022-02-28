// *********************************************************************
//
// API Hub request, persist and respond authentication tokens
// JavaScript code file: ah_rpr_auth.js
//
// Copyright 2022 Hans de Rooij
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, 
// software distributed under the License is distributed on an 
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
// either express or implied. See the License for the specific 
// language governing permissions and limitations under the 
// License.
//
// *********************************************************************

import getHttpRespPromise from './ah_rpr_http.js';

function getBase64EncCredentials() {
   return Buffer.from(process.env.DNB_DPL_KEY + ':' + process.env.DNB_DPL_SECRET).toString('Base64')
}

const ahReq = {
   http: {
      method: 'POST',
      host: 'plus.dnb.com',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': 'Basic ' + getBase64EncCredentials()
      },
      path: '/v2/token'
   },
   body: '{ "grant_type": "client_credentials" }'
};

export default class DplAuthToken { 
   constructor() {
      getHttpRespPromise(ahReq.http, ahReq.body)
         .then(apiResp => {
            console.log('Successfully retrieved a new token');

            const oRespBody = JSON.parse(apiResp.body);

            this.authToken = oRespBody.access_token;
            this.expiresIn = oRespBody.expiresIn;
         })
         .catch(err => console.log(err));
   }

   toString() {
      if(!this.authToken) {
         return ''
      }
      else {
         return 'Bearer ' + this.authToken;
      }
   }
}
