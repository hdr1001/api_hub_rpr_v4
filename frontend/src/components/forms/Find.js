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
   InputAdornment,
   Alert,
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
   Select,
   MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';;

const maxRefFields = 3; //D&B Direct+ allows for max 5
const refFieldOpts = [ ...Array(maxRefFields + 1).keys() ];

const defaultCtry = { label: 'Netherlands', code: 'NL' };

const iniSearchCriteria = {
   isoCtry: { ...defaultCtry },
   name: '',
   addr1: '',
   addr2: '',
   state: '',
   postalCode: '',
   city: '',
   regNumber: '',
   telNumber: '',
   iniState: true,
   apiErrResp: '',
};

refFieldOpts.forEach(opt => {if(opt < maxRefFields) { iniSearchCriteria[`refField${opt}`] = '' }});

const mcSxRow = {
   py: 0.5,
   pl: 0,
   mt: 0,
   width: '50%'
}

const mcSxCol = {
   py: 0.5,
   mt: 2,
   width: '100%'
}

const processQueue1st = refFormField => {
   if(refFormField && refFormField.current) { refFormField.current.focus() }
}

const handleOnFind = (formValidate, apiHubUrl, setAwaitingResp,
                        setIdrResp, setDuns, searchCriteria, setSearchCriteria, billRef,
                        refNameTextField, ref1stMC) => {
   if(formValidate.exec() === false) {
      console.log('Form validates false');
      return; //No match candidates will be fetched
   }

   setAwaitingResp(true);

   const dnbIDR = {};

   if(searchCriteria.isoCtry) { dnbIDR.countryISOAlpha2Code = searchCriteria.isoCtry.code }
   if(searchCriteria.name) { dnbIDR.name = searchCriteria.name }
   if(searchCriteria.addr1) { dnbIDR.streetAddressLine1 = searchCriteria.addr1 }
   if(searchCriteria.addr2) { dnbIDR.streetAddressLine2 = searchCriteria.addr2 }
   if(searchCriteria.state) { dnbIDR.addressRegion = searchCriteria.state }
   if(searchCriteria.postalCode) { dnbIDR.postalCode = searchCriteria.postalCode }
   if(searchCriteria.city) { dnbIDR.addressLocality = searchCriteria.city }
   if(searchCriteria.regNumber) { dnbIDR.registrationNumber = searchCriteria.regNumber }
   if(searchCriteria.telNumber) { dnbIDR.telephoneNumber = searchCriteria.telNumber }
   refFieldOpts.forEach(opt => {
      if(opt < maxRefFields) {
         if(searchCriteria[`refField${opt}`]) { dnbIDR[`customerReference${opt + 1}`] = searchCriteria[`refField${opt}`] }
      }
   });
   if(billRef) {dnbIDR.customerBillingEndorsement = billRef}

   fetch(apiHubUrl + '/api/dnb/find', {
      method: 'POST',
      mode: 'cors', 
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(dnbIDR)
   })
   .then(resp => {
      return new Promise((resolve, reject) => {
         resp.json()
            .then(oIdrResp => {
               if(resp.ok) {
                  oIdrResp.ahRpr = {
                     httpStatus: parseInt(resp.headers.get('X-AHRPR-API-HTTP-Status')),
                     idrID: parseInt(resp.headers.get('X-AHRPR-API-IDR-ID'))
                  };

                  resolve(oIdrResp);
               }
               else {
                  let errMsg = '', errCode = '';
                  let httpStatus = resp.headers.get('X-AHRPR-API-HTTP-Status');

                  const extnlApiResp = oIdrResp && oIdrResp.apiHubErr && oIdrResp.apiHubErr.externalApi;

                  if(extnlApiResp) {
                     if(!httpStatus) { httpStatus = extnlApiResp.status }

                     const extnlApiErr = extnlApiResp.body && extnlApiResp.body.error;

                     if(extnlApiErr) {
                        if(extnlApiErr.errorMessage) { errMsg = extnlApiErr.errorMessage }
                        if(extnlApiErr.errorCode) { errCode = extnlApiErr.errorCode }
                     }
                  }

                  if(!httpStatus) { httpStatus = resp.status + ''}

                  if(!errMsg) { errMsg = 'API request returned a HTTP status code outside of the 2XX range' }

                  let addtnlInfo = httpStatus ? ` (HTTP status ${httpStatus}` : '';

                  if(errCode) {
                     addtnlInfo += addtnlInfo.length ? `, error code ${errCode})` : ` (error code ${errCode})`
                  }
                  else {
                     addtnlInfo += addtnlInfo.length ? ')' : ''
                  }
                  
                  reject(`${errMsg}${addtnlInfo}`);
               }
            })
      })
   })
   .then(idrResp => {
      setIdrResp(idrResp);

      setDuns(idrResp.matchCandidates && idrResp.matchCandidates[0] && 
                     idrResp.matchCandidates[0].organization && idrResp.matchCandidates[0].organization.duns
               ? idrResp.matchCandidates[0].organization.duns 
               : ''
      );

      setAwaitingResp(false);

      if(ref1stMC && ref1stMC.current) { ref1stMC.current.focus() }
   })
   .catch(err => {
      setSearchCriteria( { apiErrResp: err } );

      setAwaitingResp(false);

      if(refNameTextField && refNameTextField.current) {
         refNameTextField.current.focus();
      }
   });

   return;
};

