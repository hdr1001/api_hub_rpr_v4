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

import { useContext } from 'react';
import { DataContext } from './App'
import Box from '@mui/system/Box';
import DnbDplDBs from './AhDnbDplDBs';
import { contentBox, arrFilesBox } from './style';

export default function AhContent(props) {
   const dataContext = useContext(DataContext);

   return (
      <Box
         sx={contentBox}
      >
         {
            dataContext.arrData.map(data => 
               <Box
                  key={data.uuid}
                  sx={arrFilesBox}
               >
                  <DnbDplDBs
                     file={data.file}
                     uuid={data.uuid}
                  />
               </Box>
            )
         }
      </Box>
   )
}
