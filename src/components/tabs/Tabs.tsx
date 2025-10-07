import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

type Props = {
  className?: string;
  children: React.ReactNode | React.ReactNode[];
};

const Tabs = ({ className, children }: Props) => {
  return (
    <Tab.List
      className={clsx(
        'grid grid-cols-2 items-center justify-center gap-1 rounded-full bg-white/95 p-2 capitalize text-black shadow-sm backdrop-blur mobile-m:gap-3 mobile-demo:gap-6',
        className
      )}
    >
      {children}
    </Tab.List>
  );
};

export default Tabs;
