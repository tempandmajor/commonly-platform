
import React from 'react';
import { useParams } from 'react-router-dom';
import ContentPageComponent from '@/components/content/ContentPage';

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  return <ContentPageComponent />;
};

export default ContentPage;
