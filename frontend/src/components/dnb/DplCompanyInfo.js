// *********************************************************************
//
// API Hub request, D&B D+ Company Information data block component
// JavaScript code file: DplCompanyInfo.js
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
import { B2BDataTable, B2BDataTableRow, bObjIsEmpty } from '../AhUtils';

export default function DbCompanyInfo(props) {
   //State determined by Company Information data availability
   const [ciDa, setCiDa] = useState(null);

   useEffect(() => {
      let ciDa = {}
      
      //Access the organization property through a property on ciDa
      ciDa.org = props.globalDa.org;

      ciDa.tradeStyleNames = ciDa.org.tradeStyleNames && ciDa.org.tradeStyleNames.length > 0;

      ciDa.operatingStatus = ciDa.org.dunsControlStatus && ciDa.org.dunsControlStatus.operatingStatus
                                 && !bObjIsEmpty(ciDa.org.dunsControlStatus.operatingStatus);

      if(props.globalDa.blockIDs.companyinfo.level === 2) {
         ciDa.org.registeredName ? ciDa.registeredName = true : ciDa.registeredName = false;

         ciDa.businessEntityType = ciDa.org.businessEntityType 
                                                   && ciDa.org.businessEntityType.description;

         ciDa.legalForm = ciDa.org.legalForm && ciDa.org.legalForm.description;

         ciDa.registeredDetails = ciDa.org.registeredDetails
                                       && ciDa.org.registeredDetails.legalForm
                                       && ciDa.org.registeredDetails.legalForm.description;

         ciDa.controlOwnershipType = ciDa.org.controlOwnershipType &&
                                       !bObjIsEmpty(ciDa.org.controlOwnershipType);

         ciDa.org.startDate ? ciDa.startDate = true : ciDa.startDate = false;

         ciDa.org.incorporatedDate ? ciDa.incorporatedDate = true : ciDa.incorporatedDate = false;
      }

      setCiDa(ciDa)
   }, [])

   return (
      <>
      {ciDa && 
         <B2BDataTable caption='General'>
            {props.globalDa.duns && <B2BDataTableRow label='DUNS delivered'
               content={ciDa.org.duns} />}
            {props.globalDa.primaryName && <B2BDataTableRow label='Primary name'
               content={ciDa.org.primaryName} />}
            {ciDa.registeredName && <B2BDataTableRow label='Registered name'
               content={ciDa.org.registeredName} />}
            {ciDa.tradeStyleNames && <B2BDataTableRow label='Tradestyle(s)'
               content={ciDa.org.tradeStyleNames.map(oTS => oTS.name)} />}
            {ciDa.businessEntityType && <B2BDataTableRow label='Entity type'
               content={ciDa.org.businessEntityType.description} />}
            {ciDa.legalForm && <B2BDataTableRow label='Legal form'
               content={ciDa.org.legalForm.description} />}
            {ciDa.registeredDetails && <B2BDataTableRow label='Registered as'
               content={ciDa.org.registeredDetails.legalForm.description} />}
            {ciDa.controlOwnershipType && <B2BDataTableRow label='Ownership type'
               content={ciDa.org.controlOwnershipType.description} />}
            {ciDa.startDate && <B2BDataTableRow label='Start date'
               content={ciDa.org.startDate} />}
            {ciDa.incorporatedDate && <B2BDataTableRow label='Incorp. date'
               content={ciDa.org.incorporatedDate} />}
            {ciDa.operatingStatus && <B2BDataTableRow label='Operating status'
               content={ciDa.org.dunsControlStatus.operatingStatus.description} />}
         </B2BDataTable>
      }
      </>
   )
}
