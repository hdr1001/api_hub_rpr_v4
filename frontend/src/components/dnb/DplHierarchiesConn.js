// *********************************************************************
//
// API Hub, D&B D+ Hierarchies & Connections data block component
// JavaScript code file: DplHierarchiesConn.js
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

//Data block Hierarchies & Connections component
export default function DbHierarchiesConn(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   //General hierarchy information component
   function HierarchyInfo(props) {
      const arrLinkageProps = ['familytreeRolesPlayed', 'hierarchyLevel', 'globalUltimateFamilyTreeMembersCount'];

      if(!(props.content && props.content.organization && props.content.organization.corporateLinkage &&
            arrLinkageProps.some(prop => props.content.organization.corporateLinkage[prop]))) {
         return null
      }

      const { familytreeRolesPlayed,
               hierarchyLevel,
               globalUltimateFamilyTreeMembersCount } = props.content.organization.corporateLinkage;

      return (
         <B2BDataTable caption='Corporate hierarchy information'>
            {familytreeRolesPlayed && familytreeRolesPlayed.length > 0 &&
               <B2BDataTableRow
                  label='Roles played'
                  content={familytreeRolesPlayed.map(oRole => oRole.description)}
               />
            }
            {typeof hierarchyLevel === 'number' &&
               <B2BDataTableRow
                  label='Hierarchy level'
                  content={hierarchyLevel}
               />
            }
            {typeof globalUltimateFamilyTreeMembersCount === 'number' &&
               <B2BDataTableRow
                  label='Member count'
                  content={globalUltimateFamilyTreeMembersCount}
               />
            }
         </B2BDataTable>
      );
   }

   //Hierarchy levels component
   function HierarchyLevels(props) {
      if(!(props.content && props.content.organization && props.content.organization.corporateLinkage)) {
         return null
      }

      let { headQuarter,
               parent,
               domesticUltimate,
               globalUltimate } = props.content.organization.corporateLinkage;

      //Different hierarchy levels representing the same DUNS collapse
      if(bIsEmptyObj(headQuarter)) { headQuarter = null };
      if(bIsEmptyObj(parent)) { parent = null };
      if(bIsEmptyObj(domesticUltimate)) { domesticUltimate = null };
      if(bIsEmptyObj(globalUltimate)) { globalUltimate = null };

      let bCollapseLevel1and2 = false;

      if(headQuarter || parent) {
         if(domesticUltimate) {
            if((headQuarter && headQuarter.duns === domesticUltimate.duns) ||
                  (parent && parent.duns === domesticUltimate.duns)) {

                     bCollapseLevel1and2 = true
            }
         }
      }

      let bCollapseLevel2and3 = false;

      if(domesticUltimate && globalUltimate && 
            domesticUltimate.duns === globalUltimate.duns) {

         bCollapseLevel2and3 = true;
      }

      //Define the hierarchy levels which will be part of the UI 
      let arrHierarchyLevels = [];

      if(bCollapseLevel1and2 && bCollapseLevel2and3) {
         if(headQuarter) {
            arrHierarchyLevels.push({ caption: 'HQ & domestic & global ultimate', obj: globalUltimate })
         }
         else {
            arrHierarchyLevels.push({ caption: 'Parent & domestic & global ultimate', obj: globalUltimate })
         }
      }

      else if(bCollapseLevel1and2) {
         if(headQuarter) {
            arrHierarchyLevels.push({ caption: 'Company HQ & domestic ultimate', obj: domesticUltimate })
         }
         else {
            arrHierarchyLevels.push({ caption: 'Parent company & domestic ultimate', obj: domesticUltimate})
         }

         if(globalUltimate) { arrHierarchyLevels.push({ caption: 'Global ultimate', obj: globalUltimate }) }
      }

      else if(bCollapseLevel2and3) {
         if(headQuarter) { arrHierarchyLevels.push({ caption: 'Company HQ', obj: headQuarter }) }

         if(parent) { arrHierarchyLevels.push({ caption: 'Parent company', obj: parent }) }

         arrHierarchyLevels.push({ caption: 'Domestic & global ultimate', obj: globalUltimate })
      }

      else if(!bIsEmptyObj(props.content.organization.corporateLinkage)) {
         if(headQuarter) { arrHierarchyLevels.push({ caption: 'Company HQ', obj: headQuarter }) }

         if(parent) { arrHierarchyLevels.push({ caption: 'Parent company', obj: parent }) }

         if(domesticUltimate) { arrHierarchyLevels.push({ caption: 'Domestic ultimate', obj: domesticUltimate }) }

         if(globalUltimate) { arrHierarchyLevels.push({ caption: 'Global ultimate', obj: globalUltimate }) }
      }

      else {
         console.log('No corporate linkage available, nothing to display');
      }

      return(
         <>
            {arrHierarchyLevels.map(level => 
               <React.Fragment key={level.caption}>
                  <B2BDataTable caption={level.caption}>
                     {!!(level.obj.duns) && 
                        <B2BDataTableRow label='DUNS' content={level.obj.duns} />
                     }
                     {!!(level.obj.primaryName) && 
                        <B2BDataTableRow label='Primary name' content={level.obj.primaryName} />
                     }
                     {!bIsEmptyObj(level.obj.primaryAddress) &&
                        <B2BDataTableRow
                           label='Primary address'
                           content={getArrAddr(level.obj.primaryAddress)}
                        />
                     }
                  </B2BDataTable>
               </React.Fragment>
            )}
         </>
      );
   }
      
   return (
      <>
         <HierarchyInfo content={props.content} />
         <HierarchyLevels content={props.content} />
      </>
   );
}
