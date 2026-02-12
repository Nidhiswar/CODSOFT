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
  isCustomRequest?: boolean;
}

export const products: Product[] = [
  {
    id: "fresh-curry-leaves",
    name: "Fresh Curry Leaves",
    tamilName: "கறிவேப்பிலை (Kariveppilai)",
    description: "Premium fresh curry leaves, handpicked directly from the fertile lands of Tamil Nadu. These vibrant green leaves are harvested at peak freshness to capture their intense aroma and distinctive flavor. Essential for authentic South Indian tempering (tadka), curries, chutneys, and traditional recipes. Our fresh leaves are carefully packed to preserve their natural oils and fragrance.",
    image: "/assets/products/fresh-curry-leaves.jpg",
    category: "Leaves",
    origin: "Tamil Nadu",
    harvestTiming: "Peak: March - July",
    certifications: ["FSSAI", "ISO 22000", "IEC", "APEDA"],
  },
  {
    id: "dry-curry-leaves",
    name: "Dry Curry Leaves",
    tamilName: "உலர் கறிவேப்பிலை (Ular Kariveppilai)",
    description: "Premium sun-dried curry leaves from Tamil Nadu, carefully processed to retain their aromatic essence and rich green color. These dried leaves are perfect for long-term storage while maintaining the authentic flavor essential for South Indian curries, chutneys, and seasoning. Ideal for export with extended shelf life.",
    image: "/assets/products/dry-curry-leaves.jpg",
    category: "Leaves",
    origin: "Tamil Nadu",
    harvestTiming: "Year-round (Peak: March - July)",
    certifications: ["FSSAI", "ISO 22000", "IEC", "APEDA", "Export Quality"],
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
  {
    id: "custom-product-request",
    name: "Custom Product on Request",
    tamilName: "தனிப்பயன் உற்பத்தி (Thanippayan Urpathi)",
    description: "If the product you require is not listed on our website, we can source and export it based on your specifications with quality assurance.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    category: "EXPORT",
    origin: "India",
    harvestTiming: "On Demand",
    certifications: ["Custom Sourcing", "Quality Assured", "Export Ready"],
    isCustomRequest: true,
  },
];

// Related products mapping - products that complement each other
export const relatedProducts: { [key: string]: string[] } = {
  // Curry leaves go well with mustard seeds, pepper, and other tempering spices
  "fresh-curry-leaves": ["dry-curry-leaves", "pepper", "cardamom", "bay-leaves"],
  "dry-curry-leaves": ["fresh-curry-leaves", "pepper", "cinnamon", "bay-leaves"],
  
  // Pepper pairs with cardamom, cloves, cinnamon for garam masala
  "pepper": ["cardamom", "cloves", "cinnamon", "nutmeg"],
  
  // Cardamom for sweet and savory dishes
  "cardamom": ["pepper", "cloves", "cinnamon", "nutmeg", "star-anise"],
  
  // Cloves for aromatic cooking
  "cloves": ["cardamom", "cinnamon", "pepper", "bay-leaves", "star-anise"],
  
  // Nutmeg and mace naturally pair
  "nutmeg": ["mace", "cardamom", "cinnamon", "cloves"],
  "mace": ["nutmeg", "cardamom", "pepper", "cloves"],
  
  // Kapok buds - traditional and medicinal
  "kapok-buds": ["cinnamon", "cardamom", "star-anise", "cloves"],
  
  // Cinnamon for desserts and curries
  "cinnamon": ["cardamom", "cloves", "nutmeg", "star-anise", "bay-leaves"],
  
  // Star anise for biryani and Chinese-style cooking
  "star-anise": ["cinnamon", "cloves", "cardamom", "bay-leaves", "pepper"],
  
  // Bay leaves for rice dishes and curries
  "bay-leaves": ["fresh-curry-leaves", "cinnamon", "cardamom", "cloves", "star-anise"],
};

// Get recommended products based on cart items
export const getRecommendedProducts = (cartItems: { id: string }[], limit: number = 4): Product[] => {
  const cartIds = new Set(cartItems.map(item => item.id));
  const recommendedIds = new Set<string>();
  
  // Collect related products from cart items
  cartItems.forEach(item => {
    const related = relatedProducts[item.id] || [];
    related.forEach(id => {
      if (!cartIds.has(id)) {
        recommendedIds.add(id);
      }
    });
  });
  
  // If we don't have enough recommendations, add products from same categories
  if (recommendedIds.size < limit) {
    const cartCategories = new Set(
      cartItems
        .map(item => products.find(p => p.id === item.id)?.category)
        .filter(Boolean)
    );
    
    products.forEach(product => {
      if (!cartIds.has(product.id) && !recommendedIds.has(product.id) && cartCategories.has(product.category)) {
        recommendedIds.add(product.id);
      }
    });
  }
  
  // Convert IDs to products and limit
  return Array.from(recommendedIds)
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .slice(0, limit);
};
