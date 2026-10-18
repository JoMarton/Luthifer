import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LengthUnit } from '@/shared/units';
import { DEFAULT_SET_ID, defaultSetFor, getSet, resizeGauges } from '@/tools/nut/stringSets';

export const CUSTOM_SET_ID = 'custom';
export const MIN_STRINGS = 4;
export const MAX_STRINGS = 12;

type NutState = {
  /** All lengths are stored in inches. */
  width: number;
  bassOffset: number;
  trebleOffset: number;
  /** Unit the width/offset fields are typed in. */
  inputUnit: LengthUnit;
  /** Unit the results are shown in. */
  outputUnit: LengthUnit;
  /** Preset id, or CUSTOM_SET_ID once any gauge has been edited. */
  setId: string;
  /** Bass → treble, inches. */
  gauges: number[];
  /** Draw the diagram with the bass side on the right. */
  flipped: boolean;

  setWidth: (v: number) => void;
  setBassOffset: (v: number) => void;
  setTrebleOffset: (v: number) => void;
  setInputUnit: (u: LengthUnit) => void;
  setOutputUnit: (u: LengthUnit) => void;
  setFlipped: (f: boolean) => void;
  chooseSet: (id: string) => void;
  setGauge: (index: number, d: number) => void;
  setStringCount: (count: number) => void;
};

export const useNutStore = create<NutState>()(
  persist(
    (set, get) => ({
      width: 1.6875,
      bassOffset: 0.125,
      trebleOffset: 0.125,
      inputUnit: 'in',
      outputUnit: 'in',
      setId: DEFAULT_SET_ID,
      gauges: getSet(DEFAULT_SET_ID)!.gauges,
      flipped: false,

      setWidth: (width) => set({ width }),
      setBassOffset: (bassOffset) => set({ bassOffset }),
      setTrebleOffset: (trebleOffset) => set({ trebleOffset }),
      setInputUnit: (inputUnit) => set({ inputUnit }),
      setOutputUnit: (outputUnit) => set({ outputUnit }),
      setFlipped: (flipped) => set({ flipped }),

      chooseSet: (id) => {
        const preset = getSet(id);
        if (preset) set({ setId: id, gauges: preset.gauges });
      },

      setGauge: (index, d) =>
        set({ setId: CUSTOM_SET_ID, gauges: get().gauges.map((g, i) => (i === index ? d : g)) }),

      setStringCount: (count) => {
        const n = Math.min(MAX_STRINGS, Math.max(MIN_STRINGS, count));
        const { gauges, setId } = get();
        if (n === gauges.length) return;
        const preset = setId !== CUSTOM_SET_ID ? defaultSetFor(n) : undefined;
        if (preset) set({ setId: preset.id, gauges: preset.gauges });
        else set({ setId: CUSTOM_SET_ID, gauges: resizeGauges(gauges, n) });
      },
    }),
    {
      name: 'nut/inputs',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        width,
        bassOffset,
        trebleOffset,
        inputUnit,
        outputUnit,
        setId,
        gauges,
        flipped,
      }) => ({
        width,
        bassOffset,
        trebleOffset,
        inputUnit,
        outputUnit,
        setId,
        gauges,
        flipped,
      }),
    },
  ),
);