function handleOnSubmit(apiHubUrl, idrResp, setIdrResp, duns,
                           setDuns, isoCtry, setSearchCriteria, refNameTextField) {
   fetch(apiHubUrl + '/api/dnb/find/duns', {
      method: 'POST',
      mode: 'cors', 
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: idrResp.ahRpr.idrID, duns: duns})
   })
   .then(httpResp => httpResp.json())
   .then(oResp => {
      if(oResp.success) {
         console.log(`Successfully persisted IDR DUNS ${duns} for id ${idrResp.ahRpr.idrID}`)
      }
      else {
         throw new Error(`IDR update using id ${idrResp.ahRpr.idrID} and duns ${duns} was not successful 🤔`)
      }
   })
   .catch(err => 
      console.error(`Error:${err.message}`)
   )

   setIdrResp(null);
   setDuns('');

   setSearchCriteria( { ...iniSearchCriteria, isoCtry: isoCtry } );

   setTimeout(() => processQueue1st(refNameTextField), 0);
}

function DialogSettingsMenu(props) {
   const sxLabel = {justifyContent: 'space-between'};

   const [ menuBillRef, setMenuBillRef ] = useState(props.billRef);
   const [ billRefSavedSuccess, setBillRefSavedSuccess ] = useState(false);
   const [ billRefNotSavedAlert, setBillRefNotSavedAlert ] = useState(false);

   function handleMenuClose() {
      if(menuBillRef !== props.billRef) {
         setBillRefNotSavedAlert(true);

         return;
      }

      props.setDialogSettingsMenu(null)
   }

   function alertSaveDismiss(doSaveBillRef) {
      setBillRefNotSavedAlert(false);

      if(doSaveBillRef) {
         props.setBillRef(menuBillRef)
      }
      else {
         setMenuBillRef(props.billRef)
      }

      props.setDialogSettingsMenu(null)
   }

   return (
      <Menu
         id='dialog-settings-menu'
         anchorEl={props.dialogSettingsMenu}
         open={!!props.dialogSettingsMenu}
         onClose={handleMenuClose}
         anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
         }}
         transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
         }}
      >
         <Stack spacing={1} sx={{mx: 2, my: 1}}>
            <Typography
               variant='h6'
               gutterBottom
            >
               Find a company form settings
            </Typography>
            <FormControlLabel control={
                  <ToggleButtonGroup
                     value={props.addtnlFields}
                     onChange={(event, updatedAddtnlFields) => props.setAddtnlFields(updatedAddtnlFields)}
                     sx={{pl: 1}}
                  >
                     <ToggleButton value='location'><LocationOnOutlinedIcon /></ToggleButton>
                     <ToggleButton value='regNumber'><KeyOutlinedIcon /></ToggleButton>
                     <ToggleButton value='telNumber'><PhoneOutlinedIcon /></ToggleButton>
                  </ToggleButtonGroup>
               }
               label='Optional criteria fields'
               labelPlacement='start'
               sx={sxLabel}
            />
            <FormControlLabel control={
                  <Select
                     size='small'
                     value={props.numRefFields}
                     onChange={event => props.setNumRefFields(event.target.value)}
                  >
                     {refFieldOpts.map(opt => <MenuItem value={opt} key={opt}>{opt}</MenuItem>)}
                  </Select>
               }
               label='Number of reference fields'
               labelPlacement='start'
               sx={sxLabel}
            />
            <FormControlLabel control={
                  <ToggleButtonGroup
                     value={props.formOrientation}
                     exclusive
                     onChange={(event, newOrientation) => props.setFormOrientation(newOrientation)}
                     sx={{pl: 1}}
                  >
                     <ToggleButton value='column'><ArrowDownwardIcon /></ToggleButton>
                     <ToggleButton value='row'><ArrowForwardIcon /></ToggleButton>
                  </ToggleButtonGroup>
               }
               label='Match candidate orientation'
               labelPlacement='start'
               sx={sxLabel}
            />
            <TextField
               name='billRef' label='Billing reference'
               size='small' margin='dense'
               value={menuBillRef}
               onChange={event => setMenuBillRef(event.target.value)}
               InputProps={{
                  endAdornment:
                     <InputAdornment position='end'>
                        <SaveOutlinedIcon
                           onClick={() => {
                              props.setBillRef(menuBillRef);

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
         <Stack
            direction='row'
            justifyContent='end'
            sx={{mx: 2, mt: 2}}
         >
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
                  >
                     Billing reference changed
                  </Alert>
               :
                  <Button onClick={handleMenuClose}>
                     Close
                  </Button>
            }
         </Stack>
      </Menu>
   )
}

function MatchCriteriaInputs(props) {
   const [ addr2Act, setAddr2Act ] = useState(false);

   const disableInputs = !!(props.awaitingResp || props.idrResp);
   const textFieldOpts = { size: 'small', margin: 'dense', disabled: disableInputs};
   const textFieldOptsInclFW = { ...textFieldOpts, fullWidth: true };

   const handleOnChange = (event, newValue) => {
      if(!event.target.name) {
         props.setSearchCriteria( { isoCtry: newValue, iniState: false, apiErrResp: '' } )
      }
      else {
         props.setSearchCriteria( 
            { [event.target.name]: event.target.value, iniState: false, apiErrResp: '' }
         )
      }
   };

   return (
      <>
         <Autocomplete
            name='country'
            { ...textFieldOptsInclFW }
            options={isoCtrys}
            isOptionEqualToValue={(option, value) => option.code === value.code}
            value={props.searchCriteria.isoCtry}
            onChange={handleOnChange}
            renderInput={(params) => (
               <TextField
                  { ...params }
                  label='Select country'
                  required
                  { ...props.formValidate.validate[props.formValidate.isoCtry]() }
               />
            )}
            autoHighlight
            autoSelect
            sx={{my: 1}}
         />
         <TextField
            name='name' label='Company name'
            { ...textFieldOptsInclFW }
            autoFocus inputRef={props.refNameTextField}
            value={props.searchCriteria.name}
            onChange={handleOnChange}
            { ...props.formValidate.validate[props.formValidate.nameOrRegNumber]() }
            onFocus={event => event.target.select()}
         />
         <TextField
            name='addr1' label='Address line 1' 
            { ...textFieldOptsInclFW }
            value={props.searchCriteria.addr1}
            onChange={handleOnChange}
            InputProps={props.addtnlFields.includes('location')
               ?
                  null
               :
                  {endAdornment: (
                     <IconButton
                        edge='end'
                        disabled={addr2Act || disableInputs}
                        onClick={() => setAddr2Act(!addr2Act)}
                     >
                        <AddCircleOutlineOutlinedIcon />
                     </IconButton>
                  )}
            }
         />
         <Stack direction='row'>
            {(props.addtnlFields.includes('location') || addr2Act) && 
               <TextField
                  name='addr2' label='Address line 2' 
                  { ...textFieldOptsInclFW }
                  value={props.searchCriteria.addr2}
                  onChange={handleOnChange}
                  InputProps={props.addtnlFields.includes('location')
                     ?
                        null
                     :
                        {endAdornment: (
                           <IconButton
                              edge='end'
                              disabled={!addr2Act || disableInputs}
                              onClick={() => setAddr2Act(!addr2Act)}
                           >
                              <RemoveCircleOutlineOutlinedIcon />
                           </IconButton>
                        )}
                  }
                  sx={{
                     width: props.addtnlFields.includes('location') ? '80%' : '100%',
                     mr: props.addtnlFields.includes('location') ? 1 : 0
                  }}
               />
            }
            {(props.addtnlFields.includes('location')) &&
               <TextField
                  name='state' label='State' 
                  { ...textFieldOpts }
                  value={props.searchCriteria.state}
                  onChange={handleOnChange}
                  sx={{width: '20%'}}
               />
            }
         </Stack>
         <Stack direction='row'>
            <TextField
               name='postalCode' label='Postal code' 
               { ...textFieldOpts }
               value={props.searchCriteria.postalCode}
               onChange={handleOnChange}
               sx={{width: '40%', mr: 1}}
            />
            <TextField
               name='city' label='City' 
               { ...textFieldOpts }
               value={props.searchCriteria.city}
               onChange={handleOnChange}
               sx={{width: '60%'}}
            />
         </Stack>
         {props.addtnlFields.includes('regNumber') &&
            <TextField
               name='regNumber' label='Registration number' 
               { ...textFieldOptsInclFW }
               value={props.searchCriteria.regNumber}
               onChange={handleOnChange}
               { ...props.formValidate.validate[props.formValidate.nameOrRegNumber]() }
            />
         }
         {props.addtnlFields.includes('telNumber') &&
            <TextField
               name='telNumber' label='Telephone number' 
               { ...textFieldOptsInclFW }
               value={props.searchCriteria.telNumber}
               onChange={handleOnChange}
            />
         }
         {props.numRefFields > 0 &&
               refFieldOpts.map(opt =>
                  opt < props.numRefFields
                     ?
                        <TextField
                           name={`refField${opt}`}
                           label={`Reference field ${opt + 1}`} 
                           { ...textFieldOptsInclFW }
                           value={props.searchCriteria[`refField${opt}`]}
                           onChange={handleOnChange}
                           key={opt}
                        />
                     :
                        null
               )
         }
         {props.searchCriteria.apiErrResp.length > 0 && 
            <Alert
               severity='error'
               onClose={() => {
                  props.refNameTextField.current.focus();
                  props.setSearchCriteria( { apiErrResp: '' } );
               }}
               sx={{mt: 1}}
            >
               {props.searchCriteria.apiErrResp}
            </Alert>
         }
      </>
   );
}

function MatchCriteriaBtns(props) {
   const btnOpts = { variant: 'contained', color: 'primary', sx: {width: '25%'} };

   return (
      <Stack
         direction='row'
         justifyContent='center'
         spacing={1}
         sx={{ mt: 2, mb: 1, mx: 'auto' }}
      >
         <Button
            { ... btnOpts }
            onClick={() => handleOnFind(props.formValidate, props.apiHubUrl, props.setAwaitingResp, props.setIdrResp,
                                          props.setDuns, props.searchCriteria, props.setSearchCriteria, props.billRef,
                                          props.refNameTextField, props.ref1stMC)}
         >
            Find
         </Button>
         <Button
            { ... btnOpts }
            onClick={() => {
               const isoCtry = props.searchCriteria.isoCtry
                                 ? { ...props.searchCriteria.isoCtry }
                                 : { ...defaultCtry }
               props.setSearchCriteria({ ...iniSearchCriteria, isoCtry: isoCtry });
               if(props.refNameTextField && props.refNameTextField.current) {
                  props.refNameTextField.current.focus();
               }
            }}
         >
            Reset
         </Button>
      </Stack>
   );
}

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
            org.primaryAddress.streetAddress[props.line]
         ?
            <Typography>{org.primaryAddress.streetAddress[props.line]}</Typography>
         :
            null
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
   );
}

