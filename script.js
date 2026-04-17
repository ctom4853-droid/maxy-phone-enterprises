// ==========================================
// STEP 1: IMAGE COMPRESSION FUNCTION
// ==========================================

function compressImage(base64String, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64String;
        
        img.onload = () => {
            // Create canvas
            const canvas = document.createElement('canvas');
            
            // Calculate new size
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to compressed JPEG
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        
        img.onerror = () => reject('Failed to load image');
    });
}
// Variable to hold compressed image
let compressedImageData = null;
        // ==========================================
        // CONFIGURATION
        // ==========================================
        
        // CHANGE THIS PASSWORD!
        const ADMIN_PASSWORD = 'maxy2024';
        
        // WhatsApp Number (Change to your business number)
        const WHATSAPP_NUMBER = '233XXXXXXXXX'; // Format: country code + number without +
        
        // Storage Keys
        const STORAGE_KEYS = {
            products: 'maxy_products',
            cart: 'maxy_cart'
        };

        // Brand Options by Category
        const BRAND_OPTIONS = {
            phones: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Infinix', 'Tecno', 'Itel', 'Nokia'],
            laptops: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'MSI', 'Razer'],
            gaming: ['Sony', 'Microsoft', 'Nintendo', 'Steam', 'ASUS ROG', 'Razer'],
            accessories: ['Apple', 'Samsung', 'Sony', 'Bose', 'JBL', 'Anker', 'Logitech', 'Beats', 'AirPods', 'Generic']
        };

        // Category Emojis
        const CATEGORY_EMOJIS = {
            phones: '📱',
            laptops: '💻',
            gaming: '🎮',
            accessories: '🎧'
        };

        // ==========================================
        // STATE
        // ==========================================
        
        let products = [];
        let cart = [];
        let currentFilter = 'all';
        let isAdminLoggedIn = false;

        // ==========================================
        // INITIALIZATION
        // ==========================================
        
        document.addEventListener('DOMContentLoaded', () => {
            loadProducts();
            loadCart();
            createFloatingIcons();
            updateBrandOptions();
        });

        // Create floating background icons
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
        // PRODUCT MANAGEMENT
        // ==========================================
        
        function loadProducts() {
            const saved = localStorage.getItem(STORAGE_KEYS.products);
            
            if (saved) {
                products = JSON.parse(saved);
            } else {
                // Default products
                products = [
                    {
                        id: Date.now(),
                        category: 'phones',
                        brand: 'Apple',
                        name: 'iPhone 15 Pro Max',
                        price: 1250,
                        stock: 5,
                        specs: '256GB, Titanium, A17 Pro',
                        description: 'Latest flagship with titanium design, A17 Pro chip, and advanced camera system.',
                        image: null,
                        emoji: '📱',
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 1,
                        category: 'phones',
                        brand: 'Samsung',
                        name: 'Galaxy S24 Ultra',
                        price: 1150,
                        stock: 3,
                        specs: '512GB, S Pen, AI Camera',
                        description: 'AI-powered smartphone with S Pen, 200MP camera, and all-day battery.',
                        image: null,
                        emoji: '📱',
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 2,
                        category: 'laptops',
                        brand: 'Apple',
                        name: 'MacBook Pro 14"',
                        price: 1800,
                        stock: 2,
                        specs: 'M3 Pro, 18GB RAM, 512GB SSD',
                        description: 'Professional laptop with M3 Pro chip, stunning XDR display.',
                        image: null,
                        emoji: '💻',
                        date: new Date().toISOString()
                    },
                    {
                        id: Date.now() + 3,
                        category: 'gaming',
                        brand: 'Sony',
                        name: 'PlayStation 5',
                        price: 550,
                        stock: 8,
                        specs: '825GB SSD, 4K Gaming',
                        description: 'Next-gen gaming console with lightning-fast loading and haptic feedback.',
                        image: null,
                        emoji: '🎮',
                        date: new Date().toISOString()
                    }
                ];
                saveProducts();
            }
            
            renderProducts();
            updateStats();
        }

        function saveProducts() {
            localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
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

           // IMAGE PREVIEW WITH COMPRESSION
async function handleImagePreview(input) {
    const label = document.getElementById('fileLabel');
    const preview = document.getElementById('imagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            // Show preview immediately with original
            preview.src = e.target.result;
            preview.classList.add('show');
            label.classList.add('has-file');
            label.innerHTML = '⏳ Compressing...';
            
            try {
                // Compress the image
                compressedImageData = await compressImage(e.target.result);
                
                // Show success
                label.innerHTML = '✓ Image ready<br><small>Click to change</small>';
                
                // Debug: log sizes
                console.log('Original:', Math.round(e.target.result.length / 1024), 'KB');
                console.log('Compressed:', Math.round(compressedImageData.length / 1024), 'KB');
                
            } catch (err) {
                console.error('Compression failed:', err);
                // Fall back to original if compression fails
                compressedImageData = e.target.result;
                label.innerHTML = '✓ Image added (large)<br><small>Click to change</small>';
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}
       // STEP 4: MODIFIED FINALIZE WITH COMPRESSED IMAGE
async function finalizeAddProduct(product) {
    // Add the compressed image if available
    if (compressedImageData) {
        product.image = compressedImageData;
        compressedImageData = null; // Clear for next time
    }
    
    products.unshift(product);
    saveProducts();
    
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').classList.remove('show');
    document.getElementById('fileLabel').classList.remove('has-file');
    document.getElementById('fileLabel').innerHTML = '📷 Click to upload product image<br><small>Recommended: 800x600px, JPG or PNG</small>';
    updateBrandOptions();
    
    // Update UI
    renderInventory();
    renderProducts();
    updateStats();
    
    showToast('✓ Product added successfully!', 'success');
}
  // STEP 5: HANDLE FORM SUBMISSION
async function handleAddProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        category: document.getElementById('prodCategory').value,
        brand: document.getElementById('prodBrand').value,
        name: document.getElementById('prodName').value,
        price: parseInt(document.getElementById('prodPrice').value),
        stock: parseInt(document.getElementById('prodStock').value),
        specs: document.getElementById('prodSpecs').value,
        description: document.getElementById('prodDesc').value,
        emoji: '📦',
        date: new Date().toISOString()
    };
    
    // Get emoji based on category
    const cat = document.getElementById('prodCategory').value;
    if (cat === 'phones') newProduct.emoji = '📱';
    else if (cat === 'laptops') newProduct.emoji = '💻';
    else if (cat === 'gaming') newProduct.emoji = '🎮';
    else if (cat === 'accessories') newProduct.emoji = '🎧';
    
    // Check if image was uploaded but not yet compressed
    const imageInput = document.getElementById('prodImage');
    if (imageInput.files && imageInput.files[0] && !compressedImageData) {
        // Wait for compression to finish
        const reader = new FileReader();
        reader.onload = async function(e) {
            compressedImageData = await compressImage(e.target.result);
            await finalizeAddProduct(newProduct);
        };
        reader.readAsDataURL(imageInput.files[0]);
        return; // Exit here, will continue in onload above
    }
    
    // No image or already compressed - proceed immediately
    await finalizeAddProduct(newProduct);
} 

        // ==========================================
        // SELL FUNCTION - REDUCE STOCK
        // ==========================================
        
        function sellOne(id) {
            const product = products.find(p => p.id === id);
            if (!product || product.stock < 1) {
                showToast('❌ Out of stock!', 'error');
                return;
            }
            
            if (!confirm(`Mark 1x ${product.brand} ${product.name} as SOLD?\n\nStock will reduce from ${product.stock} to ${product.stock - 1}`)) {
                return;
            }
            
            product.stock -= 1;
            saveProducts();
            renderInventory();
            renderProducts();
            
            const remaining = product.stock;
            const message = remaining > 0 
                ? `✓ Sold! ${product.brand} ${product.name} - ${remaining} remaining`
                : `✓ Sold! ${product.brand} ${product.name} - NOW OUT OF STOCK`;
            
            showToast(message, 'success');
        }

        function deleteProduct(id) {
            if (!confirm('Are you sure you want to delete this product?')) return;
            
            products = products.filter(p => p.id !== id);
            saveProducts();
            renderInventory();
            renderProducts();
            updateStats();
            
            showToast('🗑️ Product deleted', 'success');
        }

        // ==========================================
        // CART MANAGEMENT
        // ==========================================
        
        function loadCart() {
            const saved = localStorage.getItem(STORAGE_KEYS.cart);
            cart = saved ? JSON.parse(saved) : [];
            updateCartUI();
        }

        function saveCart() {
            localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
            updateCartUI();
        }

        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                showToast('❌ Product not found', 'error');
                return;
            }
            
            if (product.stock < 1) {
                showToast('❌ Product out of stock', 'error');
                return;
            }
            
            // Check if already in cart
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                showToast('⚠️ Already in cart', 'error');
                return;
            }
            
            // Add to cart
            cart.push({
                ...product,
                cartId: Date.now()
            });
            
            saveCart();
            showToast(`✓ ${product.name} added to cart`, 'success');
            
            // Update button state
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
            const count = cart.length;
            document.getElementById('cartCount').textContent = count;
        }

        function toggleCart() {
            const modal = document.getElementById('cartModal');
            const isOpen = modal.classList.contains('show');
            
            if (isOpen) {
                modal.classList.remove('show');
            } else {
                renderCart();
                modal.classList.add('show');
            }
        }

        function closeCartOutside(e) {
            if (e.target.id === 'cartModal') {
                toggleCart();
            }
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
                    </div>
                `;
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
                        <button class="remove-item" onclick="removeFromCart(${item.cartId})">
                            ✕
                        </button>
                    </div>
                `;
            }).join('');
            
            document.getElementById('cartItemCount').textContent = cart.length;
            document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();
            summary.style.display = 'block';
        }

        function checkoutWhatsApp() {
            if (cart.length === 0) {
                showToast('❌ Cart is empty', 'error');
                return;
            }
            
            // Build WhatsApp message with all cart items
            let message = `Hi Maxy Phone Enterprise,\n\nI want to ORDER the following items:\n\n`;
            
            let total = 0;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.brand} ${item.name}\n`;
                message += `   Price: ₦${item.price}\n`;
                message += `   Category: ${item.category}\n\n`;
                total += item.price;
            });
            
            message += `TOTAL: ₦${total.toLocaleString()}\n\n`;
            message += `Please confirm availability and delivery details. Thank you!`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappLink = `https://wa.me/2348124146689?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappLink, '_blank');
            
            showToast('💬 Opening WhatsApp...', 'success');
        }

        // ==========================================
        // RENDERING
        // ==========================================
        
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const filtered = currentFilter === 'all' 
                ? products 
                : products.filter(p => p.category === currentFilter);
            
            // Update count
            const countText = currentFilter === 'all' 
                ? `Showing all ${filtered.length} products`
                : `Showing ${filtered.length} ${currentFilter}`;
            document.getElementById('productCount').textContent = countText;
            
            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <h3 class="empty-title">No products found</h3>
                        <p class="empty-text">Check back later for new arrivals in this category.</p>
                    </div>
                `;
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
                                    <span class="price-amount">NGN${product.price}</span>
                                    <span class="price-label">Free shipping</span>
                                </div>
                                
                                <button class="add-cart-btn" 
                                        onclick="addToCart(${product.id})"
                                        ${product.stock < 1 || inCart ? 'disabled' : ''}>
                                     ${inCart ? '✓ Added' : (product.stock < 1 ? 'Sold Out' : '🛒 Add to Cart')}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
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
                        
                        <div class="inventory-price">NGN${product.price}</div>
                        
                        <span class="inventory-stock ${stockClass}">
                            ${stockText}
                        </span>
                        
                        <div class="inventory-actions">
                            <button class="sell-btn" onclick="sellOne(${product.id})" ${product.stock < 1 ? 'disabled' : ''} title="Mark as sold - reduces stock by 1">
                                💰 Sell
                            </button>
                            <button class="delete-btn" onclick="deleteProduct(${product.id})" title="Delete product">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
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
            
            // Update buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            renderProducts();
            
            // Scroll to products
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
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAdminLogin();
                const cartModal = document.getElementById('cartModal');
                if (cartModal.classList.contains('show')) {
                    toggleCart();
                }
            }
        });