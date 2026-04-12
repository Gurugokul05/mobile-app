const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");

const SELLERS_DATA = [
  {
    name: "Arun Kumar",
    email: "arun@sellers.com",
    password: "password123",
    phone: "+91 98765 43210",
    address: "42, Handcraft Lane, Coimbatore, Tamil Nadu 641001",
    role: "seller",
    isVerified: true,
    trustScore: 95,
  },
  {
    name: "Priya Sharma",
    email: "priya@sellers.com",
    password: "password123",
    phone: "+91 99876 54321",
    address: "Blue Pottery Workshop, Jaipur, Rajasthan 302001",
    role: "seller",
    isVerified: true,
    trustScore: 92,
  },
  {
    name: "Rajesh Nair",
    email: "rajesh@sellers.com",
    password: "password123",
    phone: "+91 97654 32109",
    address: "Tea Estate Office, Darjeeling, West Bengal 734101",
    role: "seller",
    isVerified: true,
    trustScore: 98,
  },
  {
    name: "Deepika Menon",
    email: "deepika@sellers.com",
    password: "password123",
    phone: "+91 96543 21098",
    address: "Heritage Silks, Kanchipuram, Tamil Nadu 631502",
    role: "seller",
    isVerified: true,
    trustScore: 94,
  },
  {
    name: "Vikram Singh",
    email: "vikram@sellers.com",
    password: "password123",
    phone: "+91 95432 10987",
    address: "Craft House, Jaisalmer, Rajasthan 345001",
    role: "seller",
    isVerified: true,
    trustScore: 89,
  },
  {
    name: "Test Seller",
    email: "test@seller.com",
    password: "test1234",
    phone: "+91 90000 00000",
    address: "Test Address, Test City, Test State 000000",
    role: "seller",
    isVerified: false,
    trustScore: 0,
  },
  {
    name: "Premium Artisan - Test",
    email: "premium@seller.com",
    password: "test1234",
    phone: "+91 91234 56789",
    address: "Artisan Workshop, Bangalore, Karnataka 560001",
    role: "seller",
    isVerified: true,
    trustScore: 98,
    yearsInBusiness: 5,
    specialties: ["Handcrafted textiles", "Wood carving", "Ceramics"],
    certifications: ["ISO 9001", "Craft Excellence Award"],
    description:
      "Premium artisan products with international quality standards",
  },
];

const BUYERS_DATA = [
  {
    name: "John Doe",
    email: "buyer1@email.com",
    password: "password123",
    role: "buyer",
    isVerified: true,
    trustScore: 75,
  },
  {
    name: "Jane Smith",
    email: "buyer2@email.com",
    password: "password123",
    role: "buyer",
    isVerified: true,
    trustScore: 82,
  },
  {
    name: "Test Buyer",
    email: "test@buyer.com",
    password: "test1234",
    role: "buyer",
    isVerified: true,
    trustScore: 50,
  },
];

const ADMIN_DATA = {
  name: "Roots Admin",
  email: "admin@roots.com",
  password: "admin123",
  role: "admin",
  isVerified: true,
  trustScore: 100,
};

const TEST_ADMIN_DATA = {
  name: "Test Admin",
  email: "test@admin.com",
  password: "test1234",
  role: "admin",
  isVerified: true,
  trustScore: 100,
};

