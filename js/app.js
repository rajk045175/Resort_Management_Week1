/**
 * Grand Azure Luxury Resort & Spa - Central Application State Engine
 * Currency: Indian Rupee (INR / ₹)
 * Interactive Atmospheric Controller & Sanctuary Concierge Engine
 */

const STORAGE_KEYS = {
  USER: 'grand_azure_user',
  ROOMS: 'grand_azure_rooms',
  PACKAGES: 'grand_azure_packages',
  MENU: 'grand_azure_menu',
  BOOKINGS: 'grand_azure_bookings',
  PAYMENTS: 'grand_azure_payments',
  REVIEWS: 'grand_azure_reviews',
  CART: 'grand_azure_cart',
  DRAFT: 'grand_azure_draft',
  USERS_LIST: 'grand_azure_users_list',
  RESORTS: 'grand_azure_resorts',
  SELECTED_RESORT: 'grand_azure_selected_resort',
  ATMOSPHERE: 'grand_azure_atmosphere',
};

// Currency Formatter - Indian Rupee (INR / ₹)
function formatINR(amount) {
  const num = Math.round(Number(amount) || 0);
  return '₹' + num.toLocaleString('en-IN');
}

// 1. Data Store Initialization
function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Global Resort State Accessors
function getResorts() { return getStoredData(STORAGE_KEYS.RESORTS, INITIAL_RESORTS); }
function setResorts(resorts) { setStoredData(STORAGE_KEYS.RESORTS, resorts); }

function getCurrentResortId() {
  return getStoredData(STORAGE_KEYS.SELECTED_RESORT, 'resort-maldives');
}
function setCurrentResortId(resortId) {
  setStoredData(STORAGE_KEYS.SELECTED_RESORT, resortId);
}

function getCurrentResort() {
  const id = getCurrentResortId();
  const resorts = getResorts();
  return resorts.find(r => r.id === id) || resorts[0];
}

function getMenuItemsByResort(resortId) {
  const allItems = getMenuItems();
  if (!resortId || resortId === 'ALL') return allItems;
  return allItems.filter(item => item.resortId === resortId);
}

