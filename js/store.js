/**
 * KUTIR MART - Central Data Store & State Management
 * Handles localStorage persistence, seed data, user authentication, and event notifications.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'kutir_mart_products',
  CATEGORIES: 'kutir_mart_categories',
  CART: 'kutir_mart_cart',
  WISHLIST: 'kutir_mart_wishlist',
  ORDERS: 'kutir_mart_orders',
  COUPONS: 'kutir_mart_coupons',
  USER: 'kutir_mart_user',
  REVIEWS: 'kutir_mart_reviews',
  AUTH_USER: 'kutir_mart_auth_user',
  ALL_USERS: 'kutir_mart_all_users'
};

// Default Initial Seed Data
const DEFAULT_PRODUCTS = [
  {
    id: 'km-p1',
    title: 'HomePod mini Smart Speaker',
    price: 239.00,
    originalPrice: 299.00,
    category: 'Tech',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80',
    description: 'Room-filling sound, intelligent assistant, smart home control, and built-in privacy protection.',
    specs: ['Deep Bass & Crisp Highs', 'Siri Voice Control', 'Intercom System', 'Compact 3.3-inch Design'],
    rating: 4.8,
    reviewsCount: 124,
    stock: 28,
    isDeal: true,
    isPopular: true,
    tag: 'Best Seller'
  },
  {
    id: 'km-p2',
    title: 'Instax Mini 9 Instant Camera',
    price: 99.00,
    originalPrice: 129.00,
    category: 'Tech',
    brand: 'Fujifilm',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    description: 'Selfie mode and selfie mirror, macro lens attachment for close-ups, and automatic exposure measurement.',
    specs: ['Built-in Flash', 'Selfie Mirror', 'Close-Up Lens Attachment', 'Automatic Light Adjuster'],
    rating: 4.7,
    reviewsCount: 89,
    stock: 15,
    isDeal: true,
    isPopular: true,
    tag: 'Trending'
  },
  {
    id: 'km-p3',
    title: 'Base Camp Duffel M - Olive',
    price: 159.00,
    originalPrice: 199.00,
    category: 'Travel',
    brand: 'The North Face',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    description: 'Legendary rugged duffel bag constructed from water-resistant ballistic nylon with reinforced stitching.',
    specs: ['71 Liters Capacity', 'Ergonomic Alpine Straps', 'Heavy Duty Weatherproof', 'ID Pocket on Top'],
    rating: 4.9,
    reviewsCount: 215,
    stock: 9,
    isDeal: true,
    isPopular: true,
    tag: 'Featured'
  },
  {
    id: 'km-p4',
    title: 'Handcrafted Minimalist Tote Medium',
    price: 239.00,
    originalPrice: 280.00,
    category: 'Hand Bag',
    brand: 'Kutir Crafts',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
    description: 'Artisanal organic canvas paired with full-grain vegetable tanned leather trims. Built to last a lifetime.',
    specs: ['100% Organic Canvas', 'Brass Hardware', 'Interior Laptop Sleeve', 'Hand-stitched in Bangladesh'],
    rating: 4.9,
    reviewsCount: 64,
    stock: 12,
    isDeal: true,
    isPopular: false,
    tag: 'Eco Friendly'
  },
  {
    id: 'km-p5',
    title: 'Pro Wireless ANC Headphones',
    price: 199.00,
    originalPrice: 249.00,
    category: 'Tech',
    brand: 'Beats',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'High-performance wireless noise cancelling headphones with up to 40 hours of battery life.',
    specs: ['Active Noise Cancellation', 'Spatial Audio Support', 'Fast Fuel 5-min Charge', 'Plush Memory Foam'],
    rating: 4.6,
    reviewsCount: 340,
    stock: 22,
    isDeal: true,
    isPopular: true,
    tag: '50% Off'
  },
  {
    id: 'km-p6',
    title: 'Artisan Solid Teak Accent Armchair',
    price: 450.00,
    originalPrice: 550.00,
    category: 'Furniture',
    brand: 'Kutir Heritage',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional joinery handcrafted from sustainably harvested teak wood with natural cane woven backrest.',
    specs: ['Solid Plantation Teak', 'Hand-woven Natural Rattan', 'Water-based Matt Finish', 'Weight Cap: 150kg'],
    rating: 4.9,
    reviewsCount: 42,
    stock: 4,
    isDeal: false,
    isPopular: true,
    tag: 'Handcrafted'
  },
  {
    id: 'km-p7',
    title: 'AirPods Max High-Fidelity Audio',
    price: 549.00,
    originalPrice: 599.00,
    category: 'Tech',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    description: 'Computational audio combines custom acoustic design with Apple H1 chips and cutting-edge software.',
    specs: ['Custom Acoustic Drivers', 'Transparency Mode', 'Knit-mesh Canopy Band', 'Dynamic Head Tracking'],
    rating: 4.9,
    reviewsCount: 180,
    stock: 14,
    isDeal: true,
    isPopular: true,
    tag: 'Top Rated'
  },
  {
    id: 'km-p8',
    title: 'Retro Classic Court Sneakers',
    price: 110.00,
    originalPrice: 145.00,
    category: 'Sneakers',
    brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    description: 'Timeless silhouette reimagined with modern cloudfoam cushioning and premium leather uppers.',
    specs: ['Full Leather Upper', 'OrthoLite Sockliner', 'Non-slip Rubber Outsole', 'Heritage Design'],
    rating: 4.7,
    reviewsCount: 95,
    stock: 30,
    isDeal: false,
    isPopular: true,
    tag: 'Trending'
  },
  {
    id: 'km-p9',
    title: 'Hardcover Editorial Architecture Book',
    price: 45.00,
    originalPrice: 60.00,
    category: 'Books',
    brand: 'Penguin',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    description: 'A breathtaking retrospective of modern South Asian vernacular design, photography, and sustainable dwellings.',
    specs: ['320 Color Pages', 'Linen Hardcover Binding', 'Archival Quality Paper', 'Author Signed Edition'],
    rating: 4.8,
    reviewsCount: 38,
    stock: 50,
    isDeal: false,
    isPopular: false,
    tag: 'Bestseller'
  },
  {
    id: 'km-p10',
    title: 'Insulated Stainless Explorer Flask',
    price: 38.00,
    originalPrice: 48.00,
    category: 'Travel',
    brand: 'Kutir Mart',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    description: 'Double-wall vacuum insulation keeps beverages iced for 24 hours or piping hot for 12 hours.',
    specs: ['18/8 Food Grade Steel', 'Leakproof Flex Cap', 'BPA-Free & Phthalate-Free', '750ml Volume'],
    rating: 4.8,
    reviewsCount: 112,
    stock: 45,
    isDeal: true,
    isPopular: true,
    tag: 'Daily Pick'
  },
  {
    id: 'km-p11',
    title: 'Sculpted Ceramic Coffee Pour-Over Set',
    price: 65.00,
    originalPrice: 85.00,
    category: 'Furniture',
    brand: 'Kutir Crafts',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Hand-thrown stoneware dripper with matching carafe in a speckled sand glaze finish.',
    specs: ['Lead-free Ceramic', 'Dishwasher Safe', 'Heat Retentive Wall', 'Includes 50 Filter Sheets'],
    rating: 4.9,
    reviewsCount: 52,
    stock: 18,
    isDeal: false,
    isPopular: true,
    tag: 'Artisan'
  },
  {
    id: 'km-p12',
    title: 'Leather Chronograph Heritage Watch',
    price: 185.00,
    originalPrice: 240.00,
    category: 'Tech',
    brand: 'Tomford',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80',
    description: 'Sapphire crystal glass dial with genuine horween leather strap and Japanese quartz movement.',
    specs: ['5 ATM Water Resistance', 'Horween Leather Strap', '42mm Case Diameter', 'Luminous Hands'],
    rating: 4.8,
    reviewsCount: 77,
    stock: 8,
    isDeal: true,
    isPopular: true,
    tag: 'Limited'
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-furniture', name: 'Furniture', icon: 'fa-couch', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80', count: 240 },
  { id: 'cat-handbag', name: 'Hand Bag', icon: 'fa-bag-shopping', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80', count: 180 },
  { id: 'cat-books', name: 'Books', icon: 'fa-book-open', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80', count: 320 },
  { id: 'cat-tech', name: 'Tech', icon: 'fa-laptop', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', count: 410 },
  { id: 'cat-sneakers', name: 'Sneakers', icon: 'fa-shoe-prints', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', count: 195 },
  { id: 'cat-travel', name: 'Travel', icon: 'fa-plane-departure', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80', count: 145 }
];

const DEFAULT_COUPONS = [
  { code: 'KUTIR50', type: 'percentage', value: 50, minSpend: 150, maxDiscount: 100, active: true, desc: '50% Off orders over $150 (Max $100)' },
  { code: 'MUSE20', type: 'percentage', value: 20, minSpend: 50, maxDiscount: 50, active: true, desc: '20% Off your favorite items' },
  { code: 'SAVE15', type: 'fixed', value: 15, minSpend: 60, maxDiscount: 15, active: true, desc: '$15 Flat discount on orders above $60' }
];

// Seed Users for Authentication (Customer & Admin)
const DEFAULT_REGISTERED_USERS = [
  {
    id: 'usr-1',
    name: 'Jerry',
    email: 'jerry@kutirmart.com',
    phone: '+880 1712-345678',
    password: 'password123',
    role: 'customer',
    avatar: 'assets/jerry.png',
    addresses: [
      {
        id: 'addr-1',
        title: 'Home',
        isDefault: true,
        fullName: 'Jerry',
        phone: '+880 1712-345678',
        street: 'House 42, Road 11, Block D, Banani',
        city: 'Dhaka',
        postalCode: '1213',
        country: 'Bangladesh'
      }
    ]
  },
  {
    id: 'usr-admin',
    name: 'Kutir Store Admin',
    email: 'admin@kutirmart.com',
    phone: '+880 1700-112233',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    addresses: []
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'KM-8841',
    date: '2026-09-02T14:30:00Z',
    customerName: 'Jerry',
    email: 'jerry@kutirmart.com',
    phone: '+880 1712-345678',
    shippingAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    items: [
      { id: 'km-p1', title: 'HomePod mini Smart Speaker', price: 239.00, quantity: 1, image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80' },
      { id: 'km-p10', title: 'Insulated Stainless Explorer Flask', price: 38.00, quantity: 2, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' }
    ],
    subtotal: 315.00,
    discount: 50.00,
    shippingFee: 0.00,
    total: 265.00,
    paymentMethod: 'bKash Online',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    trackingSteps: [
      { step: 'Order Placed', time: 'Sep 02, 02:30 PM', done: true },
      { step: 'Processing', time: 'Sep 02, 05:15 PM', done: true },
      { step: 'Shipped', time: 'Sep 03, 10:00 AM', done: true },
      { step: 'Out for Delivery', time: 'Sep 05, 08:30 AM', done: false },
      { step: 'Delivered', time: 'Estimated Sep 06', done: false }
    ]
  },
  {
    id: 'KM-8840',
    date: '2026-08-28T09:15:00Z',
    customerName: 'Ayesha Siddika',
    email: 'ayesha.s@example.com',
    phone: '+880 1819-223344',
    shippingAddress: 'Dhanmondi 27, Dhaka',
    items: [
      { id: 'km-p4', title: 'Handcrafted Minimalist Tote Medium', price: 239.00, quantity: 1, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80' }
    ],
    subtotal: 239.00,
    discount: 0.00,
    shippingFee: 15.00,
    total: 254.00,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    trackingSteps: [
      { step: 'Order Placed', time: 'Aug 28, 09:15 AM', done: true },
      { step: 'Processing', time: 'Aug 28, 11:00 AM', done: true },
      { step: 'Shipped', time: 'Aug 29, 02:00 PM', done: true },
      { step: 'Out for Delivery', time: 'Aug 30, 09:30 AM', done: true },
      { step: 'Delivered', time: 'Aug 30, 03:45 PM', done: true }
    ]
  }
];

class KutirStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.save(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.save(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
      this.save(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.save(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      this.save(STORAGE_KEYS.CART, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      this.save(STORAGE_KEYS.WISHLIST, ['km-p1', 'km-p4']);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      this.save(STORAGE_KEYS.ALL_USERS, DEFAULT_REGISTERED_USERS);
    }
    // Set default logged in user to Jerry for immediate convenience
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_USER)) {
      this.save(STORAGE_KEYS.AUTH_USER, DEFAULT_REGISTERED_USERS[0]);
    }
    // Auto-migrate previous session if named Tanvir to Jerry
    try {
      const authUser = this.getCurrentUser();
      if (authUser && (authUser.name === 'Tanvir Hossain' || authUser.email === 'tanvir@kutirmart.com')) {
        authUser.name = 'Jerry';
        authUser.email = 'jerry@kutirmart.com';
        authUser.avatar = 'assets/jerry.png';
        if (authUser.addresses && authUser.addresses[0]) {
          authUser.addresses[0].fullName = 'Jerry';
        }
        this.save(STORAGE_KEYS.AUTH_USER, authUser);
      }
      const allUsers = this.getAllUsers();
      let updated = false;
      allUsers.forEach(u => {
        if (u.name === 'Tanvir Hossain' || u.email === 'tanvir@kutirmart.com') {
          u.name = 'Jerry';
          u.email = 'jerry@kutirmart.com';
          u.avatar = 'assets/jerry.png';
          if (u.addresses && u.addresses[0]) {
            u.addresses[0].fullName = 'Jerry';
          }
          updated = true;
        }
      });
      if (updated) {
        this.save(STORAGE_KEYS.ALL_USERS, allUsers);
      }
    } catch(err) {
      console.warn('Migration error', err);
    }

  }

  get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Error reading localStorage key:', key, e);
      return defaultValue;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      window.dispatchEvent(new CustomEvent('kutir:store_updated', { detail: { key, val } }));
    } catch (e) {
      console.error('Error saving to localStorage:', key, e);
    }
  }

  // ================= AUTHENTICATION METHODS =================
  getAllUsers() {
    return this.get(STORAGE_KEYS.ALL_USERS, DEFAULT_REGISTERED_USERS);
  }

  getCurrentUser() {
    return this.get(STORAGE_KEYS.AUTH_USER, null);
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  login(identifier, password) {
    const users = this.getAllUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    
    const matched = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')) &&
      u.password === password
    );

    if (!matched) {
      return { success: false, message: 'Invalid email/phone or password. Please check your credentials.' };
    }

    // Save session
    this.save(STORAGE_KEYS.AUTH_USER, matched);
    return { success: true, user: matched };
  }

  register(userData) {
    const users = this.getAllUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanPhone = (userData.phone || '').trim();

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password,
      role: userData.role || 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      addresses: userData.address ? [{
        id: 'addr-' + Date.now(),
        title: 'Home',
        isDefault: true,
        fullName: userData.name.trim(),
        phone: cleanPhone,
        street: userData.address,
        city: userData.city || 'Dhaka',
        postalCode: '1212',
        country: 'Bangladesh'
      }] : []
    };

    users.push(newUser);
    this.save(STORAGE_KEYS.ALL_USERS, users);
    
    // Auto-login
    this.save(STORAGE_KEYS.AUTH_USER, newUser);

    return { success: true, user: newUser };
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    window.dispatchEvent(new CustomEvent('kutir:store_updated', { detail: { key: STORAGE_KEYS.AUTH_USER, val: null } }));
  }

  // --- Products ---
  getProducts() {
    return this.get(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  saveProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      product.id = 'km-p' + Date.now();
      products.unshift(product);
    }
    this.save(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, products);
  }

  // --- Categories ---
  getCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  saveCategory(cat) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === cat.id);
    if (index >= 0) {
      categories[index] = cat;
    } else {
      cat.id = 'cat-' + Date.now();
      categories.push(cat);
    }
    this.save(STORAGE_KEYS.CATEGORIES, categories);
    return cat;
  }

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CATEGORIES, categories);
  }

  // --- Cart ---
  getCart() {
    return this.get(STORAGE_KEYS.CART, []);
  }

  addToCart(productId, qty = 1, options = {}) {
    const cart = this.getCart();
    const product = this.getProductById(productId);
    if (!product) return false;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        productId,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: qty,
        ...options
      });
    }
    this.save(STORAGE_KEYS.CART, cart);
    return true;
  }

  updateCartQty(productId, qty) {
    let cart = this.getCart();
    if (qty <= 0) {
      cart = cart.filter(i => i.productId !== productId);
    } else {
      const item = cart.find(i => i.productId === productId);
      if (item) item.quantity = qty;
    }
    this.save(STORAGE_KEYS.CART, cart);
  }

  removeFromCart(productId) {
    const cart = this.getCart().filter(i => i.productId !== productId);
    this.save(STORAGE_KEYS.CART, cart);
  }

  clearCart() {
    this.save(STORAGE_KEYS.CART, []);
  }

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((cnt, item) => cnt + item.quantity, 0);
  }

  // --- Wishlist ---
  getWishlist() {
    return this.get(STORAGE_KEYS.WISHLIST, []);
  }

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const exists = wishlist.includes(productId);
    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    this.save(STORAGE_KEYS.WISHLIST, wishlist);
    return !exists;
  }

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  }

  // --- Coupons ---
  getCoupons() {
    return this.get(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
  }

  saveCoupon(coupon) {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    this.save(STORAGE_KEYS.COUPONS, coupons);
  }

  deleteCoupon(code) {
    const coupons = this.getCoupons().filter(c => c.code.toUpperCase() !== code.toUpperCase());
    this.save(STORAGE_KEYS.COUPONS, coupons);
  }

  validateCoupon(code, subtotal) {
    if (!code) return { valid: false, message: 'Please enter a coupon code' };
    const coupons = this.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { valid: false, message: 'Invalid coupon code' };
    }
    if (!found.active) {
      return { valid: false, message: 'This coupon is no longer active' };
    }
    if (subtotal < (found.minSpend || 0)) {
      return { valid: false, message: 'Minimum order amount of $' + found.minSpend + ' required' };
    }

    let discount = 0;
    if (found.type === 'percentage') {
      discount = (subtotal * found.value) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.value;
    }

    return {
      valid: true,
      discount: Math.min(discount, subtotal),
      code: found.code,
      desc: found.desc
    };
  }

  // --- Orders ---
  getOrders() {
    return this.get(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  }

  getOrderById(id) {
    return this.getOrders().find(o => o.id.toUpperCase() === id.trim().toUpperCase());
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const orderNumber = 'KM-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    
    const newOrder = {
      id: orderNumber,
      date: now.toISOString(),
      customerName: orderData.customerName || 'Valued Customer',
      email: orderData.email || 'customer@example.com',
      phone: orderData.phone || '+880 1700-000000',
      shippingAddress: orderData.shippingAddress,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      shippingFee: orderData.shippingFee || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      paymentStatus: orderData.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
      trackingSteps: [
        { step: 'Order Placed', time: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), done: true },
        { step: 'Processing', time: 'Pending', done: false },
        { step: 'Shipped', time: 'Pending', done: false },
        { step: 'Out for Delivery', time: 'Pending', done: false },
        { step: 'Delivered', time: 'Pending', done: false }
      ]
    };

    orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, orders);

    // Deduct stock
    const products = this.getProducts();
    orderData.items.forEach(item => {
      const prod = products.find(p => p.id === item.id || p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    this.save(STORAGE_KEYS.PRODUCTS, products);

    // Empty Cart
    this.clearCart();

    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    order.orderStatus = status;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const stepOrder = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const currentIdx = stepOrder.indexOf(status);

    if (order.trackingSteps) {
      order.trackingSteps.forEach((s, idx) => {
        if (idx <= currentIdx) {
          s.done = true;
          if (s.time === 'Pending' || !s.time) s.time = nowStr;
        } else {
          s.done = false;
        }
      });
    }

    this.save(STORAGE_KEYS.ORDERS, orders);
    return true;
  }

  // --- Current User Profile & Addresses ---
  getUser() {
    const authUser = this.getCurrentUser();
    if (authUser) return authUser;
    return DEFAULT_REGISTERED_USERS[0];
  }

  saveUser(userData) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === userData.id);
    if (idx >= 0) {
      users[idx] = userData;
      this.save(STORAGE_KEYS.ALL_USERS, users);
    }
    this.save(STORAGE_KEYS.AUTH_USER, userData);
  }

  addAddress(address) {
    const user = this.getUser();
    if (!user.addresses) user.addresses = [];
    address.id = 'addr-' + Date.now();
    if (address.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => a.isDefault = false);
      address.isDefault = true;
    }
    user.addresses.push(address);
    this.saveUser(user);
    return address;
  }

  deleteAddress(id) {
    const user = this.getUser();
    if (!user.addresses) return;
    user.addresses = user.addresses.filter(a => a.id !== id);
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    this.saveUser(user);
  }

  resetDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.ALL_USERS);
    this.init();
    window.location.reload();
  }
}

window.kutirStore = new KutirStore();
