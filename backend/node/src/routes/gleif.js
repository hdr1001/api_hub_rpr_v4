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
import { ahEndpoints, ahProviderCodes, ahKeys, ahKeyCodes, ahErrCodes } from '../ah_rpr_globs.js';
import ApiHubErr from '../ah_rpr_err.js';
import getHttpRespPromise from '../ah_rpr_http.js';

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
   resp.json({api: ahEndpoints[ahProviderCodes.gleif].provider , key: ahKeys[ahKeyCodes.lei]})
});

router.get(`/${ahKeys[ahKeyCodes.lei]}/:key`, (req, resp) => {

   const lei = req.params.key;

   if(!isKeyValid(lei)) {
      const ahErr = new ApiHubErr(ahErrCodes.invalidParameter, 'LEI submitted is not valid');

      resp.status(ahErr.apiHubErr.http.status).json(ahErr); return;
   }

   getHttpRespPromise(ahProviderCodes.gleif, ahEndpoints[ahProviderCodes.gleif].endpointCodes.lei, lei)
   .then(apiResp => {
      console.log(`Status code returned by the external API ${apiResp.extnlApiStatusCode}`);

      resp.setHeader('Content-Type', 'application/json'); 
      resp.send(apiResp.body);
   })  
   .catch(err => new ApiHubErr);
});

export default router;
