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
import AhContent from './AhContent';

export const DataContext = React.createContext(); 

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function App(props) {
   const [arrData, setArrData] = useState([]);

   const handleFileInp = e => 
      setArrData([...arrData, ...Array.from(e.target.files).map(file => ({file, uuid: uuidv4()}))])
   
   const handleDeleteData = (e, uuid) => {
      setArrData(arrData.filter(oData => oData.uuid !== uuid))
   }

   return (
      <DataContext.Provider
         value={{
            arrData,
            handleFileInp,
            handleDeleteData
         }}>
         <AhAppBar />
         <Offset />

         <AhContent />
      </DataContext.Provider>
   );
}
