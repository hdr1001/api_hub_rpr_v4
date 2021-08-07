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

const app = express();

app.get('/', (req, res) => {
   res.send('Hello World, API Hub RPR (v4) remote container! 🙂👋')
});

const server = app.listen(3000, () => {
   console.log(`Now listening on port ${server.address().port}`)
});