const PRODUCTS_DATA = [
  {
    name: "Authentic Pashmina Shawl",
    description:
      "Handwoven traditional Pashmina shawl from Kashmir with intricate embroidery. Pure wool, warm and elegant.",
    price: 12500,
    originPlace: "Kashmir",
    images: [
      "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1595777707802-c55afe0a4200?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "arun@sellers.com",
  },
  {
    name: "Jaipuri Blue Pottery Vase",
    description:
      "Handcrafted blue pottery vase from Jaipur with traditional motifs. Perfect for home decoration.",
    price: 1200,
    originPlace: "Rajasthan",
    images: [
      "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1578586306625-a9a3a97e6db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "priya@sellers.com",
  },
  {
    name: "Premium First Flush Tea",
    description:
      "Authentic Darjeeling first flush tea with aromatic notes. Sourced directly from our family estate.",
    price: 850,
    originPlace: "Darjeeling",
    images: [
      "https://images.unsplash.com/photo-1576092762791-dd9e222046d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1597318972265-6d23b9a52e6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1594373862519-f3a5662bbd59?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "rajesh@sellers.com",
  },
  {
    name: "Kanchipuram Pure Silk Saree",
    description:
      "Traditional Kanchipuram silk saree with gold zari work. Perfect for special occasions.",
    price: 18000,
    originPlace: "Tamil Nadu",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550905b0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1590588903038-a0c9ecd1fd4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "deepika@sellers.com",
  },
  {
    name: "Handcrafted Sandalwood Idol",
    description:
      "Intricately carved sandalwood idol with fine details. Aromatic and decorative.",
    price: 3500,
    originPlace: "Mysore",
    images: [
      "https://images.unsplash.com/photo-1629851498382-b7e1ce790472?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1606312564261-c64e33ca6116?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1562584081-7ceef5fa0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: false,
    sellerEmail: "vikram@sellers.com",
  },
  {
    name: "Kerala Spices Gift Box",
    description:
      "Assorted premium spices from Kerala including cardamom, pepper, and cinnamon.",
    price: 950,
    originPlace: "Kerala",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1614707267537-b85faf00021b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1611787620908-c82eeec06029?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "arun@sellers.com",
  },
  {
    name: "Test Premium Handwoven Fabric",
    description:
      "Beautiful handwoven cotton fabric with traditional patterns. Perfect for clothing and home decor.",
    price: 2500,
    originPlace: "Karnataka",
    images: [
      "https://images.unsplash.com/photo-1578586306625-a9a3a97e6db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1594373862519-f3a5662bbd59?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "premium@seller.com",
  },
  {
    name: "Test Wooden Sculpture Set",
    description:
      "Handcrafted wooden figurines set with exquisite carving details. Great as collectibles.",
    price: 4500,
    originPlace: "Karnataka",
    images: [
      "https://images.unsplash.com/photo-1578586306625-a9a3a97e6db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1606312564261-c64e33ca6116?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1562584081-7ceef5fa0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "premium@seller.com",
  },
  {
    name: "Test Ceramic Dinner Set",
    description:
      "Artisan-made ceramic dinner set with hand-painted designs. Safe for everyday use.",
    price: 6800,
    originPlace: "Karnataka",
    images: [
      "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1578500494198-246f612d03b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1578586306625-a9a3a97e6db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "premium@seller.com",
  },
  {
    name: "Test Beaded Jewelry Collection",
    description:
      "Traditional beaded jewelry with vibrant colors. Perfect for festivals and special occasions.",
    price: 1800,
    originPlace: "Karnataka",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1575074857846-4ae8b6e355b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    ],
    isVerified: true,
    sellerEmail: "premium@seller.com",
  },
];

const PRODUCT_REPLACEMENT_IMAGES = [
  "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1876864936893-f80bc31aa3d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1578586306625-a9a3a97e6db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1606312564261-c64e33ca6116?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1590588903038-a0c9ecd1fd4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1570710891776-e80fcf6edd41?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1594373862519-f3a5662bbd59?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1523293182086-7651a899d37f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
];

const ensureDemoUsers = async () => {
  // Create sellers
  let sellersCreated = 0;
  for (const seller of SELLERS_DATA) {
    const normalizedEmail = seller.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      continue;
    }

    await User.create({
      ...seller,
      email: normalizedEmail,
      password: await bcrypt.hash(seller.password, 10),
    });
    sellersCreated += 1;
  }

  if (sellersCreated > 0) {
    console.log(`✅ Created ${sellersCreated} seller(s)`);
  }

  // Create buyers
  let buyersCreated = 0;
  for (const buyer of BUYERS_DATA) {
    const normalizedEmail = buyer.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      continue;
    }

    await User.create({
      ...buyer,
      email: normalizedEmail,
      password: await bcrypt.hash(buyer.password, 10),
    });
    buyersCreated += 1;
  }

  if (buyersCreated > 0) {
    console.log(`✅ Created ${buyersCreated} buyer(s)`);
  }

  const adminEmail = ADMIN_DATA.email.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      ...ADMIN_DATA,
      email: adminEmail,
      password: await bcrypt.hash(ADMIN_DATA.password, 10),
    });
    console.log("✅ Created default admin user (admin@roots.com / admin123)");
  }

  const testAdminEmail = TEST_ADMIN_DATA.email.trim().toLowerCase();
  const existingTestAdmin = await User.findOne({ email: testAdminEmail });
  if (!existingTestAdmin) {
    await User.create({
      ...TEST_ADMIN_DATA,
      email: testAdminEmail,
      password: await bcrypt.hash(TEST_ADMIN_DATA.password, 10),
    });
    console.log("✅ Created test admin user (test@admin.com / test1234)");
  }
};

const ensureProducts = async () => {
  let productsCreated = 0;

  for (const productData of PRODUCTS_DATA) {
    const existingProduct = await Product.findOne({
      name: productData.name,
    });

    if (existingProduct) {
      continue;
    }

    // Find seller by email
    const seller = await User.findOne({ email: productData.sellerEmail });
    if (!seller) {
      console.warn(`⚠️  Seller not found for product "${productData.name}"`);
      continue;
    }

    await Product.create({
      ...productData,
      sellerId: seller._id,
    });
    productsCreated += 1;
  }

  if (productsCreated > 0) {
    console.log(`✅ Created ${productsCreated} product(s)`);
  }
};

const seedDatabase = async () => {
  try {
    console.log("\n📦 Starting database seeding...");
    await ensureDemoUsers();
    await ensureProducts();
    await updateProductsWithMissingImages();
    await ensureTestOrders();
    console.log("✅ Database seeding completed\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error("Stack:", error.stack);
  }
};

const updateProductsWithMissingImages = async () => {
  try {
    const productsWithoutImages = await Product.find({
      $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
    });

    if (productsWithoutImages.length === 0) {
      return;
    }

    let updated = 0;
    for (const product of productsWithoutImages) {
      const randomImages = [];
      for (let i = 0; i < 3; i++) {
        const randomIdx = Math.floor(
          Math.random() * PRODUCT_REPLACEMENT_IMAGES.length,
        );
        randomImages.push(PRODUCT_REPLACEMENT_IMAGES[randomIdx]);
      }

      product.images = randomImages;
      await product.save();
      updated += 1;
    }

    if (updated > 0) {
      console.log(`✅ Added images to ${updated} product(s) without images`);
    }
  } catch (error) {
    console.error("❌ Error updating products with images:", error.message);
  }
};

const ensureTestOrders = async () => {
  try {
    // Get test seller and buyer
    const seller = await User.findOne({ email: "premium@seller.com" });
    const buyer = await User.findOne({ email: "buyer1@email.com" });

    if (!seller || !buyer) {
      console.warn(
        "⚠️  Test seller or buyer not found, skipping order creation",
      );
      return;
    }

    // Get test seller's products
    const products = await Product.find({ sellerId: seller._id });
    if (products.length === 0) {
      console.warn("⚠️  No products found for test seller");
      return;
    }

    // Check if orders already exist for this seller
    const existingOrders = await Order.countDocuments({ sellerId: seller._id });
    if (existingOrders > 0) {
      console.log(`ℹ️  Test orders already exist (${existingOrders} orders)`);
      return;
    }

    // Create orders with dates spread across months
    const orders = [];

    // Generate orders for the past 6 months
    const now = new Date();
    const months = 6;

    for (let m = 0; m < months; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const daysInMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
      ).getDate();

      // Create 4-8 orders per month
      const ordersThisMonth = Math.floor(Math.random() * 5) + 4;

      for (let i = 0; i < ordersThisMonth; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const orderedAt = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          day,
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60),
        );

        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalPrice = product.price * quantity;

        orders.push({
          buyerId: buyer._id,
          sellerId: seller._id,
          productId: product._id,
          quantity,
          totalPrice,
          status: "Delivered",
          paymentDetails: {
            paymentId: `${Date.now()}_${Math.random()}`,
            method: "razorpay",
            status: "Completed",
            amount: totalPrice,
            currency: "INR",
          },
          shippingDetails: {
            address: "Delivery Address, City, State 000000",
            trackingId: `TRACK${Math.random().toString(36).substr(2, 9)}`,
            estimatedDelivery: new Date(
              orderedAt.getTime() + 5 * 24 * 60 * 60 * 1000,
            ),
          },
          createdAt: orderedAt,
          updatedAt: orderedAt,
        });
      }
    }

    // Insert all orders
    await Order.insertMany(orders);
    console.log(
      `✅ Created ${orders.length} test orders for premium@seller.com`,
    );

    // Calculate and display revenue stats
    const stats = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          "paymentDetails.status": "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const revenue = stats[0].totalRevenue;
      const orderCount = stats[0].totalOrders;
      console.log(
        `📊 Test seller stats: ₹${revenue.toLocaleString()} revenue from ${orderCount} orders`,
      );
    }
  } catch (error) {
    console.error("❌ Error creating test orders:", error.message);
  }
};

module.exports = seedDatabase;
