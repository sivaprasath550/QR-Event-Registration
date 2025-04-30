const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth');
const { createEvent, getEvents, registerForEvent, verifyQR } = require('../controllers/eventController');

router.post('/', auth, role('admin'), createEvent);

router.get('/', getEvents);

router.post('/:eventId/register', auth, registerForEvent);

router.post('/verify', auth, role('admin'), verifyQR);

module.exports = router;