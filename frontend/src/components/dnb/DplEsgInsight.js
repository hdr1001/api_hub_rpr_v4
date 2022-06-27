// *********************************************************************
//
// API Hub, D&B D+ Financial Strength Insights data block component
// JavaScript code file: DplFinStrength.js
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
import { B2BDataTable, B2BDataTableRow, bIsEmptyObj } from '../AhUtils';

//Data block Financial Strength Insights component
export default function DbEsgInsight(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   function EsgIndustryCategory(props) {
      const org = props.org;

      if(!(org.esgIndustryCategories && org.esgIndustryCategories.length > 0)) { return null }

      return (
         <B2BDataTable caption='ESG industry category'>
               <B2BDataTableRow label='Category' content={org.esgIndustryCategories[0].category} />
               <B2BDataTableRow label='Industry' content={org.esgIndustryCategories[0].industry} />
         </B2BDataTable>
      )
   }

   return (
      <>
         <EsgIndustryCategory org={props.content.organization} />
      </>
   );
}
