// *********************************************************************
//
// API Hub request, persist and respond UI, Hub interactions
// JavaScript code file: AhCalls.js
//
// Copyright 2022 Hans de Rooij
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

function rejectInclError(resp, reject, defaultErrMsg) {
   if(resp instanceof Error) {
      reject(resp);
      return;
   }

   try {
      resp.json()
         .then(oAhErrResp => {
            let errMsg = '', errCode = '';
            let httpStatus = resp.headers.get('X-AHRPR-API-HTTP-Status');
         
            const extnlApiResp = oAhErrResp && oAhErrResp.apiHubErr && oAhErrResp.apiHubErr.externalApi;
         
            if(extnlApiResp) {
               if(!httpStatus) { httpStatus = extnlApiResp.status }
         
               const extnlApiErr = extnlApiResp.body && extnlApiResp.body.error;
         
               if(extnlApiErr) {
                  if(extnlApiErr.errorMessage) { errMsg = extnlApiErr.errorMessage }
                  if(extnlApiErr.errorCode) { errCode = extnlApiErr.errorCode }
               }
            }
         
            if(!httpStatus) { httpStatus = resp.status + '' }
         
            if(!errMsg) { errMsg = 'API request returned a HTTP status code outside of the 2XX range' }
         
            let addtnlInfo = httpStatus ? ` (HTTP status ${httpStatus}` : '';
         
            if(errCode) {
               addtnlInfo += addtnlInfo.length ? `, error code ${errCode})` : ` (error code ${errCode})`
            }
            else {
               addtnlInfo += addtnlInfo.length ? ')' : ''
            }

            reject(new Error(`${errMsg}${addtnlInfo}`));
         })
         .catch(() => reject(new Error(defaultErrMsg)));
   }
   catch(err) {
      reject(new Error(defaultErrMsg));
   }
}

//D&B Direct+ API calls
const ahDnbGenerateMcs = (apiHubUrl, findParameters) => {
   const httpParameters = {
      url: `${apiHubUrl}/api/dnb/find`,
      opts: {
         method: 'POST',
         mode: 'cors', 
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(findParameters)
      }
   }

   return new Promise((resolve, reject) => {
      let ahRespHdrs = null;

      fetch(httpParameters.url, httpParameters.opts)
         .then(resp => {
            if(!resp.ok) { throw resp }

            ahRespHdrs = {
               httpStatus: parseInt(resp.headers.get('X-AHRPR-API-HTTP-Status')),
               idrID: parseInt(resp.headers.get('X-AHRPR-API-IDR-ID'))
            };

            return resp.json();
         })
         .then(oIdrResp => {
            oIdrResp.ahRpr = ahRespHdrs;

            resolve(oIdrResp);
         })
         .catch(resp => rejectInclError(resp, reject, 'Unkown error occurred while generating match candidates'));
   })
}

const ahAssignDnbDuns = (apiHubUrl, dunsParameters) => {
   const httpParameters = {
      url: `${apiHubUrl}/api/dnb/find/duns`,
      opts: {
         method: 'POST',
         mode: 'cors', 
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(dunsParameters)
      }
   }

   return new Promise((resolve, reject) => {
      fetch(httpParameters.url, httpParameters.opts)
         .then(resp => {
            if(!resp.ok) { throw resp }

            return resp.json();
         })
         .then(oAssignDunsResp => { resolve(oAssignDunsResp) })
         .catch(resp => rejectInclError(resp, reject, `IDR update using id ${dunsParameters.id} and duns ${dunsParameters.duns} was not successful 🤔`));
   })
}

const ahDnbGetDBs = (apiHubUrl, duns) => {
   const httpParameters = {
      url: `${apiHubUrl}/api/dnb/duns/${duns}`,
      opts: {
         mode: 'cors', 
         headers: {
            'Accept': 'application/json'
         }
      }
   }

   return new Promise((resolve, reject) => {
      fetch(httpParameters.url, httpParameters.opts)
         .then(resp => {
            if(!resp.ok) { throw resp }

            return resp.json();
         })
         .then(oDBs => resolve(oDBs))
         .catch(resp => rejectInclError(resp, reject, `Unkown error occurred while retrieving DUNS ${duns}`));
   })
}

const ahDnbGetAbout = apiHubUrl => {
   const httpParameters = {
      url: `${apiHubUrl}/about`,
      opts: {
         mode: 'cors', 
         headers: {
            'Accept': 'application/json'
         }
      }
   }

   return new Promise((resolve, reject) => {
      fetch(httpParameters.url, httpParameters.opts)
         .then(resp => {
            if(!resp.ok) { throw resp }

            return resp.json();
         })
         .then(oAbt => resolve(oAbt))
         .catch(resp => rejectInclError(resp, reject, `Error occurred while accessing the API Hub`));
   })
}

export { ahDnbGenerateMcs, ahAssignDnbDuns, ahDnbGetDBs, ahDnbGetAbout };
