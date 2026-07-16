import type { InventoryItem } from '../types';

/**
 * Master inventory of spottable items.
 *
 * Notes:
 * - `icon` is a Google Material Symbols (Rounded) glyph name.
 * - `theme: 'general'` items are mixed into every themed trip.
 * - The list is intentionally larger than the biggest "Surprise Me" deck (32)
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
    bonus: { question: 'Double or triple trailer?', options: [{ label: 'Single', mult: 1 }, { label: 'Double!', mult: 2, isBonus: true }, { label: 'Triple!!', mult: 3, isBonus: true }] }
  },
  {
    id: 10, theme: 'highway', category: 'vehicle', name: 'Motorcycle', points: 15,
    icon: 'two_wheeler', color: 'text-orange-500', bg: 'bg-orange-50',
    bonus: { question: 'Did the rider wave back?', options: [{ label: 'No', mult: 1 }, { label: 'They waved!', mult: 2, isBonus: true }] }
  },
  {
    // A motorhome that drives itself — the towed kind is 'Towed Camper' below.
    id: 11, theme: 'highway', category: 'vehicle', name: 'RV', points: 15,
    icon: 'airport_shuttle', color: 'text-teal-600', bg: 'bg-teal-50',
    bonus: { question: 'Is it also towing a car?', options: [{ label: 'No', mult: 1 }, { label: 'Towing a car!', mult: 2, isBonus: true }] }
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
  {
    // At least 3 semis nose to tail.
    id: 29, theme: 'highway', category: 'vehicle', name: 'Convoy', points: 20,
    icon: 'local_shipping', color: 'text-indigo-600', bg: 'bg-indigo-50',
    bonus: { question: 'How many trucks in the row?', options: [{ label: '3 or 4', mult: 1 }, { label: '5 or more!', mult: 2, isBonus: true }] }
  },
  {
    id: 30, theme: 'highway', category: 'vehicle', name: 'Military Vehicle', points: 20,
    icon: 'military_tech', color: 'text-green-800', bg: 'bg-green-50',
    bonus: { question: 'Is it in a military convoy?', options: [{ label: 'On its own', mult: 1 }, { label: 'A whole convoy!', mult: 2, isBonus: true }] }
  },
  {
    id: 31, theme: 'highway', category: 'vehicle', name: 'Abandoned Vehicle', points: 15,
    icon: 'car_crash', color: 'text-stone-500', bg: 'bg-stone-100',
    bonus: null
  },
  {
    id: 32, theme: 'highway', category: 'vehicle', name: 'Tanker Truck', points: 15,
    icon: 'oil_barrel', color: 'text-zinc-600', bg: 'bg-zinc-100',
    bonus: null
  },
  {
    // The kind a truck pulls — the self-driving kind is 'RV' above.
    id: 33, theme: 'highway', category: 'vehicle', name: 'Towed Camper', points: 15,
    icon: 'rv_hookup', color: 'text-teal-700', bg: 'bg-teal-50',
    bonus: null
  },
  {
    id: 34, theme: 'highway', category: 'vehicle', name: 'Animal Hauler', points: 20,
    icon: 'pets', color: 'text-amber-800', bg: 'bg-amber-50',
    bonus: { question: 'Can you see animals inside?', options: [{ label: "Can't tell", mult: 1 }, { label: 'Animals!', mult: 2, isBonus: true }] }
  },
  {
    id: 35, theme: 'highway', category: 'object', name: 'Fireworks Store', points: 15,
    icon: 'celebration', color: 'text-pink-600', bg: 'bg-pink-50',
    bonus: null
  },
  {
    id: 36, theme: 'highway', category: 'object', name: 'Rest Stop', points: 10,
    icon: 'local_parking', color: 'text-blue-700', bg: 'bg-blue-50',
    bonus: { question: 'Did you stop there?', options: [{ label: 'Drove past', mult: 1 }, { label: 'We stopped!', mult: 2, isBonus: true }] }
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
    id: 19, theme: 'country', category: 'object', name: 'Farm', points: 10,
    icon: 'cottage', color: 'text-red-700', bg: 'bg-red-50',
    bonus: { question: 'Any animals at the farm?', options: [{ label: 'None', mult: 1 }, { label: 'Cows!', mult: 2, isBonus: true }, { label: 'Goats!', mult: 3, isBonus: true }] }
  },
  {
    id: 20, theme: 'country', category: 'object', name: 'Wind Turbine', points: 10,
    icon: 'wind_power', color: 'text-sky-600', bg: 'bg-sky-50',
    bonus: { question: 'Are there more than 3?', options: [{ label: '3 or fewer', mult: 1 }, { label: 'More than 3!', mult: 2, isBonus: true }] }
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
  {
    id: 37, theme: 'country', category: 'creature', name: 'Roadkill', points: 10,
    icon: 'skull', color: 'text-stone-500', bg: 'bg-stone-100',
    bonus: null
  },
  {
    id: 38, theme: 'country', category: 'object', name: 'Solar Panel', points: 10,
    icon: 'solar_power', color: 'text-yellow-500', bg: 'bg-yellow-50',
    bonus: { question: 'Are there more than 3?', options: [{ label: '3 or fewer', mult: 1 }, { label: 'More than 3!', mult: 2, isBonus: true }] }
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
    bonus: { question: 'Still raining, or a double?', options: [{ label: 'Just a rainbow', mult: 1 }, { label: 'Still raining!', mult: 2, isBonus: true }, { label: 'Double rainbow!!', mult: 4, isBonus: true }] }
  },
  {
    id: 39, theme: 'general', category: 'object', name: 'Porta Potty', points: 10,
    icon: 'wc', color: 'text-sky-700', bg: 'bg-sky-50',
    bonus: null
  },
  {
    id: 40, theme: 'general', category: 'vehicle', name: 'Amazon Van', points: 10,
    icon: 'package_2', color: 'text-orange-500', bg: 'bg-orange-50',
    bonus: null
  },
  {
    id: 41, theme: 'general', category: 'object', name: 'Campground Sign', points: 10,
    icon: 'camping', color: 'text-green-700', bg: 'bg-green-50',
    bonus: null
  },
  {
    id: 42, theme: 'general', category: 'vehicle', name: 'U-Haul', points: 15,
    icon: 'moving', color: 'text-orange-600', bg: 'bg-orange-50',
    bonus: null
  },
  {
    id: 43, theme: 'general', category: 'object', name: 'Airport', points: 20,
    icon: 'local_airport', color: 'text-sky-600', bg: 'bg-sky-50',
    bonus: { question: 'Is it an international airport?', options: [{ label: 'Regular', mult: 1 }, { label: 'International!', mult: 2, isBonus: true }] }
  },
  {
    id: 44, theme: 'general', category: 'object', name: 'Historical Marker', points: 15,
    icon: 'history_edu', color: 'text-amber-800', bg: 'bg-amber-50',
    bonus: { question: 'Did you stop to read it?', options: [{ label: 'Drove past', mult: 1 }, { label: 'We stopped!', mult: 2, isBonus: true }] }
  },
  {
    id: 45, theme: 'general', category: 'vehicle', name: 'Convertible', points: 15,
    icon: 'car_rental', color: 'text-rose-500', bg: 'bg-rose-50',
    bonus: { question: 'Is the top down?', options: [{ label: 'Top up', mult: 1 }, { label: 'Top down!', mult: 2, isBonus: true }] }
  },
  {
    id: 46, theme: 'general', category: 'vehicle', name: 'Exotic Sports Car', points: 25,
    icon: 'sports_motorsports', color: 'text-amber-500', bg: 'bg-amber-50',
    bonus: { question: 'What kind is it?', options: [{ label: 'Another exotic', mult: 1 }, { label: 'Ferrari or Lambo!', mult: 2, isBonus: true }, { label: 'McLaren!!', mult: 4, isBonus: true }] }
  },
  {
    id: 47, theme: 'general', category: 'vehicle', name: 'Ultra Luxury Car', points: 25,
    icon: 'diamond', color: 'text-indigo-500', bg: 'bg-indigo-50',
    bonus: { question: 'What kind is it?', options: [{ label: 'Another luxury car', mult: 1 }, { label: 'Bentley!', mult: 2, isBonus: true }, { label: 'Rolls-Royce!!', mult: 4, isBonus: true }] }
  }
];

const byId = new Map(masterInventory.map((item) => [item.id, item]));

export function getItemById(id: number): InventoryItem | undefined {
  return byId.get(id);
}
