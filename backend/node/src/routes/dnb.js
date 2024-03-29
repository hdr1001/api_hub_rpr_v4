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
import { ahProviders, ahProviderCodes, ahKeys, ahKeyCodes, ahErrCodes, httpSuccess, dplAuthToken } from '../ah_rpr_globs.js';
import ahReqPersistResp from '../ah_rpr_core.js';
import ApiHubErr from '../ah_rpr_err.js';
import db from '../ah_rpr_pg.js';
import getHttpRespPromise from '../ah_rpr_http.js';

const router = express.Router();

const dataBlockCollections = {
   '00': {
            desc: 'Master data',
            dataBlocks: ['companyinfo_L2_v1', 'principalscontacts_L3_v1', 'hierarchyconnections_L1_v1'],
            findAppend: true
         },

   '01': {
            desc: 'D&B ratings',
            dataBlocks: ['financialstrengthinsight_L2_v1', 'paymentinsight_L1_v1'],
            findAppend: true
         },

   '02': {
            desc: 'Principals',
            dataBlocks: ['principalscontacts_L3_v1'],
            findAppend: true
         },

   '03': {
            desc: 'Global financials',
            dataBlocks: ['globalfinancials_L2_v1'],
            findAppend: false
         }
};

function getDUNS(sKey) {
   if(typeof sKey !== 'string') { return '' }
   
   sKey = sKey.trim();

   if(sKey.length === 0) { return '' }

   if(sKey.length === 11 && sKey.slice(2, 3) === '-' && sKey.slice(6, 7) === '-') {
      sKey = sKey.slice(0, 2) + sKey.slice(3, 6) + sKey.slice(7);
   }

   if(sKey.length > 9) { return '' }

   const reg = /^\d+$/; //Only numbers allowed

   if(!reg.test(sKey)) { return '' }

   if(sKey.length < 9) {
      sKey = '000000000'.slice(0, 9 - sKey.length) + sKey
   }

   return sKey;
}

router.get('/', (req, resp) => {
    resp.json({api: ahProviders[ahProviderCodes.dnb] , key: ahKeys[ahKeyCodes.duns]})
});

router.get('/collections', (req, resp) => {
   resp.json(dataBlockCollections)
})

router.get(`/${ahKeys[ahKeyCodes.duns]}/:key`, (req, resp) => {
   const sDUNS = getDUNS(req.params.key);

   if(!sDUNS) {
      const ahErr = new ApiHubErr(ahErrCodes.invalidParameter, 'DUNS submitted is not valid');

      resp.status(ahErr.apiHubErr.http.status).json(ahErr); return;
   }

   let dbCollID = '00';

   if(req.query.dbCollID) {
      dbCollID = req.query.dbCollID.length === 1 ? '0' + req.query.dbCollID : req.query.dbCollID
   }

   if(!dataBlockCollections[dbCollID]) {
      const ahErr = new ApiHubErr(ahErrCodes.invalidParameter, 'Data block collection ID specified is not valid');

      resp.status(ahErr.apiHubErr.http.status).json(ahErr); return;
   }

   const qryParameters = {
      blockIDs: dataBlockCollections[dbCollID].dataBlocks.join(',')
   };

   const ahReq = {
      key: sDUNS,
      http: {
         method: 'GET',
         host: 'plus.dnb.com',
         headers: {
            'Content-Type': 'application/json',
            Authorization: dplAuthToken.toString()
         },
         path: `/v1/data/duns/${sDUNS}?${(new URLSearchParams(qryParameters)).toString()}`
      },
      forceNew: (req.query.forceNew !== undefined && req.query.forceNew !== 'false') ? true : false,
      sql: {
         select: `SELECT duns AS key, dbs_${dbCollID} AS product, dbs_${dbCollID}_obtained_at AS poa, dbs_${dbCollID}_http_status AS api_http_status FROM products_dnb WHERE duns = $1;`,
         insert: `INSERT INTO products_dnb (duns, dbs_${dbCollID}, dbs_${dbCollID}_obtained_at, dbs_${dbCollID}_http_status) VALUES ($1, $2, $3, $4) ON CONFLICT (duns) DO UPDATE SET dbs_${dbCollID} = $2, dbs_${dbCollID}_obtained_at = $3, dbs_${dbCollID}_http_status = $4;`
      }
   };

   ahReqPersistResp(req, resp, ahReq);
});

