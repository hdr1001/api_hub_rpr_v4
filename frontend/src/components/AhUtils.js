// *********************************************************************
//
// API Hub request, persist and respond UI utility functions
// JavaScript code file: AhUtils.js
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

import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ahGrey, horizontalPadding, verticalMargin,
            fontItalic, borderNone, tableCaption } from './style'

function B2BDataTable(props) {
   return (
      <TableContainer
         component={Paper}
         sx={ verticalMargin }
      >
         <Table size='small'>
            <TableHead
               sx={ ahGrey }
            >
               <TableRow>
                  <TableCell
                     colSpan={100}
                     align='center'
                     sx={ tableCaption }
                  >
                     {props.caption}
                  </TableCell>
               </TableRow>
            </TableHead>
            <TableBody>{props.children}</TableBody>
         </Table> 
      </TableContainer>
   );
}

function B2BDataTableRow(props) {
   const [numContentRows, setNumContentRows] = useState(0);

   useEffect(() => {
      let numContentRows = 1;
      
      if(Array.isArray(props.content)) {
         numContentRows = props.content.length
      }

      if(typeof props.content === 'string' && props.content.length === 0) {
         numContentRows = 0
      }

      //Skip if no content available or empty array
      if(numContentRows === 0) {
         console.log('No content available for ' + props.label);
         return null;
      }

      setNumContentRows(numContentRows);
   });

   const tableCellAttrs = {component: 'th', scope: 'row', sx: fontItalic};

   return (
      <>
         {numContentRows > 0 &&
            numContentRows === 1
               ?                  
                  <TableRow>
                     <TableCell { ...tableCellAttrs } >
                        {props.label}
                     </TableCell>
                     <TableCell>
                        {Array.isArray(props.content) ? props.content[0] : props.content}
                     </TableCell>
                  </TableRow>
               :
                  <>
                     <TableRow>
                        <TableCell
                           { ...tableCellAttrs }
                           rowSpan={numContentRows + 1}
                        >
                           {props.label}
                        </TableCell>
                     </TableRow>
                     <>
                        {Array.isArray(props.content) && props.content.map((item, idx) =>
                           <TableRow key={idx}>
                              <TableCell {...(idx < numContentRows - 1 ? {sx: borderNone} : {})} >
                                 {item}
                              </TableCell>
                           </TableRow>
                        )}
                     </>
                  </>
         }
      </>
   );
}

function ErrPaper(props) {
   return (
      <Paper sx={{ ...horizontalPadding, ...verticalMargin }}>
         <Typography>
            {props.errMsg}
         </Typography>
      </Paper>
   )
}

//Check if an object is an empty object
function bObjIsEmpty(obj) {
   return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export { B2BDataTable, B2BDataTableRow, ErrPaper, bObjIsEmpty }
