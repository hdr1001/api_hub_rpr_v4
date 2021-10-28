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

import React from 'react';
import Typography from '@mui/material/Typography';

export default function DplDBsMain({ oDBs }) {
   const dplReq = oDBs.inquiryDetail;
   const dplDataBlocks = oDBs.inquiryDetail && oDBs.inquiryDetail.blockIDs;
   const org = oDBs.organization;

   if(!(dplReq && dplDataBlocks && org)) {
      return <Typography>Error, JSON does not contain required elements</Typography>
   }

   return (
      <>
         <p>{org.primaryName}</p>
      </>
   )
}
