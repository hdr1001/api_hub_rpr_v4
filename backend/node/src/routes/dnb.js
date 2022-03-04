// *********************************************************************
//
// API Hub request, persist and respond API routes to D&B
// JavaScript code file: ./routes/dnb.js
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

import express from 'express';
import { ahProviders, ahProviderCodes, ahKeys, ahKeyCodes, ahErrCodes, dplAuthToken } from '../ah_rpr_globs.js';
import ApiHubErr from '../ah_rpr_err.js';
import getHttpRespPromise from '../ah_rpr_http.js';

const router = express.Router();

router.get('/', (req, resp) => {
    resp.json({api: ahProviders[ahProviderCodes.dnb] , key: ahKeys[ahKeyCodes.duns]})
});

router.post('/find', (req, resp) => {
   if(!req.body.isoCountry) {
      const ahErr = new ApiHubErr(ahErrCodes.semanticError, 'No country code specified');

      resp.status(ahErr.apiHubErr.http.status).json(ahErr); return;
   }

   const ahReq = {
      http: {
         method: 'GET',
         host: 'plus.dnb.com',
         headers: {
            'Content-Type': 'application/json',
            Authorization: dplAuthToken.toString()
         },
         path: '/v1/match/cleanseMatch'
      },
      sql: {
/*            select: 'SELECT id, token, expires_in, obtained_at FROM auth_tokens_dpl ORDER BY id DESC LIMIT 1;',
         insert: 'INSERT INTO auth_tokens_dpl (token, expires_in, obtained_at) VALUES ($1, $2, $3) RETURNING id;' */
      }
   };

   ahReq.http.path += `?countryISOAlpha2Code=${req.body.isoCountry}&name=${req.body.name}`;

   getHttpRespPromise(ahReq.http).then(apiResp => {
      if(apiResp) {
         console.log(`D&B Direct+ cleanseMatch request resulted in HTTP status ${apiResp.extnlApiStatusCode}`);

         if(apiResp.extnlApiStatusCode === 200) {
            console.log(apiResp.body);
         }
      }
   })

   resp.json(req.body);
});

export default router;
