// *********************************************************************
//
// API Hub request, persist and respond API routes to GLEIF
// JavaScript code file: ./routes/gleif.js
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
import { ahProviders, ahProviderCodes, ahKeys, ahKeyCodes, ahErrCodes } from '../ah_rpr_globs.js';
import ahReqPersistResp from '../ah_rpr_core.js';
import ApiHubErr from '../ah_rpr_err.js';

const router = express.Router();

function isKeyValid(sKey) {
   let m = 0, charCode;

   for(let i = 0; i < sKey.length; i++) {
      charCode = sKey.charCodeAt(i);
   
      if(charCode >= 48 && charCode <= 57) {
         m = (m * 10 + charCode - 48) % 97 
      }
      else if(charCode >= 65 && charCode <= 90) {
         m = (m * 100 + charCode - 55) % 97 
      }
      else {
         console.log(`Unexpected character at ${i}`);
         return false;
      }
   }

   return m === 1;
}

router.get('/', (req, resp) => {
   resp.json({api: ahProviders[ahProviderCodes.gleif] , key: ahKeys[ahKeyCodes.lei]})
});

router.get(`/${ahKeys[ahKeyCodes.lei]}/:key`, (req, resp) => {
   if(!isKeyValid(req.params.key)) {
      const ahErr = new ApiHubErr(ahErrCodes.invalidParameter, 'LEI submitted is not valid');

      resp.status(ahErr.apiHubErr.http.status).json(ahErr); return;
   }

   const ahReq = {
      key: req.params.key,
      http: {
         method: 'GET',
         host: 'api.gleif.org',
         headers: {
            Accept: 'application/vnd.api+json'
         },
         path: '/api/v1/lei-records/' + req.params.key
      },
      forceNew: (req.query.forceNew !== undefined && req.query.forceNew !== 'false') ? true : false,
      sql: {
         select: 'SELECT lei AS key, lei_ref AS product, lei_ref_obtained_at AS poa, lei_ref_http_status AS api_http_status FROM products_gleif WHERE lei = $1;',
         insert: 'INSERT INTO products_gleif (lei, lei_ref, lei_ref_obtained_at, lei_ref_http_status) VALUES ($1, $2, $3, $4) ON CONFLICT (lei) DO UPDATE SET lei_ref = $2, lei_ref_obtained_at = $3, lei_ref_http_status = $4;'
      }
   }

   ahReqPersistResp(req, resp, ahReq);
});

export default router;
