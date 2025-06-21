
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new community home page
    navigate('/community/home', { replace: true });
  }, [navigate]);

  return null;
};

export default Community;
