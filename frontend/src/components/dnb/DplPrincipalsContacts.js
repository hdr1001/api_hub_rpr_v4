// *********************************************************************
//
// API Hub, D&B D+ Principals & Contacts data block component
// JavaScript code file: DplPrincipalsContacts.js
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

//Extract full name from principal object
function getFullName(oPrincipal) {
   if(oPrincipal.fullName) { return oPrincipal.fullName}

   let sRet = '';

   if(['givenName', 'middleName', 'familyName'].some(prop => oPrincipal[prop])) {
      const { givenName, middleName, familyName} = oPrincipal;

      if(givenName) {sRet += givenName + ' '};
      if(middleName) {sRet += middleName + ' '};
      if(familyName) {sRet += familyName};

      if(sRet.length > 0) { return sRet }
   }

   return '-';
}

//Data block Principals & Contacts component
export default function DbPrincipals(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   //General hierarchy information component
   function PrincipalSummary(props) {
      if(!(props.content && props.content.organization && 
            !bIsEmptyObj(props.content.organization.principalsSummary))) {
         return null
      }

      const { currentPrincipalsCount,
               otherAssociationsCount,
               inactiveAssociationsCount,
               unfavorableInactiveAssociationsCount,
               favorableInactiveAssociationsCount,
               detrimentalPrincipalsCount,
               detrimentalPrincipalsPercentage } = props.content.organization.principalsSummary;

      return (
         <B2BDataTable caption='Principal summary'>
            {typeof currentPrincipalsCount === 'number' &&
               <B2BDataTableRow
                  label='Current principal count'
                  content={currentPrincipalsCount}
               />
            }
            {typeof otherAssociationsCount === 'number' &&
               <B2BDataTableRow
                  label='Other associations count'
                  content={otherAssociationsCount}
               />
            }
            {typeof inactiveAssociationsCount === 'number' &&
               <B2BDataTableRow
                  label='Inactive associations count'
                  content={inactiveAssociationsCount}
               />
            }
            {typeof unfavorableInactiveAssociationsCount === 'number' &&
               <B2BDataTableRow
                  label='Unfavorable inact. assoc. count'
                  content={unfavorableInactiveAssociationsCount}
               />
            }
            {typeof favorableInactiveAssociationsCount === 'number' &&
               <B2BDataTableRow
                  label='Favorable inact. assoc. count'
                  content={favorableInactiveAssociationsCount}
               />
            }
            {typeof detrimentalPrincipalsCount === 'number' &&
               <B2BDataTableRow
                  label='Detrimental principals count'
                  content={detrimentalPrincipalsCount}
               />
            }
            {typeof detrimentalPrincipalsPercentage === 'number' &&
               <B2BDataTableRow
                  label='Detrimental principals perc.'
                  content={detrimentalPrincipalsPercentage + '%'}
               />
            }
         </B2BDataTable>
      );
   }

   //General hierarchy information component
   function Principals(props) {
      if(!(props.content && props.content.organization)) {
         return null
      }

      const { currentPrincipals, mostSeniorPrincipals } = props.content.organization;

      let arrPrincipals = null;
      
      if(mostSeniorPrincipals && mostSeniorPrincipals.length > 0) {
         arrPrincipals = mostSeniorPrincipals.map(principal => {
            principal.isMostSenior = true;
            return principal;
         })
      }

      if(currentPrincipals && currentPrincipals.length > 0) {
         arrPrincipals = [].concat(arrPrincipals, currentPrincipals)
      }

      if(!(arrPrincipals && arrPrincipals.length > 0)) { return null }

      return (
         <>
            {arrPrincipals.map((principal, idx) =>
               <React.Fragment key={idx}>
                  <B2BDataTable caption='Principal'>
                     <B2BDataTableRow label='Full name' content={getFullName(principal)} />
                     {principal.subjectType && principal.subjectType !== 'Individuals' &&
                        <B2BDataTableRow label='Subject type' content='Legal entity' />
                     }
                     {principal.namePrefix &&
                        <B2BDataTableRow label='Name prefix' content={principal.namePrefix} />
                     }
                     {principal.nameSuffix &&
                        <B2BDataTableRow label='Name suffix' content={principal.nameSuffix} />
                     }
                     {principal.isMostSenior && 
                        <B2BDataTableRow label='Most senior?' content='Yes' />
                     }
                  </B2BDataTable>
               </React.Fragment>
            )}
         </>
      )
   }

   return (
      <>
         <PrincipalSummary content={props.content} />
         <Principals content={props.content} />
      </>
   );
}
