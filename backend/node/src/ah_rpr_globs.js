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

import DplAuthToken from './ah_rpr_auth.js';

//API providers
const ahProviders = [
   'gleif',
   'dnb'
];

//API provider codes
const ahProviderCodes = {
   gleif: 0,
   dnb: 1
};

//Identifying keys
const ahKeys = [
   'lei',
   'duns'
];

//API key codes
const ahKeyCodes = {
   lei: 0, //GLEIF Legal Entity Identifier
   duns: 1, //D&B (i.e. DUNS)
};

//API Hub errors
const ahErrCodes = {
   generic: 0,
   unableToLocate: 1,
   invalidParameter: 2,
   extnlApiErr: 3,
   httpErrReturn: 4,
   semanticError: 5,
   serverError: 6
};

//HTTP success
const httpSuccess = 200;

const dplAuthToken = new DplAuthToken();

export {
   ahProviders,
   ahProviderCodes,
   ahKeys,
   ahKeyCodes,
   ahErrCodes,
   httpSuccess,
   dplAuthToken
};
