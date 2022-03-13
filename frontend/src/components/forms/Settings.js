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

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
//  FormControl,
//  InputLabel,
//  Select,
//  MenuItem,
  TextField
} from "@mui/material";

const FormSettings = (props) => {
  return (
    <Dialog open={props.formSettingsIsOpen} onClose={props.closeFormSettings}>
      <DialogTitle>Application settings</DialogTitle>
      <DialogContent>
         <DialogContentText>
            API Hub connection settings
         </DialogContentText>
{ /*        <FormControl component='fieldset'>
            <InputLabel id='labelProtocol'>Protocol</InputLabel>
            <Select
               labelId='labelProtocol'
               name='selectProtocolOpts'
               label='Menu options'
               margin='dense'
               value={props.state.selectProtocolOpts}
               onChange={props.handleChange}
            >
               <MenuItem value='http'>HTTP</MenuItem>
               <MenuItem value='https'>HTTPS</MenuItem>
            </Select>
         </FormControl> */ }
         <TextField
            autoFocus
            size="small"
            margin="normal"
            id="pwdTextField"
            label="Password"
            type="text"
            fullWidth
            variant="outlined"
         />
      </DialogContent>
      <DialogActions>
         <Button onClick={props.closeFormSettings}>Close</Button>
      </DialogActions>
   </Dialog>
   );
};

export default FormSettings;
