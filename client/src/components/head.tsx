import { Helmet } from 'react-helmet';
import { ReactNode } from 'react';

interface HeadProps {
  children: ReactNode;
}

export default function Head({ children }: HeadProps) {
  return (
    <Helmet>
      {children}
    </Helmet>
  );
}
