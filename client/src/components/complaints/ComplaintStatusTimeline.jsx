import React from 'react';
import Timeline from '../ui/Timeline';

const ComplaintStatusTimeline = ({ statusHistory = [] }) => {
  const events = statusHistory.map((event) => {
    let title = `Status changed to ${event.status}`;
    if (event.changedByRole) {
      title += ` by ${event.changedByRole}`;
    }

    return {
      title,
      description: event.note,
      time: new Date(event.timestamp).toLocaleString(),
    };
  });

  return (
    <div className="py-2">
      <Timeline events={events} />
    </div>
  );
};

export default ComplaintStatusTimeline;
