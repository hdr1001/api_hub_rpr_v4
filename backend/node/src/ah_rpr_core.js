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
      ahReq.msg.push('forceNew flag is set on the request');

      return Promise.resolve(null)
   }
   else {
      return db.query(ahReq.sql.select, [ahReq.key])
   }
}

export default function ahReqPersistResp(req, resp, ahReq) {
   ahReq.msg = [`\nahReqPersistResp for ${ahReq.key}`];

   getProductDb(ahReq)
      .then(dbResp => {
         if(dbResp) {
            if(dbResp.rows.length > 0) { //Available on the database
               resp
                  .setHeader('X-AHRPR-Cache', true)
                  .setHeader('X-AHRPR-Obtained-At', new Date(dbResp.rows[0].poa))
                  .setHeader('X-AHRPR-API-HTTP-Status', dbResp.rows[0].api_http_status)
                  .json(dbResp.rows[0].product);

               ahReq.msg.push(`Request for key ${ahReq.key} delivered from database`);

               return Promise.resolve(null);
            }
            else { //rows.length === 0 (i.e. not available from database)
               ahReq.msg.push(`Key ${ahReq.key} is not available on the database`);
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
            const extnlApiMsg = `Request for key ${ahReq.key} returned with HTTP status code ${apiResp.extnlApiStatusCode}`;
            const obtainedAt = Date.now();

            ahReq.msg.push(extnlApiMsg);

            if(apiResp.extnlApiStatusCode === 200) {
               resp
                  .setHeader('X-AHRPR-Cache', false)
                  .setHeader('X-AHRPR-Obtained-At', new Date(obtainedAt))
                  .setHeader('X-AHRPR-API-HTTP-Status', apiResp.extnlApiStatusCode)
                  .set('Content-Type', 'application/json')
                  .send(apiResp.body);

               return db.query(ahReq.sql.insert, [ahReq.key, apiResp.body, 
                                       obtainedAt, apiResp.extnlApiStatusCode]);
            }
            else { //External API HTTP status code returned indicates an error
               ahReq.ahErr = new ApiHubErr(ahErrCodes.httpErrReturn, extnlApiMsg, apiResp.body);

               resp
                  .status(apiResp.extnlApiStatusCode)
                  .json(ahReq.ahErr);

               let sqlErr  = 'INSERT INTO ah_errors (key, err, err_obtained_at, err_http_status) ';
                   sqlErr += 'VALUES ($1, $2, $3, $4);';

               return db.query(sqlErr, [ahReq.key, JSON.stringify(ahReq.ahErr), 
                                          obtainedAt, apiResp.extnlApiStatusCode]);
            }
         }
      })
      .then(dbPersist => {
         if(dbPersist) { //Not delivered out of the database
            let persistMsg = 'Successfully wrote the ';
            
            if(dbPersist.rowCount !== 1) { persistMsg = 'Failed to write the ' }

            persistMsg += ahReq.ahErr ? 'error' : 'API response';

            ahReq.msg.push(persistMsg + ' to the database');
         }

         ahReq.msg.forEach(elem => console.log(elem))
      })
      .catch(err => {
         console.log('\nA promise was rejected in ahReqPersistResp');
         console.log(err);

         const ahErr = new ApiHubErr(ahErrCodes.generic, 'Error occurred', err);

         if(!req.writableEnded) {
            resp.status(ahErr.apiHubErr.http.status).json(ahErr);
         }
      });
}
