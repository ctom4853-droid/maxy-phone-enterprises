// ==========================================
// FIREBASE + CLOUDINARY CONFIG
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAljnWWdxfMV53jiAp7EsUAHGoO2d0qK38",
  authDomain: "maxy-phones.firebaseapp.com",
  projectId: "maxy-phones",
  storageBucket: "maxy-phones.firebasestorage.app",
  messagingSenderId: "775189856975",
  appId: "1:775189856975:web:78bd715b993ece4a982dba",
  measurementId: "G-0DBXS80P14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cloudinary config
const CLOUDINARY_CLOUD = 'dyqj5jtsf';
const CLOUDINARY_PRESET = 'ml_default';

// ==========================================
// CONFIGURATION
// ==========================================

const ADMIN_PASSWORD = 'maxy2024';
const WHATSAPP_NUMBER = '2348124146689';

const BRAND_OPTIONS = {
    phones: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Infinix', 'Tecno', 'Itel', 'Nokia'],
    laptops: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'MSI', 'Razer'],
    gaming: ['Sony', 'Microsoft', 'Nintendo', 'Steam', 'ASUS ROG', 'Razer'],
    accessories: ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL', 'Anker', 'Logitech', 'Beats', 'AirPods', 'Generic']
};

// ==========================================
// STATE
// ==========================================

let products = [];
let cart = [];
let currentFilter = 'all';
let isAdminLoggedIn = false;
let selectedImageFile = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
    createFloatingIcons();
    updateBrandOptions();
});

function createFloatingIcons() {
    const container = document.getElementById('floatingIcons');
    const icons = ['📱', '💻', '🎮', '🎧', '⌚', '📷', '🔌', '💾'];
    for (let i = 0; i < 15; i++) {
        const div = document.createElement('div');
        div.className = 'float-item';
        div.textContent = icons[Math.floor(Math.random() * icons.length)];
        div.style.left = Math.random() * 100 + '%';
        div.style.top = Math.random() * 100 + '%';
        div.style.animationDelay = Math.random() * 20 + 's';
        div.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(div);
    }
}

// ==========================================
// CLOUDINARY IMAGE UPLOAD
// ==========================================

async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    return data.secure_url;
}

// ==========================================
// IMAGE PREVIEW
// ==========================================

function handleImagePreview(input) {
    const label = document.getElementById('fileLabel');
    const preview = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        selectedImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.add('show');
            label.classList.add('has-file');
            label.innerHTML = '✓ Image ready<br><small>Click to change</small>';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================

async function loadProducts() {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        products = snapshot.docs.map(d => ({ ...d.data(), docId: d.id }));
        renderProducts();
        updateStats();
    } catch (err) {
        console.error('Error loading products:', err);
        showToast('❌ Error loading products', 'error');
    }
}

