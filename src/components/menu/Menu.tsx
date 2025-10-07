import React from 'react';

import clsxm from '@/lib/clsxm';

import { menuItems } from '@/components/menu/constants';

import { useTabsContext } from '@/features/Game/contexts/TabsContext';

const Menu = () => {
  const { setSelectedTab, selectedTab } = useTabsContext();

  return (
    <div className='sticky bottom-4 z-[999] mx-auto flex w-[85vw] items-center justify-around rounded-full border border-primary-500/50 bg-white/95 p-3 shadow-lg backdrop-blur mobile-demo:w-[450px]'>
      {menuItems.map((item) => {
        return (
          <span
            onClick={() => setSelectedTab(item.name)}
            className={clsxm([
              'aspect-square text-xl text-black transition-colors',
              selectedTab === item.name && 'text-primary-500',
            ])}
            key={item.name}
          >
            {item.icon}
          </span>
        );
      })}
    </div>
  );
};

export default Menu;