// Rooms Accessor with Auto-Migration to INR & Unique Sanctuaries
function getRooms() {
  const rooms = getStoredData(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  // Auto-upgrade if data is legacy (price < 5000 or contains legacy generic room names)
  if (!rooms || rooms.length === 0 || rooms[0].price < 5000 || rooms[0].name.includes('Deluxe Ocean Suite') || !rooms[0].architecturalStyle) {
    setRooms(INITIAL_ROOMS);
    return INITIAL_ROOMS;
  }
  return rooms;
}
function setRooms(rooms) { setStoredData(STORAGE_KEYS.ROOMS, rooms); }

// Packages Accessor with Auto-Migration
function getPackages() {
  const pkgs = getStoredData(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  if (!pkgs || pkgs.length === 0 || pkgs[0].price < 5000) {
    setPackages(INITIAL_PACKAGES);
    return INITIAL_PACKAGES;
  }
  return pkgs;
}
function setPackages(pkgs) { setStoredData(STORAGE_KEYS.PACKAGES, pkgs); }

// Menu Items Accessor with Auto-Migration
function getMenuItems() {
  const items = getStoredData(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  if (!items || items.length === 0 || !items[0].resortId || items[0].price < 100) {
    setMenuItems(INITIAL_MENU_ITEMS);
    return INITIAL_MENU_ITEMS;
  }
  return items;
}
function setMenuItems(items) { setStoredData(STORAGE_KEYS.MENU, items); }

// Bookings Accessor with Auto-Migration
function getBookings() {
  const bookings = getStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  if (!bookings || bookings.length === 0 || bookings[0].totalAmount < 10000) {
    setBookings(INITIAL_BOOKINGS);
    return INITIAL_BOOKINGS;
  }
  return bookings;
}
function setBookings(bookings) { setStoredData(STORAGE_KEYS.BOOKINGS, bookings); }

// Payments Accessor with Auto-Migration
function getPayments() {
  const payments = getStoredData(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  if (!payments || payments.length === 0 || payments[0].amount < 10000) {
    setPayments(INITIAL_PAYMENTS);
    return INITIAL_PAYMENTS;
  }
  return payments;
}
function setPayments(payments) { setStoredData(STORAGE_KEYS.PAYMENTS, payments); }

function getReviews() { return getStoredData(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS); }
function setReviews(reviews) { setStoredData(STORAGE_KEYS.REVIEWS, reviews); }

function getUsersList() { return getStoredData(STORAGE_KEYS.USERS_LIST, INITIAL_USERS); }
function setUsersList(list) { setStoredData(STORAGE_KEYS.USERS_LIST, list); }

function getCurrentUser() {
  const user = getStoredData(STORAGE_KEYS.USER, INITIAL_USERS[1]);
  if (!user || user.isLoggedOut) return null;
  return user;
}
function setCurrentUser(user) { setStoredData(STORAGE_KEYS.USER, user); }

// Cart Management
function getCart() { return getStoredData(STORAGE_KEYS.CART, []); }
function setCart(cart) {
  setStoredData(STORAGE_KEYS.CART, cart);
  updateCartBadge();
}

function addToCart(menuItemId, quantity = 1) {
  const items = getMenuItems();
  const menuItem = items.find(i => i.id === menuItemId);
  if (!menuItem) return;

  const cart = getCart();
  const existing = cart.find(c => c.menuItem.id === menuItemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ menuItem, quantity });
  }
  setCart(cart);
  showToast(`Added ${menuItem.name} to order tray!`);
  renderCartDrawer();
}

function updateCartQuantity(menuItemId, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(c => c.menuItem.id !== menuItemId);
  } else {
    const item = cart.find(c => c.menuItem.id === menuItemId);
    if (item) item.quantity = quantity;
  }
  setCart(cart);
  renderCartDrawer();
}

function clearCart() {
  setCart([]);
  renderCartDrawer();
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// Luxury Extras Catalog (Prices in INR)
const LUXURY_EXTRAS = {
  helicopter: { name: 'VIP Twin-Turbine Helicopter Atoll Transfer', price: 25000, description: 'Direct aerial scenic transfer from international airport' },
  spa: { name: 'Ayurvedic & Pearl Dust Couple Ritual (120 min)', price: 9500, description: 'Overwater lagoon pavilion with botanical aromatic steam' },
  champagne: { name: 'Private Sunset Catamaran Cruise & Beluga Caviar', price: 8000, description: '90-minute bespoke cruise with sommelier pairing' },
  butler: { name: 'Dedicated Royal Butler & Sommelier Service (24/7)', price: 12000, description: 'Full personalized packaging, private dining setup, and concierge' },
};

// Booking Draft & Pricing Calculations (INR)
function getBookingDraft() {
  const defaultDraft = {
    roomId: 'room-101',
    checkInDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    adults: 2,
    children: 0,
    packageId: '',
    promoCode: 'AZUREVIP',
    extras: [],
  };
  return getStoredData(STORAGE_KEYS.DRAFT, defaultDraft);
}

function setBookingDraft(draft) {
  setStoredData(STORAGE_KEYS.DRAFT, draft);
}

function calculatePricing(checkInDate, checkOutDate, roomPrice, packagePrice = 0, foodTotal = 0, extrasTotal = 0, promoCode = '') {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  let nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights < 1) nights = 1;

  const roomSubtotal = nights * roomPrice;
  const packageSubtotal = packagePrice || 0;
  const subtotalBeforeTax = roomSubtotal + packageSubtotal + foodTotal + extrasTotal;

  let discountAmount = 0;
  let promoApplied = null;
  if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
    const promo = PROMO_CODES[promoCode.toUpperCase()];
    discountAmount = Math.min((subtotalBeforeTax * promo.discountPercent) / 100, promo.maxDiscount);
    promoApplied = promo;
  }

  const taxableAmount = Math.max(0, subtotalBeforeTax - discountAmount);
  const taxAmount = Math.round(taxableAmount * RESORT_INFO.taxRate);
  const finalTotal = Math.round(taxableAmount + taxAmount);

  return {
    totalNights: nights,
    roomSubtotal,
    packageSubtotal,
    foodSubtotal: foodTotal,
    extrasTotal,
    subtotalBeforeTax,
    discountAmount,
    taxAmount,
    finalTotal,
    promoApplied,
  };
}

