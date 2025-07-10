import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { Box, Button, Typography, CircularProgress, IconButton, ButtonGroup, useTheme, useMediaQuery } from '@mui/material';
import AddReadingGoalModal from './AddReadingGoalModal';
import EventDetailsModal from './EventDetailsModal';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Toolbar for the Calendar
const CustomToolbar = ({ label, onNavigate, onView, view, isMobile }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={() => onNavigate('PREV')} aria-label="previous">
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" component="h2" sx={{ mx: 2, minWidth: isMobile ? '120px' : '150px', textAlign: 'center' }}>
        {label}
      </Typography>
      <IconButton onClick={() => onNavigate('NEXT')} aria-label="next">
        <ChevronRightIcon />
      </IconButton>
      <Button variant="outlined" onClick={() => onNavigate('TODAY')} sx={{ ml: 2 }}>
        Today
      </Button>
    </Box>
    <ButtonGroup variant="outlined" aria-label="view switcher">
      <Button onClick={() => onView(Views.MONTH)} variant={view === Views.MONTH ? 'contained' : 'outlined'}>Month</Button>
      <Button onClick={() => onView(Views.WEEK)} variant={view === Views.WEEK ? 'contained' : 'outlined'}>Week</Button>
      <Button onClick={() => onView(Views.DAY)} variant={view === Views.DAY ? 'contained' : 'outlined'}>Day</Button>
    </ButtonGroup>
  </Box>
);

const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user, token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);

  const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView) => setView(newView), [setView]);

  const fetchEvents = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await api.get('/schedule');
      if (Array.isArray(res.data)) {
        const formattedEvents = res.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch schedule events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [token, fetchEvents]);

  useEffect(() => {
    if (eventIdFromUrl && events.length > 0) {
      const eventToOpen = events.find(e => e._id === eventIdFromUrl);
      if (eventToOpen) {
        setSelectedEvent(eventToOpen);
      }
    }
  }, [events, eventIdFromUrl]);

  const handleUpdate = () => {
    fetchEvents();
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const eventPropGetter = (event) => {
    const style = {
      backgroundColor: event.completed ? theme.palette.success.main : theme.palette.primary.main,
      borderRadius: '5px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 'bold' }}>
          My Reading Schedule
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)} 
          disabled={loading || !token}
          sx={{ borderRadius: '20px', px: 3, py: 1 }}
        >
          Add Goal
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100vh - 200px)' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
            views={['month', 'week', 'day']}
            date={date}
            view={view}
            onNavigate={handleNavigate}
            onView={handleView}
            components={{
              toolbar: (props) => <CustomToolbar {...props} isMobile={isMobile} />,
            }}
          />
        </Box>
      )}

      <AddReadingGoalModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onGoalAdded={handleUpdate}
      />

      <EventDetailsModal
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onUpdate={handleUpdate}
      />
    </Box>
  );
};

export default SchedulePage;
