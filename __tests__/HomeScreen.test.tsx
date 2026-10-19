import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import HomeScreen from '@/app/index';

describe('Home screen', () => {
  it('lists the tools and opens the nut calculator', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('1 tool installed')).toBeOnTheScreen();
    expect(screen.getAllByText(/EMPTY/)).toHaveLength(3);

    await fireEvent.press(screen.getByRole('link', { name: /Nut Slot Calculator/ }));
    expect(router.push).toHaveBeenCalledWith('/nut');
  });
});
