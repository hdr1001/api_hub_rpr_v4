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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { ahGrey, horizontalPadding, verticalMargin,
            fontItalic, borderNone, tableCaption } from './style'

function B2BDataTable(props) {
   const [collapsed, setCollapsed] = React.useState(false);

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
                  >
                     <Box sx={{ display: 'flex' }}>
                        <Typography
                           sx={{
                              flexGrow: 1,
                              textAlign: 'center',
                              ...tableCaption
                           }}
                        >
                           {props.caption}
                        </Typography>
                        <IconButton
                           color='inherit'
                           onClick={() => setCollapsed(prevCollapsed => !prevCollapsed)}
                           sx={{ px: 0 }}
                        >
                           {collapsed 
                              ?
                                 <ExpandMoreOutlinedIcon />
                              :
                                 <ExpandLessOutlinedIcon />
                           }
                        </IconButton>
                     </Box>
                  </TableCell>
               </TableRow>
            </TableHead>
            <TableBody>{ collapsed ? null : props.children }</TableBody>
         </Table> 
      </TableContainer>
   );
}

function B2BDataTableRowFilter(props) {
   return (
      <TableRow>
         <TableCell colSpan={2}>
            <FormControl
               component='fieldset'
               fullWidth={true}
               margin='none'
               size='small'
            >
               <Select
                  autoWidth={false}
                  name='selectTypeCodes'
                  margin='dense'
                  value={props.value}
                  onChange={event => props.onChange(event.target.value)}
               >
                  {props.items.map(item =>
                     <MenuItem key={item.key} value={item.value}>{item.desc}</MenuItem>
                  )}
               </Select>
            </FormControl>
         </TableCell>
      </TableRow>
   )
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
   }, [props.content, props.label]);

   const tableCellAttrs = {component: 'th', scope: 'row', sx: fontItalic};

   return (
      <>
         {numContentRows > 0 &&
            numContentRows === 1
               ?                  
                  <TableRow height={0}>
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
function bIsEmptyObj(obj) {
   let bRet = false;

   try {
      if(obj === null || typeof obj === 'undefined' ||
            (obj.constructor === Object && Object.keys(obj).length === 0)) {

         bRet = true;
      }
   }
   catch(err) {
      console.log('Parameter passed into function bIsEmptyObj is not an object')
   }

   return bRet;
}

//D&B data block address object to array conversion
function getArrAddr(oAddr) {
   let arrAddr = [], str = '';

   if(!oAddr) {return arrAddr}

   //Street address
   if(oAddr.streetAddress) {
      if(oAddr.streetAddress.line1) {arrAddr.push(oAddr.streetAddress.line1)}
      if(oAddr.streetAddress.line2) {arrAddr.push(oAddr.streetAddress.line2)}
   }

   //Refer to alternative properties if streetAddress doesn't contain info
   if(arrAddr.length === 0) {
      if(oAddr.streetName) {
         str = oAddr.streetName;
   
         if(oAddr.streetNumber) {
            str += ' ' + oAddr.streetNumber
         }

         arrAddr.push(str);

         str = '';
      }
   }

   //Postalcode & city
   if(oAddr.postalCode) {str = oAddr.postalCode}
   if(!bIsEmptyObj(oAddr.addressLocality)) {
      str.length > 0 ? str += ' ' + oAddr.addressLocality.name : str = oAddr.addressLocality.name
   }
   if(str.length > 0) {arrAddr.push(str)}

   if(oAddr.addressCountry && oAddr.addressCountry.name) {arrAddr.push(oAddr.addressCountry.name)}

   if(oAddr.isRegisteredAddress) {
      arrAddr.push('Entity registered at this address');
   }

   return arrAddr;
}

export { B2BDataTable, B2BDataTableRowFilter, B2BDataTableRow, ErrPaper, bIsEmptyObj, getArrAddr }
