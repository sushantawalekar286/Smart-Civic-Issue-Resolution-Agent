import React from 'react';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-4">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-200 ml-3 md:ml-4 space-y-6 pb-2">
      {events.map((event, idx) => (
        <div key={idx} className="relative pl-6 md:pl-8">
          {/* Timeline dot */}
          <span className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{event.title}</h4>
              {event.description && (
                <p className="text-sm text-slate-600 mt-1">{event.description}</p>
              )}
              {event.result && (
                <div className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-lg inline-block">
                  {event.result}
                </div>
              )}
            </div>
            <div className="mt-2 sm:mt-0 text-xs text-slate-500 whitespace-nowrap">
              {event.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
