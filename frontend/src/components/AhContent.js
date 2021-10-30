// *********************************************************************
//
// API Hub request, persist and respond UI content component
// JavaScript code file: AhContent.js
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

import React from 'react';
import Box from '@mui/system/Box';
import DnbDplDBs from './AhDnbDplDBs';

export default function AhContent(props) {
   return (
      <Box
         sx={{
            mt: 1,
            mx: 0.5,
            display: 'inline-block' 
         }}
      >
         {
            props.state.arrFiles.map((file, idx) => 
               <Box
                  key={idx}
                  sx={{
                     width: 385,
                     m: 1,
                     float: 'right'
                  }}
               >
                  <DnbDplDBs file={file} />
               </Box>
            )
         }
      </Box>
   )
}
