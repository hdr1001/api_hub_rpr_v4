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

import { useState, useReducer } from 'react';
import { ahDnbGetAbout, ahDnbGetCollections } from '../../components/ahCalls';
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
  Stack,
  Button,
  TextField
} from '@mui/material';

const FormConnSettings = (props) => {
   const connSettingsDefaults = {protocol: 'https', host: 'localhost', port: '8080', path: '/hub'};

   const [connSettings, setConSettings] = useReducer(
      (prevState, state) => ( { ...prevState, ...state } ),
      connSettingsDefaults
   );

   const [resetConnSettings, setResetConnSettings] = useState({ ...connSettingsDefaults });

   const [settingsTestSuccess, setSettingsTestSuccess] = useState(false);

   const handleOnChange = evnt => {
      setConSettings( { [evnt.target.name]: evnt.target.value } );
      setSettingsTestSuccess(false);
   };

   function settingsChanged() {
      return Object.keys(resetConnSettings).some(setting => resetConnSettings[setting] !== connSettings[setting])
   }

   function concatApiHubUrl() {
      return `${connSettings.protocol}://${connSettings.host}:${connSettings.port}${connSettings.path}`
   }

   function handleClose() {
      setConSettings(resetConnSettings);

      props.closeFormConnSettings();
   }

   return (
      <Dialog
         open={props.formConnSettingsIsOpen}
         onClose={handleClose}
      >
         <DialogTitle>Connection settings</DialogTitle>
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
                  size='small' margin='dense' 
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
               <Stack 
                  direction='row'
                  justifyContent='center'
                  spacing={1}
                  sx={{ mt: 1.5, mb: 1, mx: 'auto' }}
               >
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={() => {
                        ahDnbGetAbout(concatApiHubUrl())
                           .then(abt => {
                              try{
                                 if(abt.description.substr(abt.description.length - 3, 2) === 'v4') {
                                    setSettingsTestSuccess(true); return;
                                 }
                              }
                              catch(err) { throw err }

                              throw new Error('JSON returned does not contain the expected content');                                                      
                           })
                           .catch(err => {
                              console.log((err.message));

                              if(settingsTestSuccess) { setSettingsTestSuccess(false) }
                           })
                     }}
                  >
                     Test
                  </Button>
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={() => {
                           setSettingsTestSuccess(false);

                           setConSettings(resetConnSettings);
                        }
                     }
                     disabled={!settingsChanged()}
                  >
                     Reset
                  </Button>
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={() => {
                           setSettingsTestSuccess(false);

                           setResetConnSettings(connSettings);

                           const url = concatApiHubUrl();

                           props.setApiHubUrl(url);

                           ahDnbGetCollections(url)
                              .then( oDnbDbColl => props.setDnbDbColl(oDnbDbColl) )
                              .catch( err => console.error(err.message) )
                        }
                     }
                     disabled={!(settingsTestSuccess && settingsChanged())}
                  >
                     Save
                  </Button>
               </Stack>
            </FormControl>
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
         </DialogActions>
      </Dialog>
   );
};

export default FormConnSettings;
