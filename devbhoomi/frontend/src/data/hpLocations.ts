// Mirrors backend/backend/src/constants/hpLocations.js — kept in sync
// manually since frontend and backend are separate deployables. See that
// file's comment for why village stays free-text instead of a dropdown.
export const HP_TEHSILS_BY_DISTRICT: Record<string, string[]> = {
  Chamba: ["Chamba", "Chowari", "Sihunta", "Churah", "Dalhousie", "Bharmaur", "Pangi", "Salooni"],
  Kangra: [
    "Kangra", "Nurpur", "Jawali", "Indora", "Dehra", "Shahpur", "Baroh", "Khundian",
    "Dadasiba", "Jaswan", "Rakkar", "Fatehpur", "Baijnath", "Jaisinghpur", "Thural",
    "Dharamshala", "Multhan", "Palampur", "Jawalamukhi", "Nagrota Bagwan",
  ],
  Una: ["Una", "Amb", "Bangana", "Haroli", "Ghanari"],
  Bilaspur: ["Bharari", "Bilaspur Sadar", "Ghumarwin", "Jhandutta", "Naina Devi", "Namhol"],
  Hamirpur: ["Hamirpur", "Barsar", "Nadaun", "Bhoranj", "Sujanpur Tihra", "Tauni Devi", "Bijhari", "Galore"],
  Mandi: [
    "Mandi Sadar", "Balh", "Sundernagar", "Sarkaghat", "Dharampur", "Jogindernagar", "Padhar",
    "Chaachiot", "Thunag", "Karsog", "Kotli", "Baldwara", "Nihari", "Aut", "Sandhol",
    "Balichowki", "Ladbharol",
  ],
  Kullu: ["Kullu", "Bhuntar", "Manali", "Banjar", "Anni", "Nirmand"],
  "Lahaul-Spiti": ["Lahaul (Keylong)", "Spiti (Kaza)"],
  Kinnaur: ["Nichar", "Kalpa", "Sangla", "Moorang", "Pooh"],
  Shimla: [
    "Shimla Urban", "Shimla Rural", "Rampur", "Rohru", "Chopal", "Theog", "Kupvi", "Sunni",
    "Kumarsain", "Dodra-Kwar", "Kotkhai", "Jubbal", "Chirgaon", "Nerwa", "Nankhari",
    "Tikka", "Junga",
  ],
  Sirmaur: ["Nahan", "Paonta Sahib", "Rajgarh", "Shillai", "Pachhad", "Renukaji", "Dadahu", "Nohradhar", "Kamrau"],
  Solan: ["Arki", "Kandaghat", "Nalagarh", "Solan", "Kasauli", "Baddi", "Ramshehar"],
};
