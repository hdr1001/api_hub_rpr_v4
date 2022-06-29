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

//https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript 
const romanMatrix = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], 
                        [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
 
function convertToRoman(num) {
   let sRet = '';

   if(num < 1) { return '' }

   romanMatrix.forEach(romanDigit => sRet += num >= romanDigit[0] ? romanDigit[1] + convertToRoman(num - romanDigit[0]) : '');

   return sRet;
}

//Data block Financial Strength Insights component
export default function DbEsgInsight(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   function EsgIndustryCategory(props) {
      const org = props.org;

      if(!(org.esgIndustryCategories && org.esgIndustryCategories.length > 0)) { return null }

      return (
         org.esgIndustryCategories
            .sort((first, second) => first.priority - second.priority)
            .map(indCat => 
               <B2BDataTable
                  caption={`ESG industry category (${convertToRoman(indCat.priority)})`}
                  key={indCat.priority}
               >
                  <B2BDataTableRow label='Category' content={indCat.category} />
                  <B2BDataTableRow label='Industry' content={indCat.industry} />
               </B2BDataTable>
            )
      )
   }

   return (
      <>
         <EsgIndustryCategory org={props.content.organization} />
      </>
   );
}
