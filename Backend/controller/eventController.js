const Event = require('../models/Event');
const User = require('../models/User');
const generateQR = require('../utils/generateQR');
const { sendEmail } = require('../config/email');

const createEvent = async (req, res) => {
  const { title, description, location, date, time } = req.body;

  try {
    const event = new Event({
      title,
      description,
      location,
      date,
      time,
      organizer: req.user.id
    });

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const registerForEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const user = await User.findById(req.user.id);
    const isRegistered = user.registeredEvents.some(regEvent => 
      regEvent.event.toString() === eventId
    );

    if (isRegistered) {
      return res.status(400).json({ msg: 'Already registered for this event' });
    }

    const qrData = {
      userId: user._id,
      eventId: event._id,
      studentId: user.studentId,
      timestamp: new Date()
    };

    const qrCode = await generateQR(qrData);

    user.registeredEvents.push({
      event: event._id,
      qrCode,
      checkedIn: false
    });

    await user.save();

    event.attendees.push({
      user: user._id,
      checkedIn: false
    });

    await event.save();

    const emailHtml = `
      <h1>Event Registration Confirmation</h1>
      <p>You have successfully registered for ${event.title}.</p>
      <p><strong>Event Details:</strong></p>
      <p>Date: ${event.date.toDateString()}</p>
      <p>Time: ${event.time}</p>
      <p>Location: ${event.location}</p>
      <p>Please present this QR code at the event for check-in:</p>
      <img src="${qrCode}" alt="QR Code" style="width:200px;height:200px;"/>
    `;

    await sendEmail(user.email, `Registration Confirmation: ${event.title}`, emailHtml);

    res.json({ msg: 'Registered successfully', qrCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const verifyQR = async (req, res) => {
  const { qrData } = req.body;

  try {
    const data = JSON.parse(qrData);
    
    const user = await User.findById(data.userId);
    const event = await Event.findById(data.eventId);

    if (!user || !event) {
      return res.status(404).json({ msg: 'Invalid QR code' });
    }

    const userRegistration = user.registeredEvents.find(regEvent => 
      regEvent.event.toString() === data.eventId
    );

    if (!userRegistration) {
      return res.status(400).json({ msg: 'User not registered for this event' });
    }

    if (userRegistration.checkedIn) {
      return res.status(400).json({ msg: 'User already checked in' });
    }

    userRegistration.checkedIn = true;
    await user.save();

    const eventAttendee = event.attendees.find(attendee => 
      attendee.user.toString() === data.userId
    );
    eventAttendee.checkedIn = true;
    await event.save();

    res.json({ msg: 'Check-in successful', user: user.name, event: event.title });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createEvent, getEvents, registerForEvent, verifyQR };