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
import { oCurrOpts } from '../style'

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

//Get yearly revenue number from the financials object
function getCiYearlyRevenue(oFin) {
   let oRet = {label: 'Yearly revenue', content: ''};

   if(oFin.yearlyRevenue && oFin.yearlyRevenue[0]) {
      if(oFin.yearlyRevenue[0].value && oFin.yearlyRevenue[0].currency) {
         let oCurrency = { ...oCurrOpts, currency: oFin.yearlyRevenue[0].currency }

         const intlNumFormat = new Intl.NumberFormat('en-us', oCurrency);

         oRet.content = intlNumFormat.format(oFin.yearlyRevenue[0].value)
      }
      else {
         if(oFin.yearlyRevenue[0].value) {
            oRet.content = oFin.yearlyRevenue[0].value
         }
      }

      if(oFin.reliabilityDnBCode === 9093) {
         oRet.label = <span>{oRet.label}<br />
                        <small>*figure is an estimate</small>
                      </span>;
      }
   }

   return oRet;
}

//Get number of employees figure from object
function getCiNumEmpl(oNumEmpl) {
   const oRet = {
      label: 'Number of Employees',
      content: ''
   };

   if(typeof oNumEmpl.value === 'number') {oRet.content = oNumEmpl.value.toString()}

   let sLabelAdd = oNumEmpl.informationScopeDescription
      ?
         oNumEmpl.informationScopeDescription
      :
         '';

   if(oNumEmpl.reliabilityDescription && sLabelAdd) {
      sLabelAdd += ' & ' + oNumEmpl.reliabilityDescription;
   }
   else if(oNumEmpl.reliabilityDescription) {
      sLabelAdd = oNumEmpl.reliabilityDescription;
   }

   if(sLabelAdd) {
      oRet.label = <span>{oRet.label}<br /><small>*{sLabelAdd}</small></span>
   }

   return oRet;
}

//Remove the country code from a description
function getDescNoCountryCode(sDesc) {
   const idx = sDesc.indexOf('(');

   if(idx > -1) {
      if(sDesc.substr(idx + 3, 1) == ')') { //Just checking :-)
         sDesc = sDesc.substr(0, idx - 1).trim();
      }
   }

   return sDesc;
}

//Data block Company Information component
export default function DbCompanyInfo(props) {
   //Company Information General component
   function General(props) {
      if(!(props.content && props.content.organization)) {
         return null
      }

      const { duns, primaryName, registeredName, tradeStyleNames,
               businessEntityType, legalForm, registeredDetails,
               controlOwnershipType, startDate, incorporatedDate,
               dunsControlStatus } = props.content.organization;

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
      );
   }

   //Company Information Address component
   function Address(props) {
      if(!(props.content && props.content.organization) ||
            !['primaryAddress', 'registeredAddress', 'mailingAddress'].some(prop => props.content.organization[prop])) {
         return null
      }

      const { primaryAddress, registeredAddress, mailingAddress } = props.content.organization;

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
      );
   }

   //Company Information Contact component
   function ContactAt(props) {
      if(!(props.content && props.content.organization) ||
            !['telephone', 'websiteAddress', 'email'].some(prop => props.content.organization[prop])) {
         return null;
      }

      const { telephone, websiteAddress, email } = props.content.organization;

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
      );
   }

   //Company information size component
   function CompanySize(props) {
      if(!(props.content && props.content.organization) ||
            !['financials', 'organizationSizeCategory', 'numberOfEmployees', 
                  'isStandalone'].some(prop => props.content.organization[prop])) {
         return null;
      }

      const { financials, numberOfEmployees, organizationSizeCategory,
                  isStandalone } = props.content.organization;

      return (
         <B2BDataTable caption='Company size'>
            {financials && financials.length &&
               <B2BDataTableRow {...getCiYearlyRevenue(financials[0])} />
            }
            {numberOfEmployees && numberOfEmployees.length &&
               numberOfEmployees.map((numEmpl, idx) => 
                  <B2BDataTableRow key={idx}
                     {...getCiNumEmpl(numEmpl)}
                  />
               )
            }
            {organizationSizeCategory && organizationSizeCategory.description &&
               <B2BDataTableRow
                  label='Size category'
                  content={organizationSizeCategory.description}
               />
            }
            {typeof isStandalone === 'boolean' &&
               <B2BDataTableRow
                  label='Standalone'
                  content={isStandalone ? 'Yes' : 'No'}
               />
            }
         </B2BDataTable>
      );
   }

   function RegistrationNumbers(props) {
      const { registrationNumbers } = props.content.organization;

      if(!registrationNumbers || registrationNumbers.length === 0) { return null }

      return (
         <B2BDataTable caption='Registration number(s)'>
            {
               registrationNumbers.map(regNum => 
                  <B2BDataTableRow key={regNum.typeDnBCode}
                     label={getDescNoCountryCode(regNum.typeDescription)}
                     content={regNum.registrationNumber}
                  />
               )
            }
         </B2BDataTable>
      );
   }

   function Activities(props) {
      const { activities } = props.content.organization;

      if(!activities || activities.length === 0) { return null }

      return (
         <B2BDataTable caption='Business operations'>
            {
               activities.map((act, idx) => 
                  <B2BDataTableRow key={idx}
                     label={act.language.description}
                     content={act.description}
                  />
               )
            }
         </B2BDataTable>
      );
   }

   function StockExchanges(props) {
      const { stockExchanges } = props.content.organization;

      if(!stockExchanges || stockExchanges.length === 0) { return null }

      return (
         <B2BDataTable caption='Stock exchange(s)'>
            { 
               <B2BDataTableRow
                  label='Ticker name(s)'
                  content={stockExchanges.map(stockExch => stockExch.tickerName)}
               />
            }
         </B2BDataTable>
      );
   }

   return (
      <>
         <General content={props.content} />
         <Address content={props.content} />
         <ContactAt content={props.content} />
         <CompanySize content={props.content} />
         <RegistrationNumbers content={props.content} />
         <Activities content={props.content} />
         <StockExchanges content={props.content} />
      </>
   )
}
