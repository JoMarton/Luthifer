import { fireEvent, render, screen } from '@testing-library/react-native';

import StringsScreen from '@/app/nut/strings';
import { CUSTOM_SET_ID, useNutStore } from '@/tools/nut/useNutStore';

const initial = useNutStore.getState();

beforeEach(() => {
  useNutStore.setState(initial, true);
});

describe('String sets screen', () => {
  it('starts with no saved sets and the default preset selected', async () => {
    await render(<StringsScreen />);

    expect(screen.getByText('0 saved')).toBeOnTheScreen();
    expect(screen.getByText(/No saved sets yet/)).toBeOnTheScreen();
    expect(screen.getByText('ELECTRIC 10–46')).toBeOnTheScreen();
  });

  it('picks a preset', async () => {
    await render(<StringsScreen />);
    await fireEvent.press(screen.getByText('Bass 4-string 45–105'));

    expect(useNutStore.getState().gauges).toEqual([0.105, 0.085, 0.065, 0.045]);
    expect(screen.getByLabelText('String 4 — bass gauge')).toHaveDisplayValue('105');
  });

  it('edits a gauge in thousandths and marks the set custom', async () => {
    await render(<StringsScreen />);
    await fireEvent.changeText(screen.getByLabelText('String 6 — bass gauge'), '52');

    expect(useNutStore.getState().gauges[0]).toBe(0.052);
    expect(useNutStore.getState().setId).toBe(CUSTOM_SET_ID);
    expect(screen.getByText('CUSTOM · UNSAVED')).toBeOnTheScreen();
  });

  it('saves, selects and deletes a custom set', async () => {
    await render(<StringsScreen />);
    await fireEvent.changeText(screen.getByLabelText('String 6 — bass gauge'), '52');

    await fireEvent.press(screen.getByText('SAVE AS NEW SET...'));
    expect(screen.getByText('SAVE STRING SET')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Set name'), 'Tele heavy bottom');
    await fireEvent.press(screen.getByText('SAVE'));

    expect(screen.getByText('1 saved')).toBeOnTheScreen();
    expect(screen.getByText('Tele heavy bottom')).toBeOnTheScreen();
    expect(screen.getByText('TELE HEAVY BOTTOM')).toBeOnTheScreen();

    // Deleting takes two taps.
    await fireEvent.press(screen.getByLabelText('Delete Tele heavy bottom'));
    expect(useNutStore.getState().savedSets).toHaveLength(1);
    await fireEvent.press(screen.getByLabelText('Confirm delete Tele heavy bottom'));

    expect(useNutStore.getState().savedSets).toHaveLength(0);
    expect(screen.getByText('0 saved')).toBeOnTheScreen();
  });

  it('suggests a name and offers to update a set with the same name', async () => {
    useNutStore.getState().setGauge(0, 0.052);
    useNutStore.getState().saveSet('Hybrid');
    useNutStore.getState().setGauge(0, 0.054);

    await render(<StringsScreen />);
    await fireEvent.press(screen.getByText('SAVE AS NEW SET...'));
    expect(screen.getByPlaceholderText('Custom 10–54')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Set name'), 'hybrid');
    expect(screen.getByText('A saved set with this name will be updated.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('UPDATE'));

    expect(useNutStore.getState().savedSets).toHaveLength(1);
    expect(useNutStore.getState().savedSets[0].gauges[0]).toBe(0.054);
  });
});
