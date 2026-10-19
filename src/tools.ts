import type { Href } from 'expo-router';
import type { ComponentType } from 'react';

import { NutIcon } from '@/tools/nut/NutIcon';

export type Tool = {
  id: string;
  title: string;
  description: string;
  route: Href;
  Icon: ComponentType<{ size?: number }>;
};

/** Every Luthifer tool. Add an entry here to put a new tool on the home screen. */
export const TOOLS: Tool[] = [
  {
    id: 'nut',
    title: 'Nut Slot Calculator',
    description: 'String slot positions with an equal gap between every string.',
    route: '/nut',
    Icon: NutIcon,
  },
];
