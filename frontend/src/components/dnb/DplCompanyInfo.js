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

import React from 'react';
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

//Company Info telephone object conversion
function getCiTel(oTel) {
   return (oTel.isdCode ? '+' + oTel.isdCode + ' ' : '') + oTel.telephoneNumber
}

//Data block Company Information component
export default function DbCompanyInfo(props) {
   //Company Information General component
   function General(props) {
      if(!(props.content && props.content.org)) {
         return null;
      }

      const { duns, primaryName, registeredName, tradeStyleNames,
               businessEntityType, legalForm, registeredDetails,
               controlOwnershipType, startDate, incorporatedDate,
               dunsControlStatus } = props.content.org;

      return (
         <B2BDataTable caption='General'>
            {duns && 
               <B2BDataTableRow label='DUNS delivered' content={duns} />
            }
            {primaryName && 
               <B2BDataTableRow label='Primary name' content={primaryName} />
            }
            {registeredName &&
               <B2BDataTableRow label='Registered name' content={registeredName} />
            }
            {tradeStyleNames && tradeStyleNames.length &&
               <B2BDataTableRow
                  label='Tradestyle(s)'
                  content={tradeStyleNames.map(oTS => oTS.name)}
               />
            }
            {businessEntityType && businessEntityType.description &&
               <B2BDataTableRow
                  label='Entity type'
                  content={businessEntityType.description}
               />
            }
            {legalForm && legalForm.description &&
               <B2BDataTableRow label='Legal form' content={legalForm.description} />
            }
            {registeredDetails && registeredDetails.legalForm &&
                           registeredDetails.legalForm.description &&
               <B2BDataTableRow
                  label='Registered as'
                  content={registeredDetails.legalForm.description}
               />
            }
            {controlOwnershipType && controlOwnershipType.description &&
               <B2BDataTableRow
                  label='Ownership type'
                  content={controlOwnershipType.description}
               />
            }
            {startDate &&
               <B2BDataTableRow label='Start date' content={startDate} />
            }
            {incorporatedDate &&
               <B2BDataTableRow label='Incorp. date' content={incorporatedDate} />
            }
            {dunsControlStatus && dunsControlStatus.operatingStatus &&
                     dunsControlStatus.operatingStatus.description &&
               <B2BDataTableRow
                  label='Operating status'
                  content={dunsControlStatus.operatingStatus.description}
               />
            }
         </B2BDataTable>
      )
   }

   //Company Information Address component
   function Address(props) {
      if(!(props.content && props.content.org) ||
            !['primaryAddress', 'registeredAddress', 'mailingAddress'].some(prop => props.content.org[prop])) {
         return null;
      }

      const { primaryAddress, registeredAddress, mailingAddress } = props.content.org;

      const primaryAddrIsRegisteredAddr = primaryAddress && primaryAddress.isRegisteredAddress;

      return (
         <B2BDataTable caption='Address'>
            {primaryAddress && !bObjIsEmpty(primaryAddress) &&
               <B2BDataTableRow
                  label='Primary address'
                  content={getArrAddr(primaryAddress)}
               />
            }
            {!primaryAddrIsRegisteredAddr && registeredAddress && !bObjIsEmpty(registeredAddress) &&
               <B2BDataTableRow
                  label='Registered address'
                  content={getArrAddr(registeredAddress)}
               />
            }
            {mailingAddress && !bObjIsEmpty(mailingAddress) &&
               <B2BDataTableRow
                  label='Mail address'
                  content={getArrAddr(mailingAddress)}
               />
            }
         </B2BDataTable>
      )
   }

   //Company Information Contact component
   function ContactAt(props) {
      if(!(props.content && props.content.org) ||
            !['telephone', 'websiteAddress', 'email'].some(prop => props.content.org[prop])) {
         return null;
      }

      const { telephone, websiteAddress, email } = props.content.org;

      return (
         <B2BDataTable caption='Contact @'>
            {telephone && telephone.length &&
               <B2BDataTableRow
                  label='Telephone'
                  content={telephone.map(oTel => getCiTel(oTel))}
               />
            }
            {websiteAddress && websiteAddress.length &&
               <B2BDataTableRow
                  label='Website'
                  content={websiteAddress.map(oURL => oURL.url)}
               />
            }
            {email && email.length &&
               <B2BDataTableRow
                  label='e-mail'
                  content={email.map(oEmail => oEmail.address)}
               />
            }
         </B2BDataTable>
      )
   }

   return (
      <>
         <General content={props.globalDa} />
         <Address content={props.globalDa} />
         <ContactAt content={props.globalDa} />
      </>
   )
}
