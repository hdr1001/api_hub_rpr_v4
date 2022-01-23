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

import { useState, useRef } from 'react';
import {
   B2BDataTable,
   B2BDataTableRowFilter,
   B2BDataTableRow,
   bIsEmptyObj,
   getArrAddr } from '../AhUtils';
import { oCurrOpts } from '../style'

//Company Info name object conversion
function getCiName(labelIn, nameIn) {
   let oRet = {label: labelIn, content: ''};

   if(typeof nameIn === 'string') {
      oRet.content = nameIn;
      return oRet;
   }

   if(typeof nameIn === 'object') {
      if(nameIn.language && nameIn.language.description) {
         oRet.label = <span>{labelIn}<br /><small>{'*' + nameIn.language.description}</small></span>
      }
      else {
         oRet.label = <span>{labelIn}</span>
      }

      oRet.content = nameIn.name;
   }

   return oRet;
}

//Company Info telephone object conversion
function getCiTel(oTel) {
   return (oTel.isdCode ? '+' + oTel.isdCode + ' ' : '') + oTel.telephoneNumber
}

//Get yearly revenue number from the financials object
function getCiYearlyRevenue(oFin, defaultCurrency) {
   function ExpandedLabel(props) {
      return (
         <span>{props.label}<br />
            <small>*figure is {props.line2}</small>
         </span>
      )
   }

   let oRet = {label: 'Yearly revenue', content: ''};

   if(Array.isArray(oFin.yearlyRevenue) && oFin.yearlyRevenue.length) {
      let yearlyRevenue = oFin.yearlyRevenue.filter(yr => yr.currency === defaultCurrency);

      if(yearlyRevenue.length) {
         yearlyRevenue = yearlyRevenue[0]
      }
      else { //No value for the default currency
         yearlyRevenue = oFin.yearlyRevenue[0]
      }

      if(yearlyRevenue.value && yearlyRevenue.currency) {
         let oCurrency = { ...oCurrOpts, currency: yearlyRevenue.currency };

         const intlNumFormat = new Intl.NumberFormat('en-us', oCurrency);

         oRet.content = intlNumFormat.format(yearlyRevenue.value);
      }
      else {
         if(typeof yearlyRevenue.value === 'number') {
            oRet.content = yearlyRevenue.value
         }
      }

      if(oFin.reliabilityDnBCode === 9093) {
         oRet.label = <ExpandedLabel label={oRet.label} line2="an estimate" />
      }
      else if(oFin.reliabilityDnBCode === 9094) {
         oRet.label = <ExpandedLabel label={oRet.label} line2="modelled" />
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

      const { duns, primaryName, multilingualPrimaryName,
               registeredName, multilingualRegisteredNames,
               tradeStyleNames, multilingualTradestyleNames,                
               businessEntityType, legalForm, registeredDetails,
               controlOwnershipType, startDate, incorporatedDate,
               dunsControlStatus } = props.content.organization;

      return (
         <B2BDataTable caption='General'>
            {!!(duns) && 
               <B2BDataTableRow label='DUNS delivered' content={duns} />
            }
            {Array.isArray(multilingualPrimaryName) && multilingualPrimaryName.length > 0
               ?
                  multilingualPrimaryName.map((oPN, idx) =>
                     <B2BDataTableRow {...getCiName('Primary name', oPN)} key={idx} />
                  )
               :
                  !!(primaryName) && 
                     <B2BDataTableRow {...getCiName('Primary name', primaryName)} />
            }
            {Array.isArray(multilingualRegisteredNames) && multilingualRegisteredNames.length > 0
               ?
                  multilingualRegisteredNames.map((oRN, idx) =>
                     <B2BDataTableRow {...getCiName('Registered name', oRN)} key={idx} />
                  )
               :
                  !!(registeredName) && 
                     <B2BDataTableRow {...getCiName('Registered name', registeredName)} />
            }
            {Array.isArray(multilingualTradestyleNames) && multilingualTradestyleNames.length > 0
               ?
                  multilingualTradestyleNames.map((oTS, idx) =>
                     <B2BDataTableRow {...getCiName('Tradestyle', oTS)} key={idx} />
                  )
               :
                  Array.isArray(tradeStyleNames) && tradeStyleNames.length > 0 &&
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
               <B2BDataTableRow {...getCiYearlyRevenue(financials[0], props.content.organization.defaultCurrency)} />
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

   //Company information size component
   function DomesticUltSize(props) {
      if(props.content && props.content.organization &&
            props.content.organization.domesticUltimate &&
               (!bIsEmptyObj(props.content.organization.domesticUltimate.numberOfEmployees) ||
                  !bIsEmptyObj(props.content.organization.domesticUltimate.financials))) {

         const {numberOfEmployees, financials} = props.content.organization.domesticUltimate;

         return (
            <B2BDataTable caption='Domestic ultimate size'>
               {financials && financials.length > 0 &&
                  <B2BDataTableRow {...getCiYearlyRevenue(financials[0], props.content.organization.defaultCurrency)} />
               }
               {numberOfEmployees && numberOfEmployees.length > 0 &&
                  numberOfEmployees.map((numEmpl, idx) => 
                     <B2BDataTableRow key={idx}
                        {...getCiNumEmpl(numEmpl)}
                     />
                  )
               }
            </B2BDataTable>
         );
      }
      else {
         return null
      }
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
      function ListIndustryCodes(props) {
         const [ filterCodeType, setFilterCodeType ] = useState(
            props.indCodes.some(indCode => indCode.typeDnBCode === 399)
               ?
                  399
               :
                  props.indCodes[0].typeDnBCode
         );

         const uniqueTypeCodes = useRef(props.indCodes.reduce(
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
         ));
   
         return (
            <B2BDataTable caption='Activity codes'>
               <B2BDataTableRowFilter
                  value={filterCodeType}
                  onChange={setFilterCodeType}
                  items={uniqueTypeCodes.current}
               />
               {props.indCodes
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

      const { industryCodes } = props.content.organization;

      if(!Array.isArray(industryCodes) || industryCodes.length === 0) {
         return null
      }
      else {
         return <ListIndustryCodes indCodes={industryCodes} />
      }
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
         <DomesticUltSize content={props.content} />
         <RegistrationNumbers content={props.content} />
         <Activities content={props.content} />
         <IndustryCodes content={props.content} />
         <StockExchanges content={props.content} />
      </>
   )
}