function MatchCandidateOpts(props) {
   const fldSet = {border: 1, borderColor: 'rgba(0, 0, 0, 0.23)', borderRadius: '4px'};

   return (
      <FormGroup>
         <FormControl
            component='fieldset'
            sx={{
               ...fldSet,
               px: 2,
               py: 0.5
            }}
         >
            <FormLabel component='legend'>Match candidates</FormLabel>
            <RadioGroup
               id='optMCs'
               value={props.duns}
               onChange={event => props.setDuns(event.target.value)}
               row
            >
               {props.idrResp.matchCandidates.filter((mc, idx) => idx < 5).map((mc, idx) => 
                  <FormControlLabel
                     value={mc.organization.duns}
                     key={mc.organization.duns}
                     name='optMatchCandidate'
                     control={<Radio
                        inputRef={idx === 0 ? props.ref1stMC : null}
                        sx={{ pt: 0.2, pl: 0.5 }}
                     />}
                     label={<MatchCandidate mc={mc} />}
                     sx={{
                        ...fldSet,
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
   );
}

function MatchCandidateBtns(props) {
   const btnOpts = { variant: 'contained', color: 'primary', sx: {width: '25%'} };

   return (
      <Stack
         direction='row'
         justifyContent='center'
         spacing={1}
         sx={{ mt: 2, mb: 1, mx: 'auto' }}
      >
         <Button
            { ... btnOpts }
            onClick={() => handleOnSubmit(props.apiHubUrl, props.idrResp, props.setIdrResp,
                                             props.duns, props.setDuns, props.isoCtry,
                                             props.setSearchCriteria, props.refNameTextField)}
         >
            Submit
         </Button>
         <Button
            { ... btnOpts }
            onClick={() => {
               props.setIdrResp(null);
               setTimeout(() => processQueue1st(props.refNameTextField), 0);
            }}
         >
            Reset
         </Button>
      </Stack>
   )
}

const FormFind = props => {
   //Component state 
   const [ dialogSettingsMenu, setDialogSettingsMenu ] = useState(null);

   const [ addtnlFields, setAddtnlFields ] = useState(['regNumber']);

   const [ numRefFields, setNumRefFields ] = useState(refFieldOpts[0]);

   const [ formOrientation, setFormOrientation ] = useState('row');

   const [ searchCriteria, setSearchCriteria ] = useReducer(
      (prevState, state) => ( { ...prevState, ...state } ),
      iniSearchCriteria
   );
   
   const [ billRef, setBillRef ] = useState('');

   const [ awaitingResp, setAwaitingResp ] = useState(false);

   const [ idrResp, setIdrResp ] = useState(null);
   
   const [ duns, setDuns ] = useState('');

   //Component references
   const refNameTextField = useRef();

   const ref1stMC = useRef();

   const handleDialogClose = () => {
      if(awaitingResp) {
         console.log('Do not close the dialog while awaiting REST response');
   
         return;
      }
   
      setSearchCriteria(iniSearchCriteria);
   
      if(idrResp) { setIdrResp(null) }

      props.closeFormFind();
   };

   const formValidate = {
      isoCtry: 0,
      nameOrRegNumber: 1,

      validate: [
         (force) => (force || !searchCriteria.iniState) && searchCriteria.isoCtry === null
                  ? {error: true, helperText: 'Valid country is required'}
                  : null,
         (force) => (force || !searchCriteria.iniState) && !(searchCriteria.name || searchCriteria.regNumber)
                  ? {error: true, helperText: 'Valid name or registration number is required'}
                  : null,
         () => searchCriteria.apiErrResp.length > 0
                  ? {error: true, helperText: 'API match candidate request resulted in an error'}
                  : null
      ],

      exec: function() {
         setSearchCriteria( { iniState: false } );

         return this.validate.every(f => f(true) === null)
      }
   };

   //The find component
   return (
      <Dialog
         fullWidth={true}
         maxWidth={idrResp && formOrientation === 'row' ? 'lg' : 'xs'}
         open={props.formFindIsOpen}
         onClose={handleDialogClose}
         onKeyDown={event => {
            if(event.ctrlKey && event.code === 'KeyS') {
               event.stopPropagation(); event.preventDefault();

               if(!awaitingResp && !idrResp) {
                  handleOnFind(formValidate, props.apiHubUrl, setAwaitingResp, setIdrResp,
                                    setDuns, searchCriteria, setSearchCriteria, billRef,
                                    refNameTextField, ref1stMC)
               }

               if(!awaitingResp && idrResp) {
                  handleOnSubmit(props.apiHubUrl, idrResp, setIdrResp, duns, setDuns, 
                                       { ...searchCriteria.isoCtry }, setSearchCriteria, refNameTextField)
               }
            }

            if(event.ctrlKey && event.code === 'KeyR') {
               event.stopPropagation(); event.preventDefault();

               if(!awaitingResp && !idrResp) {
                  setSearchCriteria({ ...iniSearchCriteria, isoCtry: { ...searchCriteria.isoCtry } });

                  if(refNameTextField && refNameTextField.current) {
                     refNameTextField.current.focus();
                  }
               }

               if(!awaitingResp && idrResp) {
                  setIdrResp(null);
                  setTimeout(() => processQueue1st(refNameTextField), 0);
               }
            }
         }}
      >
         <DialogTitle>
            Find a company
            <IconButton
               aria-controls={!!dialogSettingsMenu ? 'dialog-settings-menu' : undefined}
               aria-haspopup={true}
               aria-expanded={!!dialogSettingsMenu ? true : undefined}
               onClick={event => setDialogSettingsMenu(event.currentTarget)}
               sx={{float: 'right'}}
            >
               <MenuIcon />
            </IconButton>
         </DialogTitle>
         <DialogSettingsMenu
            dialogSettingsMenu={dialogSettingsMenu}
            setDialogSettingsMenu={setDialogSettingsMenu}
            addtnlFields={addtnlFields}
            setAddtnlFields={setAddtnlFields}
            numRefFields={numRefFields}
            setNumRefFields={setNumRefFields}
            formOrientation={formOrientation}
            setFormOrientation={setFormOrientation}
            billRef={billRef}
            setBillRef={setBillRef}
         />
         <Stack
            direction={formOrientation}
         >
         <DialogContent sx={{py: 0.5, width: formOrientation === 'row' ? '50%' : '100%'}}>
            <MatchCriteriaInputs
               awaitingResp={awaitingResp}
               idrResp={idrResp}
               searchCriteria={searchCriteria}
               setSearchCriteria={setSearchCriteria}
               addtnlFields={addtnlFields}
               numRefFields={numRefFields}
               refNameTextField={refNameTextField}
               formValidate={formValidate}
            />
            {!idrResp && !awaitingResp && 
               <MatchCriteriaBtns
                  apiHubUrl={props.apiHubUrl}
                  setAwaitingResp={setAwaitingResp}
                  setIdrResp={setIdrResp}
                  setDuns={setDuns}
                  setSearchCriteria={setSearchCriteria}
                  searchCriteria={searchCriteria}
                  billRef={billRef}
                  refNameTextField={refNameTextField}
                  ref1stMC={ref1stMC}
                  formValidate={formValidate}
               />
            }
            {awaitingResp &&
               <LinearProgress sx={{mt: 2}}/>
            }
         </DialogContent>
         {idrResp &&
            <DialogContent
               sx={formOrientation === 'row' ? mcSxRow : mcSxCol}
            >
               <MatchCandidateOpts
                  idrResp={idrResp}
                  duns={duns}
                  setDuns={setDuns}
                  ref1stMC={ref1stMC}
               />
               <MatchCandidateBtns
                  apiHubUrl={props.apiHubUrl}
                  idrResp={idrResp}
                  setIdrResp={setIdrResp}
                  duns={duns}
                  setDuns={setDuns}
                  isoCtry={ {...searchCriteria.isoCtry} }
                  setSearchCriteria={setSearchCriteria}
                  refNameTextField={refNameTextField}
               />
            </DialogContent>
         }
         </Stack>
         <DialogActions sx={{mx:2, py: 0.5}}>
            <Button onClick={handleDialogClose}>Close</Button>
         </DialogActions>
      </Dialog>
   );
};
 
export default FormFind;
