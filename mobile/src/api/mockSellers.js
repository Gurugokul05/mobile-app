export const MOCK_SELLERS = [
  {
    _id: "seller1",
    name: "Arun Kumar",
    email: "arun@sellers.com",
    phone: "+91 98765 43210",
    address: "42, Handcraft Lane, Coimbatore, Tamil Nadu 641001",
    location: "Coimbatore, TamilNadu",
    isVerified: true,
    trustScore: 95,
    joinedDate: "2019-05-15",
    responseTime: "< 2 hours",
    returnRate: "2%",
    totalOrders: 1450,
    totalReviews: 1380,
    averageRating: 4.8,
    description:
      "Authentic Tamil Nadu artisan running a craft business for 5+ years. Specializing in handcrafted silk products and traditional textiles.",
    about:
      "I am a passionate artisan dedicated to preserving traditional Tamil textile arts. Each product is handcrafted with care and attention to detail.",
    specialties: ["Silk Sarees", "Traditional Textiles", "Handcrafted Wear"],
    yearsInBusiness: 5,
    certifications: [
      "Artisan Certificate",
      "Quality Verified",
      "GST Registered",
    ],
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    _id: "seller2",
    name: "Priya Sharma",
    email: "priya@sellers.com",
    phone: "+91 99876 54321",
    address: "Blue Pottery Workshop, Jaipur, Rajasthan 302001",
    location: "Jaipur, Rajasthan",
    isVerified: true,
    trustScore: 92,
    joinedDate: "2020-03-22",
    responseTime: "< 4 hours",
    returnRate: "3%",
    totalOrders: 980,
    totalReviews: 920,
    averageRating: 4.7,
    description:
      "Expert in traditional Jaipur blue pottery. Committed to providing authentic, high-quality handmade ceramics.",
    about:
      "Creating beautiful blue pottery pieces that reflect Rajasthan's rich artistic heritage. Every item is unique and crafted with passion.",
    specialties: ["Blue Pottery", "Ceramics", "Home Decor"],
    yearsInBusiness: 4,
    certifications: [
      "Master Artisan",
      "Authenticity Verified",
      "Export Certified",
    ],
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    _id: "seller3",
    name: "Rajesh Nair",
    email: "rajesh@sellers.com",
    phone: "+91 97654 32109",
    address: "Tea Estate Office, Darjeeling, West Bengal 734101",
    location: "Darjeeling, West Bengal",
    isVerified: true,
    trustScore: 98,
    joinedDate: "2018-11-10",
    responseTime: "< 1 hour",
    returnRate: "0.5%",
    totalOrders: 2100,
    totalReviews: 2050,
    averageRating: 4.9,
    description:
      "Premium Darjeeling tea exporter. Sourcing the finest first-flush teas directly from our family estate.",
    about:
      "3rd generation tea estate owner committed to delivering authentic Darjeeling tea to tea connoisseurs worldwide.",
    specialties: ["Premium Tea", "First Flush", "Organic Tea"],
    yearsInBusiness: 15,
    certifications: [
      "Estate Certified",
      "Organic Certified",
      "Fair Trade Partner",
    ],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    _id: "seller4",
    name: "Deepika Menon",
    email: "deepika@sellers.com",
    phone: "+91 96543 21098",
    address: "Heritage Silks, Kanchipuram, Tamil Nadu 631502",
    location: "Kanchipuram, Tamil Nadu",
    isVerified: true,
    trustScore: 94,
    joinedDate: "2019-08-05",
    responseTime: "< 3 hours",
    returnRate: "2.5%",
    totalOrders: 1220,
    totalReviews: 1180,
    averageRating: 4.8,
    description:
      "Authentic Kanchipuram silk sarees from our family weaving business. Each saree tells a story of tradition.",
    about:
      "5th generation silk weaver family bringing authentic Kanchipuram heritage directly to you.",
    specialties: ["Kanchipuram Silk", "Traditional Sarees", "Bridal Wear"],
    yearsInBusiness: 8,
    certifications: [
      "Silk Mark Certified",
      "Heritage Brand",
      "Quality Assured",
    ],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    _id: "seller5",
    name: "Vikram Singh",
    email: "vikram@sellers.com",
    phone: "+91 95432 10987",
    address: "Craft House, Jaisalmer, Rajasthan 345001",
    location: "Jaisalmer, Rajasthan",
    isVerified: true,
    trustScore: 89,
    joinedDate: "2021-02-14",
    responseTime: "< 6 hours",
    returnRate: "4%",
    totalOrders: 650,
    totalReviews: 600,
    averageRating: 4.6,
    description:
      "Handcrafted wooden and metal artifacts from Jaisalmer. Supporting local artisan communities.",
    about:
      "Dedicated to promoting traditional Jaisalmer crafts through quality products and fair trade practices.",
    specialties: ["Wooden Crafts", "Metal Art", "Decorative Items"],
    yearsInBusiness: 2,
    certifications: ["Craft Certified", "Fair Trade Verified"],
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

export const getSellerById = (sellerId) => {
  return MOCK_SELLERS.find((seller) => seller._id === sellerId);
};
