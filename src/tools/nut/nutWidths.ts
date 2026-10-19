export type GuitarWidth = {
  id: string;
  brand: string;
  model: string;
  /** Nut width in inches. */
  inches: number;
};

/**
 * Typical factory nut widths. Real necks vary by year, model and maker, so
 * these are starting points — measure the actual neck before cutting.
 */
export const GUITAR_WIDTHS: GuitarWidth[] = [
  { id: 'fender-vintage', brand: 'Fender', model: 'Vintage Strat / Tele', inches: 1.65 },
  { id: 'fender-modern', brand: 'Fender', model: 'American Std / Pro Strat / Tele', inches: 1.685 },
  { id: 'fender-pbass', brand: 'Fender', model: 'Precision Bass', inches: 1.75 },
  { id: 'fender-jbass', brand: 'Fender', model: 'Jazz Bass', inches: 1.5 },
  { id: 'gibson-modern', brand: 'Gibson', model: 'Les Paul / SG / ES-335 (modern)', inches: 1.695 },
  { id: 'gibson-vintage', brand: 'Gibson', model: "'50s–early '60s electrics", inches: 1.6875 },
  { id: 'gibson-narrow', brand: 'Gibson', model: "Late '60s narrow nut", inches: 1.5625 },
  { id: 'gibson-acoustic', brand: 'Gibson', model: 'J-45 / Hummingbird (modern)', inches: 1.725 },
  { id: 'martin-standard', brand: 'Martin', model: 'Standard series', inches: 1.6875 },
  { id: 'martin-wide', brand: 'Martin', model: 'Wide / fingerstyle', inches: 1.75 },
  { id: 'classical', brand: 'Classical', model: 'Nylon-string', inches: 52 / 25.4 },
];

/** Every guitar with this nut width (several share one), for labelling the current value. */
export function matchGuitars(inches: number): GuitarWidth[] {
  return GUITAR_WIDTHS.filter((g) => Math.abs(g.inches - inches) < 1e-6);
}
