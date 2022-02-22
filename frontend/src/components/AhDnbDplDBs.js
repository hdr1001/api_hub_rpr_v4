// *********************************************************************
//
// API Hub request, persist and respond UI D&B Direct+ component
// JavaScript code file: AhDnbDplDBs.js
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

import { useState, useEffect, memo } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import DplDBsMain from './dnb/DplDBsMain';
import { horizontalPadding } from './style';

export default memo(function DnbDplDBs(props) {
   const [oDbData, setObjDbData] = useState(null);
   const [errMsg, setErrMsg] = useState('');

   useEffect(() => {
      const fileReader = new FileReader();
   
      fileReader.onload = evnt => {
         try {
            setObjDbData(JSON.parse(evnt.target.result));
         }
         catch(err) {
            setErrMsg(err.message ? err.message : `Error parsing file ${props.file.name}`);
         }
      }
   
      fileReader.onerror = err => {
         setErrMsg(err.message ? err.message : `Error reading file ${props.file.name}`)
      };
   
      fileReader.readAsText(props.file, 'utf-8');
   }, [props.file]);

   return (
      <>
         {errMsg
            ?
               <Card sx={ horizontalPadding }>
                  <Typography>
                     {errMsg}
                  </Typography>
               </Card>
            :
               <Box sx={ horizontalPadding }>
                  {oDbData && <DplDBsMain oDBs={oDbData} uuid={props.uuid} />}
               </Box>
         }
      </>
   );
})
