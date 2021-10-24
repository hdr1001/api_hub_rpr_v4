import React from 'react';
import Box from '@mui/system/Box';
import Paper from '@mui/material/Paper';

export default function AhContent(props) {
   return (
      <Box
         sx={{
            mt: 1,
            mx: 0.5,
            display: 'inline-block' 
         }}
      >
         {
            props.state.arrFiles.map((file, idx) => 
               <Box
                  key={idx}
                  sx={{
                     width: 320,
                     m: 1,
                     float: 'right'
                  }}
               >
                  <Paper
                     sx={{
                        px: 0.5
                     }}
                  >
                     {file}
                  </Paper>
               </Box>
            )
         }
      </Box>
   )
}
