// *********************************************************************
//
// API Hub request, persist and respond style objects
// JavaScript code file: style.js
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

import { grey } from '@mui/material/colors';

const ahGrey = {
   backgroundColor: grey.A400
};

const contentBox = {
   mt: 1,
   mx: 0.5,
   display: 'inline-block' 
};

const arrFilesBox = {
   minWidth: '320px',
   m: 1,
   float: 'left'
};

const horizontalPadding = {
   px: 0.5
};

const verticalMargin = {
   my: 2
};

const fontItalic = {
   fontStyle: 'italic'
}

const borderNone = {
   border: 0
}

const tableCaption = {
   fontSize: 'larger',
   py: 1.3,
};

const oCurrOpts = {
   style: 'currency',
   minimumFractionDigits: 0
};

export { ahGrey, contentBox, arrFilesBox, horizontalPadding,
         verticalMargin, fontItalic, borderNone, tableCaption,
         oCurrOpts };
