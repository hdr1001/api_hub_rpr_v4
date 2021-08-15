// *********************************************************************
//
// API Hub request, persist and respond custom error object
// JavaScript code file: ah_rpr_err.js
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

//HTTP status codes
const httpStatusCodes = {
   okay: { errDesc: 'Request succeeded', status: 200 },
   notFound: { errDesc: 'Unable to locate', status: 404 },
   genericErr: { errDesc: 'Server Error', status: 500 }
};

//Error specifics
const ahErrors = [
   { errDesc: 'Error occurred in API HUB', httpStatusCode: httpStatusCodes.genericErr },
   { errDesc: 'Unable to locate the requested resource', httpStatusCode: httpStatusCodes.notFound },
   { errDesc: 'Invalid parameter', httpStatusCode: httpStatusCodes.notFound },
   { errDesc: 'External API returned an error', httpStatusCode: httpStatusCodes.genericErr }
];

export default class ApiHubErr {
   constructor(errCode, addtlErrMsg) {
      if(ahErrors[errCode]) {
         this.errorCode = errCode
      }
      else {
         this.errorCode = ahErrCodes.generic
      }

      this.errorMessage = ahErrors[this.errorCode].errDesc;

      if(addtlErrMsg) {
         this.addtlErrorMessage = addtlErrMsg
      }

      this.httpStatus = ahErrors[this.errorCode].httpStatusCode.status;
      this.httpMessage = ahErrors[this.errorCode].httpStatusCode.errDesc;
   }

   toString() {
      return `${this.errorMessage} (${this.errCode})`
   }
}
