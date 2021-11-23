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

//Data block Hierarchies & Connections component
export default function DbFinStrength(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   function FailureScore(props) {
      if(!(props.content && props.content.organization && 
            !bIsEmptyObj(props.content.organization.dnbAssessment) &&
            !bIsEmptyObj(props.content.organization.dnbAssessment.failureScore))) {
         return null
      }

      const { nationalPercentile,
         scoreOverrideReasons,
         classScore,
         classScoreDescription,
         scoreDate,
         scoreModel } = props.content.organization.dnbAssessment.failureScore;

      if(!(nationalPercentile || classScore)) { return null }

      return (
         <B2BDataTable caption='D&amp;B failure score'>
            {nationalPercentile &&
               <B2BDataTableRow label='Percentile score' content={nationalPercentile} />
            }
            {scoreOverrideReasons && scoreOverrideReasons.length > 0 &&
               <B2BDataTableRow label='Override reason(s)' content={scoreOverrideReasons.map(reason => reason.description)} />
            }
            {typeof classScore === 'number' &&
               <B2BDataTableRow label='Class score' content={classScore} />
            }
            {classScoreDescription &&
               <B2BDataTableRow label='Description' content={classScoreDescription} />
            }
            {scoreDate &&
               <B2BDataTableRow label='Score date' content={scoreDate} />
            }
            {scoreModel && scoreModel.description &&
               <B2BDataTableRow label='Model' content={scoreModel.description} />
            }
         </B2BDataTable>
      );
   }

   return (
      <>
         <FailureScore content={props.content} />
      </>
   );
}
