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
import getHttpRespPromise from './ah_rpr_http.js';
//import db from './db/index.js';
import ApiHubErr from './ah_rpr_err.js';

export default function ahReqPersistResp(req, resp, ahReq) {
/*   db.query('SELECT lei_ref FROM products_gleif')
      .then(ret => console.log(`Results SQL query ${ret.rows.length}`))
      .catch(err => console.log(err));
*/
   getHttpRespPromise(ahReq)
      .then(apiResp => {
         const sMsg = `Request for LEI ${ahReq.key} returned with HTTP status code ${apiResp.extnlApiStatusCode}`; 
         console.log(sMsg);

         if(apiResp.extnlApiStatusCode === 200) {
            resp.setHeader('Content-Type', 'application/json').send(apiResp.body);
         }
         else {
            resp
               .status(apiResp.extnlApiStatusCode)
               .json(new ApiHubErr(ahErrCodes.httpErrReturn, sMsg, apiResp.body)); 
         }
      })
      .catch(err => {
         resp.status(err.apiHubErr.http.status).json(err);
      });
}
