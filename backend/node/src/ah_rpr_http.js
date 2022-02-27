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

export default function getHttpRespPromise(ahReq, httpPostBody) {
   return new Promise((resolve, reject) => {

      let httpsReq = https.request(ahReq.http, resp => {
         const body = [];

         resp.on('error', err => reject(err));

         resp.on('data', chunk => body.push(chunk));

         resp.on('end', () => { //The data product is now available in full
            resolve({
               body: Buffer.concat(body).toString(),
               extnlApiStatusCode: resp.statusCode
            })
         });
      });

      httpsReq.on('error', err => reject(err));

      if(httpPostBody) {
         if(typeof httpPostBody === 'object') {
            httpsReq.write(JSON.stringify(httpPostBody));
         }
         else {
            httpsReq.write(httpPostBody);
         }
      }

      httpsReq.end();
   })
}
