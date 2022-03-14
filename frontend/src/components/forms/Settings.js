// *********************************************************************
//
// API Hub request, persist and respond settings form
// JavaScript code file: Settings.js
//
// Copyright 2022 Hans de Rooij
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

import { useReducer } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TextField
} from "@mui/material";

const FormSettings = (props) => {
   const [connSettings, setConSettings] = useReducer(
      (prevState, state) => ( { ...prevState, ...state } ),
      {protocol: 'https', host: '', port: '', path: ''}
   );

   const handleOnChange = evnt => {
      const { name, value } = evnt.target;
      setConSettings( { [name]: value } );
   };

   return (
      <Dialog open={props.formSettingsIsOpen} onClose={props.closeFormSettings}>
         <DialogTitle>Application settings</DialogTitle>
         <DialogContent>
            <DialogContentText>
               API Hub connection settings
            </DialogContentText>
            <FormControl
               component='fieldset'
               sx={{ mt: 1, mb: 1 }}
            >
               <RadioGroup
                  id='protocol'
                  value={connSettings.protocol}
                  onChange={handleOnChange}
                  row
               >
                  <FormControlLabel
                     autoFocus
                     value='http'
                     name='protocol'
                     control={<Radio />}
                     label='HTTP'
                  />
                  <FormControlLabel
                     value='https'
                     name='protocol'
                     control={<Radio />}
                     label='HTTPS'
                  />
               </RadioGroup>
               <TextField
                  fullWidth
                  name='host' label='Host name' 
                  size='small' margin='dense' 
                  value={connSettings.host}
                  onChange={handleOnChange}
               />
               <TextField
                  fullWidth name='port'
                  label='Port' 
                  size='small' margin='sense' 
                  value={connSettings.port}
                  onChange={handleOnChange}
               />
               <TextField
                  fullWidth name='path'
                  label='Path' 
                  size='small' margin='dense' 
                  value={connSettings.path}
                  onChange={handleOnChange}
               />
               <Button
                  variant='contained'
                  color='secondary'
                  onClick={() => console.log(connSettings)}
               >
                  Test
               </Button>
            </FormControl>
         </DialogContent>
         <DialogActions>
            <Button onClick={props.closeFormSettings}>Close</Button>
         </DialogActions>
      </Dialog>
   );
};

export default FormSettings;