async function handleAddProduct(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Saving...';

    try {
        const category = document.getElementById('prodCategory').value;
        let emoji = '📦';
        if (category === 'phones') emoji = '📱';
        else if (category === 'laptops') emoji = '💻';
        else if (category === 'gaming') emoji = '🎮';
        else if (category === 'accessories') emoji = '🎧';

        const newProduct = {
            id: Date.now(),
            category,
            brand: document.getElementById('prodBrand').value,
            name: document.getElementById('prodName').value,
            price: parseInt(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            specs: document.getElementById('prodSpecs').value,
            description: document.getElementById('prodDesc').value,
            emoji,
            image: null,
            date: new Date().toISOString()
        };

        // Upload image to Cloudinary if selected
        if (selectedImageFile) {
            submitBtn.textContent = '⏳ Uploading image...';
            newProduct.image = await uploadImageToCloudinary(selectedImageFile);
            selectedImageFile = null;
        }

        // Save to Firestore
        const docRef = await addDoc(collection(db, "products"), newProduct);
        newProduct.docId = docRef.id;
        products.unshift(newProduct);

        // Reset form
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').classList.remove('show');
        document.getElementById('fileLabel').classList.remove('has-file');
        document.getElementById('fileLabel').innerHTML = '📷 Click to upload product image<br><small>Recommended: 800x600px, JPG or PNG</small>';
        updateBrandOptions();

        renderInventory();
        renderProducts();
        updateStats();

        showToast('✓ Product added successfully!', 'success');

    } catch (err) {
        console.error('Error adding product:', err);
        showToast('❌ Error adding product: ' + err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>➕</span> Add Product to Inventory';
    }
}

function updateBrandOptions() {
    const category = document.getElementById('prodCategory').value;
    const brandSelect = document.getElementById('prodBrand');
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    if (category && BRAND_OPTIONS[category]) {
        BRAND_OPTIONS[category].forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }
}

async function sellOne(id) {
    const product = products.find(p => p.id === id);
    if (!product || product.stock < 1) {
        showToast('❌ Out of stock!', 'error');
        return;
    }

    if (!confirm(`Mark 1x ${product.brand} ${product.name} as SOLD?\n\nStock will reduce from ${product.stock} to ${product.stock - 1}`)) return;

    try {
        const newStock = product.stock - 1;
        await updateDoc(doc(db, "products", product.docId), { stock: newStock });
        product.stock = newStock;

        renderInventory();
        renderProducts();

        const message = newStock > 0
            ? `✓ Sold! ${product.brand} ${product.name} - ${newStock} remaining`
            : `✓ Sold! ${product.brand} ${product.name} - NOW OUT OF STOCK`;

        showToast(message, 'success');
    } catch (err) {
        showToast('❌ Error updating stock', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const product = products.find(p => p.id === id);
        await deleteDoc(doc(db, "products", product.docId));
        products = products.filter(p => p.id !== id);
        renderInventory();
        renderProducts();
        updateStats();
        showToast('🗑️ Product deleted', 'success');
    } catch (err) {
        showToast('❌ Error deleting product', 'error');
    }
}

// ==========================================
// CART MANAGEMENT
// ==========================================

function loadCart() {
    const saved = localStorage.getItem('maxy_cart');
    cart = saved ? JSON.parse(saved) : [];
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('maxy_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) { showToast('❌ Product not found', 'error'); return; }
    if (product.stock < 1) { showToast('❌ Product out of stock', 'error'); return; }
    if (cart.find(item => item.id === productId)) { showToast('⚠️ Already in cart', 'error'); return; }

    cart.push({ ...product, cartId: Date.now() });
    saveCart();
    showToast(`✓ ${product.name} added to cart`, 'success');
    renderProducts();
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    saveCart();
    renderCart();
    renderProducts();
}

function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Clear all items from cart?')) return;
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
    showToast('🗑️ Cart cleared', 'success');
}

function updateCartUI() {
    document.getElementById('cartCount').textContent = cart.length;
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    } else {
        renderCart();
        modal.classList.add('show');
    }
}

function closeCartOutside(e) {
    if (e.target.id === 'cartModal') toggleCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Add products to get started</p>
            </div>`;
        summary.style.display = 'none';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                ${item.image
                    ? `<img src="${item.image}" class="cart-item-thumb" alt="">`
                    : `<div class="cart-item-thumb">${item.emoji}</div>`
                }
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.brand} ${item.name}</div>
                    <div class="cart-item-specs">${item.specs || item.category}</div>
                    <div class="cart-item-price">₦${item.price.toLocaleString()}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.cartId})">✕</button>
            </div>`;
    }).join('');

    document.getElementById('cartItemCount').textContent = cart.length;
    document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();
    summary.style.display = 'block';
}

function checkoutWhatsApp() {
    if (cart.length === 0) { showToast('❌ Cart is empty', 'error'); return; }

    let message = `Hi Maxy Phone Enterprise,\n\nI want to ORDER the following items:\n\n`;
    let total = 0;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.brand} ${item.name}\n`;
        message += `   Price: ₦${item.price}\n`;
        message += `   Category: ${item.category}\n\n`;
        total += item.price;
    });
    message += `TOTAL: ₦${total.toLocaleString()}\n\nPlease confirm availability and delivery details. Thank you!`;

    window.open(`https://wa.me/2348124146689?text=${encodeURIComponent(message)}`, '_blank');
    showToast('💬 Opening WhatsApp...', 'success');
}

