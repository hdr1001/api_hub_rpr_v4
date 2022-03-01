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

import db from './ah_rpr_pg.js';
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
      let sqlSelect = 'SELECT id, token, expires_in, obtained_at ';
      sqlSelect += 'FROM auth_tokens_dpl ';
      sqlSelect += 'ORDER BY id DESC LIMIT 1;';

      db.query(sqlSelect)
         .then(dbResp => {
            if(dbResp && dbResp.rows.length > 0) {
               this.authToken = dbResp.rows[0].token;
               this.expiresIn = dbResp.rows[0].expires_in;
               this.obtainedAt = dbResp.rows[0].obtained_at;
      
               console.log('Request for authentication token delivered from database');

               return Promise.resolve(null);
            }
         });
/*
      getHttpRespPromise(ahReq.http, ahReq.body)
         .then(apiResp => {
            console.log('Successfully retrieved a new token');

            const oRespBody = JSON.parse(apiResp.body);

            this.authToken = oRespBody.access_token;
            this.expiresIn = oRespBody.expiresIn;
            this.obtainedAt = Date.now();
         })
         .catch(err => console.log(err)); */

//INSERT INTO auth_tokens_dpl (token, expires_in, obtained_at) VALUES ('41...', 86400, 1646115141993) RETURNING id;
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
