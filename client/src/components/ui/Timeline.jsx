import React from 'react';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-4">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-white/20 ml-3 md:ml-4 space-y-6 pb-2">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6 md:pl-8">
          {/* Timeline dot */}
          <span className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
          </span>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">{event.title}</h4>
              {event.description && (
                <p className="text-sm text-gray-300 mt-1">{event.description}</p>
              )}
              {event.result && (
                <div className="mt-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg inline-block">
                  {event.result}
                </div>
              )}
            </div>
            <div className="mt-2 sm:mt-0 text-xs text-gray-400 whitespace-nowrap">
              {event.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
