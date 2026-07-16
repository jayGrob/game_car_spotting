import type { InventoryItem } from '../types';

/**
 * Master inventory of spottable items.
 *
 * Notes:
 * - `icon` is a Google Material Symbols (Rounded) glyph name.
 * - `theme: 'general'` items are mixed into every themed trip.
 * - The list is intentionally larger than the biggest "Surprise Me" deck (24)
 *   so a full-size random deck never repeats.
 */
export const masterInventory: InventoryItem[] = [
  // ---------- City ----------
  {
    id: 1, theme: 'city', category: 'vehicle', name: 'Bus', points: 15,
    icon: 'directions_bus', color: 'text-blue-500', bg: 'bg-blue-50',
    bonus: { question: 'Are kids on the bus?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 2, theme: 'city', category: 'vehicle', name: 'Taxi', points: 10,
    icon: 'local_taxi', color: 'text-amber-500', bg: 'bg-amber-50',
    bonus: { question: 'Is someone riding in it?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 3, theme: 'city', category: 'vehicle', name: 'Fire Truck', points: 20,
    icon: 'fire_truck', color: 'text-red-500', bg: 'bg-red-50',
    bonus: { question: 'Are the lights or sirens on?', options: [{ label: 'No', mult: 1 }, { label: 'Lights OR Siren', mult: 2, isBonus: true }, { label: 'Both On!', mult: 3, isBonus: true }] }
  },
  {
    id: 4, theme: 'city', category: 'vehicle', name: 'Ambulance', points: 20,
    icon: 'ambulance', color: 'text-rose-500', bg: 'bg-rose-50',
    bonus: { question: 'Are the lights flashing?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 5, theme: 'city', category: 'object', name: 'Fire Hydrant', points: 5,
    icon: 'fire_extinguisher', color: 'text-red-500', bg: 'bg-red-50',
    bonus: null
  },
  {
    id: 6, theme: 'city', category: 'object', name: 'Traffic Light', points: 5,
    icon: 'traffic', color: 'text-emerald-500', bg: 'bg-emerald-50',
    bonus: { question: 'Is it green right now?', options: [{ label: 'No', mult: 1 }, { label: 'Green!', mult: 2, isBonus: true }] }
  },
  {
    id: 7, theme: 'city', category: 'vehicle', name: 'Bicycle', points: 10,
    icon: 'pedal_bike', color: 'text-cyan-600', bg: 'bg-cyan-50',
    bonus: { question: 'Is the rider wearing a helmet?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },

  // ---------- Highway ----------
  {
    id: 8, theme: 'highway', category: 'vehicle', name: 'Police Car', points: 15,
    icon: 'local_police', color: 'text-blue-600', bg: 'bg-blue-50',
    bonus: { question: 'Are the lights or sirens on?', options: [{ label: 'No', mult: 1 }, { label: 'Lights OR Siren', mult: 2, isBonus: true }, { label: 'Both On!', mult: 3, isBonus: true }] }
  },
  {
    id: 9, theme: 'highway', category: 'vehicle', name: 'Semi Truck', points: 10,
    icon: 'local_shipping', color: 'text-slate-600', bg: 'bg-slate-50',
    bonus: { question: 'Is the trailer flatbed or enclosed?', options: [{ label: 'Enclosed', mult: 1 }, { label: 'Flatbed', mult: 2, isBonus: true }] }
  },
  {
    id: 10, theme: 'highway', category: 'vehicle', name: 'Motorcycle', points: 15,
    icon: 'two_wheeler', color: 'text-orange-500', bg: 'bg-orange-50',
    bonus: { question: 'Did the rider wave back?', options: [{ label: 'No', mult: 1 }, { label: 'They waved!', mult: 2, isBonus: true }] }
  },
  {
    id: 11, theme: 'highway', category: 'vehicle', name: 'RV Camper', points: 15,
    icon: 'airport_shuttle', color: 'text-teal-600', bg: 'bg-teal-50',
    bonus: { question: 'Is it towing something?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 12, theme: 'highway', category: 'vehicle', name: 'Tow Truck', points: 20,
    icon: 'car_repair', color: 'text-amber-600', bg: 'bg-amber-50',
    bonus: { question: 'Is it towing a car?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 13, theme: 'highway', category: 'object', name: 'Gas Station', points: 5,
    icon: 'local_gas_station', color: 'text-lime-600', bg: 'bg-lime-50',
    bonus: null
  },
  {
    id: 14, theme: 'highway', category: 'object', name: 'Cell Tower', points: 5,
    icon: 'cell_tower', color: 'text-slate-500', bg: 'bg-slate-50',
    bonus: null
  },
  {
    id: 15, theme: 'highway', category: 'vehicle', name: 'Electric Car', points: 10,
    icon: 'electric_car', color: 'text-green-600', bg: 'bg-green-50',
    bonus: null
  },

  // ---------- Country ----------
  {
    id: 16, theme: 'country', category: 'creature', name: 'Cow', points: 15,
    icon: 'pets', color: 'text-amber-700', bg: 'bg-amber-50',
    bonus: { question: 'Is it eating grass?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 17, theme: 'country', category: 'vehicle', name: 'Tractor', points: 20,
    icon: 'agriculture', color: 'text-green-700', bg: 'bg-green-50',
    bonus: { question: 'Is it driving on the road?', options: [{ label: 'No', mult: 1 }, { label: 'On the road!', mult: 2, isBonus: true }] }
  },
  {
    id: 18, theme: 'country', category: 'creature', name: 'Horse', points: 15,
    icon: 'bedroom_baby', color: 'text-yellow-800', bg: 'bg-yellow-50',
    bonus: { question: 'Is it running?', options: [{ label: 'No', mult: 1 }, { label: 'Yes!', mult: 2, isBonus: true }] }
  },
  {
    id: 19, theme: 'country', category: 'object', name: 'Farm House', points: 10,
    icon: 'cottage', color: 'text-red-700', bg: 'bg-red-50',
    bonus: null
  },
  {
    id: 20, theme: 'country', category: 'object', name: 'Wind Turbine', points: 10,
    icon: 'wind_power', color: 'text-sky-600', bg: 'bg-sky-50',
    bonus: { question: 'Are the blades spinning?', options: [{ label: 'No', mult: 1 }, { label: 'Spinning!', mult: 2, isBonus: true }] }
  },
  {
    id: 21, theme: 'country', category: 'object', name: 'Hay Bales', points: 10,
    icon: 'grass', color: 'text-yellow-600', bg: 'bg-yellow-50',
    bonus: null
  },
  {
    id: 22, theme: 'country', category: 'object', name: 'Water Tower', points: 10,
    icon: 'water_drop', color: 'text-blue-500', bg: 'bg-blue-50',
    bonus: null
  },

  // ---------- General (mixed into every theme) ----------
  {
    id: 23, theme: 'general', category: 'object', name: 'Speed Limit Sign', points: 5,
    icon: 'speed', color: 'text-slate-800', bg: 'bg-slate-100',
    bonus: null
  },
  {
    id: 24, theme: 'general', category: 'object', name: 'Construction Zone', points: 10,
    icon: 'construction', color: 'text-amber-600', bg: 'bg-amber-50',
    bonus: { question: 'Do you see a digger?', options: [{ label: 'No', mult: 1 }, { label: 'Digger!', mult: 2, isBonus: true }] }
  },
  {
    id: 25, theme: 'general', category: 'vehicle', name: 'Train', points: 20,
    icon: 'train', color: 'text-purple-600', bg: 'bg-purple-50',
    bonus: { question: 'Is it moving?', options: [{ label: 'No', mult: 1 }, { label: 'Moving!', mult: 2, isBonus: true }] }
  },
  {
    id: 26, theme: 'general', category: 'vehicle', name: 'Airplane', points: 15,
    icon: 'flight', color: 'text-sky-500', bg: 'bg-sky-50',
    bonus: { question: 'Is it taking off or landing?', options: [{ label: 'Just flying', mult: 1 }, { label: 'Taking off / landing!', mult: 2, isBonus: true }] }
  },
  {
    id: 27, theme: 'general', category: 'vehicle', name: 'Sports Car', points: 15,
    icon: 'directions_car', color: 'text-red-600', bg: 'bg-red-50',
    bonus: { question: 'Is it red?', options: [{ label: 'No', mult: 1 }, { label: 'Red!', mult: 2, isBonus: true }] }
  },
  {
    id: 28, theme: 'general', category: 'object', name: 'Rainbow', points: 25,
    icon: 'looks', color: 'text-purple-500', bg: 'bg-purple-50',
    bonus: null
  }
];

const byId = new Map(masterInventory.map((item) => [item.id, item]));

export function getItemById(id: number): InventoryItem | undefined {
  return byId.get(id);
}
