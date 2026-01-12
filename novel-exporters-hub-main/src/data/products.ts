export interface Product {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  image: string;
  category: string;
  origin: string;
  harvestTiming: string;
  certifications: string[];
}

export const products: Product[] = [
  {
    id: "curry-leaves",
    name: "Fresh & Dry Curry Leaves",
    tamilName: "கறிவேப்பிலை (Kariveppilai)",
    description: "Aromatic curry leaves, sourced directly from the fertile lands of Tamil Nadu. Essential for South Indian cuisine, these leaves are picked at peak freshness and processed to maintain their intense flavor and color. Available in both fresh and premium cold-dried grades.",
    image: "/assets/products/fresh-curry-leaves.jpg",
    category: "Leaves",
    origin: "Tamil Nadu",
    harvestTiming: "Peak: March - July",
    certifications: ["FSSAI", "ISO 22000", "IEC", "APEDA"],
  },
  {
    id: "pepper",
    name: "Black Pepper",
    tamilName: "மிளகு (Milagu)",
    description: "Known as 'Black Gold', our pepper is sourced from the high-altitude plantations of Kerala. These large, bold peppercorns are hand-harvested and sun-dried to ensure a high piperine content and a pungent, complex aroma.",
    image: "/assets/products/black-pepper.jpg",
    category: "Seeds",
    origin: "Kerala",
    harvestTiming: "December - March",
    certifications: ["FSSAI", "Spices Board of India", "ISO 22000"],
  },
  {
    id: "cardamom",
    name: "Cardamom",
    tamilName: "ஏலக்காய் (Elakkai)",
    description: "The 'Queen of Spices'. Our 8mm+ bold green cardamom pods are sourced from the misty hills of Kerala. They are prized for their deep green color and high essential oil content.",
    image: "/assets/products/cardamom.jpg",
    category: "Seeds",
    origin: "Kerala",
    harvestTiming: "August - February",
    certifications: ["FSSAI", "IEC", "Spices Board Approved"],
  },
  {
    id: "cloves",
    name: "Clove Flowers",
    tamilName: "கிராம்பு (Kirambu)",
    description: "Grown in the unique climate of Kerala's hilly regions, these cloves are rich in eugenol. They are full-headed, deep reddish-brown buds with a powerful aroma.",
    image: "/assets/products/cloves.jpg",
    category: "Flowers",
    origin: "Kerala",
    harvestTiming: "January - April",
    certifications: ["FSSAI", "ISO 22000", "Quality Grade A"],
  },
  {
    id: "nutmeg",
    name: "Nutmeg",
    tamilName: "ஜாதிக்காய் (Jathikkai)",
    description: "Sourced from the lush spice gardens of Kerala, our nutmeg is carefully dried and graded. It offers a warm, sweet aroma and a rich, nutty flavor.",
    image: "/assets/products/nutmeg.jpg",
    category: "Seeds",
    origin: "Kerala",
    harvestTiming: "June - August",
    certifications: ["FSSAI", "Export Certified", "Non-GMO"],
  },
  {
    id: "mace",
    name: "Nutmeg Mace",
    tamilName: "ஜாதிப்பத்திரி (Jathipathiri)",
    description: "The delicate, bright red aril covering the nutmeg seed. Hand-collected and dried under shade to preserve its vibrant color. Sourced from Kerala.",
    image: "/assets/products/nutmeg-mace.jpg",
    category: "Seeds",
    origin: "Kerala",
    harvestTiming: "June - August",
    certifications: ["FSSAI", "IEC", "Purity Guaranteed"],
  },
  {
    id: "kapok-buds",
    name: "Kapok Buds",
    tamilName: "இலவம் பூ (Ilavam Poo)",
    description: "Unique and traditional spice sourced from Kerala. These buds are known for their cooling properties and are a staple in authentic medicinal and culinary traditions.",
    image: "/assets/products/kapok-buds.jpg",
    category: "Flowers",
    origin: "Kerala",
    harvestTiming: "February - April",
    certifications: ["FSSAI", "Wild Harvested", "Medicinal Grade"],
  },
  {
    id: "cinnamon",
    name: "Cinnamon Stick",
    tamilName: "பட்டை (Pattai)",
    description: "Our Malabar Cinnamon features thin, cigar-like rolls with a sweet, delicate flavor. Harvested from Kerala, it is high in cinnamaldehyde.",
    image: "/assets/products/cinnamon.jpg",
    category: "Bark",
    origin: "Kerala",
    harvestTiming: "May - August",
    certifications: ["FSSAI", "ISO 22000", "No Additives"],
  },
  {
    id: "star-anise",
    name: "Star Anise",
    tamilName: "அன்னாசிப்பூ (Annasipoo)",
    description: "Beautiful 8-pointed star pods sourced from selected Kerala spice gardens. Whole and unbroken, carrying a powerful licorice-like aroma.",
    image: "/assets/products/star-anise.jpg",
    category: "Seeds",
    origin: "Kerala",
    harvestTiming: "October - December",
    certifications: ["FSSAI", "Grade A sorting", "IEC"],
  },
  {
    id: "bay-leaves",
    name: "Bay Leaves",
    tamilName: "பிரியாணி இலை (Biriyani Ilai)",
    description: "Thick, aromatic leaves sourced from Kerala. Air-dried to retain volatile oils, providing a deep, woodsy fragrance.",
    image: "/assets/products/bay-leaves.jpg",
    category: "Leaves",
    origin: "Kerala",
    harvestTiming: "October - December",
    certifications: ["FSSAI", "Ethically Sourced", "Organic Practices"],
  },
];
