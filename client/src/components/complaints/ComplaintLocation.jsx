import React from 'react';
import ComplaintLocationMap from '../location/ComplaintLocationMap';

const ComplaintLocation = ({ location }) => {
  return <ComplaintLocationMap location={location} height="220px" />;
};

export default ComplaintLocation;
