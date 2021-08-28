// *********************************************************************
//
// API Hub request, persist and respond HTTP code
// JavaScript code file: ah_rpr_http.js
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

import https from 'https';
import { ahErrCodes } from './ah_rpr_globs.js'
import ApiHubErr from './ah_rpr_err.js';

export default function getHttpRespPromise(ahReq) {
   return new Promise((resolve, reject) => {

      https.request(ahReq.http, resp => {
         const body = [];

         resp.on('error', err => reject(new ApiHubErr(ahErrCodes.extnlApiErr, 'External API emitted an error', err)));

         resp.on('data', chunk => body.push(chunk));

         resp.on('end', () => { //The data product is now available in full
            resolve({
               body: Buffer.concat(body).toString(),
               extnlApiStatusCode: resp.statusCode
            })
         });
      }).end()

   });
}
