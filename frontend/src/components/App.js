// *********************************************************************
//
// API Hub request, persist and respond UI main app
// JavaScript code file: App.js
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

import './App.css';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { styled } from '@mui/material/styles';
import AhAppBar from './AhAppBar';
import FormFind from './forms/Find.js'
import FormConnSettings from './forms/ConnSettings.js';
import FormSettings from './forms/Settings.js';
import AhContent from './AhContent';
import { ahDnbGetDBs } from './ahCalls';

export const DataContext = React.createContext(); 

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function App(props) {
   const [arrData, setArrData] = useState([]);
 
   const handleFileInp = e => 
      setArrData([...arrData, ...Array.from(e.target.files).map(file => ({file, uuid: uuidv4()}))])

   const handleApiInputs = arrInps => {
      Promise.all(arrInps.map(callParams => ahDnbGetDBs(callParams.apiHubUrl, callParams.duns, callParams.oQryParams) ))
         .then(arrObjDbData => setArrData([ ...arrData , ...arrObjDbData.map(oDbData => ({ oDbData,  uuid: uuidv4() }) )]))
         .catch(err => console.log(err.message))
   }

   const handleDeleteData = (e, uuid) => {
      setArrData(arrData.filter(oData => oData.uuid !== uuid))
   }

   const [apiHubUrl, setApiHubUrl] = useState('');

   const [formFindIsOpen, setFormFindIsOpen] = useState(false);

   const openFormFind = () => setFormFindIsOpen(true);
   const closeFormFind = () => setFormFindIsOpen(false);

   const [ billRef, setBillRef ] = useState('');

   const [formConnSettingsIsOpen, setFormConnSettingsIsOpen] = useState(false);

   const openFormConnSettings = () => setFormConnSettingsIsOpen(true);
   const closeFormConnSettings = () => setFormConnSettingsIsOpen(false);

   const [formSettingsIsOpen, setFormSettingsIsOpen] = useState(false);

   const openFormSettings = () => setFormSettingsIsOpen(true);
   const closeFormSettings = () => setFormSettingsIsOpen(false);
 
   return (
      <DataContext.Provider
         value={{
            handleDeleteData
         }}>
         <AhAppBar
            apiHubUrl={apiHubUrl}
            handleFileInp={handleFileInp}
            openFormFind={openFormFind}
            openFormConnSettings={openFormConnSettings}
            openFormSettings={openFormSettings}
         />
         <Offset />

         <AhContent arrData={arrData} />
         <FormFind
            apiHubUrl={apiHubUrl}
            billRef={billRef}
            formFindIsOpen={formFindIsOpen}
            closeFormFind={closeFormFind}
            handleApiInputs={handleApiInputs}
         />
         <FormConnSettings
            formConnSettingsIsOpen={formConnSettingsIsOpen}
            closeFormConnSettings={closeFormConnSettings}
            setApiHubUrl={setApiHubUrl}
         />
         <FormSettings
            apiHubUrl={apiHubUrl}
            billRef={billRef}
            setBillRef={setBillRef}
            formSettingsIsOpen={formSettingsIsOpen}
            closeFormSettings={closeFormSettings}
         />
      </DataContext.Provider>
   );
}
