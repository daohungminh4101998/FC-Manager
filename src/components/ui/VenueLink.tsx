import React from 'react';
import clsx from 'clsx';

interface VenueLinkProps {
  venue: string;
  locationUrl?: string | null;
  className?: string;
}

export const VenueLink: React.FC<VenueLinkProps> = ({ venue, locationUrl, className }) => {
  if (!locationUrl) return <>{venue}</>;

  return (
    <a
      href={locationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('hover:text-emerald-400 underline underline-offset-2', className)}
    >
      {venue}
    </a>
  );
};
