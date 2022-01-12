// *********************************************************************
//
// API Hub, D&B D+ Filings & Events data block component
// JavaScript code file: DplFilingsEvents.js
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
import { B2BDataTable,
         B2BDataTableRowFilter,
         B2BDataTableRow,
         bIsEmptyObj } from '../AhUtils';

//checks if parameter obj is an object, null value will return false
function isObject(obj) {
   if (obj === null) {
      return false
   }

   return typeof obj === 'function' || typeof obj === 'object';
}

//Function to convert boolean to Yes or No (or -)
function booleanToYesNo(boole) {
   if(typeof boole === 'boolean') {
      if(boole) {
         return 'Yes';
      }
      else {
         return 'No';
      }
   }

   return '-';
}

const filterOpts = [
   {key: 'filterYesOrNo', value: 'YesOrNo', desc: 'Display "Yes" and "No" values'},
   {key: 'filterYes', value: 'Yes', desc: 'Display "Yes" values solely'},
   {key: 'filterNo', value: 'No', desc: 'Display "No" values solely'},
   {key: 'filterNull', value: '-', desc: 'Display "-" values solely'},
   {key: 'filterNone', value: 'None', desc: 'Display all values unfiltered'}
];
      
const arrSignificantEvents = [
   {property: 'hasSignificantEvents', label: 'Has significant events'},
   {property: 'hasDisastrousEvents', label: 'Has disastrous events'},
   {property: 'hasOperationalEvents', label: 'Has operational events'},
   {property: 'hasBusinessDiscontinued', label: 'Business discontinued'},
   {property: 'hasFireOccurred', label: 'Has fire occured'},
   {property: 'hasBurglaryOccured', label: 'Has burglary occured'},
   {property: 'hasControlChange', label: 'Has control change'},
   {property: 'hasPartnerChange', label: 'Has partner change'},
   {property: 'hasCEOChange', label: 'Has CEO change'},
   {property: 'hasNameChange', label: 'Has name change'},
   {property: 'hasCompanyMoved', label: 'Has company moved'} //Added to this category
];

const arrLegalEvents = [
   {property: 'hasLegalEvents', label: 'Has legal events'},
   {property: 'hasOpenLegalEvents', label: 'Has open legal events'},
   {property: 'hasOtherLegalEvents', label: 'Has other legal events'},
   {property: 'hasBankruptcy', label: 'Has bankruptcy'},
   {property: 'hasOpenBankruptcy', label: 'Has open bankruptcy'},
   {property: 'hasInsolvency', label: 'Has insolvency'},
   {property: 'hasLiquidation', label: 'Has liquidation'},
   {property: 'hasSuspensionOfPayments', label: 'Has suspension of payments'},
   {property: 'hasCriminalProceedings', label: 'Has criminal proceedings'},
   {property: 'hasOpenCriminalProceedings', label: 'Has open criminal proceedings'},
   {property: 'hasJudgments', label: 'Has judgments'},
   {property: 'hasOpenJudgments', label: 'Has open judgments'},
   {property: 'hasSuits', label: 'Has suits'},
   {property: 'hasOpenSuits', label: 'Has open suits'},
   {property: 'hasFinancialEmbarrassment', label: 'Has financial embarrassment'},
   {property: 'hasOpenFinancialEmbarrassment', label: 'Has open financial embarrassment'},
   {property: 'hasDebarments', label: 'Has debarments'},
   {property: 'hasOpenDebarments', label: 'Has open debarments'},
   {property: 'hasLiens', label: 'Has liens'},
   {property: 'hasOpenLiens', label: 'Has open liens'},
   {property: 'hasClaims', label: 'Has claims'},
   {property: 'hasOpenClaims', label: 'Has open claims'}
];

