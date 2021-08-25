// *********************************************************************
//
// API Hub request, persist and respond, Postgres objects
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
// *********************************************************************

import pg from 'pg';

const { Pool } = pg;
const pool = new Pool();
pool.query('SELECT NOW() as now')
   .then(sqlRslt => console.log(`Database connection at ${sqlRslt.rows[0].now}`))
   .catch(err => console.log(err));

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
// https://node-postgres.com/features/pooling
pool.on('error', (err, client) => {
   console.log(`Unexpected error on idle client ${err.toString()}`);
   process.exit(-1);
})
  
export default {
   query: (text, params) => {

      return pool.query(text, params);
//      return new Promise((resolve, reject) => {
//         setTimeout(() => resolve('foo'), 300);
   }
}
