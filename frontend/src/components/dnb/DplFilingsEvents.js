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

import { typography } from '@mui/system';
import React, { useState } from 'react';
import { B2BDataTable,
         B2BDataTableRowFilter,
         B2BDataTableRow,
         bIsEmptyObj } from '../AhUtils';

const filterOpts = [
   {key: 'filterYesOrNo', value: 'YesOrNo', desc: 'Display "Yes" and "No" values'},
   {key: 'filterYes', value: 'Yes', desc: 'Display "Yes" values solely'},
   {key: 'filterNo', value: 'No', desc: 'Display "No" values solely'},
   {key: 'filterNull', value: '-', desc: 'Display "-" values solely'},
   {key: 'filterNone', value: 'None', desc: 'Display all values unfiltered'}
];
      
const arrLegalEvents = [
   {property: 'hasBankruptcy', label: 'Has bankruptcy'},
   {property: 'hasOpenBankruptcy', label: 'Has open bankruptcy'},
   {property: 'hasInsolvency', label: 'Has insolvency'},
   {property: 'hasLiquidation', label: 'Has liquidation'},
   {property: 'hasSuspensionOfPayments', label: 'Has suspension of payments'},
   {property: 'hasCriminalProceedings', label: 'Has criminal proceedings'},
   {property: 'hasOpenCriminalProceedings', label: 'Has open criminal proceedings'},
   {property: 'hasJudgments', label: 'Has judgments'},
   {property: 'hasOpenJudgments', label: 'Has open judgments'},
   {property: 'hasLegalEvents', label: 'Has legal events'},
   {property: 'hasOpenLegalEvents', label: 'Has open legal events'},
   {property: 'hasOtherLegalEvents', label: 'Has other legal events'},
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

//Data block Filings & Events component
export default function DbFilingsEvents(props) {
   if(!(props.content && props.content.organization)) { return null }

   function LegalEvents(props) {
      const [filterValue, setFilterValue] = useState('Yes');

      return (
         <B2BDataTable caption='Legal events'>
            <B2BDataTableRowFilter
               value={filterValue}
               onChange={setFilterValue}
               items={filterOpts}
            />
            {arrLegalEvents
               .map(event => ({
                                 ...event,
                                 value: booleanToYesNo(props.legalEvents[event.property])
                              }))
               .filter(event =>
                           filterValue === 'None' ||
                           event.value === filterValue ||
                           filterValue === 'YesOrNo' && (event.value === 'Yes' || event.value === 'No'))
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

   return (
      <>
         {!bIsEmptyObj(legalEvents) &&
            <LegalEvents legalEvents={legalEvents} />
         }
      </>
   );
}