const arrFinEvents = [
   {property: 'hasFinancingEvents', label: 'Has financing events'},
   {property: 'hasOpenFinancingEvents', label: 'Has open financing events'},
   {property: 'hasSecuredFilings', label: 'Has secured filings'},
   {property: 'hasOpenSecuredFilings', label: 'Has open secured filings'},
   {property: 'hasLetterOfAgreement', label: 'Has letter of agreement'},
   {property: 'hasLetterOfLiability', label: 'Has letter of liability'},
   {property: 'hasOpenLetterOfLiability', label: 'Has open letter of liability'},
   {property: 'hasRemovedLetterOfLiability', label: 'Has removed letter of liability'}
];

const arrExclusions = [
   {property: 'hasActiveExclusions', label: 'Has active exclusions'},
   {property: 'hasInactiveExclusions', label: 'Has inactive exclusions'}
];

const arrViolations = [
   {property: 'hasEPAViolations', label: 'Has EPA violations'},
   {property: 'hasOSHAViolations', label: 'Has OSHA violations'},
   {property: 'hasGCLCitations', label: 'Has GCL citations'},
   {property: 'hasCAEnvironmentalViolations', label: 'Has Canadian EPA violations'}
];

const arrAwards = [
   {property: 'hasContracts', label: 'Has contracts awarded'},
   {property: 'hasOpenContracts', label: 'Has open contracts awarded'},
   {property: 'hasLoans', label: 'Has loans awarded'},
   {property: 'hasOpenLoans', label: 'Has open loans awarded'},
   {property: 'hasDebts', label: 'Has associated debts'},
   {property: 'hasOpenDebts', label: 'Has associated open debts'},
   {property: 'hasGrants', label: 'Has grants awarded'},
   {property: 'hasOpenGrants', label: 'Has open grants awarded'}
];

//Filing & events component(s)
export default function DbFilingsEvents(props) {
   if(!(props.content && props.content.organization)) { return null }

   function ListEvents(props) {
      const [filterValue, setFilterValue] = useState('Yes');

      return (
         <B2BDataTable caption={props.tableCaption}>
            <B2BDataTableRowFilter
               value={filterValue}
               onChange={setFilterValue}
               items={filterOpts}
            />
            {props.arrEvents
               .map(event => ({
                                 ...event,
                                 value: booleanToYesNo(props.events[event.property])
                              }))
               .filter(event =>
                           filterValue === 'None' ||
                           event.value === filterValue ||
                           (filterValue === 'YesOrNo' && (event.value === 'Yes' || event.value === 'No')))
               .map(event => 
                  <B2BDataTableRow
                     label={event.label}
                     content={event.value}
                     key={event.property}
                  />
               )
            }
         </B2BDataTable>
      )
   }

   const { hasCompanyMoved,
      legalEvents,
      financingEvents,
      significantEvents,
      awards,
      exclusions,
      violations
   } = props.content.organization;

   //Add hasCompanyMoved flag to the significantEvents category
   if(significantEvents && isObject(significantEvents)) {
      significantEvents['hasCompanyMoved'] = hasCompanyMoved
   }

   return (
      <>
         {!bIsEmptyObj(significantEvents) &&
            <ListEvents
               tableCaption='Significant events'
               events={significantEvents}
               arrEvents={arrSignificantEvents}
            />
         }
         {!bIsEmptyObj(legalEvents) &&
            <ListEvents
               tableCaption='Legal events'
               events={legalEvents}
               arrEvents={arrLegalEvents}
            />
         }
         {!bIsEmptyObj(financingEvents) &&
            <ListEvents
               tableCaption='Financing events'
               events={financingEvents}
               arrEvents={arrFinEvents}
            />
         }
         {!bIsEmptyObj(exclusions) &&
            <ListEvents
               tableCaption='Exclusions/debarments'
               events={exclusions}
               arrEvents={arrExclusions}
            />
         }
         {!bIsEmptyObj(violations) &&
            <ListEvents
               tableCaption='Violations/citations'
               events={violations}
               arrEvents={arrViolations}
            />
         }
         {!bIsEmptyObj(awards) &&
            <ListEvents
               tableCaption='Government contracts, grants, ... '
               events={awards}
               arrEvents={arrAwards}
            />
         }
      </>
   );
}
