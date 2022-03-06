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
import db from '../ah_rpr_pg.js';
import getHttpRespPromise from '../ah_rpr_http.js';

const router = express.Router();

router.get('/', (req, resp) => {
    resp.json({api: ahProviders[ahProviderCodes.dnb] , key: ahKeys[ahKeyCodes.duns]})
});

router.post('/find', (req, resp) => {
   let sErr = '', idIDR = 0, httpStatus = 0;

   function validateReqBody() {
      if(!req.body || req.body.constructor !== Object || Object.keys(req.body).length === 0) {
         sErr = 'No search criteria specified in the body of the POST transaction';
         return false;
      }

      if(!req.body.countryISOAlpha2Code) {
         sErr = 'No country code specified in the body of the POST transaction';
         return false;
      }

      return true;
   }

   const ahReq = {
      http: {
         method: 'GET',
         host: 'plus.dnb.com',
         headers: {
            'Content-Type': 'application/json',
            Authorization: dplAuthToken.toString()
         },
         path: '/v1/match/cleanseMatch?' + (new URLSearchParams(req.body)).toString()
      },
      sql: {
         insert: 'INSERT INTO dnb_dpl_idr (parameters) VALUES ($1) RETURNING id;',
         update: 'UPDATE dnb_dpl_idr SET result = $1, http_stat = $2, obtained_at = $3 WHERE id = $4;'
      }
   };

   (validateReqBody()
      ?
         db.query(ahReq.sql.insert, [req.body])
      :
         Promise.reject(new ApiHubErr(ahErrCodes.semanticError, sErr))
      )
      .then(sqlReturn => {
         try {
            idIDR = sqlReturn.rows[0].id //Test database write success
         }
         catch(err) {
            sErr = 'Database returned no or invalid dnb_dpl_idr row id';

            return Promise.reject(new ApiHubErr(ahErrCodes.serverError, sErr));
         }

         console.log(`Wrote D&B Direct+ IDR parameters to database, idIDR is ${idIDR}`);

         return getHttpRespPromise(ahReq.http);
      })
      .then(apiResp => {
         if(apiResp && apiResp.extnlApiStatusCode) {
            httpStatus = apiResp.extnlApiStatusCode;
            const obtainedAt = Date.now();
   
            if(apiResp.extnlApiStatusCode === 200) {
               resp
                  .setHeader('X-AHRPR-Cache', false)
                  .setHeader('X-AHRPR-Obtained-At', obtainedAt)
                  .setHeader('X-AHRPR-API-HTTP-Status', httpStatus)
                  .set('Content-Type', 'application/json')
                  .send(apiResp.body);

               return db.query(ahReq.sql.update, [apiResp.body, httpStatus, obtainedAt, idIDR]);
            }
         }

         sErr = 'D&B Direct+ cleanseMatch request failed';

         if(!httpStatus) {
            if(apiResp && apiResp.extnlApiStatusCode) {
               httpStatus = apiResp.extnlApiStatusCode
            }
         }

         return Promise.reject(new ApiHubErr(ahErrCodes.extnlApiErr, sErr, '', httpStatus, apiResp.body));
      })
      .then(sqlReturn => {
         if(sqlReturn.rowCount && sqlReturn.rowCount === 1) {
            console.log('Successfully persisted D&B Direct+ IDR transaction')
         }
         else {
            console.log('🤔, D&B D+ IDR sqlReturn.rowCount === 1 evaluates to false');
         }
      })
      .catch(err => {
         httpStatus = httpStatus || 500;

         if(!req.writableEnded) {
            resp.status(httpStatus).json(err);
         }
      });
});

export default router;
