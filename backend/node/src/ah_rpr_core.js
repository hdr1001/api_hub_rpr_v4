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

export default function ahReqPersistResp(req, resp, ahReq) {
   let ahErr = null, httpStatus = 0;

   console.log(`\nahReqPersistResp for ${ahReq.key}`);

   (ahReq.forceNew 
      ? Promise.resolve(null)
      : db.query(ahReq.sql.select, [ahReq.key])
   )
      .then(dbResp => {
         if(dbResp) {
            if(dbResp.rows.length > 0) { //Available on the database
               resp
                  .setHeader('X-AHRPR-Cache', true)
                  .setHeader('X-AHRPR-Obtained-At', new Date(dbResp.rows[0].poa))
                  .setHeader('X-AHRPR-API-HTTP-Status', dbResp.rows[0].api_http_status)
                  .json(dbResp.rows[0].product);

               console.log(`Request for key ${ahReq.key} delivered from database`);

               return Promise.resolve(null);
            }
            else { //rows.length === 0 (i.e. not available from database)
               console.log(`Key ${ahReq.key} is not available on the database`);
            }
         }

         //Not on database or forceNew flag set
         return getHttpRespPromise(ahReq.http);
      })
      .then(apiResp => {
         if(apiResp === null) { //Product delivered out of the database
            return Promise.resolve(null)
         }
         else { //Get the product from the external API
            httpStatus = apiResp.extnlApiStatusCode;

            const extnlApiMsg = `Request for key ${ahReq.key} returned with HTTP status code ${httpStatus}`;
            const obtainedAt = Date.now();

            console.log(extnlApiMsg);

            if(httpStatus === 200) {
               resp
                  .setHeader('X-AHRPR-Cache', false)
                  .setHeader('X-AHRPR-Obtained-At', new Date(obtainedAt))
                  .setHeader('X-AHRPR-API-HTTP-Status', httpStatus)
                  .set('Content-Type', 'application/json')
                  .send(apiResp.body);

               return db.query(ahReq.sql.insert, [ahReq.key, apiResp.body, obtainedAt, httpStatus]);
            }
            else { //External API HTTP status code returned indicates an error
               ahErr = new ApiHubErr(ahErrCodes.httpErrReturn, extnlApiMsg, '', httpStatus, apiResp.body);

               console.error(JSON.stringify(ahErr, null, 3));

               resp
                  .status(httpStatus)
                  .json(ahErr);

               let sqlErr  = 'INSERT INTO ah_errors (key, err, err_obtained_at, err_http_status) ';
                   sqlErr += 'VALUES ($1, $2, $3, $4);';

               return db.query(sqlErr, [ahReq.key, JSON.stringify(ahErr), obtainedAt, httpStatus]);
            }
         }
      })
      .then(dbPersist => {
         if(dbPersist) { //Not delivered out of the database
            if(dbPersist.rowCount && dbPersist.rowCount === 1) {
               if(ahErr) {
                  console.log(`Successfully persisted error on the database`)
               }
               else {
                  console.log(`Successfully persisted ${ahReq.key} on the database`)
               }
            }
            else {
               console.error(`🤔, dbPersist.rowCount === 1 evaluates to false`)
            }
         }
      })
      .catch(err => {
         if(err instanceof ApiHubErr) {
            console.error(JSON.stringify(err, null, 3))
         }
         else {
            console.error(`Error: ${err.message}`);
         }
      });
}
