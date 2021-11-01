// *********************************************************************
//
// API Hub request, main D&B Direct+ data block component
// JavaScript code file: DplDBsMain.js
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

import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { B2BDataTable, B2BDataTableRow } from '../AhUtils'
import DbCompanyInfo from './DplCompanyInfo';

export default function DplDBsMain({ oDBs }) {
   let dplReq, dplDataBlocks, org;

   const [dataAvailability, setDataAvailability] = useState(null);
   const [errMsg, setErrMsg] = useState('');

   useEffect(() => {
      //Dynamically determine data availability
      const da = {}; 

      //The very basics
      da.dplReq = oDBs.inquiryDetail;
      da.dplDataBlocks = oDBs.inquiryDetail && oDBs.inquiryDetail.blockIDs;
      da.org = oDBs.organization;

      if(!(da.dplReq && da.dplDataBlocks && da.org)) {
         setErrMsg('Error, JSON is missing required elements');
         return;
      }

      //Parse the information contained in property blockIDs
      da.blockIDs = {};

      da.dplDataBlocks.forEach(dbID => {
         let splitBlockIDs = dbID.split('_');

         da.blockIDs[splitBlockIDs[0]] = {};
         da.blockIDs[splitBlockIDs[0]]['level'] = parseInt(splitBlockIDs[1].slice(-1), 10);
         da.blockIDs[splitBlockIDs[0]]['version'] = splitBlockIDs[2];
      });

      //Check for the availability of the common data elements
      da.org.duns ? da.duns = true : da.duns = false;
      da.org.primaryName ? da.primaryName = true : da.primaryName = false;
      da.org.countryISOAlpha2Code ? da.countryISOAlpha2Code = true : 
                                       da.countryISOAlpha2Code = false;
/*
      //Log the data availability
      console.log('\nAvailable data');
      Object.keys(da)
         .filter(sKey => da[sKey])
         .forEach(sKey => console.log('  ' + sKey));

      console.log('\nMissing data');
      Object.keys(da)
         .filter(sKey => !da[sKey])
         .forEach(sKey => console.log('  ' + sKey));
*/
      setDataAvailability(da);
   }, []);

   return (
      <>
         {errMsg
            ?
               <Paper sx={{ px: 0.5 }}>
                  <Typography>
                     {errMsg}
                  </Typography>
               </Paper>
            :
               <>
               {dataAvailability && dataAvailability.dplReq &&
                  <B2BDataTable caption='Inquiry details'>
                     {dataAvailability.dplReq.duns && <B2BDataTableRow label='DUNS'
                           content={dataAvailability.dplReq.duns} />}
                     {dataAvailability.dplReq.blockIDs && <B2BDataTableRow label='Data blocks'
                           content={dataAvailability.dplReq.blockIDs} />}
                     {dataAvailability.dplReq.tradeUp && <B2BDataTableRow label='Trade up'
                           content={dataAvailability.dplReq.tradeUp} />}
                  </B2BDataTable>
               }
               {dataAvailability && !dataAvailability.blockIDs['companyinfo'] &&
                  <B2BDataTable caption='Common data'>
                     {dataAvailability.duns && <B2BDataTableRow label='DUNS delivered'
                        content={dataAvailability.org.duns} />}
                     {dataAvailability.primaryName && <B2BDataTableRow label='Primary name'
                        content={dataAvailability.org.primaryName} />}
                     {dataAvailability.countryISOAlpha2Code && <B2BDataTableRow label='Country code'                      
                        content={dataAvailability.org.countryISOAlpha2Code} />}
                  </B2BDataTable>
               }
               {dataAvailability && dataAvailability.blockIDs['companyinfo'] &&
                  <DbCompanyInfo globalDa={dataAvailability} />
               }
               </>
         }
      </>
   );
}