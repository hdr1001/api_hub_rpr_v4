// *********************************************************************
//
// API Hub request, persist and respond lookup form
// JavaScript code file: Find.js
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

import { useState, useReducer, useRef } from 'react';
import isoCtrys from '../../common/isoCtrys.json';
import {
   Dialog,
   DialogTitle,
   Menu,
   DialogContent,
   Autocomplete,
   TextField,
   IconButton,
   DialogActions,
   Stack,
   Button,
   LinearProgress,
   FormGroup,
   FormControl,
   FormLabel,
   FormControlLabel,
   RadioGroup,
   Radio,
   ToggleButtonGroup,
   ToggleButton,
   Typography,
   Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';

const FormFind = props => {
   const iniSearchCriteria = {
      isoCtry: { label: 'Netherlands', code: 'NL' },
      name: '',
      addr1: '',
      addr2: '',
      postalCode: '',
      city: '',
      regNumber: '',
      telNumber: ''
   };

   const [ anchorMenu, setAnchorMenu ] = useState(null);

   const [ addtnlFields, setAddtnlFields ] = useState(['regNumber']);

   const [ addr2Act, setAddr2Act ] = useState(false);

   const [ searchCriteria, setSearchCriteria ] = useReducer(
      (prevState, state) => ( { ...prevState, ...state } ),
      iniSearchCriteria
   );

   const [ awaitingResp, setAwaitingResp ] = useState(false);

   const [ matchCandidates, setMatchCandidates ] = useState(null);

   const [ duns, setDuns ] = useState('');

   const handleDialogClose = () => {
      if(awaitingResp) {
         console.log('Do not close the dialog while awaiting REST response');

         return;
      }

      setSearchCriteria(iniSearchCriteria);

      if(matchCandidates) { setMatchCandidates(null) }

      props.closeFormFind();
   };

   const handleOnChange = (event, newValue) => {
      if(!awaitingResp && !matchCandidates) {
         if(!event.target.name) {
            setSearchCriteria( { isoCtry: newValue } )
         }
         else {
            setSearchCriteria( { [event.target.name]: event.target.value } )
         }
      }
   };

   const handleOnFind = () => {
      const dnbIDR = {};

      setAwaitingResp(true);

      if(searchCriteria.isoCtry) { dnbIDR.countryISOAlpha2Code = searchCriteria.isoCtry.code }
      if(searchCriteria.name) { dnbIDR.name = searchCriteria.name }
      if(searchCriteria.addr1) { dnbIDR.streetAddressLine1 = searchCriteria.addr1 }
      if(searchCriteria.addr2) { dnbIDR.streetAddressLine2 = searchCriteria.addr2 }
      if(searchCriteria.postalCode) { dnbIDR.postalCode = searchCriteria.postalCode }
      if(searchCriteria.city) { dnbIDR.addressLocality = searchCriteria.city }
      if(searchCriteria.regNumber) { dnbIDR.registrationNumber = searchCriteria.regNumber }
      if(searchCriteria.telNumber) { dnbIDR.telephoneNumber = searchCriteria.telNumber }

      fetch(props.apiHubUrl + '/api/dnb/find', {
         method: 'POST',
         mode: 'cors', 
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(dnbIDR)
      })
         .then(resp => resp.json())
         .then(idrResp => {
            setMatchCandidates(idrResp.matchCandidates);

            setDuns(idrResp.matchCandidates[0] && idrResp.matchCandidates[0].organization &&
                        idrResp.matchCandidates[0].organization.duns
                     ? idrResp.matchCandidates[0].organization.duns 
                     : ''
            );
      
            ref1stMC.current.focus();
      
            setAwaitingResp(false);
         });

      return;
   };

   const refNameTextField = useRef();
   const ref1stMC = useRef();

   function MatchCandidate(props) {
      const org = props.mc.organization;

      const [ showTradestyleNames, setShowTradestyleNames ] = useState(false);

      const bTradestyleNames = org.tradeStyleNames && !!org.tradeStyleNames.length;

      function McOOB(props) {
         return (
            org.dunsControlStatus &&
               org.dunsControlStatus.operatingStatus &&
               org.dunsControlStatus.operatingStatus.dnbCode &&
               org.dunsControlStatus.operatingStatus.dnbCode === 403
                  ?  <Tooltip title='Out of business'><span>⛔️ </span></Tooltip>
                  :  null
         )
      }

      function McBranch(props) {
         return (
            org.corporateLinkage && org.corporateLinkage.familytreeRolesPlayed &&
               org.corporateLinkage.familytreeRolesPlayed[0] && org.corporateLinkage.familytreeRolesPlayed[0].dnbCode &&
               org.corporateLinkage.familytreeRolesPlayed[0].dnbCode === 9140
                  ?  <Tooltip title='Branch record'><span> 🇧</span></Tooltip>
                  :  null
         )
      }

      function McLineMisc(props) {
         const regNum =  org.registrationNumbers && org.registrationNumbers[0] && org.registrationNumbers[0].registrationNumber;
         const tel = org.telephone && org.telephone[0] && org.telephone[0].telephoneNumber;
         const ceo = org.mostSeniorPrincipals && org.mostSeniorPrincipals[0] && org.mostSeniorPrincipals[0].fullName;
         const mailAdr = org.mailingAddress && org.mailingAddress.streetAddress && org.mailingAddress.streetAddress.line1

         return (
            (regNum || tel || ceo || mailAdr)
               ? <Typography>
                  {regNum ? <span>🆔 {regNum} </span> : null}
                  {tel ? <span>☎️ {tel} </span> : null}
                  {ceo ? <Tooltip title={ceo}><span>👨‍💼 </span></Tooltip> : null}
                  {mailAdr ? <Tooltip title={mailAdr}><span>📨 </span></Tooltip> : null}
                 </Typography>
               : null
         )
      }

      function McLinePostalCodeCity(props) {
         const postalCode = org.primaryAddress && org.primaryAddress.postalCode;
         const city = org.primaryAddress && org.primaryAddress.addressLocality && org.primaryAddress.addressLocality.name;

         return (
            (postalCode || city)
               ? <Typography>{postalCode
                     ? <span style={{ 'marginRight': '8px' }}>{postalCode}</span>
                     : null}
                  {city}
                 </Typography>
               : null
         )
      }

      function McLineAdr(props) {
         return (
            org.primaryAddress &&
               org.primaryAddress.streetAddress &&
               org.primaryAddress.streetAddress[props.line] &&
               <Typography>{org.primaryAddress.streetAddress[props.line]}</Typography>
         )
      }

      function McTradeStyleNames(props) {
         if(org.tradeStyleNames && org.tradeStyleNames.length) {
            return <Typography>{org.tradeStyleNames.map(oName => oName.name).join(', ')}</Typography>
         } 

         return null;
      }

      function McLineName(props) {
         return (
            org.primaryName
               ? <Typography>
                     <McOOB />
                     {org.primaryName}
                     {props.bTradestyleNames &&
                        <span
                           onMouseEnter={() => props.setSTNs(true)}
                           onMouseLeave={() => props.setSTNs(false)}
                        > ➕ </span>
                     }
                     <McBranch />
                 </Typography>
               : null
         )
      }

      return (
         <>
            <McLineName
               bTradestyleNames={bTradestyleNames}
               setSTNs={setShowTradestyleNames}
            />
            {showTradestyleNames && <McTradeStyleNames />}
            <McLineAdr line='line1' />
            <McLineAdr line='line2' />
            <McLinePostalCodeCity />
            <McLineMisc />
         </>
      )
   }

   return (
      <Dialog
         fullWidth={true}
         maxWidth={'xs'}
         open={props.formFindIsOpen}
         onClose={handleDialogClose}
      >
         <DialogTitle>
            Find a company
            <IconButton
               onClick={event => setAnchorMenu(event.currentTarget)}
               sx={{float: 'right'}}
            >
               <MenuIcon />
            </IconButton>
         </DialogTitle>
         <Menu
            anchorEl={anchorMenu}
            open={!!anchorMenu}
            onClose={event => setAnchorMenu(event.currentTarget)}
            anchorOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
         >
            <ToggleButtonGroup
               value={addtnlFields}
               onChange={(event, updatedAddtnlFields) => setAddtnlFields(updatedAddtnlFields)}
            >
               <ToggleButton value='location'><LocationOnOutlinedIcon /></ToggleButton>
               <ToggleButton value='regNumber'><KeyOutlinedIcon /></ToggleButton>
               <ToggleButton value='telNumber'><PhoneOutlinedIcon /></ToggleButton>
            </ToggleButtonGroup>
            <Stack
               direction='row'
               justifyContent='end'
               sx={{pr: 1, mt: 1}}
            >
               <Button onClick={() => setAnchorMenu(null)}>
                  Close
               </Button>
            </Stack>
         </Menu>
         <DialogContent sx={{pt: 0.5}}>
            <Autocomplete
               fullwidth='true'
               name='country'
               size='small' margin='dense'
               options={isoCtrys}
               isOptionEqualToValue={(option, value) => option.code === value.code}
               value={searchCriteria.isoCtry}
               onChange={handleOnChange}
               renderInput={(params) => (
                  <TextField {...params} label="Select country" />
               )}
               autoSelect
               sx={{my: 1}}
            />
            <TextField
               fullWidth
               name='name' label='Company name' 
               size='small' margin='dense'
               autoFocus inputRef={refNameTextField}
               value={searchCriteria.name}
               onChange={handleOnChange}
            />
            <TextField
               fullWidth
               name='addr1' label='Address line 1' 
               size='small' margin='dense'
               value={searchCriteria.addr1}
               onChange={handleOnChange}
               InputProps={{endAdornment: (
                  <IconButton
                     edge='end'
                     disabled={addr2Act}
                     onClick={() => setAddr2Act(!addr2Act)}
                  >
                     <AddCircleOutlineOutlinedIcon />
                  </IconButton>
               )}}
            />
            {addr2Act && 
               <TextField
                  fullWidth
                  name='addr2' label='Address line 2' 
                  size='small' margin='dense'
                  value={searchCriteria.addr2}
                  onChange={handleOnChange}
                  InputProps={{endAdornment: (
                     <IconButton
                        edge='end'
                        disabled={!addr2Act}
                        onClick={() => setAddr2Act(!addr2Act)}
                     >
                        <RemoveCircleOutlineOutlinedIcon />
                     </IconButton>
                  )}}
               />
            }
            <Stack direction='row'>
               <TextField
                  name='postalCode' label='Postal code' 
                  size='small' margin='dense'
                  value={searchCriteria.postalCode}
                  onChange={handleOnChange}
                  sx={{width: '40%', mr: 1}}
               />
               <TextField
                  name='city' label='City' 
                  size='small' margin='dense'
                  value={searchCriteria.city}
                  onChange={handleOnChange}
                  sx={{width: '60%'}}
               />
            </Stack>
            {addtnlFields.includes('regNumber') &&
               <TextField
                  fullWidth
                  name='regNumber' label='Registration number' 
                  size='small' margin='dense'
                  value={searchCriteria.regNumber}
                  onChange={handleOnChange}
               />
            }
            {addtnlFields.includes('telNumber') &&
               <TextField
                  fullWidth
                  name='telNumber' label='Telephone number' 
                  size='small' margin='dense'
                  value={searchCriteria.telNumber}
                  onChange={handleOnChange}
               />
            }
            {!matchCandidates && !awaitingResp &&
               <Stack 
                  direction='row'
                  justifyContent='center'
                  spacing={1}
                  sx={{ mt: 2, mb: 1, mx: 'auto' }}
               >
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={handleOnFind}
                  >
                     Find
                  </Button>
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={() => {
                        setSearchCriteria(iniSearchCriteria);
                        refNameTextField.current.focus();
                     }}
                  >
                     Reset
                  </Button>
               </Stack>
            }
            {awaitingResp &&
               <LinearProgress sx={{mt: 2}}/>
            }
         </DialogContent>
         {matchCandidates &&
            <DialogContent sx={{pt: 0.5}}>
               <FormGroup>
                  <FormControl
                     component='fieldset'
                     sx={{
                        border: 1,
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        px: 2
                     }}
                  >
                     <FormLabel component='legend'>Match candidates</FormLabel>
                     <RadioGroup
                        id='optMCs'
                        value={duns}
                        onChange={event => setDuns(event.target.value)}
                        row
                     >
                        {matchCandidates.filter((mc, idx) => idx < 5).map((mc, idx) => 
                           <FormControlLabel
                              value={mc.organization.duns}
                              key={mc.organization.duns}
                              name='optMatchCandidate'
                              control={<Radio
                                 inputRef={idx === 0 ? ref1stMC : null}
                                 sx={{ pt: 0.2, pl: 0.5 }}
                              />}
                              label={<MatchCandidate mc={mc} />}
                              sx={{
                                 border: 1,
                                 borderColor: 'rgba(0, 0, 0, 0.23)',
                                 borderRadius: '4px',
                                 mx: 0.2,
                                 my: 0.4,
                                 p: 0.5,
                                 width: '100%',
                                 alignItems: 'start'
                              }}
                           />
                        )}
                     </RadioGroup>
                  </FormControl>
               </FormGroup>
               <Stack 
                  direction='row'
                  justifyContent='center'
                  spacing={1}
                  sx={{ mt: 2, mb: 1, mx: 'auto' }}
               >
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                  >
                     Submit
                  </Button>
                  <Button
                     variant='contained'
                     color='primary'
                     sx={{width: '25%'}}
                     onClick={() => {
                        setMatchCandidates(null);
                        refNameTextField.current.focus();
                     }}
                  >
                     Reset
                  </Button>
               </Stack>
            </DialogContent>
         }
         <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
         </DialogActions>
      </Dialog>
   );
};
 
export default FormFind;
