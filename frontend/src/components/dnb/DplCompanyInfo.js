// *********************************************************************
//
// API Hub, D&B D+ Company Information data block component
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

import React, { useState } from 'react';
import {
   B2BDataTable,
   B2BDataTableRowFilter,
   B2BDataTableRow,
   bIsEmptyObj,
   getArrAddr } from '../AhUtils';
import { oCurrOpts } from '../style'

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
         if(typeof oFin.yearlyRevenue[0].value === 'number') {
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
      if(sDesc.substr(idx + 3, 1) === ')') { //Just checking :-)
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
            {!!(duns) && 
               <B2BDataTableRow label='DUNS delivered' content={duns} />
            }
            {!!(primaryName) && 
               <B2BDataTableRow label='Primary name' content={primaryName} />
            }
            {!!(registeredName) &&
               <B2BDataTableRow label='Registered name' content={registeredName} />
            }
            {tradeStyleNames && tradeStyleNames.length > 0 &&
               <B2BDataTableRow
                  label='Tradestyle(s)'
                  content={tradeStyleNames.map(oTS => oTS.name)}
               />
            }
            {businessEntityType && !!(businessEntityType.description) &&
               <B2BDataTableRow
                  label='Entity type'
                  content={businessEntityType.description}
               />
            }
            {legalForm && !!(legalForm.description) &&
               <B2BDataTableRow label='Legal form' content={legalForm.description} />
            }
            {registeredDetails && registeredDetails.legalForm &&
                           !!(registeredDetails.legalForm.description) &&
               <B2BDataTableRow
                  label='Registered as'
                  content={registeredDetails.legalForm.description}
               />
            }
            {controlOwnershipType && !!(controlOwnershipType.description) &&
               <B2BDataTableRow
                  label='Ownership type'
                  content={controlOwnershipType.description}
               />
            }
            {!!(startDate) &&
               <B2BDataTableRow label='Start date' content={startDate} />
            }
            {!!(incorporatedDate) &&
               <B2BDataTableRow label='Incorp. date' content={incorporatedDate} />
            }
            {dunsControlStatus && dunsControlStatus.operatingStatus &&
                     !!(dunsControlStatus.operatingStatus.description) &&
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
            {!bIsEmptyObj(primaryAddress) &&
               <B2BDataTableRow
                  label='Primary address'
                  content={getArrAddr(primaryAddress)}
               />
            }
            {!primaryAddrIsRegisteredAddr && !bIsEmptyObj(registeredAddress) &&
               <B2BDataTableRow
                  label='Registered address'
                  content={getArrAddr(registeredAddress)}
               />
            }
            {!bIsEmptyObj(mailingAddress) &&
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
      if(!(props.content && props.content.organization)) { return null }

      const { telephone, websiteAddress, email } = props.content.organization;

      if(!((telephone && telephone.length) ||
            (websiteAddress && websiteAddress.length) ||
            (email && email.length))) {
         return null
      }

      return (
         <B2BDataTable caption='Contact @'>
            {telephone && telephone.length > 0 &&
               <B2BDataTableRow
                  label='Telephone'
                  content={telephone.map(oTel => getCiTel(oTel))}
               />
            }
            {websiteAddress && websiteAddress.length > 0 &&
               <B2BDataTableRow
                  label='Website'
                  content={websiteAddress.map(oURL => oURL.url)}
               />
            }
            {email && email.length > 0 &&
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
      if(!(props.content && props.content.organization &&
            ['financials', 'organizationSizeCategory', 'numberOfEmployees']
               .some(prop => props.content.organization[prop]))) {

         if(typeof props.content.organization['isStandalone'] !== 'boolean') {
            return null;
         }
      }

      const { financials, numberOfEmployees, organizationSizeCategory,
                  isStandalone } = props.content.organization;

      return (
         <B2BDataTable caption='Company size'>
            {financials && financials.length > 0 &&
               <B2BDataTableRow {...getCiYearlyRevenue(financials[0])} />
            }
            {numberOfEmployees && numberOfEmployees.length > 0 &&
               numberOfEmployees.map((numEmpl, idx) => 
                  <B2BDataTableRow key={idx}
                     {...getCiNumEmpl(numEmpl)}
                  />
               )
            }
            {organizationSizeCategory && !!(organizationSizeCategory.description) &&
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

   function IndustryCodes(props) {
      const { industryCodes } = props.content.organization;
      const [ filterCodeType, setFilterCodeType ] = useState(399);

      let ret = null;

      if(Array.isArray(industryCodes) && industryCodes.length > 0) {

         const uniqueTypeCodes = industryCodes.reduce(
            (arrDeduped, industryCode) => arrDeduped.some(dedupIndustryCode => industryCode.typeDnBCode === dedupIndustryCode.value)
               ?
                  arrDeduped
               :
                  [...arrDeduped, {
                     key: industryCode.typeDnBCode,
                     value: industryCode.typeDnBCode,
                     desc: industryCode.typeDescription
                  }],
            []
         );

         function getInitialTypeCode() {
            return uniqueTypeCodes.some(IndustryTypeCode => IndustryTypeCode.value === 399)
               ?
                  399
               :
                  uniqueTypeCodes[0].typeDnBCode
         }

         ret = (
            <B2BDataTable caption='Activity codes'>
               <B2BDataTableRowFilter
                  value={filterCodeType}
                  onChange={setFilterCodeType}
                  items={uniqueTypeCodes}
               />
               {industryCodes
                  .filter(industryCode => industryCode.typeDnBCode === filterCodeType)
                  .map((industryCode, idx) => 
                     <B2BDataTableRow key={idx}
                        label={industryCode.code}
                        content={industryCode.description}
                     />
                  )
               }
            </B2BDataTable>
         );
      }

      return ret;
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
         <IndustryCodes content={props.content} />
         <StockExchanges content={props.content} />
      </>
   )
}
