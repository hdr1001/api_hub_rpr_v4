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
  Tab
} from "@mui/material";

const FormSettings = props => {
   const [ tabIdx, setTabIdx ] = useState(0);

   return (
      <Dialog open={props.formSettingsIsOpen} onClose={props.closeFormSettings}>
         <DialogTitle>API Hub (v4)</DialogTitle>

         <DialogContent>
            <Tabs
               value={tabIdx}
               onChange={(event, newTabIdx) => setTabIdx(newTabIdx)}
            >
               <Tab label="Find" id={0} />
               <Tab label="About" id={1} />
            </Tabs>

            {tabIdx === 1 &&
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

            <DialogActions>
               <Button onClick={props.closeFormSettings}>Close</Button>
            </DialogActions>

         </DialogContent>
      </Dialog>
   );
};

export default FormSettings;
