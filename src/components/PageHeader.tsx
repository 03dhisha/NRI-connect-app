import React from 'react';
import nriLogo from '@/assets/nri-logo.png';

interface PageHeaderProps {
  title: string;
  className?: string;
}

const PageHeader = ({ title, className = '' }: PageHeaderProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={nriLogo} alt="NRI Connect" className="w-10 h-10 object-contain" />
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    </div>
  );
};

export default PageHeader;
