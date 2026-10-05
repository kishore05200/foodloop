import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, FoodListing, User, Claim, Rating } from './types.js';

const DB_FILE = path.resolve(process.cwd(), 'data/foodloop_db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: DatabaseSchema = {
  users: [],
  food_listings: [],
  claims: [],
  ratings: []
};

// Helper to hash passwords
const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

const getInitialSeed = (): DatabaseSchema => {
  const now = new Date();
  
  // Future expiry timestamps
  const inHours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
  const inMinutes = (m: number) => new Date(now.getTime() + m * 60 * 1000).toISOString();
  const pastHours = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  const users: User[] = [
    {
      id: 'usr_user_1',
      name: 'Ananya Sharma',
      email: 'user@foodloop.org',
      phone: '+91 98765 43210',
      password_hash: hashPassword('user123'),
      role: 'USER',
      created_at: pastHours(72)
    },
    {
      id: 'usr_provider_1',
      name: 'College Central Cafeteria',
      email: 'provider@foodloop.org',
      phone: '+91 91234 56789',
      password_hash: hashPassword('provider123'),
      role: 'PROVIDER',
      created_at: pastHours(120)
    },
    {
      id: 'usr_provider_2',
      name: 'Crust & Crumb Bakery',
      email: 'bakery@foodloop.org',
      phone: '+91 94567 12345',
      password_hash: hashPassword('bakery123'),
      role: 'PROVIDER',
      created_at: pastHours(100)
    },
    {
      id: 'usr_provider_3',
      name: 'TechFest College Event Catering',
      email: 'event@foodloop.org',
      phone: '+91 97890 65432',
      password_hash: hashPassword('event123'),
      role: 'PROVIDER',
      created_at: pastHours(48)
    },
    {
      id: 'usr_admin_1',
      name: 'FoodLoop Admin',
      email: 'admin@foodloop.org',
      phone: '+91 99999 00000',
      password_hash: hashPassword('admin123'),
      role: 'ADMIN',
      created_at: pastHours(200)
    }
  ];

  const food_listings: FoodListing[] = [
    {
      id: 'list_1',
      provider_id: 'usr_provider_1',
      provider_name: 'College Central Cafeteria',
      provider_rating: 4.8,
      provider_reviews_count: 34,
      name: 'Chicken Rice Box with Raita',
      category: 'Rice',
      description: 'Fragrant steamed jeera rice with succulent spiced chicken curry, boiled egg, and cool mint cucumber raita. Freshly packed after lunch rush.',
      original_price: 120,
      foodloop_price: 30,
      discount_percentage: 75,
      quantity: 20,
      available_quantity: 12,
      unit: 'portions',
      pickup_location: 'College Cafeteria, North Campus Block B, Counter 4',
      latitude: 12.9716,
      longitude: 77.5946,
      travel_estimate: '1.2 km away · 8 min walk',
      expiry_at: inHours(2), // 2 hours from now
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      created_at: pastHours(2),
      updated_at: pastHours(2)
    },
    {
      id: 'list_2',
      provider_id: 'usr_provider_3',
      provider_name: 'TechFest College Event Catering',
      provider_rating: 4.9,
      provider_reviews_count: 19,
      name: 'Vegetable Meals Deluxe Feast',
      category: 'Meals',
      description: 'Wholesome buffet feast surplus: Paneer kofta curry, yellow dal tadka, 3 butter rotis, peas pulao, and gulab jamun.',
      original_price: 80,
      foodloop_price: 20,
      discount_percentage: 75,
      quantity: 30,
      available_quantity: 18,
      unit: 'portions',
      pickup_location: 'College Event - TechFest Dining Hall, East Lawn Pavilion',
      latitude: 12.9740,
      longitude: 77.5990,
      travel_estimate: '0.8 km away · 5 min walk',
      expiry_at: inHours(3.5),
      image_url: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      created_at: pastHours(1),
      updated_at: pastHours(1)
    },
    {
      id: 'list_3',
      provider_id: 'usr_provider_2',
      provider_name: 'Crust & Crumb Bakery',
      provider_rating: 4.9,
      provider_reviews_count: 52,
      name: 'Bakery Combo Pack (Croissants & Sourdough)',
      category: 'Bakery',
      description: 'Surplus morning artisanal bake: 2 golden butter croissants, 1 loaf of rustic sourdough bread, and 2 blueberry muffins. Still warm!',
      original_price: 200,
      foodloop_price: 50,
      discount_percentage: 75,
      quantity: 10,
      available_quantity: 3,
      unit: 'packs',
      pickup_location: 'Crust & Crumb Bakery, Main University Avenue, Gate 2',
      latitude: 12.9690,
      longitude: 77.5890,
      travel_estimate: '1.8 km away · 12 min walk',
      expiry_at: inMinutes(45), // Expiring Soon!
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      status: 'LOW_STOCK',
      created_at: pastHours(3),
      updated_at: pastHours(1)
    },
    {
      id: 'list_4',
      provider_id: 'usr_provider_1',
      provider_name: 'College Central Cafeteria',
      provider_rating: 4.8,
      provider_reviews_count: 34,
      name: 'Steaming Idly + Sambar Set (4 pcs)',
      category: 'Snacks',
      description: 'Soft pillow idlies served with aromatic vegetable sambar and fresh ground coconut chutney. Prepared for evening tea session.',
      original_price: 60,
      foodloop_price: 15,
      discount_percentage: 75,
      quantity: 40,
      available_quantity: 26,
      unit: 'portions',
      pickup_location: 'College Central Canteen, Student Activity Center',
      latitude: 12.9716,
      longitude: 77.5946,
      travel_estimate: '1.2 km away · 8 min walk',
      expiry_at: inHours(1.5),
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      created_at: pastHours(1.5),
      updated_at: pastHours(1.5)
    },
    {
      id: 'list_5',
      provider_id: 'usr_provider_1',
      provider_name: 'College Central Cafeteria',
      provider_rating: 4.8,
      provider_reviews_count: 34,
      name: 'Paneer Butter Masala & Garlic Naan',
      category: 'Meals',
      description: 'Rich cottage cheese cubes simmered in creamy tomato-cashew gravy, served with 2 freshly buttered tandoori garlic naans.',
      original_price: 160,
      foodloop_price: 40,
      discount_percentage: 75,
      quantity: 15,
      available_quantity: 2,
      unit: 'portions',
      pickup_location: 'College Central Cafeteria, North Campus Block B, Counter 2',
      latitude: 12.9716,
      longitude: 77.5946,
      travel_estimate: '1.2 km away · 8 min walk',
      expiry_at: inMinutes(25), // Expiring Soon & Low Stock!
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
      status: 'LOW_STOCK',
      created_at: pastHours(2),
      updated_at: pastHours(1)
    },
    {
      id: 'list_6',
      provider_id: 'usr_provider_2',
      provider_name: 'Crust & Crumb Bakery',
      provider_rating: 4.9,
      provider_reviews_count: 52,
      name: 'Assorted Gourmet Cupcakes & Tarts Box',
      category: 'Desserts',
      description: 'Box of 4 delightful patisserie treats: Dark chocolate truffle cupcake, Red velvet with cream cheese, Lemon tart, and Salted caramel mousse.',
      original_price: 180,
      foodloop_price: 45,
      discount_percentage: 75,
      quantity: 12,
      available_quantity: 8,
      unit: 'boxes',
      pickup_location: 'Crust & Crumb Bakery, Main University Avenue, Gate 2',
      latitude: 12.9690,
      longitude: 77.5890,
      travel_estimate: '1.8 km away · 12 min walk',
      expiry_at: inHours(4),
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      created_at: pastHours(2),
      updated_at: pastHours(2)
    },
    {
      id: 'list_7',
      provider_id: 'usr_provider_3',
      provider_name: 'TechFest College Event Catering',
      provider_rating: 4.9,
      provider_reviews_count: 19,
      name: 'Organic Fruit & Sprout Salad Bowls',
      category: 'Fruits',
      description: 'Crisp diced apples, pomegranate, watermelon, sweet lime, and sprouted moong with zesty lemon chaat masala dressing. Super healthy & refreshing.',
      original_price: 100,
      foodloop_price: 25,
      discount_percentage: 75,
      quantity: 15,
      available_quantity: 9,
      unit: 'bowls',
      pickup_location: 'College Event - TechFest Dining Hall, Green Zone',
      latitude: 12.9740,
      longitude: 77.5990,
      travel_estimate: '0.8 km away · 5 min walk',
      expiry_at: inHours(2.5),
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      created_at: pastHours(1.5),
      updated_at: pastHours(1.5)
    },
    {
      id: 'list_8',
      provider_id: 'usr_provider_1',
      provider_name: 'College Central Cafeteria',
      provider_rating: 4.8,
      provider_reviews_count: 34,
      name: 'Crispy Samosa & Masala Chai Combo',
      category: 'Snacks',
      description: '4 golden crunchy potato-pea samosas with mint & tamarind chutneys, plus flask of piping hot ginger cardamom chai.',
      original_price: 80,
      foodloop_price: 20,
      discount_percentage: 75,
      quantity: 25,
      available_quantity: 0,
      unit: 'portions',
      pickup_location: 'College Central Cafeteria, Kiosk 3',
      latitude: 12.9716,
      longitude: 77.5946,
      travel_estimate: '1.2 km away · 8 min walk',
      expiry_at: inHours(1),
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      status: 'FULLY_CLAIMED',
      created_at: pastHours(4),
      updated_at: pastHours(1)
    }
  ];

  const claims: Claim[] = [
    {
      id: 'clm_1',
      listing_id: 'list_1',
      user_id: 'usr_user_1',
      user_name: 'Ananya Sharma',
      provider_id: 'usr_provider_1',
      provider_name: 'College Central Cafeteria',
      food_name: 'Chicken Rice Box with Raita',
      category: 'Rice',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      quantity: 3,
      foodloop_price: 30,
      original_price: 120,
      total_price: 90,
      total_saved: 270,
      pickup_location: 'College Cafeteria, North Campus Block B, Counter 4',
      claim_code: 'FL-4829',
      status: 'READY_FOR_PICKUP',
      claimed_at: pastHours(1),
      has_rated: false
    },
    {
      id: 'clm_2',
      listing_id: 'list_2',
      user_id: 'usr_user_1',
      user_name: 'Ananya Sharma',
      provider_id: 'usr_provider_3',
      provider_name: 'TechFest College Event Catering',
      food_name: 'Vegetable Meals Deluxe Feast',
      category: 'Meals',
      image_url: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80',
      quantity: 2,
      foodloop_price: 20,
      original_price: 80,
      total_price: 40,
      total_saved: 120,
      pickup_location: 'College Event - TechFest Dining Hall, East Lawn Pavilion',
      claim_code: 'FL-9134',
      status: 'COMPLETED',
      claimed_at: pastHours(24),
      completed_at: pastHours(22),
      has_rated: true
    },
    {
      id: 'clm_3',
      listing_id: 'list_3',
      user_id: 'usr_user_1',
      user_name: 'Ananya Sharma',
      provider_id: 'usr_provider_2',
      provider_name: 'Crust & Crumb Bakery',
      food_name: 'Bakery Combo Pack (Croissants & Sourdough)',
      category: 'Bakery',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
      foodloop_price: 50,
      original_price: 200,
      total_price: 50,
      total_saved: 150,
      pickup_location: 'Crust & Crumb Bakery, Main University Avenue, Gate 2',
      claim_code: 'FL-3301',
      status: 'COMPLETED',
      claimed_at: pastHours(48),
      completed_at: pastHours(46),
      has_rated: true
    }
  ];

  const ratings: Rating[] = [
    {
      id: 'rat_1',
      claim_id: 'clm_2',
      reviewer_id: 'usr_user_1',
      reviewer_name: 'Ananya Sharma',
      provider_id: 'usr_provider_3',
      provider_name: 'TechFest College Event Catering',
      rating: 5,
      review: 'Food was delicious, steaming hot, and packaged super neatly! Pickup was completed in less than 2 minutes. Huge fan of FoodLoop!',
      created_at: pastHours(22)
    },
    {
      id: 'rat_2',
      claim_id: 'clm_3',
      reviewer_id: 'usr_user_1',
      reviewer_name: 'Ananya Sharma',
      provider_id: 'usr_provider_2',
      provider_name: 'Crust & Crumb Bakery',
      rating: 5,
      review: 'The croissants were golden flaky perfection and the sourdough bread was bakery-fresh. Saved ₹150 while rescuing great food!',
      created_at: pastHours(46)
    }
  ];

  return { users, food_listings, claims, ratings };
};

