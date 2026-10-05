import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, checkAndUpdateExpiries, resetDb } from './db.js';
import { generateToken, requireAuth, requireRole, optionalAuth, AuthRequest } from './auth.js';
import { FoodListing, Claim, Rating, FoodCategory, ListingStatus } from './types.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION APIS
// ==========================================

// POST /auth/register
apiRouter.post('/auth/register', (req: AuthRequest, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }

  const validRole = role === 'PROVIDER' || role === 'ADMIN' ? role : 'USER';
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : '',
    password_hash: bcrypt.hashSync(password, 10),
    role: validRole,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();

  const token = generateToken(newUser);
  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      created_at: newUser.created_at
    }
  });
});

// POST /auth/login
apiRouter.post('/auth/login', (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// GET /auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// ==========================================
// 2. FOOD LISTINGS APIS
// ==========================================

// GET /listings
apiRouter.get('/listings', optionalAuth, (req: AuthRequest, res: Response) => {
  checkAndUpdateExpiries();
  const db = getDb();

  const {
    search,
    category,
    status,
    max_price,
    min_discount,
    expiring_soon,
    provider_id,
    sort,
    user_lat,
    user_lng
  } = req.query;

  let listings = [...db.food_listings];

  // Expiring soon filter (e.g., expires within 60 minutes)
  if (expiring_soon === 'true') {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    listings = listings.filter(item => {
      const expTime = new Date(item.expiry_at).getTime();
      return expTime > now && expTime - now <= oneHour && item.status !== 'EXPIRED' && item.available_quantity > 0;
    });
  }

  // Filter by provider
  if (provider_id) {
    listings = listings.filter(item => item.provider_id === provider_id);
  }

  // Filter by category
  if (category && category !== 'All') {
    listings = listings.filter(
      item => item.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  // Filter by status
  if (status && status !== 'All') {
    listings = listings.filter(item => item.status === status);
  }

  // Filter by max FoodLoop price
  if (max_price) {
    const max = parseFloat(max_price as string);
    if (!isNaN(max)) {
      listings = listings.filter(item => item.foodloop_price <= max);
    }
  }

  // Filter by min discount percentage
  if (min_discount) {
    const minD = parseFloat(min_discount as string);
    if (!isNaN(minD)) {
      listings = listings.filter(item => item.discount_percentage >= minD);
    }
  }

  // Search filter (name, description, provider, pickup location)
  if (search) {
    const q = (search as string).toLowerCase().trim();
    listings = listings.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.provider_name.toLowerCase().includes(q) ||
        item.pickup_location.toLowerCase().includes(q)
    );
  }

  // Distance computation if user coordinates provided
  const uLat = user_lat ? parseFloat(user_lat as string) : 12.9716;
  const uLng = user_lng ? parseFloat(user_lng as string) : 77.5946;

  listings = listings.map(item => {
    // Haversine approximate distance in km
    const dLat = (item.latitude - uLat) * 111;
    const dLng = (item.longitude - uLng) * 111 * Math.cos(uLat * (Math.PI / 180));
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    const roundedDist = Math.max(0.2, Math.round(distKm * 10) / 10);
    const walkMin = Math.round(roundedDist * 7.5);
    return {
      ...item,
      distance_km: roundedDist,
      travel_estimate: `${roundedDist} km away · ${walkMin} min walk`
    };
  });

  // Sorting
  if (sort === 'lowest_price') {
    listings.sort((a, b) => a.foodloop_price - b.foodloop_price);
  } else if (sort === 'highest_discount') {
    listings.sort((a, b) => b.discount_percentage - a.discount_percentage);
  } else if (sort === 'expiring_soon') {
    listings.sort(
      (a, b) => new Date(a.expiry_at).getTime() - new Date(b.expiry_at).getTime()
    );
  } else if (sort === 'nearest') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listings.sort((a: any, b: any) => (a.distance_km || 0) - (b.distance_km || 0));
  } else {
    // Default newest
    listings.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return res.json({ listings });
});

// GET /listings/:id
apiRouter.get('/listings/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  checkAndUpdateExpiries();
  const db = getDb();
  const listing = db.food_listings.find(l => l.id === req.params.id);

  if (!listing) {
    return res.status(404).json({ error: 'Food listing not found.' });
  }

  // Get provider ratings
  const providerRatings = db.ratings.filter(r => r.provider_id === listing.provider_id);
  const avgRating = providerRatings.length > 0
    ? Number((providerRatings.reduce((sum, r) => sum + r.rating, 0) / providerRatings.length).toFixed(1))
    : 4.9;

  return res.json({
    listing: {
      ...listing,
      provider_rating: avgRating,
      provider_reviews_count: providerRatings.length + 15 // baseline plus reviews
    },
    reviews: providerRatings
  });
});

// POST /listings (Provider or Admin only)
apiRouter.post('/listings', requireAuth, requireRole('PROVIDER', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const {
    name,
    category,
    description,
    original_price,
    foodloop_price,
    quantity,
    unit,
    pickup_location,
    latitude,
    longitude,
    expiry_at,
    image_url
  } = req.body;

  if (!name || !original_price || !quantity || !pickup_location || !expiry_at) {
    return res.status(400).json({
      error: 'Food name, original price, quantity, pickup location, and expiry date/time are required.'
    });
  }

  const origPrice = parseFloat(original_price);
  if (isNaN(origPrice) || origPrice <= 0) {
    return res.status(400).json({ error: 'Original price must be greater than 0.' });
  }

  // Default to 25% if not provided, or parse provider's chosen price
  let flPrice = foodloop_price !== undefined && foodloop_price !== null && foodloop_price !== ''
    ? parseFloat(foodloop_price)
    : Math.round(origPrice * 0.25);

  if (isNaN(flPrice) || flPrice <= 0) {
    flPrice = Math.round(origPrice * 0.25);
  }

  // Calculate discount percentage
  const discountPct = Math.round(((origPrice - flPrice) / origPrice) * 100);

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  // Expiry check
  const expDate = new Date(expiry_at);
  if (isNaN(expDate.getTime()) || expDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: 'Expiry date/time must be in the future.' });
  }

  const defaultImages: Record<string, string> = {
    Meals: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80',
    Rice: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    Bakery: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    Snacks: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    Fruits: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    Beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    Desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    Other: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  };

  const selectedCategory: FoodCategory = category || 'Meals';
  const imgUrl = image_url && image_url.trim().length > 0 ? image_url : (defaultImages[selectedCategory] || defaultImages['Meals']);

  const db = getDb();
  const provider = req.user!;

  const newListing: FoodListing = {
    id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    provider_id: provider.id,
    provider_name: provider.name,
    name: name.trim(),
    category: selectedCategory,
    description: description ? description.trim() : `Fresh surplus ${name.trim()} available for quick rescue pickup.`,
    original_price: origPrice,
    foodloop_price: flPrice,
    discount_percentage: discountPct,
    quantity: parsedQty,
    available_quantity: parsedQty,
    unit: unit ? unit.trim() : 'portions',
    pickup_location: pickup_location.trim(),
    latitude: latitude ? parseFloat(latitude) : 12.9716 + (Math.random() - 0.5) * 0.02,
    longitude: longitude ? parseFloat(longitude) : 77.5946 + (Math.random() - 0.5) * 0.02,
    expiry_at: expDate.toISOString(),
    image_url: imgUrl,
    status: parsedQty <= 3 ? 'LOW_STOCK' : 'AVAILABLE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.food_listings.unshift(newListing);
  saveDb();

  return res.status(201).json({ listing: newListing });
});

// PUT /listings/:id (Provider ownership check or Admin)
apiRouter.put('/listings/:id', requireAuth, requireRole('PROVIDER', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const listing = db.food_listings.find(l => l.id === req.params.id);

  if (!listing) {
    return res.status(404).json({ error: 'Food listing not found.' });
  }

  // Check ownership
  if (req.user!.role !== 'ADMIN' && listing.provider_id !== req.user!.id) {
    return res.status(403).json({ error: 'You are only authorized to modify your own listings.' });
  }

  const {
    name,
    category,
    description,
    original_price,
    foodloop_price,
    quantity,
    available_quantity,
    unit,
    pickup_location,
    expiry_at,
    image_url,
    status
  } = req.body;

  if (name !== undefined) listing.name = name.trim();
  if (category !== undefined) listing.category = category;
  if (description !== undefined) listing.description = description.trim();
  if (unit !== undefined) listing.unit = unit.trim();
  if (pickup_location !== undefined) listing.pickup_location = pickup_location.trim();
  if (image_url !== undefined && image_url.trim()) listing.image_url = image_url.trim();

  if (original_price !== undefined) {
    const op = parseFloat(original_price);
    if (!isNaN(op) && op > 0) listing.original_price = op;
  }

  if (foodloop_price !== undefined) {
    const fp = parseFloat(foodloop_price);
    if (!isNaN(fp) && fp > 0) listing.foodloop_price = fp;
  }

  // Recalculate discount
  listing.discount_percentage = Math.round(
    ((listing.original_price - listing.foodloop_price) / listing.original_price) * 100
  );

  if (quantity !== undefined) {
    const q = parseInt(quantity, 10);
    if (!isNaN(q) && q >= 0) listing.quantity = q;
  }

  if (available_quantity !== undefined) {
    const aq = parseInt(available_quantity, 10);
    if (!isNaN(aq) && aq >= 0) {
      listing.available_quantity = aq;
      if (aq === 0) listing.status = 'FULLY_CLAIMED';
      else if (aq <= 3) listing.status = 'LOW_STOCK';
      else if (listing.status !== 'EXPIRED') listing.status = 'AVAILABLE';
    }
  }

  if (expiry_at !== undefined) {
    const exp = new Date(expiry_at);
    if (!isNaN(exp.getTime())) listing.expiry_at = exp.toISOString();
  }

  if (status !== undefined) {
    listing.status = status as ListingStatus;
  }

  listing.updated_at = new Date().toISOString();
  saveDb();

  return res.json({ listing });
});

// DELETE /listings/:id (Provider ownership check or Admin)
apiRouter.delete('/listings/:id', requireAuth, requireRole('PROVIDER', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const index = db.food_listings.findIndex(l => l.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Food listing not found.' });
  }

  const listing = db.food_listings[index];
  if (req.user!.role !== 'ADMIN' && listing.provider_id !== req.user!.id) {
    return res.status(403).json({ error: 'You are only authorized to delete your own listings.' });
  }

  db.food_listings.splice(index, 1);
  saveDb();

  return res.json({ message: 'Listing deleted successfully.' });
});

// ==========================================
// 3. CLAIMS APIS
// ==========================================

// POST /claims
apiRouter.post('/claims', requireAuth, (req: AuthRequest, res: Response) => {
  const { listing_id, quantity } = req.body;

  if (!listing_id || !quantity) {
    return res.status(400).json({ error: 'Listing ID and quantity are required.' });
  }

  const claimQty = parseInt(quantity, 10);
  if (isNaN(claimQty) || claimQty <= 0) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  checkAndUpdateExpiries();
  const db = getDb();
  const listing = db.food_listings.find(l => l.id === listing_id);

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (listing.status === 'EXPIRED') {
    return res.status(400).json({ error: 'This food listing has already expired and cannot be claimed.' });
  }

  if (listing.available_quantity <= 0 || listing.status === 'FULLY_CLAIMED') {
    return res.status(400).json({ error: 'This food listing is fully claimed.' });
  }

  if (claimQty > listing.available_quantity) {
    return res.status(400).json({
      error: `Cannot claim ${claimQty} portions. Only ${listing.available_quantity} available.`
    });
  }

  // Atomic update to available quantity
  listing.available_quantity -= claimQty;
  if (listing.available_quantity === 0) {
    listing.status = 'FULLY_CLAIMED';
  } else if (listing.available_quantity <= 3) {
    listing.status = 'LOW_STOCK';
  }
  listing.updated_at = new Date().toISOString();

  // Create claim record
  const totalPrice = listing.foodloop_price * claimQty;
  const originalTotal = listing.original_price * claimQty;
  const totalSaved = originalTotal - totalPrice;

  const claimCode = `FL-${Math.floor(1000 + Math.random() * 9000)}`;

  const newClaim: Claim = {
    id: `clm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    listing_id: listing.id,
    user_id: req.user!.id,
    user_name: req.user!.name,
    provider_id: listing.provider_id,
    provider_name: listing.provider_name,
    food_name: listing.name,
    category: listing.category,
    image_url: listing.image_url,
    quantity: claimQty,
    foodloop_price: listing.foodloop_price,
    original_price: listing.original_price,
    total_price: totalPrice,
    total_saved: totalSaved,
    pickup_location: listing.pickup_location,
    claim_code: claimCode,
    status: 'READY_FOR_PICKUP',
    claimed_at: new Date().toISOString(),
    has_rated: false
  };

  db.claims.unshift(newClaim);
  saveDb();

  return res.status(201).json({
    claim: newClaim,
    updated_listing: listing
  });
});

// GET /claims
apiRouter.get('/claims', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = req.user!;

  let claims = [...db.claims];

  if (user.role === 'ADMIN') {
    // Admin sees all claims
  } else if (user.role === 'PROVIDER') {
    // Provider sees claims for their listings
    claims = claims.filter(c => c.provider_id === user.id);
  } else {
    // User sees only their own claims
    claims = claims.filter(c => c.user_id === user.id);
  }

  // Sort newest first
  claims.sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());

  return res.json({ claims });
});

// GET /claims/:id
apiRouter.get('/claims/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const claim = db.claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  // Authorization check
  const user = req.user!;
  if (user.role !== 'ADMIN' && claim.user_id !== user.id && claim.provider_id !== user.id) {
    return res.status(403).json({ error: 'Access denied to this claim ticket.' });
  }

  return res.json({ claim });
});

// PUT /claims/:id/complete (Mark as picked up / completed)
apiRouter.put('/claims/:id/complete', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const claim = db.claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  const user = req.user!;
  // Both recipient user, provider, and admin can confirm pickup
  if (user.role !== 'ADMIN' && claim.user_id !== user.id && claim.provider_id !== user.id) {
    return res.status(403).json({ error: 'Not authorized to complete this claim.' });
  }

  if (claim.status === 'COMPLETED') {
    return res.json({ claim, message: 'Claim was already completed.' });
  }

  claim.status = 'COMPLETED';
  claim.completed_at = new Date().toISOString();
  saveDb();

  return res.json({
    claim,
    message: 'Pickup completed successfully! Food rescued.'
  });
});

// PUT /claims/:id/cancel
apiRouter.put('/claims/:id/cancel', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const claim = db.claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  const user = req.user!;
  if (user.role !== 'ADMIN' && claim.user_id !== user.id) {
    return res.status(403).json({ error: 'Not authorized to cancel this claim.' });
  }

  if (claim.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Completed pickups cannot be cancelled.' });
  }

  if (claim.status === 'CANCELLED') {
    return res.json({ claim, message: 'Claim was already cancelled.' });
  }

  claim.status = 'CANCELLED';

  // Restore available quantity to listing
  const listing = db.food_listings.find(l => l.id === claim.listing_id);
  if (listing && listing.status !== 'EXPIRED') {
    listing.available_quantity += claim.quantity;
    if (listing.available_quantity > 3) {
      listing.status = 'AVAILABLE';
    } else if (listing.available_quantity > 0) {
      listing.status = 'LOW_STOCK';
    }
  }

  saveDb();
  return res.json({ claim, message: 'Claim cancelled. Quantity restored to listing.' });
});

// ==========================================
// 4. RATINGS APIS
// ==========================================

// POST /ratings
apiRouter.post('/ratings', requireAuth, (req: AuthRequest, res: Response) => {
  const { claim_id, rating, review } = req.body;

  if (!claim_id || !rating) {
    return res.status(400).json({ error: 'Claim ID and rating score (1-5) are required.' });
  }

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  const db = getDb();
  const claim = db.claims.find(c => c.id === claim_id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  if (claim.user_id !== req.user!.id) {
    return res.status(403).json({ error: 'You can only review claims that you picked up.' });
  }

  const existingRating = db.ratings.find(r => r.claim_id === claim_id);
  if (existingRating) {
    return res.status(400).json({ error: 'You have already submitted a rating for this pickup.' });
  }

  const newRating: Rating = {
    id: `rat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    claim_id: claim.id,
    reviewer_id: req.user!.id,
    reviewer_name: req.user!.name,
    provider_id: claim.provider_id,
    provider_name: claim.provider_name,
    rating: numRating,
    review: review ? review.trim() : 'Great fresh food and seamless pickup!',
    created_at: new Date().toISOString()
  };

  db.ratings.unshift(newRating);
  claim.has_rated = true;

  // Update provider average rating on their listings
  const providerRatings = db.ratings.filter(r => r.provider_id === claim.provider_id);
  const avg = Number((providerRatings.reduce((sum, r) => sum + r.rating, 0) / providerRatings.length).toFixed(1));

  for (const listing of db.food_listings) {
    if (listing.provider_id === claim.provider_id) {
      listing.provider_rating = avg;
      listing.provider_reviews_count = (listing.provider_reviews_count || 15) + 1;
    }
  }

  saveDb();
  return res.status(201).json({ rating: newRating });
});

// ==========================================
// 5. DASHBOARDS & IMPACT APIS
// ==========================================

// GET /dashboard/user
apiRouter.get('/dashboard/user', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user!.id;

  const userClaims = db.claims.filter(c => c.user_id === userId);
  const completedClaims = userClaims.filter(c => c.status === 'COMPLETED');
  const activeClaims = userClaims.filter(c => c.status === 'READY_FOR_PICKUP' || c.status === 'CLAIMED');

  const mealsRescued = completedClaims.reduce((sum, c) => sum + c.quantity, 0);
  const moneySaved = completedClaims.reduce((sum, c) => sum + c.total_saved, 0);
  const totalSpent = completedClaims.reduce((sum, c) => sum + c.total_price, 0);
  const foodWeightKg = Number((mealsRescued * 0.45).toFixed(1)); // 450g per meal approx

  return res.json({
    metrics: {
      meals_rescued: mealsRescued,
      money_saved: moneySaved,
      total_spent: totalSpent,
      food_rescued_kg: foodWeightKg,
      completed_pickups: completedClaims.length,
      active_claims_count: activeClaims.length
    },
    active_claims: activeClaims,
    recent_claims: userClaims.slice(0, 10)
  });
});