router.post('/find', (req, resp) => {
   let idIDR = 0, httpStatus = 0;

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

   console.log('\nProcessing D&B find request');

   try {
      if(!req.body || req.body.constructor !== Object || Object.keys(req.body).length === 0) {
         throw(new ApiHubErr(ahErrCodes.semanticError, 'No search parameters specified in the body of the POST transaction'))
      }

      if(!req.body.countryISOAlpha2Code) {
         throw(new ApiHubErr(ahErrCodes.semanticError, 'No country code specified in the body of the POST transaction'))
      }
   }
   catch(err) {
      if(err instanceof ApiHubErr) {
         console.error(err.apiHubErr.message);
         resp.status(err.apiHubErr.http.status).json(err);
         return;
      }
   }

   db.query(ahReq.sql.insert, [req.body])
      .then(sqlReturn => {
         try {
            idIDR = sqlReturn.rows[0].id //Test database write success
         }
         catch(err) {
            const ahErr = new ApiHubErr(ahErrCodes.serverError, 'Database returned no or invalid dnb_dpl_idr row id');
            return Promise.reject(ahErr);
         }

         console.log(`Wrote D&B Direct+ IDR parameters to database, idIDR is ${idIDR}`); //Happy path

         return getHttpRespPromise(ahReq.http);
      })
      .then(apiResp => {
         if(apiResp && apiResp.extnlApiStatusCode) {
            httpStatus = apiResp.extnlApiStatusCode;
            const obtainedAt = Date.now();
   
            if(apiResp.extnlApiStatusCode === httpSuccess) { //Happy path
               resp
                  .setHeader('X-AHRPR-Cache', false)
                  .setHeader('X-AHRPR-Obtained-At', obtainedAt)
                  .setHeader('X-AHRPR-API-HTTP-Status', httpStatus)
                  .setHeader('X-AHRPR-API-IDR-ID', idIDR)
                  .set('Content-Type', 'application/json')
                  .send(apiResp.body);

               console.log(`Successfully retrieved D&B match candidates, idIDR is ${idIDR}`);

               return db.query(ahReq.sql.update, [apiResp.body, httpStatus, obtainedAt, idIDR]);
            }
         }

         const ahErr = new ApiHubErr(
            ahErrCodes.extnlApiErr,
            'D&B Direct+ cleanseMatch API request failed',
            '',
            httpStatus || apiResp.extnlApiStatusCode || 500,
            apiResp ? apiResp.body : null
         )

         return Promise.reject(ahErr);
      })
      .then(sqlReturn => {
         if(sqlReturn && sqlReturn.rowCount && sqlReturn.rowCount === 1) {
            console.log('Successfully persisted D&B Direct+ IDR transaction')
         }
         else {
            console.log('🤔, D&B D+ IDR sqlReturn.rowCount === 1 evaluates to false');
         }
      })
      .catch(err => {
         if(err instanceof ApiHubErr) {
            console.error(err.apiHubErr.message);

            resp.status(httpStatus || err.apiHubErr.http.status).json(err);

            return;
         }

         console.error(err.message);

         httpStatus = httpStatus || 500;

         if(!req.writableEnded) {
            resp.status(httpStatus).json(err);
         }
      });
});

router.post('/find/duns', (req, resp) => {
   console.log('\nProcessing D&B IDR update DUNS request');

   try {
      if(!req.body || req.body.constructor !== Object || Object.keys(req.body).length === 0) {
         throw(new ApiHubErr(ahErrCodes.semanticError, 'No update parameters specified in the body of the POST transaction'))
      }

      if(!req.body.id) {
         throw(new ApiHubErr(ahErrCodes.semanticError, 'No unique identifier (id) specified in the body of the POST transaction'))
      }

      if(!req.body.duns) {
         throw(new ApiHubErr(ahErrCodes.semanticError, 'No duns specified in the body of the POST transaction'))
      }
   }
   catch(err) {
      console.error(err.apiHubErr.message);
      resp.status(err.apiHubErr.http.status).json(err);
      return;
   }

   db.query('UPDATE dnb_dpl_idr SET duns = $1 WHERE id = $2;', [req.body.duns, req.body.id])
      .then(sqlReturn => {
         if(sqlReturn.rowCount && sqlReturn.rowCount === 1) {
            console.log(`Successfully updated the duns associated with IDR transaction ${req.body.id}`);

            resp.json({ ...req.body, success: true });

            return;
         }

         return Promise.reject(new ApiHubErr(ahErrCodes.serverError, `Error persisting DUNS ${req.body.duns} for IDR id ${req.body.id}`));
      })
      .catch(err => {
         console.error(err.apiHubErr.message);
         resp.status(err.apiHubErr.http.status).json(err);
      });
});

export default router;
