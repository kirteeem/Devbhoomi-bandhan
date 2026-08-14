// Revenue tehsils for each of Himachal Pradesh's 12 districts, sourced from
// district/state administrative records (HP Revenue Dept. divisions as of
// late 2022). Villages are NOT enumerated here — HP has roughly 20,000
// villages across its tehsils, and no reliably complete, up-to-date public
// list exists to embed client-side. Rather than invent village names (which
// would actively mislead members about their own local geography), `village`
// is collected as free text on the Profile — see models/Profile.js — scoped
// under the district + tehsil the member already picked.
export const HP_TEHSILS_BY_DISTRICT = {
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
