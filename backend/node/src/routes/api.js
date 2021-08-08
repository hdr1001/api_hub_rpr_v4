import express from 'express';

const router = express.Router();

router.get('/', (req, resp) => {
    resp.send('APIs here')
});

export default router;
