// *********************************************************************
//
// API Hub, D&B D+ Payment Insights data block component
// JavaScript code file: DplPaymInsights.js
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
import { B2BDataTable, B2BDataTableRow } from '../AhUtils';

//Data block Hierarchies & Connections component
export default function DbPaymInsights(props) {
   if(!(props.content && props.content.organization )) { return null }

   function PaydexNotAvailable(props) {
      return (
         <B2BDataTable
            caption={`Payment insights ${props.summaryDate ? ' (' + props.summaryDate + ')' : ''}`}
         >
            <B2BDataTableRow label='D&amp;B Paydex' content='Not available' />
         </B2BDataTable>
      )
   }

   function SummaryRec(props) {
      const { dataCoverage,
         paydexScore,
         paymentBehaviorDays,
         paymentBehaviorResult,
         totalExperiencesCount
      } = props.summaryRec;

      //Check data availability
      const iPaydexScore = typeof paydexScore === 'number' ? 1 : 0;
      const iPaymentBehaviorDays = typeof paymentBehaviorDays === 'number' ? 1 : 0;
      const iPaymentBehaviorResult = paymentBehaviorResult && !!(paymentBehaviorResult.description) ? 1 : 0;
      const iTotalExperiencesCount = typeof totalExperiencesCount === 'number' ? 1 : 0;

      return (iPaydexScore + iPaymentBehaviorDays + iPaymentBehaviorResult + iTotalExperiencesCount > 0
         ?
            <B2BDataTable
               caption={`Payment insights ${props.summaryDate ? ' (' + props.summaryDate + ')' : ''}`}
            >
               {iPaydexScore > 0 &&
                  <B2BDataTableRow label='D&amp;B Paydex' content={paydexScore} />
               }
               {iPaymentBehaviorDays > 0 &&
                  <B2BDataTableRow label='Average delay in days' content={paymentBehaviorDays} />
               }
               {iPaymentBehaviorResult > 0 &&
                  <B2BDataTableRow label='Description' content={paymentBehaviorResult.description} />
               }
               {iTotalExperiencesCount > 0 &&
                  <B2BDataTableRow label='Experiences count' content={totalExperiencesCount} />
               }
               {dataCoverage && !!(dataCoverage.description) &&
                  <B2BDataTableRow label='Data coverage' content={dataCoverage.description} />
               }
            </B2BDataTable>
         :
            <PaydexNotAvailable summaryDate={props.summaryDate} />
      );
   }

   function PaymInsight(props) {
      const { summary, summaryDate } = props.paymInsight;

      return (summary && summary.length > 0 &&
         <>
            {summary.map((summaryRec, idx) => 
               <SummaryRec key={idx} summaryDate={summaryDate} summaryRec={summaryRec} />
            )}
         </>
      );
   }

   function PaymInsights(props) {
      if(!(props.content && props.content.organization)) { return null }

      return (
         props.content.organization.businessTrading &&
            props.content.organization.businessTrading.length > 0
         ?
            <>
               {props.content.organization
                  .businessTrading.map((paymInsight, idx) => <PaymInsight key={idx} paymInsight={paymInsight} />)
               }
            </>
         :
         <PaydexNotAvailable />
      );
   }

   return (
      <PaymInsights content={props.content} />
   );
}
