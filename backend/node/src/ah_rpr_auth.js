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
      this.getNewToken(); //Initialize instance properties

      //Check every hour if the token needs to be refreshed
      this.chkInterval = setInterval(this.getNewTokenIfAdvised.bind(this), 1800000);
   }

   get expiresInMins() { //Return the number of minutes until the token expires
      if(!this.expiresIn || !this.obtainedAt) {
         return 0;
      }

      return (this.obtainedAt + (this.expiresIn * 1000) - Date.now()) / 60000;
   }

   get renewAdvised() { //Answer the question; should this authorization token be renewed?
      if(this.expiresInMins < 76) {
         return true;
      }

      return false;
   }

   toString() {
      if(!this.authToken) {
         return ''
      }

      return 'Bearer ' + this.authToken;
   }

   getNewToken(bForceApiCall) {
      let sqlSelect = 'SELECT id, token, expires_in, obtained_at ';
      sqlSelect += 'FROM auth_tokens_dpl ';
      sqlSelect += 'ORDER BY id DESC LIMIT 1;';

      (bForceApiCall ? 0 : db.query(sqlSelect))
         .then(dbResp => {
            if(dbResp && dbResp.rows.length > 0) {
               console.log(`Number of tokens retrieved from the database is ${dbResp.rows.length}`);

               this.authToken = dbResp.rows[0].token;
               this.expiresIn = dbResp.rows[0].expires_in;
               this.obtainedAt = dbResp.rows[0].obtained_at;

               if(this.authToken && !this.renewAdvised) {
                  console.log(`Database token validated okay, (${this.expiresInMins.toFixed(1)} minutes remaining)`);

                  return 0;
               }
            }

            return getHttpRespPromise(ahReq.http, ahReq.body)
         })
         .then(apiResp => {
            if(apiResp === 0) { //Do nothing if token was retrieved from the database
               return 0;
            }
            else {
               console.log(`D&B Direct+ token request resulted in HTTP status ${apiResp.extnlApiStatusCode}`);

               if(apiResp.extnlApiStatusCode === 200) {
   
                  const oRespBody = JSON.parse(apiResp.body);
      
                  this.authToken = oRespBody.access_token;
                  this.expiresIn = oRespBody.expiresIn;
                  this.obtainedAt = Date.now();
   
                  let sqlInsert = 'INSERT INTO auth_tokens_dpl ';
                  sqlInsert += '(token, expires_in, obtained_at) ';
                  sqlInsert += 'VALUES ($1, $2, $3) RETURNING id;';
                  
                  //Success, now persist the token on the database
                  return db.query(sqlInsert, [this.authToken, this.expiresIn, this.obtainedAt]);
               }
               else {
                  //HTTP status code !== 200, jump to catch
                  return Promise.reject(new Error('D&B Direct+ API token request resulted in an error'))
               }
            }
         })
         .then(dbResult => {
            if(dbResult !== 0) {
               if(dbResult.rowCount && dbResult.rowCount === 1) {
                  console.log(`Successfully persisted D&B Direct+ authorization token`);
                  //console.log(`Token id = ${dbResult.rows[0].id}`);
               }
               else {
                  console.error(`🤔, dbResult.rowCount === 1 evaluates to false`);

                  return -1;
               }
            }

            return 0;
         })
         .catch(err => {
            console.error('An error occured while instantiating a DplAuthToken object');
            console.error(`Message: ${err.message}`);
         });
   }

   getNewTokenIfAdvised() {
      if(this.renewAdvised) { 
         console.log('Token invalid or (nearly) expired, get new token online');

         this.getNewToken(true);
      }
      else {
         console.log(`D&B Direct+ token validated okay (${this.expiresInMins.toFixed(1)} minutes remaining)`)
      }
   }
}
