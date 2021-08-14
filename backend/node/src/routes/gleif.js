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
import https from 'https';
import { ahProviders, ahProviderCodes, ahKeys, ahKeyCodes } from '../ah_rpr_globs.js';
import ApiHubErr from '../ah_rpr_err.js';

const router = express.Router();

router.get('/', (req, resp) => {
   resp.json({api: ahProviders[ahProviderCodes.gleif] , key: ahKeys[ahKeyCodes.lei]})
});

router.get(`/${ahKeys[ahKeyCodes.lei]}/:key`, (req, resp) => {

   new Promise((resolve, reject) => {
      const httpAttr = {
         host: 'api.gleif.org',
         path: `/api/v1/lei-records/${req.params.key}`,
         method: 'GET',
         headers: {
            'Accept': 'application/vnd.api+json'
         }
      }

      https.request(httpAttr, apiResp => {
         const body = [];

         apiResp.on('error', err => reject(err));

         apiResp.on('data', chunk => body.push(chunk));

         apiResp.on('end', () => { //The data product is now available in full
            console.log('HTTP status code ' + apiResp.statusCode);

            resolve(body + '');
         });
      }).end();
   })
   
   .then(body => {
      resp.setHeader('Content-Type', 'application/json'); 
      resp.send(body);
   })
   
   .catch(err => new ApiHubErr);
});

export default router;
