// *********************************************************************
//
// API Hub request, persist and respond node app entry point
// JavaScript code file: index.js
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
// To run this code execute: node index
//
// *********************************************************************

import express from 'express';
import { ahErrCodes } from './ah_rpr_globs.js';
import ApiHubErr from './ah_rpr_err.js';
import hub from './routes/hub.js';

const app = express();

const port = process.env.PORT || 3000;

app.use('/hub', hub);

app.use((req, resp) => {
   const ahErr = new ApiHubErr(ahErrCodes.unableToLocate);

   resp.status(ahErr.apiHubErr.http.status).json(ahErr);
})

const server = app.listen(port, err => {
   if(err) {
      console.log(`Error occurred initializing Express server, ${err.message}`)
   }
   else {
      console.log(`Now listening on port ${server.address().port}`)
   }
});
