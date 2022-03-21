// *********************************************************************
//
// API Hub request, persist and respond UI app/toolbar component
// JavaScript code file: AhAppBar.js
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

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HubIcon from '@mui/icons-material/Hub';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import IconButton from '@mui/material/IconButton';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export default function AhAppBar(props) {
   return (
      <AppBar>
         <Toolbar>
            <Typography sx={{ flexGrow: 1 }}>API Hub (v4)</Typography>
            <input
               type='file'
               accept='application/json, .json'
               multiple
               style={{ display: 'none' }}
               id='btn-file-inp'
               onChange={props.handleFileInp}
            />
            <label htmlFor='btn-file-inp'>
               <Tooltip title='Open JSON file'>
                  <IconButton
                     color='inherit'
                     component='span'
                  >
                     <UploadFileOutlinedIcon />
                  </IconButton>
               </Tooltip>
            </label>
            <Tooltip title={props.apiHubUrl ? 'Connected to hub' : 'No hub connected'}>
               <IconButton
                  color='inherit'
                  onClick={props.openFormConnSettings}
               >
                  <HubIcon color={props.apiHubUrl ? 'inherit' : 'warning'} />
               </IconButton>
            </Tooltip>
            <Tooltip title='Settings'>
               <IconButton
                  color='inherit'
                  onClick={props.openFormSettings}
               >
                  <SettingsOutlinedIcon />
               </IconButton>
            </Tooltip>
         </Toolbar>
      </AppBar>
   )
}