// User Authentication
function login(email, role = 'CUSTOMER') {
  const users = getUsersList();
  if (email.toLowerCase().includes('admin') || role === 'ADMIN') {
    const adminUser = users.find(u => u.role === 'ADMIN') || INITIAL_USERS[0];
    setCurrentUser(adminUser);
    return adminUser;
  }
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const user = found || {
    id: `user-${Date.now()}`,
    name: email.split('@')[0].replace(/[._]/g, ' '),
    email: email,
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  };
  if (!found) {
    users.push(user);
    setUsersList(users);
  }
  setCurrentUser(user);
  return user;
}

function registerUser(name, email, phone = '+91 98765 43210', role = 'CUSTOMER') {
  const users = getUsersList();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setCurrentUser(existing);
    return existing;
  }
  const newUser = {
    id: `user-${Date.now()}`,
    name: name,
    email: email,
    phone: phone,
    role: role,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  };
  users.push(newUser);
  setUsersList(users);
  setCurrentUser(newUser);
  return newUser;
}

function logout() {
  try { sessionStorage.removeItem('grand_azure_admin_auth'); } catch (e) {}
  setCurrentUser({ isLoggedOut: true });
  showToast('You have been signed out.');
  setTimeout(() => {
    window.location.href = 'auth.html';
  }, 400);
}

