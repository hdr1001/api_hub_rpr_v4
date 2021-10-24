import React from 'react';
import { styled } from '@mui/material/styles';
import AhAppBar from './AhAppBar';

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
         { arrFiles: this.state.arrFiles.concat(Array.from(e.target.files).map(file => file.name)) }
      )
   }

   render() {
      const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

      return (
         <>
            <AhAppBar handleFileInp={this.handleFileInp} />

            <Offset />
            <table><tbody>
               {
                  this.state.arrFiles.map((file, idx) => <tr key={idx}><td>{file}</td></tr>)
               }
            </tbody></table>
         </>
      )
   }
}
