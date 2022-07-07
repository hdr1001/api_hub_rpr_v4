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
import { B2BDataTable, B2BDataTableRow, bIsEmptyObj, getArrAddr } from '../AhUtils';

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

//Get principal DUNS
function getDUNS(oPrincipal) {
   let sRet = '';

   if(!(oPrincipal && oPrincipal.idNumbers && oPrincipal.idNumbers.length)) {
      return sRet;
   }

   const idDUNS = oPrincipal.idNumbers.filter(oID => 
      oID.idType && oID.idType.dnbCode && oID.idType.dnbCode === 3575
   );

   if(idDUNS && idDUNS.length) { sRet = idDUNS[0].idNumber }

   return sRet;
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

      //mostSeniorPrincipals is a v1 array, mostSeniorPrincipal is a v2 object
      const { currentPrincipals, mostSeniorPrincipals, mostSeniorPrincipal } = props.content.organization;

      let arrPrincipals = [];
      
      if(mostSeniorPrincipals && mostSeniorPrincipals.length > 0) {
         arrPrincipals = mostSeniorPrincipals.map(principal => {
            principal.isMostSenior = true;
            return principal;
         })
      }
      else {
         if(!bIsEmptyObj(mostSeniorPrincipal)) {
            mostSeniorPrincipal.isMostSenior = true;
            arrPrincipals.push(mostSeniorPrincipal);
         }
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
                     {Array.isArray(principal.otherLanguageNames) && principal.otherLanguageNames.length > 0 &&
                           principal.otherLanguageNames.map((olName, idx) => 
                              <B2BDataTableRow
                                 label='Full name'
                                 content={getFullName(olName)}
                                 key={idx}
                              />
                           )
                     }
                     {principal.subjectType && principal.subjectType !== 'Individuals' &&
                        <B2BDataTableRow label='Subject type' content='Legal entity' />
                     }
                     {principal.idNumbers && principal.idNumbers.length > 0 &&
                           !!(getDUNS(principal)) &&

                        <B2BDataTableRow label='DUNS' content={getDUNS(principal)} />
                     }
                     {!!(principal.namePrefix) &&
                        <B2BDataTableRow label='Name prefix' content={principal.namePrefix} />
                     }
                     {!!(principal.nameSuffix) &&
                        <B2BDataTableRow label='Name suffix' content={principal.nameSuffix} />
                     }
                     {!bIsEmptyObj(principal.primaryAddress) &&
                        <B2BDataTableRow
                           label='Primary address'
                           content={getArrAddr(principal.primaryAddress)}
                        />
                     }
                     {!bIsEmptyObj(principal.birthAddress) && !bIsEmptyObj(principal.birthAddress.addressLocality) &&
                        principal.birthAddress.addressLocality.name &&

                        <B2BDataTableRow
                           label='Birth address'
                           content={principal.birthAddress.addressLocality.name}
                        />
                     }
                     {Array.isArray(principal.telephones) && principal.telephones.length > 0 &&
                        principal.telephones.map(oTel => 
                           <B2BDataTableRow
                              label='Telephone'
                              content={oTel.telephoneNumber}
                           />
                        )
                     }
                     {principal.gender && !!(principal.gender.description) &&
                        <B2BDataTableRow label='Gender' content={principal.gender.description} />
                     }
                     {!!(principal.birthDate) &&
                        <B2BDataTableRow label='Date of birth' content={principal.birthDate} />
                     }
                     {principal.nationality && !!(principal.nationality.name) &&
                        <B2BDataTableRow label='Nationality' content={principal.nationality.name} />
                     }
                     {principal.jobTitles && principal.jobTitles.length > 0 &&
                        <B2BDataTableRow
                           label='Job title(s)'
                           content={principal.jobTitles.map(jobTitle => jobTitle.title)}
                        />
                     }
                     {principal.managementResponsibilities && principal.managementResponsibilities.length > 0 &&
                        <B2BDataTableRow
                           label='Mngmt responsibilities'
                           content={principal.managementResponsibilities.map(managementResp => managementResp.description)}
                        />
                     }
                     {principal.isMostSenior
                        ?
                           principal.responsibleAreas && !!(principal.responsibleAreas.description) &&
                              <B2BDataTableRow
                                 label='Areas of responsibility'
                                 content={principal.responsibleAreas.description}
                              />
                        :
                           principal.responsibleAreas && principal.responsibleAreas.length > 0 &&
                              <B2BDataTableRow
                                 label='Areas of responsibility'
                                 content={principal.responsibleAreas.map(respArea => respArea.description)}
                              />
                     }
                     {typeof principal.isSigningAuthority === 'boolean' &&
                        <B2BDataTableRow
                           label='Signing authority'
                           content={principal.isSigningAuthority ? 'Yes' : 'No'}
                        />
                     }
                     {principal.isMostSenior && 
                        <B2BDataTableRow label='Most senior?' content='Yes' />
                     }
                     {principal.hasBankruptcyHistory && 
                        <B2BDataTableRow label='Bankruptcy history' content='Yes' />
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
