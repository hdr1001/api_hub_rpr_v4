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

import { ahHttpErrMsgs, ahErrCodes } from './ah_rpr_globs.js';

export default class ApiHubErr {
   constructor(errCode, appErrMsg) {
      if(Number.isInteger(errCode) && ahHttpErrMsgs[errCode]) {
         this.errCode = errCode
      }
      else {
         this.errCode = ahErrCodes.generic
      }

      if(appErrMsg) {
         this.appErrMsg = appErrMsg
      }

      this.httpErrMsg = ahHttpErrMsgs[this.errCode].errDesc;

      this.httpStatus = ahHttpErrMsgs[this.errCode].status;
   }

   toString() {
      if(this.appErrMsg) {
         return `${this.appErrMsg.errDesc} (${this.errCode})`
      }
      else {
         return `${this.httpErrMsg.errDesc} (${this.errCode})`
      }
   }
}
