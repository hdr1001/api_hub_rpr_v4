// *********************************************************************
//
// API Hub request, persist and respond main hub routes
// JavaScript code file: ./routes/hub.js
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
import api from './api.js';

const router = express.Router();

router.use('/api', api);

router.get('/about', (req, resp) => {
   resp.json({
         description: 'API Hub for requesting, persisting & passing on 3rd party API data (v4)',
         gitRepository: 'https://github.com/hdr1001/api_hub_rpr_v4',
         license: 'Apache license, v2.0',
         licenseDetails: 'http://www.apache.org/licenses/LICENSE-2.0',
         copyright: 'Hans de Rooij, 2021'         
   });
});

export default router;
