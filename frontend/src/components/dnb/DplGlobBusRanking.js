// *********************************************************************
//
// API Hub, D&B D+ Global Business Ranking data block component
// JavaScript code file: DplGlobBusRanking.js
//
// Copyright 2022 Hans de Rooij
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

//Data block Global Business Ranking component
export default function DbGlobBusRanking(props) {
   if(!(props.content && props.content.organization && 
         !bIsEmptyObj(props.content.organization.globalBusinessRanking))) {
            return null
   }

   //Global Business Ranking properties
   const { scoreDate,
      rawScore,
      predictiveSegment,
      dataDepth,
      scoreCommentary
   } = props.content.organization.globalBusinessRanking;

   return (
      <B2BDataTable caption='D&amp;B global business ranking'>
         {!!rawScore && 
            <B2BDataTableRow label='D&amp;B GBR score' content={rawScore} />
         }
         {!!rawScore && !!scoreDate &&
            <B2BDataTableRow label='Score date' content={scoreDate} />
         }
         {predictiveSegment && !!predictiveSegment.segment &&
            <B2BDataTableRow label='Predictive segment' content={predictiveSegment.segment} />
         }
         {dataDepth && !!dataDepth.indicator &&
            <B2BDataTableRow label='Data depth indicator' content={dataDepth.indicator} />
         }
         {dataDepth && dataDepth.assessment && !!dataDepth.assessment.description &&
            <B2BDataTableRow label='Data depth assessment' content={dataDepth.assessment.description} />
         }
         {scoreCommentary && scoreCommentary.length > 0 &&
            <B2BDataTableRow label='Score commentary' content={scoreCommentary.map(reason => reason.description)} />
         }
      </B2BDataTable>
   );
}
