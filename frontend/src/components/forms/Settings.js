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

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Stack,
  TextField,
  InputAdornment,
  Alert
} from "@mui/material";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const FormSettings = props => {
   const [ tabIdx, setTabIdx ] = useState(0);
   const [ settingsBillRef, setSettingsBillRef ] = useState(props.billRef);
   const [ billRefSavedSuccess, setBillRefSavedSuccess ] = useState(false);
   const [ billRefNotSavedAlert, setBillRefNotSavedAlert ] = useState(false);

   function handleMenuClose() {
      if(settingsBillRef !== props.billRef) {
         setBillRefNotSavedAlert(true);

         return;
      }

      props.closeFormSettings();
   }

   function alertSaveDismiss(doSaveBillRef) {
      setBillRefNotSavedAlert(false);

      if(doSaveBillRef) {
         props.setBillRef(settingsBillRef)
      }
      else {
         setSettingsBillRef(props.billRef)
      }

      props.closeFormSettings();
   }

   return (
      <Dialog
         open={props.formSettingsIsOpen}
         onClose={handleMenuClose}
         fullWidth={true}
         maxWidth={'xs'}
      >
         <DialogTitle>API Hub (v4)</DialogTitle>

         <DialogContent>

            <Tabs
               value={tabIdx}
               onChange={(event, newTabIdx) => setTabIdx(newTabIdx)}
            >
               <Tab label="About" id={0} />
               {props.apiHubUrl && <Tab label="Find" id={1} />}
            </Tabs>

            {tabIdx === 0 &&
               <DialogContentText sx={{ mt: 3 }}>
                  API Hub - Request, Persist & Respond<br />
                  © Hans de Rooij<br /><br />
                  <Button
                     variant='Text'
                     sx={{ mx: 0, px: 0 }}
                     href='https://github.com/hdr1001/api_hub_rpr_v4'
                     target='_blank'
                     rel='noopener noreferrer'
                  >
                     Github Repository
                  </Button>
               </DialogContentText>
            }

            {tabIdx === 1 && props.apiHubUrl &&
               <Stack sx={{ mt: 3 }}>
                  <TextField
                     name='billRef' label='Billing reference'
                     size='small' margin='dense'
                     value={settingsBillRef}
                     onChange={event => setSettingsBillRef(event.target.value)}
                     InputProps={{
                        endAdornment:
                           <InputAdornment position='end'>
                              <SaveOutlinedIcon
                                 onClick={() => {
                                    props.setBillRef(settingsBillRef);

                                    if(billRefSavedSuccess !== true) {
                                       setBillRefSavedSuccess(true);

                                       setTimeout(() => setBillRefSavedSuccess(false), 1500);
                                    }
                                 }}

                                 color={billRefSavedSuccess ? 'success' : 'inherit'}
                              />
                           </InputAdornment>
                     }}
                  />
               </Stack>
            }

            <DialogActions>
               {billRefNotSavedAlert
                  ?
                     <Alert
                        severity='warning'
                        action={
                           <Stack direction='row'>
                              <Button
                                 color='inherit' size='small'
                                 onClick={() => alertSaveDismiss(false)}
                              >
                                 Dismiss
                              </Button>
                              <Button
                                 color='inherit' size='small'
                                 onClick={() => alertSaveDismiss(true)}
                              >
                                 Save
                              </Button>
                           </Stack>
                        }
                        sx={{ mx: 'auto' }}
                     >
                        Billing reference changed
                     </Alert>
                  :
                     <Button onClick={handleMenuClose}>
                        Close
                     </Button>
               }
            </DialogActions>

         </DialogContent>
      </Dialog>
   );
};

export default FormSettings;
