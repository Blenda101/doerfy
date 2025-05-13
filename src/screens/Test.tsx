import React, { useState, useMemo, useCallback, Fragment } from "react";
import { Calendar, Views, DateLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import PropTypes from "prop-types";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

export default function SimpleDnDCalendar() {
  const [events, setEvents] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: null,
    end: null,
  });

  // Handle dragging event to new time
  const moveEvent = useCallback(({ event, start, end }) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev)),
    );
  }, []);

  // Handle resizing
  const resizeEvent = useCallback(({ event, start, end }) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev)),
    );
  }, []);

  // Show form when slot clicked
  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewEvent({ title: "", start, end });
    setFormVisible(true);
  }, []);

  // Add new event
  const handleAddEvent = () => {
    const id = Date.now();
    setEvents([...events, { ...newEvent, id }]);
    setFormVisible(false);
  };

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 0, 1, 8),
    }),
    [],
  );

  return (
    <Fragment>
      <div className="h-[80vh] border border-gray-300 rounded-md shadow mx-4 my-6">
        <DragAndDropCalendar
          defaultDate={defaultDate}
          defaultView={Views.DAY}
          events={events}
          localizer={localizer}
          onEventDrop={moveEvent}
          onEventResize={resizeEvent}
          resizable
          selectable
          onSelectSlot={handleSelectSlot}
          scrollToTime={scrollToTime}
          step={15}
        />
      </div>

      {/* Tailwind modal form */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setFormVisible(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

SimpleDnDCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
