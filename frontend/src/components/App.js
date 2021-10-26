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

import React from 'react';
import { styled } from '@mui/material/styles';
import AhAppBar from './AhAppBar';
import AhContent from './AhContent';

export default class App extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         arrFiles: []
      };

      this.handleFileInp = this.handleFileInp.bind(this);
   }

   handleFileInp = e => {
      this.setState(
         { arrFiles: this.state.arrFiles.concat(Array.from(e.target.files)) }
      )
   }

   render() {
      const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

      return (
         <>
            <AhAppBar handleFileInp={this.handleFileInp} />

            <Offset />
            <AhContent state={this.state} />
         </>
      );
   }
}
