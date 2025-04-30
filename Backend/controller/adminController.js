const Event = require('../models/Event');
const User = require('../models/User');
const { exportToCSV, exportToJSON } = require('../utils/exportData');

const getEventsWithStats = async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'attendees.user',
          foreignField: '_id',
          as: 'attendeesDetails'
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          location: 1,
          date: 1,
          time: 1,
          totalAttendees: { $size: '$attendees' },
          checkedInAttendees: {
            $size: {
              $filter: {
                input: '$attendees',
                as: 'attendee',
                cond: { $eq: ['$$attendee.checkedIn', true] }
              }
            }
          }
        }
      },
      { $sort: { date: -1 } }
    ]);

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate({
        path: 'attendees.user',
        select: 'name email studentId'
      });

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const exportAttendees = async (req, res) => {
  const { eventId, format } = req.params;

  try {
    const event = await Event.findById(eventId)
      .populate({
        path: 'attendees.user',
        select: 'name email studentId'
      });

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const attendees = event.attendees.map(attendee => ({
      name: attendee.user.name,
      email: attendee.user.email,
      studentId: attendee.user.studentId,
      checkedIn: attendee.checkedIn ? 'Yes' : 'No'
    }));

    let data;
    let contentType;
    let fileName = `attendees_${event.title.replace(/\s+/g, '_')}`;

    if (format === 'csv') {
      data = exportToCSV(attendees);
      contentType = 'text/csv';
      fileName += '.csv';
    } else if (format === 'json') {
      data = exportToJSON(attendees);
      contentType = 'application/json';
      fileName += '.json';
    } else {
      return res.status(400).json({ msg: 'Invalid format' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { getEventsWithStats, getEventAttendees, exportAttendees };