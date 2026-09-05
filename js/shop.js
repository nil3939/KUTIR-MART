/**
 * KUTIR MART - Shop Page Controller
 * Handles Multi-facet detail filters (Categories, Price range, Brands, Rating, Stock, Search, Sort, View mode).
 */

class KutirShop {
  constructor() {
    this.filters = {
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 1000,
      brands: [],
      minRating: 0,
      inStockOnly: false,
      dealsOnly: false
    };
    this.sort = 'featured';
    this.viewMode = 'grid'; // 'grid' or 'list'
  }

  init() {
    // Parse URL params (e.g. ?category=tech or ?brand=apple or ?deal=true)
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) this.filters.category = params.get('category').toLowerCase();
    if (params.get('search')) this.filters.search = params.get('search').trim();
    if (params.get('deal') === 'true') this.filters.dealsOnly = true;

    this.renderCategoryFilters();
    this.renderBrandFilters();
    this.syncFilterUI();
    this.renderProducts();
    this.bindEvents();

    window.addEventListener('kutir:store_updated', () => {
      this.renderProducts();
    });
  }

  bindEvents() {
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim();
        this.renderProducts();
      });
    }

    const priceSlider = document.getElementById('shop-price-slider');
    const priceDisplay = document.getElementById('shop-price-display');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        this.filters.maxPrice = parseFloat(e.target.value);
        priceDisplay.textContent = `$${this.filters.maxPrice}`;
        this.renderProducts();
      });
    }

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sort = e.target.value;
        this.renderProducts();
      });
    }
  }

  syncFilterUI() {
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = this.filters.search;

    const priceSlider = document.getElementById('shop-price-slider');
    const priceDisplay = document.getElementById('shop-price-display');
    if (priceSlider && priceDisplay) {
      priceSlider.value = this.filters.maxPrice;
      priceDisplay.textContent = `$${this.filters.maxPrice}`;
    }
  }

  renderCategoryFilters() {
    const categories = window.kutirStore.getCategories();
    const products = window.kutirStore.getProducts();
    const container = document.getElementById('shop-categories-filter');
    if (!container) return;

    // Total count
    const totalCount = products.length;

    let html = `
      <label class="flex items-center justify-between text-xs py-1 cursor-pointer group">
        <div class="flex items-center gap-2">
          <input type="radio" name="shop-cat-filter" value="all" ${this.filters.category === 'all' ? 'checked' : ''} onchange="window.kutirShop.setCategory('all')" class="text-[#003d29] focus:ring-[#003d29]">
          <span class="text-gray-700 font-medium group-hover:text-[#003d29]">All Products</span>
        </div>
        <span class="text-gray-400 text-[11px]">(${totalCount})</span>
      </label>
    `;

    categories.forEach(cat => {
      const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
      const isChecked = this.filters.category.toLowerCase() === cat.name.toLowerCase();
      html += `
        <label class="flex items-center justify-between text-xs py-1 cursor-pointer group">
          <div class="flex items-center gap-2">
            <input type="radio" name="shop-cat-filter" value="${cat.name.toLowerCase()}" ${isChecked ? 'checked' : ''} onchange="window.kutirShop.setCategory('${cat.name.toLowerCase()}')" class="text-[#003d29] focus:ring-[#003d29]">
            <span class="text-gray-700 font-medium group-hover:text-[#003d29]">${cat.name}</span>
          </div>
          <span class="text-gray-400 text-[11px]">(${count})</span>
        </label>
      `;
    });

    container.innerHTML = html;
  }

  renderBrandFilters() {
    const products = window.kutirStore.getProducts();
    const container = document.getElementById('shop-brands-filter');
    if (!container) return;

    const brandCounts = {};
    products.forEach(p => {
      const b = p.brand || 'Other';
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    });

    container.innerHTML = Object.entries(brandCounts).map(([brand, count]) => {
      const isChecked = this.filters.brands.includes(brand);
      return `
        <label class="flex items-center justify-between text-xs py-1 cursor-pointer group">
          <div class="flex items-center gap-2">
            <input type="checkbox" value="${brand}" ${isChecked ? 'checked' : ''} onchange="window.kutirShop.toggleBrand('${brand}')" class="rounded text-[#003d29] focus:ring-[#003d29]">
            <span class="text-gray-700 font-medium group-hover:text-[#003d29]">${brand}</span>
          </div>
          <span class="text-gray-400 text-[11px]">(${count})</span>
        </label>
      `;
    }).join('');
  }

  setCategory(cat) {
    this.filters.category = cat;
    this.renderProducts();
  }

  toggleBrand(brand) {
    const idx = this.filters.brands.indexOf(brand);
    if (idx >= 0) this.filters.brands.splice(idx, 1);
    else this.filters.brands.push(brand);
    this.renderProducts();
  }

  setRatingFilter(rating) {
    this.filters.minRating = rating;
    this.renderProducts();
  }

  toggleStockOnly(e) {
    this.filters.inStockOnly = e.target.checked;
    this.renderProducts();
  }

  toggleDealsOnly(e) {
    this.filters.dealsOnly = e.target.checked;
    this.renderProducts();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const gridBtn = document.getElementById('view-mode-grid');
    const listBtn = document.getElementById('view-mode-list');
    if (gridBtn && listBtn) {
      if (mode === 'grid') {
        gridBtn.className = 'w-8 h-8 rounded-lg bg-[#003d29] text-white flex items-center justify-center text-xs';
        listBtn.className = 'w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xs';
      } else {
        listBtn.className = 'w-8 h-8 rounded-lg bg-[#003d29] text-white flex items-center justify-center text-xs';
        gridBtn.className = 'w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xs';
      }
    }
    this.renderProducts();
  }

  resetAllFilters() {
    this.filters = {
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: 1000,
      brands: [],
      minRating: 0,
      inStockOnly: false,
      dealsOnly: false
    };
    this.renderCategoryFilters();
    this.renderBrandFilters();
    this.syncFilterUI();
    const stockChk = document.getElementById('filter-in-stock');
    if (stockChk) stockChk.checked = false;
    const dealsChk = document.getElementById('filter-deals-only');
    if (dealsChk) dealsChk.checked = false;
    this.renderProducts();
  }

  renderActiveFilterChips() {
    const container = document.getElementById('active-filter-chips');
    if (!container) return;

    const chips = [];

    if (this.filters.search) {
      chips.push({ label: `Search: "${this.filters.search}"`, action: () => { this.filters.search = ''; this.syncFilterUI(); this.renderProducts(); } });
    }
    if (this.filters.category !== 'all') {
      chips.push({ label: `Category: ${this.filters.category}`, action: () => { this.setCategory('all'); this.renderCategoryFilters(); } });
    }
    if (this.filters.maxPrice < 1000) {
      chips.push({ label: `Max Price: $${this.filters.maxPrice}`, action: () => { this.filters.maxPrice = 1000; this.syncFilterUI(); this.renderProducts(); } });
    }
    this.filters.brands.forEach(b => {
      chips.push({ label: `Brand: ${b}`, action: () => { this.toggleBrand(b); this.renderBrandFilters(); } });
    });
    if (this.filters.minRating > 0) {
      chips.push({ label: `${this.filters.minRating}★ & above`, action: () => { this.setRatingFilter(0); } });
    }
    if (this.filters.inStockOnly) {
      chips.push({ label: 'In Stock Only', action: () => { this.filters.inStockOnly = false; document.getElementById('filter-in-stock').checked = false; this.renderProducts(); } });
    }
    if (this.filters.dealsOnly) {
      chips.push({ label: 'Deals Only', action: () => { this.filters.dealsOnly = false; document.getElementById('filter-deals-only').checked = false; this.renderProducts(); } });
    }

    if (chips.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-2 mb-4 pb-2 border-b border-gray-100">
        <span class="text-xs font-bold text-gray-500">Active Filters:</span>
        ${chips.map((chip, idx) => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#d2f7ec] text-[#003d29] border border-[#003d29]/20">
            ${chip.label}
            <button onclick="window.kutirShop.removeChip(${idx})" class="hover:text-black font-bold text-[11px]">&times;</button>
          </span>
        `).join('')}
        <button onclick="window.kutirShop.resetAllFilters()" class="text-xs text-rose-600 hover:underline font-semibold ml-2">Clear All</button>
      </div>
    `;

    this._currentChips = chips;
  }

  removeChip(idx) {
    if (this._currentChips && this._currentChips[idx]) {
      this._currentChips[idx].action();
    }
  }

  renderProducts() {
    let products = window.kutirStore.getProducts();
    const wishlist = window.kutirStore.getWishlist();

    // Filter by Category
    if (this.filters.category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === this.filters.category);
    }

    // Filter by Search
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Filter by Max Price
    products = products.filter(p => p.price <= this.filters.maxPrice);

    // Filter by Brands
    if (this.filters.brands.length > 0) {
      products = products.filter(p => this.filters.brands.includes(p.brand));
    }

    // Filter by Rating
    if (this.filters.minRating > 0) {
      products = products.filter(p => p.rating >= this.filters.minRating);
    }

    // Filter by In Stock
    if (this.filters.inStockOnly) {
      products = products.filter(p => p.stock > 0);
    }

    // Filter by Deals Only
    if (this.filters.dealsOnly) {
      products = products.filter(p => p.isDeal);
    }

    // Sorting
    if (this.sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (this.sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (this.sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (this.sort === 'newest') {
      products.reverse();
    }

    // Update Result count
    const countEl = document.getElementById('shop-product-count');
    if (countEl) countEl.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;

    this.renderActiveFilterChips();

    const container = document.getElementById('shop-products-container');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <i class="fa-solid fa-magnifying-glass text-2xl"></i>
          </div>
          <h4 class="text-base font-bold text-gray-800">No matching products found</h4>
          <p class="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Try adjusting your filters, price range, or search term to discover other items.</p>
          <button onclick="window.kutirShop.resetAllFilters()" class="mt-4 px-6 py-2 bg-[#003d29] text-white text-xs font-semibold rounded-full hover:bg-black transition">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'grid') {
      container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      container.innerHTML = products.map(product => {
        const inWish = wishlist.includes(product.id);
        return `
          <div class="product-card flex flex-col justify-between border border-gray-200/90 rounded-3xl p-4 bg-white shadow-xs">
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
                <span class="text-[11px] text-gray-400 ml-auto">${product.brand || 'Kutir'}</span>
              </div>

              <button onclick="window.kutirApp.addToCart('${product.id}')" class="w-full py-2.5 px-4 rounded-full border border-[#231f1e] text-[#231f1e] hover:bg-[#003d29] hover:border-[#003d29] hover:text-white transition font-semibold text-xs flex items-center justify-center gap-2">
                <i class="fa-solid fa-cart-shopping text-xs"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      // List View
      container.className = 'space-y-4';
      container.innerHTML = products.map(product => {
        const inWish = wishlist.includes(product.id);
        return `
          <div class="product-card flex flex-col sm:flex-row items-center gap-4 border border-gray-200/90 rounded-3xl p-4 bg-white shadow-xs">
            <div class="product-image-wrap w-full sm:w-44 h-44 flex-shrink-0 flex items-center justify-center p-2 relative rounded-2xl">
              <button onclick="event.stopPropagation(); window.kutirApp.toggleWishlist('${product.id}')" class="wishlist-heart-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center z-10 ${inWish ? 'active' : 'text-gray-400'}">
                <i class="${inWish ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-sm"></i>
              </button>
              <img src="${product.image}" onclick="window.kutirApp.openQuickView('${product.id}')" class="w-full h-full object-cover rounded-xl cursor-pointer" />
            </div>

            <div class="flex-1 flex flex-col justify-between py-1">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] uppercase font-bold text-[#003d29] bg-[#d2f7ec] px-2 py-0.5 rounded-full">${product.category}</span>
                  <span class="text-xs text-gray-400">${product.brand}</span>
                </div>
                <h4 onclick="window.kutirApp.openQuickView('${product.id}')" class="font-bold text-base text-[#231f1e] hover:text-[#003d29] cursor-pointer mb-1.5">${product.title}</h4>
                <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">${product.description}</p>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <div class="flex items-baseline gap-2">
                  <span class="font-black text-lg text-[#003d29]">$${product.price.toFixed(2)}</span>
                  ${product.originalPrice ? `<span class="text-xs line-through text-gray-400">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>

                <div class="flex items-center gap-2">
                  <button onclick="window.kutirApp.openQuickView('${product.id}')" class="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition">Quick View</button>
                  <button onclick="window.kutirApp.addToCart('${product.id}')" class="px-5 py-2 rounded-full bg-[#003d29] text-white text-xs font-semibold hover:bg-black transition flex items-center gap-1.5">
                    <i class="fa-solid fa-cart-shopping text-xs"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

window.kutirShop = new KutirShop();
