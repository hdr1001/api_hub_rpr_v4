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

//Address to object conversion
function getArrAddr(oAddr) {
   let arrAddr = [], str = '';

   if(!oAddr) {return arrAddr}

   //Street address
   if(oAddr.streetAddress) {
      if(oAddr.streetAddress.line1) {arrAddr.push(oAddr.streetAddress.line1)}
      if(oAddr.streetAddress.line2) {arrAddr.push(oAddr.streetAddress.line2)}
   }

   //Refer to alternative properties if streetAddress doesn't contain info
   if(arrAddr.length === 0) {
      if(oAddr.streetName) {
         str = oAddr.streetName;
   
         if(oAddr.streetNumber) {
            str += ' ' + oAddr.streetNumber
         }

         arrAddr.push(str);

         str = '';
      }
   }

   //Postalcode & city
   if(oAddr.postalCode) {str = oAddr.postalCode}
   if(oAddr.addressLocality && !bObjIsEmpty(oAddr.addressLocality)) {
      str.length > 0 ? str += ' ' + oAddr.addressLocality.name : str = oAddr.addressLocality.name
   }
   if(str.length > 0) {arrAddr.push(str)}

   if(oAddr.addressCountry && oAddr.addressCountry.name) {arrAddr.push(oAddr.addressCountry.name)}

   if(oAddr.isRegisteredAddress) {
      arrAddr.push('Entity registered at this address');
   }

   return arrAddr;
}

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

      ciDa.primaryAddress = ciDa.org.primaryAddress && !bObjIsEmpty(ciDa.org.primaryAddress);

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

         ciDa.registeredAddress = ciDa.org.registeredAddress
                                             && !bObjIsEmpty(ciDa.org.registeredAddress);

         ciDa.mailingAddress = ciDa.org.mailingAddress && !bObjIsEmpty(ciDa.org.mailingAddress);
      }

      setCiDa(ciDa)
   }, [])

   return (
      <>
      {ciDa && 
         <B2BDataTable caption='General'>
            {props.globalDa.duns && 
               <B2BDataTableRow label='DUNS delivered' content={ciDa.org.duns} />}
            {props.globalDa.primaryName && 
               <B2BDataTableRow label='Primary name' content={ciDa.org.primaryName} />}
            {ciDa.registeredName &&
               <B2BDataTableRow label='Registered name' content={ciDa.org.registeredName} />}
            {ciDa.tradeStyleNames &&
               <B2BDataTableRow
                  label='Tradestyle(s)'
                  content={ciDa.org.tradeStyleNames.map(oTS => oTS.name)}
               />
            }
            {ciDa.businessEntityType &&
               <B2BDataTableRow
                  label='Entity type'
                  content={ciDa.org.businessEntityType.description}
               />
            }
            {ciDa.legalForm &&
               <B2BDataTableRow label='Legal form' content={ciDa.org.legalForm.description} />}
            {ciDa.registeredDetails &&
               <B2BDataTableRow
                  label='Registered as'
                  content={ciDa.org.registeredDetails.legalForm.description}
               />
            }
            {ciDa.controlOwnershipType &&
               <B2BDataTableRow
                  label='Ownership type'
                  content={ciDa.org.controlOwnershipType.description}
               />
            }
            {ciDa.startDate &&
               <B2BDataTableRow label='Start date' content={ciDa.org.startDate} />}
            {ciDa.incorporatedDate &&
               <B2BDataTableRow label='Incorp. date' content={ciDa.org.incorporatedDate} />}
            {ciDa.operatingStatus &&
               <B2BDataTableRow
                  label='Operating status'
                  content={ciDa.org.dunsControlStatus.operatingStatus.description}
               />
            }
         </B2BDataTable>
      }
      {ciDa &&
         ['primaryAddress', 'registeredAddress', 'mailingAddress'].some(prop => ciDa[prop]) &&
            <B2BDataTable caption='Address'>
               {ciDa.primaryAddress &&
                  <B2BDataTableRow
                     label='Primary address'
                     content={getArrAddr(ciDa.org.primaryAddress)}
                  />
               }
               {ciDa.registeredAddress &&
                  !(ciDa.primaryAddress && ciDa.org.primaryAddress.isRegisteredAddress) &&
                     <B2BDataTableRow
                        label='Registered address'
                        content={getArrAddr(ciDa.org.registeredAddress)}
                     />
               }
               {ciDa.mailingAddress &&
                  <B2BDataTableRow
                     label='Mail address'
                     content={getArrAddr(ciDa.org.mailingAddress)}
                  />
               }
            </B2BDataTable>
      }
      </>
   )
}