// GET /dashboard/provider
apiRouter.get('/dashboard/provider', requireAuth, requireRole('PROVIDER', 'ADMIN'), (req: AuthRequest, res: Response) => {
  checkAndUpdateExpiries();
  const db = getDb();
  const providerId = req.user!.id;

  // Filter listings and claims
  const listings = db.food_listings.filter(l => l.provider_id === providerId);
  const claims = db.claims.filter(c => c.provider_id === providerId);

  const completedClaims = claims.filter(c => c.status === 'COMPLETED');
  const activeListings = listings.filter(l => l.status === 'AVAILABLE' || l.status === 'LOW_STOCK');
  const expiredListings = listings.filter(l => l.status === 'EXPIRED');

  const totalFoodListed = listings.reduce((sum, l) => sum + l.quantity, 0);
  const totalFoodSold = completedClaims.reduce((sum, c) => sum + c.quantity, 0);
  const totalFoodRescuedKg = Number((totalFoodSold * 0.45).toFixed(1));
  const totalRevenue = completedClaims.reduce((sum, c) => sum + c.total_price, 0);
  const totalDiscountGiven = completedClaims.reduce((sum, c) => sum + c.total_saved, 0);

  // Ratings for this provider
  const ratings = db.ratings.filter(r => r.provider_id === providerId);
  const avgRating = ratings.length > 0
    ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
    : 4.9;

  return res.json({
    metrics: {
      total_food_listed: totalFoodListed,
      total_food_sold: totalFoodSold,
      total_food_rescued_kg: totalFoodRescuedKg,
      total_revenue: totalRevenue,
      total_discount_given: totalDiscountGiven,
      active_listings_count: activeListings.length,
      expired_listings_count: expiredListings.length,
      average_rating: avgRating,
      reviews_count: ratings.length
    },
    active_listings: activeListings,
    all_listings: listings,
    recent_claims: claims.slice(0, 10),
    reviews: ratings
  });
});