// ==========================================
// RENDERING
// ==========================================

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);

    document.getElementById('productCount').textContent = currentFilter === 'all'
        ? `Showing all ${filtered.length} products`
        : `Showing ${filtered.length} ${currentFilter}`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3 class="empty-title">No products found</h3>
                <p class="empty-text">Check back later for new arrivals in this category.</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map((product, index) => {
        const stockStatus = product.stock === 0 ? 'out' : (product.stock < 5 ? 'low' : 'high');
        const stockText = product.stock === 0 ? 'Out of Stock' : (product.stock < 5 ? 'Low Stock' : 'In Stock');
        const inCart = cart.find(item => item.id === product.id);

        return `
            <div class="product-card animate-in" style="animation-delay: ${index * 0.1}s">
                ${product.stock < 3 ? '<span class="product-badge-new">Hot</span>' : ''}
                <div class="product-image-container">
                    ${product.image
                        ? `<img src="${product.image}" class="product-image" alt="${product.name}">`
                        : `<div class="product-image-placeholder">${product.emoji}</div>`
                    }
                    <span class="product-category">${product.category}</span>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-specs">
                        ${product.specs ? `<span class="product-spec">${product.specs}</span>` : ''}
                        <span class="product-spec inventory-stock ${stockStatus}">${stockText}</span>
                    </div>
                    <p class="product-description">${product.description || 'Premium quality product with warranty.'}</p>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-amount">₦${product.price.toLocaleString()}</span>
                            <span class="price-label">Free shipping</span>
                        </div>
                        <button class="add-cart-btn"
                                onclick="addToCart(${product.id})"
                                ${product.stock < 1 || inCart ? 'disabled' : ''}>
                            ${inCart ? '✓ Added' : (product.stock < 1 ? 'Sold Out' : '🛒 Add to Cart')}
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    document.getElementById('inventoryCount').textContent = `${products.length} products`;

    if (products.length === 0) {
        grid.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);">No products in inventory</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const stockClass = product.stock === 0 ? 'out' : (product.stock < 5 ? 'low' : 'high');
        const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`;

        return `
            <div class="inventory-item">
                ${product.image
                    ? `<img src="${product.image}" class="inventory-thumb" alt="">`
                    : `<div class="inventory-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${product.emoji}</div>`
                }
                <div class="inventory-info">
                    <h4>${product.brand} ${product.name}</h4>
                    <p>${product.category} • ${product.specs || 'No specs'}</p>
                </div>
                <div class="inventory-price">₦${product.price.toLocaleString()}</div>
                <span class="inventory-stock ${stockClass}">${stockText}</span>
                <div class="inventory-actions">
                    <button class="sell-btn" onclick="sellOne(${product.id})" ${product.stock < 1 ? 'disabled' : ''}>
                        💰 Sell
                    </button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">🗑️</button>
                </div>
            </div>`;
    }).join('');
}

function updateStats() {
    document.getElementById('statProducts').textContent = products.length;
}

// ==========================================
// FILTERING
// ==========================================

function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts();
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// NAVIGATION & AUTH
// ==========================================

function showStore() {
    document.getElementById('storeView').style.display = 'block';
    document.querySelector('.filter-section').style.display = 'block';
    document.querySelector('.products-section').style.display = 'block';
    document.getElementById('adminPanel').classList.remove('show');
    document.querySelector('.footer').style.display = 'block';
    renderProducts();
    window.scrollTo(0, 0);
}

function showAdminLogin() {
    document.getElementById('loginModal').classList.add('show');
    document.getElementById('adminPassword').focus();
}

function closeAdminLogin() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function checkPassword() {
    const input = document.getElementById('adminPassword').value;
    const error = document.getElementById('loginError');
    const modal = document.querySelector('.login-modal');

    if (input === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        closeAdminLogin();
        showAdminPanel();
    } else {
        error.style.display = 'block';
        modal.classList.add('shake');
        setTimeout(() => modal.classList.remove('shake'), 500);
    }
}

function showAdminPanel() {
    document.getElementById('storeView').style.display = 'none';
    document.querySelector('.filter-section').style.display = 'none';
    document.querySelector('.products-section').style.display = 'none';
    document.getElementById('adminPanel').classList.add('show');
    document.querySelector('.footer').style.display = 'none';
    renderInventory();
    window.scrollTo(0, 0);
}

function logout() {
    isAdminLoggedIn = false;
    showStore();
}

// ==========================================
// UTILITIES
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    document.getElementById('toastIcon').textContent = type === 'success' ? '✓' : '⚠️';
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAdminLogin();
        const cartModal = document.getElementById('cartModal');
        if (cartModal.classList.contains('show')) toggleCart();
    }
});
