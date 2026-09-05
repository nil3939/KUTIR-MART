/**
 * KUTIR MART - Main Customer UI Controller
 * Powers Search, Filter, Sort, Cart Drawer, Quick View, Category navigations, and Auth status.
 */

class KutirApp {
  constructor() {
    this.currentCategory = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.quickViewProduct = null;
    this.quickViewQty = 1;
  }

  init() {
    this.bindEvents();
    this.renderHeaderCategories();
    this.renderTopCategories();
    this.renderDealsSlider();
    this.renderPopularProducts();
    this.renderBrandGrid();
    this.updateBadges();
    this.renderAuthHeader();

    // Listen to store updates
    window.addEventListener('kutir:store_updated', () => {
      this.updateBadges();
      this.renderDealsSlider();
      this.renderPopularProducts();
      this.renderCartDrawer();
      this.renderAuthHeader();
    });

    console.log('Kutir Mart Customer Engine initialized.');
  }

  bindEvents() {
    // Search input autocomplete
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results-dropdown');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value.trim());
      });

      // Close dropdown on outside click
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
          searchResults.classList.add('hidden');
        }
      });
    }

    // Swiper slider for Todays Best Deals
    setTimeout(() => {
      if (typeof Swiper !== 'undefined' && document.querySelector('.deals-swiper')) {
        new Swiper('.deals-swiper', {
          slidesPerView: 1.2,
          spaceBetween: 20,
          grabCursor: true,
          pagination: {
            el: '.deals-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.deals-next',
            prevEl: '.deals-prev'
          },
          breakpoints: {
            640: { slidesPerView: 2.2, spaceBetween: 20 },
            1024: { slidesPerView: 3.5, spaceBetween: 24 },
            1280: { slidesPerView: 4.2, spaceBetween: 24 }
          }
        });
      }
    }, 200);
  }

  // --- Auth State in Header ---
  renderAuthHeader() {
    const container = document.getElementById('header-auth-container');
    if (!container) return;

    const user = window.kutirStore.getCurrentUser();

    if (user) {
      container.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition text-kutir-charcoal">
            <img src="${user.avatar || 'assets/jerry.png'}" class="w-8 h-8 rounded-full object-cover border border-gray-200" />
            <div class="hidden xl:block text-left">
              <span class="text-[10px] text-gray-400 block leading-none">Hello,</span>
              <span class="text-xs font-bold text-kutir-charcoal truncate block max-w-[100px] leading-tight">${user.name.split(' ')[0]}</span>
            </div>
            <i class="fa-solid fa-chevron-down text-[9px] text-gray-400"></i>
          </button>

          <!-- Dropdown Menu -->
          <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 hidden group-hover:block transition">
            <div class="px-4 py-2.5 border-b border-gray-100">
              <p class="text-xs font-bold text-gray-800">${user.name}</p>
              <p class="text-[11px] text-gray-400 truncate">${user.email}</p>
              <span class="inline-block mt-1 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-kutir-mint text-kutir-green'}">${user.role}</span>
            </div>

            <a href="javascript:void(0)" onclick="window.kutirAccount.open('orders')" class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <i class="fa-solid fa-box text-gray-400 w-4"></i> My Orders
            </a>
            <a href="javascript:void(0)" onclick="window.kutirAccount.open('profile')" class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <i class="fa-regular fa-user text-gray-400 w-4"></i> Account Profile
            </a>
            <a href="javascript:void(0)" onclick="window.kutirAccount.open('addresses')" class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <i class="fa-solid fa-map-location-dot text-gray-400 w-4"></i> Delivery Addresses
            </a>

            ${user.role === 'admin' ? `
              <div class="border-t border-gray-100 my-1"></div>
              <a href="admin.html" class="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-kutir-green hover:bg-kutir-mint/30">
                <i class="fa-solid fa-gauge-high text-kutir-green w-4"></i> Admin Console
              </a>
            ` : ''}

            <div class="border-t border-gray-100 my-1"></div>
            <button onclick="window.kutirApp.handleSignOut()" class="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <i class="fa-solid fa-arrow-right-from-bracket text-rose-500 w-4"></i> Sign Out
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <a href="auth.html?mode=signin" class="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-kutir-green text-xs font-bold text-kutir-charcoal hover:text-kutir-green transition bg-white shadow-2xs">
          <i class="fa-regular fa-user text-xs"></i>
          <span>Sign In</span>
        </a>
      `;
    }
  }

  handleSignOut() {
    window.kutirStore.logout();
    this.showToast('You have been signed out.', 'info');
    this.renderAuthHeader();
  }

  // --- Badges ---
  updateBadges() {
    const cartCount = window.kutirStore.getCartCount();
    const wishlist = window.kutirStore.getWishlist();

    const cartBadge = document.getElementById('cart-badge-count');
    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.classList.toggle('hidden', cartCount === 0);
    }

    const wishBadge = document.getElementById('wishlist-badge-count');
    if (wishBadge) {
      wishBadge.textContent = wishlist.length;
      wishBadge.classList.toggle('hidden', wishlist.length === 0);
    }
  }

  // --- Search Autocomplete ---
  handleSearchInput(query) {
    const dropdown = document.getElementById('search-results-dropdown');
    const list = document.getElementById('search-results-list');
    if (!dropdown || !list) return;

    if (!query) {
      dropdown.classList.add('hidden');
      return;
    }

    const products = window.kutirStore.getProducts();
    const q = query.toLowerCase();
    const matched = products.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );

    if (matched.length === 0) {
      list.innerHTML = `
        <div class="p-4 text-center text-xs text-gray-500">
          No products found for "<span class="font-bold text-gray-800">${query}</span>"
        </div>
      `;
    } else {
      list.innerHTML = matched.slice(0, 5).map(p => `
        <div onclick="window.kutirApp.openQuickView('${p.id}'); document.getElementById('search-results-dropdown').classList.add('hidden');" class="flex items-center gap-3 p-3 hover:bg-[#d2f7ec]/20 cursor-pointer transition border-b border-gray-100 last:border-0">
          <img src="${p.image}" class="w-12 h-12 object-cover rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-semibold text-[#231f1e] truncate">${p.title}</h5>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[11px] text-amber-500 flex items-center gap-1"><i class="fa-solid fa-star"></i> ${p.rating}</span>
              <span class="text-[11px] text-gray-400 font-medium">(${p.reviewsCount})</span>
              <span class="text-[11px] font-bold text-[#003d29] ml-auto">$${p.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    dropdown.classList.remove('hidden');
  }

  // --- Categories Rendering ---
  renderHeaderCategories() {
    const categories = window.kutirStore.getCategories();
    const container = document.getElementById('mega-menu-categories');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
      <div onclick="window.kutirApp.filterByCategory('${cat.name}')" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#d2f7ec]/30 cursor-pointer transition group">
        <img src="${cat.image}" class="w-11 h-11 object-cover rounded-xl group-hover:scale-105 transition" />
        <div>
          <h4 class="font-semibold text-xs text-[#231f1e] group-hover:text-[#003d29]">${cat.name}</h4>
          <span class="text-[11px] text-gray-400">${cat.count} Items Available</span>
        </div>
      </div>
    `).join('');
  }

  renderTopCategories() {
    const categories = window.kutirStore.getCategories();
    const container = document.getElementById('top-categories-wrap');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
      <div onclick="window.kutirApp.filterByCategory('${cat.name}')" class="category-pill-card p-4 rounded-3xl cursor-pointer text-center group border border-gray-100">
        <div class="w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-3 bg-white p-2 shadow-xs">
          <img src="${cat.image}" class="w-full h-full object-cover rounded-xl" />
        </div>
        <h3 class="font-bold text-sm text-[#231f1e] group-hover:text-[#003d29] transition">${cat.name}</h3>
        <p class="text-[11px] text-gray-400 mt-0.5">${cat.count} Items</p>
      </div>
    `).join('');
  }

  // --- Deals Slider ---
  renderDealsSlider() {
    const container = document.getElementById('deals-slider-wrapper');
    if (!container) return;

    const products = window.kutirStore.getProducts().filter(p => p.isDeal);
    const wishlist = window.kutirStore.getWishlist();

    container.innerHTML = products.map(product => {
      const inWish = wishlist.includes(product.id);
      return `
        <div class="swiper-slide h-auto">
          <div class="product-card h-full flex flex-col justify-between border border-gray-200/80 rounded-3xl p-4 bg-white shadow-xs">
            <div class="product-image-wrap aspect-square w-full mb-3 flex items-center justify-center p-3 relative">
              <span class="absolute top-3 left-3 bg-[#ff9900] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-xs">
                ${product.tag || 'Save 20%'}
              </span>
              <button onclick="event.stopPropagation(); window.kutirApp.toggleWishlist('${product.id}')" class="wishlist-heart-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center z-10 ${inWish ? 'active' : 'text-gray-400'}">
                <i class="${inWish ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-sm"></i>
              </button>
              <img src="${product.image}" onclick="window.kutirApp.openQuickView('${product.id}')" class="w-full h-full object-cover rounded-2xl cursor-pointer" alt="${product.title}" />
            </div>

            <div class="flex-1 flex flex-col">
              <div class="flex items-baseline justify-between mb-1">
                <h4 onclick="window.kutirApp.openQuickView('${product.id}')" class="font-bold text-sm text-[#231f1e] hover:text-[#003d29] cursor-pointer line-clamp-1">${product.title}</h4>
                <span class="font-extrabold text-sm text-[#003d29] ml-2">$${product.price.toFixed(2)}</span>
              </div>
              <p class="text-xs text-gray-500 line-clamp-1 mb-2">${product.description}</p>
              
              <div class="flex items-center gap-1.5 mb-3 mt-auto">
                <div class="flex text-amber-400 text-xs">
                  ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(product.rating))}
                </div>
                <span class="text-xs text-gray-400 font-medium">(${product.reviewsCount})</span>
              </div>

              <button onclick="window.kutirApp.addToCart('${product.id}')" class="w-full py-2.5 px-4 rounded-full border border-[#231f1e] text-[#231f1e] hover:bg-[#003d29] hover:border-[#003d29] hover:text-white transition font-semibold text-xs flex items-center justify-center gap-2">
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Popular Products Grid & Filters ---
  filterByCategory(catName) {
    this.currentCategory = catName.toLowerCase();
    
    // Update active tab button
    const tabs = document.querySelectorAll('.category-filter-tab');
    tabs.forEach(tab => {
      if (tab.dataset.category.toLowerCase() === this.currentCategory) {
        tab.className = 'category-filter-tab px-4 py-2 rounded-full font-semibold text-xs bg-[#003d29] text-white transition';
      } else {
        tab.className = 'category-filter-tab px-4 py-2 rounded-full font-medium text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition';
      }
    });

    this.renderPopularProducts();

    // Scroll smoothly to popular products
    const section = document.getElementById('popular-products-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderPopularProducts() {
    const container = document.getElementById('popular-products-grid');
    if (!container) return;

    let products = window.kutirStore.getProducts();
    const wishlist = window.kutirStore.getWishlist();

    // Filter
    if (this.currentCategory !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === this.currentCategory);
    }

    // Sort
    const sortSelect = document.getElementById('popular-sort-select');
    if (sortSelect) this.currentSort = sortSelect.value;

    if (this.currentSort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400">
          <p class="text-base font-semibold">No products found in this category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const inWish = wishlist.includes(product.id);
      return `
        <div class="product-card flex flex-col justify-between border border-gray-200 rounded-3xl p-4 bg-white shadow-xs">
          <div class="product-image-wrap aspect-square w-full mb-3 flex items-center justify-center p-3 relative">
            ${product.tag ? `
              <span class="absolute top-3 left-3 bg-[#003d29] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-xs">
                ${product.tag}
              </span>
            ` : ''}
            <button onclick="event.stopPropagation(); window.kutirApp.toggleWishlist('${product.id}')" class="wishlist-heart-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center z-10 ${inWish ? 'active' : 'text-gray-400'}">
              <i class="${inWish ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-sm"></i>
            </button>
            <img src="${product.image}" onclick="window.kutirApp.openQuickView('${product.id}')" class="w-full h-full object-cover rounded-2xl cursor-pointer" alt="${product.title}" />
          </div>

          <div class="flex-1 flex flex-col">
            <div class="flex items-baseline justify-between mb-1">
              <h4 onclick="window.kutirApp.openQuickView('${product.id}')" class="font-bold text-sm text-[#231f1e] hover:text-[#003d29] cursor-pointer line-clamp-1">${product.title}</h4>
              <span class="font-extrabold text-sm text-[#003d29] ml-2">$${product.price.toFixed(2)}</span>
            </div>
            <p class="text-xs text-gray-500 line-clamp-1 mb-2">${product.description}</p>
            
            <div class="flex items-center gap-1.5 mb-3 mt-auto">
              <div class="flex text-amber-400 text-xs">
                ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(product.rating))}
              </div>
              <span class="text-xs text-gray-400 font-medium">(${product.reviewsCount})</span>
            </div>

            <button onclick="window.kutirApp.addToCart('${product.id}')" class="w-full py-2.5 px-4 rounded-full border border-[#231f1e] text-[#231f1e] hover:bg-[#003d29] hover:border-[#003d29] hover:text-white transition font-semibold text-xs flex items-center justify-center gap-2">
              <i class="fa-solid fa-cart-shopping text-xs"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderBrandGrid() {
    const brands = [
      { name: 'Staples', sub: 'Office & Living', icon: 'fa-briefcase' },
      { name: 'Sprouts', sub: 'Organic Green', icon: 'fa-seedling' },
      { name: 'Grocery Outlet', sub: 'Daily Essentials', icon: 'fa-basket-shopping' },
      { name: 'Mollie Stones', sub: 'Handmade Treats', icon: 'fa-store' },
      { name: 'Sports Basement', sub: 'Outdoor Gear', icon: 'fa-mountain' },
      { name: 'Container Store', sub: 'Home Storage', icon: 'fa-boxes-stacked' },
      { name: 'Target Studio', sub: 'Curated Goods', icon: 'fa-bullseye' },
      { name: 'Bevmo Fresh', sub: 'Pure Beverages', icon: 'fa-mug-hot' }
    ];

    const container = document.getElementById('brand-grid-wrap');
    if (!container) return;

    container.innerHTML = brands.map(b => `
      <div onclick="window.kutirApp.filterByCategory('all')" class="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#003d29] hover:shadow-sm cursor-pointer transition group">
        <div class="w-11 h-11 rounded-xl bg-[#f5f6f6] flex items-center justify-center text-[#003d29] text-base group-hover:bg-[#003d29] group-hover:text-white transition">
          <i class="fa-solid ${b.icon}"></i>
        </div>
        <div>
          <h5 class="text-xs font-bold text-[#231f1e] group-hover:text-[#003d29] transition">${b.name}</h5>
          <span class="text-[11px] text-gray-400 font-medium">Delivery with 1 Hour</span>
        </div>
      </div>
    `).join('');
  }

  // --- Cart Drawer ---
  openCart() {
    this.renderCartDrawer();
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('hidden');
      drawer.classList.remove('translate-x-full');
      document.body.classList.add('overflow-hidden');
    }
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      backdrop.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  renderCartDrawer() {
    const items = window.kutirStore.getCart();
    const container = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('cart-drawer-subtotal');
    const countEl = document.getElementById('cart-drawer-count');

    if (countEl) countEl.textContent = items.reduce((s, i) => s + i.quantity, 0);

    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
          <div class="w-20 h-20 bg-[#f5f6f6] rounded-full flex items-center justify-center text-gray-400 mb-4">
            <i class="fa-solid fa-cart-shopping text-3xl"></i>
          </div>
          <h4 class="text-base font-bold text-gray-800">Your cart is empty</h4>
          <p class="text-xs text-gray-500 mt-1 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
          <button onclick="window.kutirApp.closeCart()" class="mt-6 px-6 py-2.5 bg-[#003d29] text-white text-xs font-bold rounded-full hover:bg-black transition">Continue Shopping</button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="flex items-center gap-3 p-3 bg-[#f5f6f6]/60 rounded-2xl border border-gray-100 mb-2.5">
        <img src="${item.image}" class="w-16 h-16 object-cover rounded-xl bg-white border border-gray-200" />
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-[#231f1e] truncate">${item.title}</h5>
          <p class="text-[11px] text-gray-400 mt-0.5">${item.category}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-extrabold text-[#003d29]">$${(item.price * item.quantity).toFixed(2)}</span>
            <!-- Qty controls -->
            <div class="flex items-center border border-gray-300 rounded-full bg-white px-2 py-0.5">
              <button onclick="window.kutirStore.updateCartQty('${item.productId}', ${item.quantity - 1})" class="text-gray-500 hover:text-black px-1.5 text-xs font-bold">-</button>
              <span class="text-xs font-bold text-gray-800 px-2">${item.quantity}</span>
              <button onclick="window.kutirStore.updateCartQty('${item.productId}', ${item.quantity + 1})" class="text-gray-500 hover:text-black px-1.5 text-xs font-bold">+</button>
            </div>
          </div>
        </div>
        <button onclick="window.kutirStore.removeFromCart('${item.productId}')" class="p-1.5 text-gray-400 hover:text-red-500 text-xs self-start">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');

    const subtotal = window.kutirStore.getCartTotal();
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  addToCart(productId, qty = 1) {
    const success = window.kutirStore.addToCart(productId, qty);
    if (success) {
      this.showToast('Item added to cart!', 'success');
      this.openCart();
    }
  }

  toggleWishlist(productId) {
    const added = window.kutirStore.toggleWishlist(productId);
    this.showToast(added ? 'Saved to Wishlist!' : 'Removed from Wishlist', added ? 'success' : 'info');
    this.renderDealsSlider();
    this.renderPopularProducts();
    this.updateBadges();
  }

  // --- Quick View Modal ---
  openQuickView(productId) {
    const product = window.kutirStore.getProductById(productId);
    if (!product) return;

    this.quickViewProduct = product;
    this.quickViewQty = 1;

    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-title').textContent = product.title;
    document.getElementById('qv-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('qv-original-price').textContent = product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : '';
    document.getElementById('qv-category').textContent = product.category;
    document.getElementById('qv-brand').textContent = product.brand;
    document.getElementById('qv-desc').textContent = product.description;
    document.getElementById('qv-stock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock';
    document.getElementById('qv-qty-input').textContent = '1';

    // Specs list
    const specsList = document.getElementById('qv-specs-list');
    if (specsList && product.specs) {
      specsList.innerHTML = product.specs.map(s => `
        <li class="flex items-center gap-2 text-xs text-gray-600">
          <i class="fa-solid fa-circle-check text-[#003d29] text-[10px]"></i> ${s}
        </li>
      `).join('');
    }

    const modal = document.getElementById('quick-view-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  changeQuickViewQty(delta) {
    this.quickViewQty = Math.max(1, this.quickViewQty + delta);
    const el = document.getElementById('qv-qty-input');
    if (el) el.textContent = this.quickViewQty;
  }

  addQuickViewToCart() {
    if (!this.quickViewProduct) return;
    this.addToCart(this.quickViewProduct.id, this.quickViewQty);
    this.closeQuickView();
  }

  // --- Toast Notifications ---
  showToast(message, type = 'success') {
    const toast = document.getElementById('kutir-toast');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;

    if (type === 'success') {
      iconEl.className = 'fa-solid fa-circle-check text-emerald-500 text-lg';
    } else if (type === 'warning') {
      iconEl.className = 'fa-solid fa-triangle-exclamation text-amber-500 text-lg';
    } else {
      iconEl.className = 'fa-solid fa-circle-info text-[#003d29] text-lg';
    }

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3200);
  }
}

// Global App Instance
window.kutirApp = new KutirApp();
window.addEventListener('DOMContentLoaded', () => {
  window.kutirApp.init();
});
