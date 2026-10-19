import { DEFAULT_SET_ID, getSet } from '@/tools/nut/stringSets';
import { CUSTOM_SET_ID, findSet, useNutStore } from '@/tools/nut/useNutStore';

const initial = useNutStore.getState();
const store = () => useNutStore.getState();

beforeEach(() => {
  useNutStore.setState(initial, true);
});

describe('saved string sets', () => {
  it('saves the current custom gauges and selects the new set', () => {
    store().setGauge(0, 0.052);
    expect(store().setId).toBe(CUSTOM_SET_ID);

    store().saveSet('  Hybrid 10–52 ');
    const [saved] = store().savedSets;
    expect(saved.name).toBe('Hybrid 10–52');
    expect(saved.gauges).toEqual([0.052, 0.036, 0.026, 0.017, 0.013, 0.01]);
    expect(store().setId).toBe(saved.id);
  });

  it('chooses a saved set and survives switching away to a preset', () => {
    store().setGauge(0, 0.052);
    store().saveSet('Hybrid');
    const id = store().setId;

    store().chooseSet('e-9-42');
    expect(store().gauges).toEqual(getSet('e-9-42')!.gauges);

    store().chooseSet(id);
    expect(store().gauges[0]).toBe(0.052);
    expect(findSet(store().savedSets, id)?.name).toBe('Hybrid');
  });

  it('updates a set saved under the same name instead of duplicating it', () => {
    store().setGauge(0, 0.052);
    store().saveSet('Hybrid');
    const id = store().setId;

    store().setGauge(0, 0.054);
    store().saveSet('hybrid');
    expect(store().savedSets).toHaveLength(1);
    expect(store().savedSets[0].id).toBe(id);
    expect(store().savedSets[0].gauges[0]).toBe(0.054);
  });

  it('ignores an empty name', () => {
    store().saveSet('   ');
    expect(store().savedSets).toHaveLength(0);
    expect(store().setId).toBe(DEFAULT_SET_ID);
  });

  it('deletes a set and keeps its gauges on screen as custom', () => {
    store().setGauge(0, 0.052);
    store().saveSet('Hybrid');
    store().deleteSet(store().setId);

    expect(store().savedSets).toHaveLength(0);
    expect(store().setId).toBe(CUSTOM_SET_ID);
    expect(store().gauges[0]).toBe(0.052);
  });

  it('changing the string count of a saved set keeps its gauges', () => {
    store().setGauge(0, 0.052);
    store().saveSet('Hybrid');
    store().setStringCount(7);
    expect(store().setId).toBe(CUSTOM_SET_ID);
    expect(store().gauges.slice(1)).toEqual([0.052, 0.036, 0.026, 0.017, 0.013, 0.01]);
  });
});