export const initDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      // Check if food_listings or users are empty
      if (!db.users || db.users.length === 0 || !db.food_listings || db.food_listings.length === 0) {
        db = getInitialSeed();
        saveDb();
      }
    } else {
      db = getInitialSeed();
      saveDb();
    }
  } catch (err) {
    console.error('Failed to load db, seeding default data:', err);
    db = getInitialSeed();
    saveDb();
  }

  // Periodic expiry maintenance (runs every 30 seconds)
  setInterval(() => {
    checkAndUpdateExpiries();
  }, 30000);
  checkAndUpdateExpiries();
};

export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
};

export const getDb = (): DatabaseSchema => db;

// Checks expiry timestamps and automatically updates listing status
export const checkAndUpdateExpiries = () => {
  const now = new Date().getTime();
  let changed = false;

  for (const listing of db.food_listings) {
    const expiryTime = new Date(listing.expiry_at).getTime();
    if (expiryTime <= now && listing.status !== 'EXPIRED') {
      listing.status = 'EXPIRED';
      listing.updated_at = new Date().toISOString();
      changed = true;
    } else if (listing.status === 'AVAILABLE' && listing.available_quantity <= 3 && listing.available_quantity > 0) {
      listing.status = 'LOW_STOCK';
      changed = true;
    } else if (listing.status === 'LOW_STOCK' && listing.available_quantity > 3) {
      listing.status = 'AVAILABLE';
      changed = true;
    }
  }

  if (changed) {
    saveDb();
  }
};

export const resetDb = () => {
  db = getInitialSeed();
  saveDb();
  return db;
};
