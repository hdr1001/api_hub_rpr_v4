import './App.css';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import AhAppBar from './AhAppBar';
import AhContent from './AhContent';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function App(props) {
   const [arrFiles, setArrFiles] = useState([]);

   useEffect(() => console.log('arrFiles = ' + arrFiles.map(file => file.name).join(', '), [arrFiles]));   

   const handleFileInp = e => {
      setArrFiles([...arrFiles, ...Array.from(e.target.files)])
   };

   return (
      <>
         <AhAppBar handleFileInp={handleFileInp} />
         <Offset />

         <AhContent arrFiles={arrFiles} />
      </>
   );
}
