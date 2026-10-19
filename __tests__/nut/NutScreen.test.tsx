import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';

import NutScreen from '@/app/nut/index';
import { useNutStore } from '@/tools/nut/useNutStore';

const initial = useNutStore.getState();

beforeEach(() => {
  useNutStore.setState(initial, true);
  jest.clearAllMocks();
});

/** The results table cell for a string, e.g. row(5) → the "from bass" value of string 5. */
function fromBass(stringNumber: number) {
  const label = screen.getByLabelText(new RegExp(`^String ${stringNumber}(, bass)?$`));
  // The row's cells are siblings: [string, gauge, from bass, from treble, to next].
  return label.parent!.children[2];
}

describe('Nut Slot Calculator screen', () => {
  it('shows the worked example: equal gap and every slot position', async () => {
    await render(<NutScreen />);

    expect(screen.getByLabelText('GAP BETWEEN STRINGS: 0.2635"')).toBeOnTheScreen();
    expect(screen.getByLabelText('OUTER SLOT SPAN: 1.4375"')).toBeOnTheScreen();

    const expected = {
      6: '0.1250',
      5: '0.4295',
      4: '0.7240',
      3: '1.0090',
      2: '1.2875',
      1: '1.5625',
    };
    for (const [string, value] of Object.entries(expected)) {
      expect(fromBass(Number(string))).toHaveTextContent(value);
    }
  });

  it('marks string 6 as the bass string in the table', async () => {
    await render(<NutScreen />);
    expect(screen.getByLabelText('String 6, bass')).toBeOnTheScreen();
  });

  it('shows results in millimeters', async () => {
    await render(<NutScreen />);
    const resultUnit = screen.getByLabelText('Result unit');
    await fireEvent.press(within(resultUnit).getByLabelText('millimeters'));

    expect(screen.getByLabelText('GAP BETWEEN STRINGS: 6.69 mm')).toBeOnTheScreen();
    expect(fromBass(5)).toHaveTextContent('10.91');
    expect(fromBass(1)).toHaveTextContent('39.69');
  });

  it('accepts the nut width in millimeters', async () => {
    await render(<NutScreen />);
    const inputUnit = screen.getByLabelText('Input unit');
    await fireEvent.press(within(inputUnit).getByLabelText('millimeters'));

    const width = screen.getByLabelText('Nut width');
    expect(width).toHaveDisplayValue('42.863');

    await fireEvent.changeText(width, '43');
    expect(useNutStore.getState().width).toBeCloseTo(43 / 25.4, 9);
  });

  it('accepts fractions for the nut width in inches', async () => {
    await render(<NutScreen />);
    await fireEvent.changeText(screen.getByLabelText('Nut width'), '1 3/4');
    expect(useNutStore.getState().width).toBe(1.75);
  });

  it('shows an error instead of results when the offset is too small', async () => {
    await render(<NutScreen />);
    await fireEvent.changeText(screen.getByLabelText('Bass offset'), '0.01');

    expect(screen.getByRole('alert')).toHaveTextContent(/Bass offset is smaller than half/);
    expect(screen.queryByLabelText(/^GAP BETWEEN STRINGS/)).toBeNull();
  });

  it('adds a string on the bass side', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByLabelText('Add string'));

    expect(screen.getByLabelText('7 strings')).toBeOnTheScreen();
    expect(screen.getByLabelText('String 7, bass')).toBeOnTheScreen();
  });

  it('sets the nut width from the guitar list', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByLabelText('Nut width by guitar'));
    await fireEvent.press(screen.getByText('American Std / Pro Strat / Tele'));

    expect(useNutStore.getState().width).toBe(1.685);
    expect(screen.getByText('= Fender American Std / Pro Strat / Tele')).toBeOnTheScreen();
  });

  it('explains how to measure the offsets', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByText('HOW TO MEASURE ?'));

    expect(screen.getByText('WHAT THE OFFSET IS')).toBeOnTheScreen();
    expect(screen.getByText('COMMON STARTING POINTS')).toBeOnTheScreen();
  });

  it('shows the working with the current numbers', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByText('HOW IT WAS CALCULATED ?'));

    expect(screen.getByText('= 1.6875 − 0.1250 − 0.1250 = 1.4375')).toBeOnTheScreen();
    expect(screen.getByText('g = 1.3175 / 5 = 0.2635')).toBeOnTheScreen();
    expect(screen.getByText('5: 0.1250 + 0.0410 + 0.2635 = 0.4295')).toBeOnTheScreen();
  });

  it('opens the string sets screen', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByLabelText('String set Electric 10–46. Edit'));
    expect(router.push).toHaveBeenCalledWith('/nut/strings');
  });

  it('opens the full-screen diagram', async () => {
    await render(<NutScreen />);
    await fireEvent.press(screen.getByLabelText('View diagram full screen, sideways'));

    expect(screen.getByLabelText('Close full screen')).toBeOnTheScreen();
    expect(screen.getByText('GAP 0.2635"')).toBeOnTheScreen();
  });
});
