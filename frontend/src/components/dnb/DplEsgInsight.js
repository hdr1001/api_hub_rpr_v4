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

// https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript 
const romanMatrix = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], 
                        [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
 
function convertToRoman(num) {
   if(num < 1) { return '' }

   for(let i = 0; i < romanMatrix.length; i++) {
      if(num >= romanMatrix[i][0]) {
         return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0])
      }
   }
}

//Data block Financial Strength Insights component
export default function DbEsgInsight(props) {
   if(!(props.content && props.content.organization)) {
      return null
   }

   function EsgIndustryCategory(props) {
      const org = props.org;
      
      if(!(org.esgIndustryCategories && org.esgIndustryCategories.length > 0)) { return null }

      const sCaption = 'ESG industry category';

      return (
         org.esgIndustryCategories
            .sort((first, second) => first.priority - second.priority)
            .map(indCat => 
               <B2BDataTable
                  caption={`${sCaption} ${org.esgIndustryCategories.length > 1
                                             ? '(' + convertToRoman(indCat.priority) + ')'
                                             : ''}
                           `}
                  key={indCat.priority}
               >
                  <B2BDataTableRow label='Category' content={indCat.category} />
                  <B2BDataTableRow label='Industry' content={indCat.industry} />
               </B2BDataTable>
            )
      )
   }

   function EsgSummary(props) {
      const ranking = props.ranking;

      if(bIsEmptyObj(ranking)) { return null }

      return (
         <B2BDataTable caption={'ESG Ranking: ' + props.caption} >
            {ranking.scoreDate && <B2BDataTableRow label='Score date' content={ranking.scoreDate} />}
            {ranking.score && <B2BDataTableRow label='Score' content={ranking.score} />}
            {ranking.peerPercentileGroup && <B2BDataTableRow label='Peer percentile group' content={ranking.peerPercentileGroup} />}
            {ranking.averagePeerScore && <B2BDataTableRow label='Average peer score' content={ranking.averagePeerScore} />}
            {!bIsEmptyObj(ranking.dataDepth) && ranking.dataDepth.indicator &&
               <B2BDataTableRow label='Data depth' content={ranking.dataDepth.indicator} />
            }
            {Array.isArray(ranking.scoreReasons) && ranking.scoreReasons.length > 0 &&
               <B2BDataTableRow
                  label='Reason(s)'
                  content= {
                     ranking.scoreReasons
                        .sort((first, second) => first.priority - second.priority)
                        .map(reason => reason.description)
                  }
               />
            }
         </B2BDataTable>
      )
   }

   function EsgThemes(props) {
      const topicBullet = '\u00A0\u00A0\u00A0\u00A0• ';
      const ranking = props.ranking;

      const topicProperty = sProperty => sProperty === 'energyManagement' ? 'energyManagementscore' : sProperty + 'Score';

      if(bIsEmptyObj(ranking)) { return null }

      const themes = props.themes;

      return (
         <B2BDataTable caption={props.caption} >
            {themes.map((theme, idx) =>
               <React.Fragment key={idx}>
                  {ranking[theme.property + 'Score'] &&
                     <B2BDataTableRow
                        label={theme.label}
                        content={ranking[theme.property + 'Score']}
                     />
                  }
                  {theme.topics.map((topic, idx) => 
                     ranking[theme.property + 'Topics'] && ranking[theme.property + 'Topics'][topicProperty(topic.property)] &&
                     <B2BDataTableRow
                        label={`${topicBullet}${topic.label}`}
                        content={ranking[theme.property + 'Topics'][topicProperty(topic.property)]}
                        key={idx}
                     />
                  )}
               </React.Fragment>
            )}
         </B2BDataTable>
      )
   }

   function EsgRanking(props) {
      const org = props.org;
      
      if(bIsEmptyObj(org.esgRanking)) { return null }

      const sections = [
         {caption: 'Environmental', property: 'environmentalRanking', themes: [
            {label: 'Natural resources', property: 'naturalResources', topics: [
               {label: 'Energy management', property: 'energyManagement'},
               {label: 'Land use & biodiversity', property: 'landUseBiodiversity'},
               {label: 'Materials sourcing management', property: 'materialsSourcingManagement'},
               {label: 'Pollution prevention management', property: 'pollutionPreventionManagement'},
               {label: 'Waste hazards management', property: 'wasteHazardsManagement'},
               {label: 'Water management', property: 'waterManagement'}
            ]},
            {label: 'Emissions & climate', property: 'emissionsClimate', topics: [
               {label: 'Climate risk', property: 'climateRisk'},
               {label: 'GHG emissions', property: 'ghgEmissions'}
            ]},
            {label: 'Risk', property: 'risk', topics: [
               {label: 'Environmental compliance', property: 'environmentalCompliance'}
            ]},
            {label: 'Opportunities', property: 'opportunities', topics: [
               {label: 'Environmental certifications', property: 'environmentalCertifications'},
               {label: 'Environmental opportunities', property: 'environmentalOpportunities'}
            ]}
         ]},
         {caption: 'Social', property: 'socialRanking', themes: [
            {label: 'Community', property: 'community', topics: [
               {label: 'Community engagement', property: 'communityEngagement'},
               {label: 'Corporate philanthropy', property: 'corporatePhilanthropy'}
            ]},
            {label: 'Customers', property: 'customers', topics: [
               {label: 'Product service', property: 'productService'},
               {label: 'Data privacy', property: 'dataPrivacy'}
            ]},
            {label: 'Human capital', property: 'humanCapital', topics: [
               {label: 'Diversity inclusion', property: 'diversityInclusion'},
               {label: 'Health & safety', property: 'healthSafety'},
               {label: 'Human rights abuses', property: 'humanRightsAbuses'},
               {label: 'Labor relations', property: 'laborRelations'},
               {label: 'Training education', property: 'trainingEducation'}
            ]},
            {label: 'Product service', property: 'productService', topics: [
               {label: 'Cyber risk', property: 'cyberRisk'},
               {label: 'Product quality management', property: 'productQualityManagement'}
            ]},
            {label: 'Supplier', property: 'supplier', topics: [
               {label: 'Supplier engagement', property: 'supplierEngagement'}
            ]},
            {label: 'Certifications', property: 'certifications', topics: [
               {label: 'Social related certs', property: 'socialRelatedCertifications'}
            ]}
         ]},
         {caption: 'Governance', property: 'governanceRanking', themes: [
            {label: 'Business resilience', property: 'businessResilience', topics: [
               {label: 'Business resilience sustainability', property: 'businessResilienceSustainability'}
            ]},
            {label: 'Corporate behavior', property: 'corporateBehavior', topics: [
               {label: 'Corporate compliance behaviors', property: 'corporateComplianceBehaviors'},
               {label: 'Governance related certs', property: 'governanceRelatedCertifications'}
            ]},
            {label: 'Corporate governance', property: 'corporateGovernance', topics: [
               {label: 'Board accountability', property: 'boardAccountability'},
               {label: 'Business ethics', property: 'businessEthics'},
               {label: 'Business transparency', property: 'businessTransparency'},
               {label: 'Shareholder rights', property: 'shareholderRights'}
            ]}
         ]}
      ]

      return (
         <>
            <EsgSummary ranking={org.esgRanking} caption='Overall' />
            {sections.map((section, idx) => 
               <React.Fragment key={idx}>
                  <EsgSummary
                     ranking={org.esgRanking[section.property]}
                     caption={section.caption}
                  />
                 <EsgThemes
                     ranking={org.esgRanking[section.property]}
                     themes={section.themes}
                     caption={`${section.caption} themes`}
                  />
               </React.Fragment>
            )}
         </>
      )
   }

   return (
      <>
         <EsgIndustryCategory org={props.content.organization} />
         <EsgRanking org={props.content.organization} />
      </>
   );
}