// GET /dashboard/admin
apiRouter.get('/dashboard/admin', requireAuth, requireRole('ADMIN'), (_req: AuthRequest, res: Response) => {
  checkAndUpdateExpiries();
  const db = getDb();

  const totalUsers = db.users.length;
  const totalProviders = db.users.filter(u => u.role === 'PROVIDER').length;
  const totalListings = db.food_listings.length;
  const activeListings = db.food_listings.filter(l => l.status === 'AVAILABLE' || l.status === 'LOW_STOCK').length;
  const expiredListings = db.food_listings.filter(l => l.status === 'EXPIRED').length;

  const totalClaims = db.claims.length;
  const completedClaims = db.claims.filter(c => c.status === 'COMPLETED');
  const totalMealsSaved = completedClaims.reduce((sum, c) => sum + c.quantity, 0);
  const totalMoneySaved = completedClaims.reduce((sum, c) => sum + c.total_saved, 0);
  const totalFoodRescuedKg = Number((totalMealsSaved * 0.45).toFixed(1));

  return res.json({
    metrics: {
      total_users: totalUsers,
      total_providers: totalProviders,
      total_listings: totalListings,
      active_listings: activeListings,
      expired_listings: expiredListings,
      total_claims: totalClaims,
      completed_claims: completedClaims.length,
      total_meals_saved: totalMealsSaved,
      total_money_saved: totalMoneySaved,
      total_food_rescued_kg: totalFoodRescuedKg
    },
    users: db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      created_at: u.created_at
    })),
    food_listings: db.food_listings,
    claims: db.claims
  });
});

