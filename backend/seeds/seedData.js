const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Product = require("../src/models/Product");

const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    console.log("🌱 Starting database seeding...");

    // Create Sellers
    const sellers = await User.insertMany([
      {
        name: "Kashmir Crafts",
        email: "seller1@kashmir.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 95,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
      {
        name: "Rajasthan Heritage",
        email: "seller2@rajasthan.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 88,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
      {
        name: "Darjeeling Tea House",
        email: "seller3@darjeeling.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 92,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
      {
        name: "Kerala Spices",
        email: "seller4@kerala.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 89,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
      {
        name: "Mysore Arts",
        email: "seller5@mysore.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 85,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
      {
        name: "Tamil Nadu Textiles",
        email: "seller6@tamilnadu.com",
        password: await bcrypt.hash("password123", 10),
        role: "seller",
        isVerified: true,
        trustScore: 91,
        verificationDocs: {
          idProofUrl: "https://via.placeholder.com/200?text=ID+Proof",
          locationProofUrl:
            "https://via.placeholder.com/200?text=Location+Proof",
          makingProofUrl: "https://via.placeholder.com/200?text=Making+Proof",
        },
      },
    ]);

    console.log(`✅ Created ${sellers.length} sellers`);

    // Create Products
    const products = await Product.insertMany([
      // Kashmir Products
      {
        sellerId: sellers[0]._id,
        name: "Authentic Pashmina Shawl",
        description:
          "Genuine pashmina shawl handwoven by skilled artisans in Kashmir. Pure wool with intricate embroidery.",
        price: 12500,
        originPlace: "Kashmir",
        images: [
          "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[0]._id,
        name: "Hand-Knotted Carpet",
        description:
          "Traditional Kashmiri hand-knotted carpet with intricate traditional patterns.",
        price: 28000,
        originPlace: "Kashmir",
        images: [
          "https://images.unsplash.com/photo-1548626328-c9367d0a6db7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[0]._id,
        name: "Kashmir Papier Mâché Box",
        description:
          "Intricate papier mâché decorative box with hand-painted traditional designs.",
        price: 3500,
        originPlace: "Kashmir",
        images: [
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },

      // Rajasthan Products
      {
        sellerId: sellers[1]._id,
        name: "Jaipuri Blue Pottery Vase",
        description:
          "Traditional blue pottery vase with hand-painted floral patterns from Jaipur.",
        price: 2200,
        originPlace: "Rajasthan",
        images: [
          "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[1]._id,
        name: "Rajasthani Bandhani Saree",
        description:
          "Colorful bandhani tie-dye saree with traditional Rajasthani patterns.",
        price: 4500,
        originPlace: "Rajasthan",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550905b0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[1]._id,
        name: "Rajasthani Miniature Painting",
        description:
          "Hand-painted miniature artwork on paper using traditional techniques.",
        price: 5800,
        originPlace: "Rajasthan",
        images: [
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },

      // Darjeeling Products
      {
        sellerId: sellers[2]._id,
        name: "Premium First Flush Tea",
        description:
          "Rare first flush Darjeeling tea with a delicate floral aroma.",
        price: 1850,
        originPlace: "Darjeeling",
        images: [
          "https://images.unsplash.com/photo-1576092762791-dd9e222046d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[2]._id,
        name: "Darjeeling Tea Gift Set",
        description:
          "Assorted collection of premium Darjeeling teas with premium packaging.",
        price: 3200,
        originPlace: "Darjeeling",
        images: [
          "https://images.unsplash.com/photo-1597318972826-8fb98b4f01c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[2]._id,
        name: "Orthodox Darjeeling Black Tea",
        description: "Hand-rolled orthodox processed Darjeeling black tea.",
        price: 2400,
        originPlace: "Darjeeling",
        images: [
          "https://images.unsplash.com/photo-1599599810694-b3fa981f99ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },

      // Kerala Products
      {
        sellerId: sellers[3]._id,
        name: "Kerala Spices Gift Box",
        description:
          "Premium collection of authentic Kerala spices: turmeric, cardamom, black pepper.",
        price: 1950,
        originPlace: "Kerala",
        images: [
          "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[3]._id,
        name: "Handwoven Kerala Saree",
        description:
          "Traditional handwoven saree from Kochi with gold pattern borders.",
        price: 6500,
        originPlace: "Kerala",
        images: [
          "https://images.unsplash.com/photo-1605384552801-35b62b4d4a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[3]._id,
        name: "Kerala Coconut Oil Cold Pressed",
        description:
          "Pure virgin coconut oil extracted using traditional methods.",
        price: 850,
        originPlace: "Kerala",
        images: [
          "https://images.unsplash.com/photo-1584308666744-24d5f15714ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },

      // Mysore Products
      {
        sellerId: sellers[4]._id,
        name: "Handcrafted Sandalwood Idol",
        description:
          "Intricately carved sandalwood idol with traditional designs.",
        price: 5500,
        originPlace: "Mysore",
        images: [
          "https://images.unsplash.com/photo-1629851498382-b7e1ce790472?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[4]._id,
        name: "Mysore Silk Fabric",
        description:
          "Premium Mysore silk fabric with traditional weaving patterns.",
        price: 8500,
        originPlace: "Mysore",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550905b0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[4]._id,
        name: "Mysore Inlay Work Box",
        description:
          "Decorative box with intricate mother-of-pearl inlay work.",
        price: 3800,
        originPlace: "Mysore",
        images: [
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },

      // Tamil Nadu Products
      {
        sellerId: sellers[5]._id,
        name: "Kanchipuram Pure Silk Saree",
        description:
          "Luxurious Kanchipuram silk saree hand-woven with gold borders.",
        price: 18000,
        originPlace: "Tamil Nadu",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550905b0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[5]._id,
        name: "South Indian Bronze Statue",
        description:
          "Traditional bronze statue of deity with intricate craftsmanship.",
        price: 12000,
        originPlace: "Tamil Nadu",
        images: [
          "https://images.unsplash.com/photo-1629851498382-b7e1ce790472?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
      {
        sellerId: sellers[5]._id,
        name: "Terracotta Art Piece",
        description:
          "Hand-molded terracotta artwork with traditional South Indian motifs.",
        price: 2500,
        originPlace: "Tamil Nadu",
        images: [
          "https://images.unsplash.com/photo-1577859453984-52e4ac99e51e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        ],
        isVerified: true,
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create Demo Buyers
    const buyers = await User.insertMany([
      {
        name: "John Doe",
        email: "buyer1@email.com",
        password: await bcrypt.hash("password123", 10),
        role: "buyer",
        isVerified: true,
        trustScore: 75,
      },
      {
        name: "Jane Smith",
        email: "buyer2@email.com",
        password: await bcrypt.hash("password123", 10),
        role: "buyer",
        isVerified: true,
        trustScore: 82,
      },
      {
        name: "Admin User",
        email: "admin@admin.com",
        password: await bcrypt.hash("password123", 10),
        role: "admin",
        isVerified: true,
        trustScore: 100,
      },
    ]);

    console.log(`✅ Created ${buyers.length} demo users`);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("Buyer: buyer1@email.com / password123");
    console.log("Seller: seller1@kashmir.com / password123");
    console.log("Admin: admin@admin.com / password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase;
