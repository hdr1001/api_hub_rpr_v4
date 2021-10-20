import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';


export default function App(props) {
   function sayHello(event) {
      alert('React Material UI button clicked')
   }

   return (
      <>
         <AppBar>
            <Toolbar>
               <Typography sx={{ flexGrow: 1 }}>API Hub (v4)</Typography>
               <IconButton color="inherit">
                  <UploadFileOutlinedIcon />
               </IconButton>
               <IconButton color="inherit">
                  <SettingsOutlinedIcon />
               </IconButton>
            </Toolbar>
         </AppBar>
      </>
   )
}  