// POST /dashboard/admin/reset (Reset sample data)
apiRouter.post('/dashboard/admin/reset', requireAuth, requireRole('ADMIN'), (_req: AuthRequest, res: Response) => {
  const newDb = resetDb();
  return res.json({ message: 'Database reset to initial sample data.', newDb });
});

// GET /dashboard/impact (Public high-level impact & rescue value metrics)
apiRouter.get('/dashboard/impact', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const completedClaims = db.claims.filter(c => c.status === 'COMPLETED');

  // Baseline platform historic metrics plus real-time updates
  const baseMeals = 2450;
  const baseMoneySaved = 86500;
  const baseRescuedKg = 720;
  const baseClaimsCount = 340;

  const currentMeals = completedClaims.reduce((sum, c) => sum + c.quantity, 0);
  const currentSaved = completedClaims.reduce((sum, c) => sum + c.total_saved, 0);
  const currentRescuedKg = Math.round(currentMeals * 0.45);

  const totalMeals = baseMeals + currentMeals;
  const totalSaved = baseMoneySaved + currentSaved;
  const totalRescuedKg = baseRescuedKg + currentRescuedKg;
  const totalClaims = baseClaimsCount + completedClaims.length;

  // Rescue value calculation:
  // Original value = FoodLoop sales + Users saved
  const totalOriginalValue = Math.round(totalSaved / 0.75); // since discount is ~75%
  const totalSales = totalOriginalValue - totalSaved;

  // Breakdown by Category
  const categoryCounts: Record<string, number> = {
    Meals: 920 + completedClaims.filter(c => c.category === 'Meals').reduce((s, c) => s + c.quantity, 0),
    Rice: 680 + completedClaims.filter(c => c.category === 'Rice').reduce((s, c) => s + c.quantity, 0),
    Bakery: 450 + completedClaims.filter(c => c.category === 'Bakery').reduce((s, c) => s + c.quantity, 0),
    Snacks: 380 + completedClaims.filter(c => c.category === 'Snacks').reduce((s, c) => s + c.quantity, 0),
    Fruits: 210 + completedClaims.filter(c => c.category === 'Fruits').reduce((s, c) => s + c.quantity, 0),
    Desserts: 190 + completedClaims.filter(c => c.category === 'Desserts').reduce((s, c) => s + c.quantity, 0),
    Other: 120 + completedClaims.filter(c => c.category === 'Other').reduce((s, c) => s + c.quantity, 0)
  };

  // Monthly trend data
  const monthlyTrend = [
    { month: 'May', meals: 280, saved: 9800 },
    { month: 'Jun', meals: 340, saved: 11900 },
    { month: 'Jul', meals: 420, saved: 14700 },
    { month: 'Aug', meals: 510, saved: 18200 },
    { month: 'Sep', meals: 640, saved: 22800 },
    { month: 'Oct', meals: totalMeals - (280 + 340 + 420 + 510 + 640), saved: totalSaved - (9800 + 11900 + 14700 + 18200 + 22800) }
  ];

  return res.json({
    total_meals_saved: totalMeals,
    total_money_saved: totalSaved,
    total_food_rescued_kg: totalRescuedKg,
    total_claims_completed: totalClaims,
    total_providers: db.users.filter(u => u.role === 'PROVIDER').length + 8, // platform partner providers
    total_users: db.users.length + 1240,
    rescue_value: {
      original_food_value: totalOriginalValue,
      foodloop_sales: totalSales,
      users_saved: totalSaved
    },
    category_distribution: categoryCounts,
    monthly_trend: monthlyTrend
  });
});
