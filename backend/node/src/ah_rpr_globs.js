// *********************************************************************
//
// API Hub request, persist and respond globals
// JavaScript code file: ah_rpr_globs.js
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

//API providers
const ahProviders = [
   'gleif',
   'dnb'
];

//API provider codes
const ahProviderCodes = {
   gleif: 0,
   dnb: 1
}

//HTTP status codes
const httpStatusCodes = {
   okay: 200,
   notFound: 404,
   genericErr: 500
};

//API Hub errors
const ahHttpErrMsgs = [
   {errDesc: 'Error occurred in API HUB', status: httpStatusCodes.genericErr},
   {errDesc: 'Unable to locate the requested resource', status: httpStatusCodes.notFound}
];

//Error type codes
const ahErrCodes = {
   generic: 0,
   unableToLocate: 1,
};

export {
   ahProviders,
   ahProviderCodes,
   httpStatusCodes,
   ahHttpErrMsgs,
   ahErrCodes
};
