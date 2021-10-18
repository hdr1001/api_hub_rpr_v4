import React from 'react';
import Button from '@mui/material/Button';

export default function App(props) {
   function sayHello(event) {
      alert('React Material UI button clicked')
   }

   return (
      <Button onClick={sayHello} variant="contained">Hello World</Button>
   )
}  
