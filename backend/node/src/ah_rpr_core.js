// *********************************************************************
//
// API Hub request, persist and respond core algorithm
// JavaScript code file: ah_rpr_core.js
//
// Copyright 2021 Hans de Rooij
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

import { ahErrCodes } from './ah_rpr_globs.js';
import db from './ah_rpr_pg.js';
import getHttpRespPromise from './ah_rpr_http.js';
import ApiHubErr from './ah_rpr_err.js';

function getProductDb(ahReq) {
   if(ahReq.forceNew) {
      return Promise.resolve(null)
   }
   else {
      return db.query(ahReq.sql.select, [ahReq.key])
   }
}

export default function ahReqPersistResp(req, resp, ahReq) {
   getProductDb(ahReq)
      .then(dbResp => {
         if(dbResp) {
            if(dbResp.rowCount > 0) { //Available on the database
               ahReq.productDb = true;
   
               resp
                  .setHeader('X-AHRPR-Cache', 'true')
                  .json(dbResp.rows[0].product);
   
               return Promise.resolve(null);
            }
            else { //rowCount === 0 (i.e. not available from database)
               ahReq.productDb = false;
            }
         }

         //Not on database or forceNew flag set
         return getHttpRespPromise(ahReq);
      })
      .then(apiResp => {
         if(apiResp === null) { //Product delivered out of the database
            return Promise.resolve(null)
         }
         else { //Get the product from the external API
            const sMsg = `Request for key ${ahReq.key} returned with HTTP status code ${apiResp.extnlApiStatusCode}`; 
            console.log(sMsg);
   
            if(apiResp.extnlApiStatusCode === 200) {
               resp.setHeader('Content-Type', 'application/json').send(apiResp.body);
            }
            else {
               resp
                  .status(apiResp.extnlApiStatusCode)
                  .json(new ApiHubErr(ahErrCodes.httpErrReturn, sMsg, apiResp.body)); 
            }
         }
      })
      .catch(err => {
         const ahErr = new ApiHubErr(ahErrCodes.generic, 'Error occurred');
         resp.status(ahErr.apiHubErr.http.status).json(ahErr);
      });
}
