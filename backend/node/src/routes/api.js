// *********************************************************************
//
// API Hub request, persist and respond API routes
// JavaScript code file: ./routes/api.js
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
import { ahProviders, ahProviderCodes } from '../ah_rpr_globs.js';
import gleif from './gleif.js';
import dnb from './dnb.js';

const router = express.Router();

router.use(`/${ahProviders[ahProviderCodes.gleif]}`, gleif);
router.use(`/${ahProviders[ahProviderCodes.dnb]}`, dnb);

router.get(`/apis`, (req, resp) => {
    resp.json(ahProviders)
});

export default router;
