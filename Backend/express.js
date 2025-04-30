
router.get('/verify-qr', auth, role('admin'), async (req, res) => {
    try {

        const { userId, eventId } = req.query;
        const user = await User.findById(userId);
        const event = await Event.findById(eventId);
        
        if (!user || !event) {
            return res.status(404).json({ success: false, message: 'Invalid QR code' });
        }
        
        const registration = user.registeredEvents.find(reg => reg.event.toString() === eventId);
        if (!registration) {
            return res.status(400).json({ success: false, message: 'User not registered for this event' });
        }
        
        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                studentId: user.studentId
            },
            event: {
                title: event.title,
                date: event.date,
                location: event.location
            },
            checkedIn: registration.checkedIn
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/confirm-checkin', auth, role('admin'), async (req, res) => {
    try {
        const { qrData } = req.body;
        
        const user = await User.findById(qrData.userId);
        const event = await Event.findById(qrData.eventId);
        
        if (!user || !event) {
            return res.status(404).json({ success: false, message: 'Invalid QR code' });
        }
  
        const userRegistration = user.registeredEvents.find(reg => 
            reg.event.toString() === qrData.eventId
        );
        
        if (userRegistration.checkedIn) {
            return res.status(400).json({ success: false, message: 'User already checked in' });
        }
        
        userRegistration.checkedIn = true;
        await user.save();

        const eventAttendee = event.attendees.find(attendee => 
            attendee.user.toString() === qrData.userId
        );
        eventAttendee.checkedIn = true;
        await event.save();
        
        res.json({ 
            success: true,
            message: 'Check-in successful',
            user: {
                name: user.name,
                studentId: user.studentId
            },
            event: {
                title: event.title
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});