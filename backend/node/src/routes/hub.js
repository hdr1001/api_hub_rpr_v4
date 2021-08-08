import express from 'express';
import api from './api.js';

const router = express.Router();

router.use('/api', api);

router.get('/about', (req, resp) => {
    resp.send('About here')
});

export default router;
