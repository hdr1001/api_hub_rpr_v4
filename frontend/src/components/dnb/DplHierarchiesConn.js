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

import React, { useState } from 'react';
import { B2BDataTable, B2BDataTableRow } from '../AhUtils';

//Data block Hierarchies & Connections component
export default function DbHierarchiesConn(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   //Company Information General component
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
                  label='Members count'
                  content={globalUltimateFamilyTreeMembersCount}
               />
            }
         </B2BDataTable>
      );
   }

   return (
      <>
         <HierarchyInfo content={props.content} />
      </>
   );
}
