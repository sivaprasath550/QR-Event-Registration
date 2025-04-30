const express = require('express');
const router = express.Router();
const { auth, role } = require('../middleware/auth');
const { getEventsWithStats, getEventAttendees, exportAttendees } = require('../controllers/adminController');

router.get('/events', auth, role('admin'), getEventsWithStats);

router.get('/events/:eventId/attendees', auth, role('admin'), getEventAttendees);

router.get('/events/:eventId/export/:format', auth, role('admin'), exportAttendees);

module.exports = router;