export interface Product {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  image: string; // primary image (local path: /assets/products/... or remote URL)
  fallback?: string; // optional remote fallback URL
  category: string;
}

export const products: Product[] = [
  {
    id: "curry-leaves",
    name: "Fresh & Dry Curry Leaves",
    tamilName: "கறிவேப்பிலை (Kariveppilai)",
    description: "Aromatic curry leaves, available fresh and dried. Essential for South Indian cuisine, adding distinctive flavor to curries and chutneys.",
    image: "/assets/products/fresh-curry-leaves.jpg",
    fallback: "https://novelexporters.com/images/fresh-curry-leaves.jpg",
    category: "Leaves",
  },
  {
    id: "cinnamon",
    name: "Cinnamon Stick",
    tamilName: "பட்டை (Pattai)",
    description: "Premium quality cinnamon sticks with sweet, warm aroma. Perfect for both sweet and savory dishes, beverages, and baking.",
    image: "/assets/products/cinnamon.jpg",
    fallback: "https://novelexporters.com/images/cinnamon.jpg",
    category: "Bark",
  },
  {
    id: "star-anise",
    name: "Star Anise",
    tamilName: "அன்னாசிப்பூ (Annasipoo)",
    description: "Star-shaped spice with a strong licorice flavor. Used in biryanis, desserts, and traditional medicine.",
    image: "/assets/products/star-anise.jpg",
    fallback: "https://novelexporters.com/images/star-anise.jpg",
    category: "Seeds",
  },
  {
    id: "pepper",
    name: "Black Pepper",
    tamilName: "மிளகு (Milagu)",
    description: "The king of spices. Our premium black pepper offers a bold, pungent flavor that elevates any dish.",
    image: "/assets/products/black-pepper.jpg",
    fallback: "https://novelexporters.com/images/black-pepper.jpg",
    category: "Seeds",
  },
  {
    id: "kapok-buds",
    name: "Kapok Buds",
    tamilName: "இலவம் பூ (Ilavam Poo)",
    description: "Unique kapok flower buds with medicinal properties. Used in traditional remedies and special cuisines.",
    image: "/assets/products/kapok-buds.jpg",
    fallback: "https://novelexporters.com/images/kapok-buds.jpg",
    category: "Flowers",
  },
  {
    id: "nutmeg",
    name: "Nutmeg",
    tamilName: "ஜாதிக்காய் (Jathikkai)",
    description: "Warm, nutty spice used in baking, curries, and Ayurvedic medicine.",
    image: "https://novelexporters.com/images/nutmeg.jpg",
    fallback: "https://novelexporters.com/images/nutmeg.jpg",
    category: "Seeds",
  },
  {
    id: "mace",
    name: "Nutmeg Mace",
    tamilName: "ஜாதிப்பத்திரி (Jathipathiri)",
    description: "The outer covering of the nutmeg seed; prized for its delicate fragrance and flavor in sweet and savory dishes.",
    image: "/assets/products/nutmeg-mace.jpg",
    fallback: "https://novelexporters.com/images/nutmeg-mace.jpg",
    category: "Seeds",
  },
  {
    id: "cardamom",
    name: "Cardamom",
    tamilName: "ஏலக்காய் (Elakkai)",
    description: "The queen of spices with an intense, sweet aroma. Perfect for chai, desserts, and savory rice dishes.",
    image: "/assets/products/cardamom.jpg",
    fallback: "https://novelexporters.com/images/cardamom.jpg",
    category: "Seeds",
  },
  {
    id: "bay-leaves",
    name: "Bay Leaves",
    tamilName: "பிரியாணி இலை (Biriyani Ilai)",
    description: "Aromatic bay leaves essential for biryanis, curries, and meat preparations.",
    image: "/assets/products/bay-leaves.jpg",
    fallback: "https://novelexporters.com/images/bay-leaves.jpg",
    category: "Leaves",
  },
  {
    id: "cloves",
    name: "Clove Flowers",
    tamilName: "கிராம்பு (Kirambu)",
    description: "Strong aromatic clove flowers used in curries, teas, and traditional remedies; prized for their intense flavor and aroma.",
    image: "/assets/products/cloves.jpg",
    fallback: "https://novelexporters.com/images/cloves.jpg",
    category: "Flowers",
  },
];
