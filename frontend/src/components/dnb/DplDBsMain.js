// *********************************************************************
//
// API Hub request, main D&B Direct+ data block component
// JavaScript code file: DplDBsMain.js
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
import { B2BDataTable, B2BDataTableRow, ErrPaper } from '../AhUtils'
import DbCompanyInfo from './DplCompanyInfo';
import DbHierarchiesConn from './DplHierarchiesConn';
import DbPrincipals from './DplPrincipalsContacts'
import DbFinStrength from './DplFinStrength';
import DbPaymInsights from './DplPaymInsights';
import DbFilingsEvents from './DplFilingsEvents';

export default function DplDBsMain(props) {
   //Echo the Direct+ data block request details
   function InquiryDetails(props) {
      const { duns, blockIDs, tradeUp } = props.content.inquiryDetail;

      return (
         <B2BDataTable
            caption='Inquiry details'
            trashCan={true}
            collapsed={true}
         >
            {!!(duns) &&
               <B2BDataTableRow
                  label='DUNS'
                  content={duns}
               />
            }
            {!!(blockIDs) &&
               <B2BDataTableRow
                  label='Data blocks'
                  content={blockIDs}
               />
            }
            {!!(tradeUp) &&
               <B2BDataTableRow
                  label='Trade up'
                  content={tradeUp}
               />
            }
         </B2BDataTable>
      );
   }

   //D&B Direct+ common data component
   function CommonData(props) {
      if(!(props.content && props.content.organization) ||
            !['duns', 'primaryName', 'countryISOAlpha2Code'].some(prop => props.content.organization[prop])) {
         return null;
      }

      const { duns, primaryName, countryISOAlpha2Code } = props.content.organization;

      return (
         <B2BDataTable caption='Common data'>
            {!!(duns) &&
               <B2BDataTableRow
                  label='DUNS delivered'
                  content={duns}
               />
            }
            {!!(primaryName) &&
               <B2BDataTableRow
                  label='Primary name'
                  content={primaryName}
               />
            }
            {!!(countryISOAlpha2Code) &&
               <B2BDataTableRow
                  label='Country code'
                  content={countryISOAlpha2Code}
               />
            }
         </B2BDataTable>
      );
   }

   let dataBlocks = null;

   if(props.oDBs && props.oDBs.inquiryDetail &&
         props.oDBs.inquiryDetail.blockIDs &&
         props.oDBs.inquiryDetail.blockIDs.length) {

            dataBlocks = { blockIDs: {} };

            props.oDBs.inquiryDetail.blockIDs.forEach(dbID => {
               let splitBlockIDs = dbID.split('_');
         
               dataBlocks.blockIDs[splitBlockIDs[0]] = {};
               dataBlocks.blockIDs[splitBlockIDs[0]]['level'] = parseInt(splitBlockIDs[1].slice(-1), 10);
               dataBlocks.blockIDs[splitBlockIDs[0]]['version'] = splitBlockIDs[2];
            });
   }

   return (
      <>
      {(dataBlocks && props.oDBs.organization)
         ?
            <>
               <InquiryDetails content={props.oDBs} />
               {dataBlocks.blockIDs['companyinfo']
                     ?
                        <DbCompanyInfo content={props.oDBs} />
                     :
                        <CommonData content={props.oDBs} />
               }
               {dataBlocks.blockIDs['hierarchyconnections'] &&
                  <DbHierarchiesConn content={props.oDBs} />
               }
               {dataBlocks.blockIDs['principalscontacts'] &&
                  <DbPrincipals content={props.oDBs} />
               }
               {dataBlocks.blockIDs['financialstrengthinsight'] &&
                  <DbFinStrength content={props.oDBs} />
               }
               {dataBlocks.blockIDs['paymentinsight'] &&
                  <DbPaymInsights content={props.oDBs} />
               }
               {dataBlocks.blockIDs['eventfilings'] &&
                  <DbFilingsEvents content={props.oDBs} />
               }
            </>

         : <ErrPaper errMsg={'Error, JSON is missing required elements'} />
      }
      </>
   );
}
