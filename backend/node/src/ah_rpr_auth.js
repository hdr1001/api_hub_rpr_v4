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

export default function dplAuthToken() {
   const oCredentials = {
      key: '',
      secret: ''
   }

   function getBase64EncCredentials() {
      return Buffer.from(oCredentials.key + ':' + oCredentials.secret).toString('Base64');
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
      }
   };

   getHttpRespPromise(ahReq, { grant_type: 'client_credentials' })
      .then(data => console.log(data))
      .catch(err => console.log(err));
}

dplAuthToken()
