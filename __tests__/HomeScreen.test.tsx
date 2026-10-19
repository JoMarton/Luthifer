import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import HomeScreen from '@/app/index';
import { useSettings } from '@/shared/settings';

describe('Home screen', () => {
  it('lists the tools and opens the nut calculator', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('1 tool installed')).toBeOnTheScreen();
    expect(screen.getAllByText(/EMPTY/)).toHaveLength(3);

    await fireEvent.press(screen.getByRole('link', { name: /Nut Slot Calculator/ }));
    expect(router.push).toHaveBeenCalledWith('/nut');
  });
});

describe('Usage data switch', () => {
  it('is on by default and can be turned off', async () => {
    await render(<HomeScreen />);
    const toggle = screen.getByLabelText('Share anonymous usage data');
    expect(toggle).toHaveProp('value', true);

    await fireEvent(toggle, 'valueChange', false);
    expect(useSettings.getState().analytics).toBe(false);
  });
});