// Factory Reset
function resetDemoData() {
  localStorage.clear();
  try { sessionStorage.clear(); } catch (e) {}
  setStoredData(STORAGE_KEYS.RESORTS, INITIAL_RESORTS);
  setStoredData(STORAGE_KEYS.SELECTED_RESORT, 'resort-maldives');
  setStoredData(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  setStoredData(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  setStoredData(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
  setStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  setStoredData(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  setStoredData(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  setStoredData(STORAGE_KEYS.USER, INITIAL_USERS[1]);
  setAtmosphere('DAY');
  showToast('Reset to original 5-star luxury INR demo data!');
  setTimeout(() => window.location.reload(), 800);
}

// Atmospheric Experience Controller
function getAtmosphere() {
  return localStorage.getItem(STORAGE_KEYS.ATMOSPHERE) || 'DAY';
}

function setAtmosphere(mode) {
  const validModes = ['DAY', 'SUNSET', 'NIGHT'];
  const activeMode = validModes.includes(mode) ? mode : 'DAY';
  localStorage.setItem(STORAGE_KEYS.ATMOSPHERE, activeMode);
  
  document.documentElement.setAttribute('data-atmosphere', activeMode.toLowerCase());
  document.body.setAttribute('data-atmosphere', activeMode.toLowerCase());

  // Update UI buttons matching data-atmosphere-btn
  document.querySelectorAll('[data-atmosphere-btn]').forEach(btn => {
    const btnMode = btn.getAttribute('data-atmosphere-btn');
    if (btnMode === activeMode) {
      btn.className = 'px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 bg-gold-500 text-azure-950 shadow-md ring-1 ring-gold-300';
    } else {
      btn.className = 'px-3 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-all duration-300 hover:bg-white/10';
    }
  });

  const statusEl = document.getElementById('atmosphereStatusText');
  if (statusEl) {
    if (activeMode === 'DAY') statusEl.innerHTML = '☀️ <strong>Daylight Splendor</strong> • Azure Waters & Tropical Sun';
    else if (activeMode === 'SUNSET') statusEl.innerHTML = '🌅 <strong>Golden Hour Sunset</strong> • Amber Horizon & Champagne Breezes';
    else if (activeMode === 'NIGHT') statusEl.innerHTML = '🌙 <strong>Starlit Midnight Lagoon</strong> • Bioluminescent Waters & Candlelit Atoll';
  }
}

// Interactive Sanctuary Matcher
function matchSanctuaries(answers) {
  const rooms = getRooms();
  const { vibe, style, guests } = answers;
  
  return rooms.filter(room => {
    if (guests && room.maxGuests < guests) return false;
    if (!vibe || vibe === 'ALL') return true;
    
    if (vibe === 'OVERWATER') return room.type === 'OVERWATER' || room.architecturalStyle.includes('Overwater') || room.architecturalStyle.includes('Palace');
    if (vibe === 'ROYAL') return room.type === 'PRESIDENTIAL' || room.type === 'PENTHOUSE' || room.architecturalStyle.includes('Palace') || room.architecturalStyle.includes('Imperial');
    if (vibe === 'CLIFFTOP') return room.architecturalStyle.includes('Clifftop') || room.architecturalStyle.includes('Hillside');
    if (vibe === 'BEACH') return room.type === 'BEACH_VILLA' || room.architecturalStyle.includes('Beachfront') || room.architecturalStyle.includes('Dune');
    if (vibe === 'WELLNESS') return room.architecturalStyle.includes('Lotus') || room.architecturalStyle.includes('Banyan') || room.architecturalStyle.includes('Haven');
    
    return true;
  });
}

// Toast Helper
function showToast(message) {
  let toast = document.getElementById('resortToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'resortToast';
    toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-azure-950 text-gold-300 border border-gold-400/40 text-xs font-semibold shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  toast.classList.remove('translate-y-12', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-12', 'opacity-0');
  }, 3500);
}

// Cart Drawer Renderer with INR Pricing
function renderCartDrawer() {
  const container = document.getElementById('cartDrawerContent');
  if (!container) return;

  const cart = getCart();
  const subtotal = getCartSubtotal();
  const tax = Math.round(subtotal * RESORT_INFO.taxRate);
  const total = Math.round(subtotal + tax);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-lg">🍽️</div>
        <p class="font-serif text-slate-700 text-base">Your Tray is Empty</p>
        <p class="text-xs text-slate-500">Discover gourmet creations and add to your room stay.</p>
        <a href="dining.html" class="px-4 py-2 rounded-full bg-gold-gradient text-azure-950 text-xs font-bold uppercase tracking-wider">Explore Menu</a>
      </div>
    `;
    const footer = document.getElementById('cartDrawerFooter');
    if (footer) footer.classList.add('hidden');
    return;
  }

  const resorts = getResorts();
  let html = `<div class="divide-y divide-slate-100">`;
  cart.forEach(item => {
    const resort = resorts.find(r => r.id === item.menuItem.resortId);
    const resortLabel = resort ? resort.name.replace('Grand Azure ', '') : 'Resort Kitchen';
    html += `
      <div class="py-3 flex items-center justify-between gap-3">
        <img src="${item.menuItem.image}" alt="${item.menuItem.name}" class="w-12 h-12 rounded-xl object-cover" />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-xs text-slate-800 truncate">${item.menuItem.name}</p>
          <div class="flex items-center gap-1.5 pt-0.5">
            <span class="text-[11px] text-gold-600 font-bold">${formatINR(item.menuItem.price)}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-azure-900/10 text-azure-900 font-medium truncate">${resortLabel}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50 text-xs">
            <button onclick="updateCartQuantity('${item.menuItem.id}', ${item.quantity - 1})" class="px-2 py-0.5 text-slate-600 hover:bg-slate-200">-</button>
            <span class="px-2 font-bold text-slate-800">${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.menuItem.id}', ${item.quantity + 1})" class="px-2 py-0.5 text-slate-600 hover:bg-slate-200">+</button>
          </div>
          <button onclick="updateCartQuantity('${item.menuItem.id}', 0)" class="text-slate-400 hover:text-rose-500 text-xs p-1">✕</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  const footer = document.getElementById('cartDrawerFooter');
  if (footer) {
    footer.classList.remove('hidden');
    document.getElementById('cartDrawerSubtotal').textContent = formatINR(subtotal);
    document.getElementById('cartDrawerTax').textContent = formatINR(tax);
    document.getElementById('cartDrawerTotal').textContent = formatINR(total);
  }
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  if (open) {
    drawer.classList.remove('translate-x-full');
    renderCartDrawer();
  } else {
    drawer.classList.add('translate-x-full');
  }
}

// Global Init on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved atmospheric experience
  setAtmosphere(getAtmosphere());

  updateCartBadge();
  const user = getCurrentUser();
  const userBtn = document.getElementById('navUserBtn');
  if (userBtn) {
    if (user) {
      userBtn.innerHTML = `
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}" class="w-6 h-6 rounded-full object-cover border border-gold-300" />
        <span class="max-w-[95px] truncate text-xs font-semibold">${user.name}</span>
      `;
      userBtn.href = "auth.html";
      userBtn.title = `Signed in as ${user.name} (${user.role})`;
    } else {
      userBtn.innerHTML = `<span>Sign In</span>`;
      userBtn.href = "auth.html";
      userBtn.title = "Sign In or Register";
    }
  }
});
