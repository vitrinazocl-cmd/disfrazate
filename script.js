// Global shop states
let baseCatalogo = [...catalogoProductos];
let currentProducts = [...baseCatalogo];
let currentViewMode = 'grid'; // Default grid view matching user screenshot
const itemsPerPage = 24;
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ENTER OVERLAY & AUDIO CONTROLLER ---
    const landingOverlay = document.getElementById('landing-overlay');
    const btnEntrar = document.getElementById('btn-entrar');
    const bgAudio = document.getElementById('bg-audio');
    let hasPlayedOnce = false;

    if (bgAudio) {
        bgAudio.volume = 0.5;
        bgAudio.loop = false; // Ensure track plays only once

        // Automatically mute audio once it finishes playing one full time
        bgAudio.addEventListener('ended', () => {
            hasPlayedOnce = true;
            bgAudio.muted = true;
            bgAudio.pause();
        });

        // Attempt automatic playback on initial load
        bgAudio.play().catch(err => console.log('Initial autoplay pending user interaction:', err));
    }

    if (btnEntrar && landingOverlay) {
        btnEntrar.addEventListener('click', () => {
            landingOverlay.classList.add('fade-out');
            
            if (bgAudio && !hasPlayedOnce && bgAudio.paused) {
                bgAudio.play().catch(err => console.log('Audio play on enter blocked:', err));
            }
            
            setTimeout(() => {
                landingOverlay.style.display = 'none';
            }, 800);
        });
    }

    // Force play audio on first user click if autoplay was blocked by browser
    document.body.addEventListener('click', () => {
        if (bgAudio && !hasPlayedOnce && bgAudio.paused) {
            bgAudio.play().catch(e => console.log('Audio playback request denied:', e));
        }
    }, { once: true });


    // --- 2. HERO SLIDER BANNER CAROUSEL ---
    const sliderTrack = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotElements = document.querySelectorAll('#sliderDots .dot');
    
    let sliderIndex = 0;
    let autoPlayTimer;

    function renderSlider() {
        if (!sliderTrack) return;
        const offset = -sliderIndex * 100;
        sliderTrack.style.transform = `translateX(${offset}%)`;
        
        dotElements.forEach((dot, idx) => {
            if (idx === sliderIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    function nextSlide() {
        if (!sliderTrack) return;
        const totalSlides = sliderTrack.children.length;
        sliderIndex = (sliderIndex + 1) % totalSlides;
        renderSlider();
    }

    function prevSlide() {
        if (!sliderTrack) return;
        const totalSlides = sliderTrack.children.length;
        sliderIndex = (sliderIndex - 1 + totalSlides) % totalSlides;
        renderSlider();
    }

    function startAutoPlay() {
        autoPlayTimer = setInterval(nextSlide, 6000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    dotElements.forEach(dot => {
        dot.addEventListener('click', (e) => {
            sliderIndex = parseInt(e.target.getAttribute('data-index'));
            renderSlider();
            stopAutoPlay();
            startAutoPlay();
        });
    });

    if (sliderTrack && sliderTrack.children.length > 1) {
        startAutoPlay();
        // Pause slider on hover
        sliderTrack.parentElement.addEventListener('mouseenter', stopAutoPlay);
        sliderTrack.parentElement.addEventListener('mouseleave', startAutoPlay);
    }


    // --- 3. CATEGORY FILTER NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-container .nav-link');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const cat = link.getAttribute('data-category');
            
            // Check if it's an overlay toggle link rather than product filter
            if (link.id === 'open-contact-btn') {
                e.preventDefault();
                openModal('contact-modal');
                return;
            }
            if (link.id === 'open-catalog-btn') {
                e.preventDefault();
                // Scrolls to visual catalog card
                const target = document.getElementById('catalogo-download');
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
                }
                return;
            }

            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            filterByCategory(cat);
        });
    });

    // Smart search logic
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) {
                currentProducts = [...baseCatalogo];
                document.getElementById('productos-title').textContent = "TODOS LOS PRODUCTOS";
            } else {
                currentProducts = baseCatalogo.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.category.toLowerCase().includes(query)
                );
                document.getElementById('productos-title').textContent = `RESULTADOS PARA: "${query.toUpperCase()}"`;
            }
            // Reset to page 1
            currentPage = 1;
            applyOrderingAndRender();
        });
    }

    // Ordering dropdown select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyOrderingAndRender();
        });
    }


    // --- 4. CART MODAL HANDLERS ---
    const cartIconBtn = document.getElementById('cart-icon-btn');
    const btnCloseCart = document.getElementById('btn-close-cart');
    const customerCommune = document.getElementById('customer-commune');

    if (cartIconBtn) cartIconBtn.addEventListener('click', () => openModal('cart-modal'));
    if (btnCloseCart) btnCloseCart.addEventListener('click', () => closeModal('cart-modal'));
    
    if (customerCommune) {
        customerCommune.addEventListener('change', () => {
            renderCartTotals();
        });
    }


    // --- 5. CHECKOUT INTEGRATION (SIMULATED WEBPAY) ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', submitOrderCheckout);
    }


    // --- 6. ADMIN LOGIN HANDLERS ---
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const ventasLoginBtn = document.getElementById('ventas-login-btn');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const submitLoginBtn = document.getElementById('submit-login-btn');
    const loginPass = document.getElementById('login-pass');
    
    let redirectDashboardUrl = 'pedidos.html'; // Cache path

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            redirectDashboardUrl = 'pedidos.html';
            openModal('login-modal');
        });
    }
    const footerAdminBtn = document.getElementById('footer-admin-btn');
    if (footerAdminBtn) {
        footerAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            redirectDashboardUrl = 'pedidos.html';
            openModal('login-modal');
        });
    }

    if (ventasLoginBtn) {
        ventasLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            redirectDashboardUrl = 'ventas.html';
            openModal('login-modal');
        });
    }
    const footerVentasBtn = document.getElementById('footer-ventas-btn');
    if (footerVentasBtn) {
        footerVentasBtn.addEventListener('click', (e) => {
            e.preventDefault();
            redirectDashboardUrl = 'ventas.html';
            openModal('login-modal');
        });
    }

    const footerCatalogBtn = document.getElementById('footer-catalog-btn');
    if (footerCatalogBtn) {
        footerCatalogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('catalogo-download');
            if (target) {
                window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
            }
        });
    }

    if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => closeModal('login-modal'));

    if (submitLoginBtn) {
        submitLoginBtn.addEventListener('click', () => {
            const user = document.getElementById('login-user').value.trim();
            const pass = loginPass.value.trim();
            const errorMsg = document.getElementById('login-error');

            if (user === 'admin' && pass === 'disfrazate123') {
                errorMsg.style.display = 'none';
                closeModal('login-modal');
                // Redirect user to admin page
                window.location.href = redirectDashboardUrl;
            } else {
                errorMsg.style.display = 'block';
            }
        });

        loginPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitLoginBtn.click();
        });
    }


    // --- 7. ACCESSORY CUSTOM PACK DIALOG (JABA MIXTA EQUIVALENT) ---
    const btnCloseCustom = document.getElementById('btn-close-custom');
    const addCustomPackBtn = document.getElementById('add-custom-pack-btn');

    if (btnCloseCustom) btnCloseCustom.addEventListener('click', () => closeModal('custom-product-modal'));
    
    // Wire up counter buttons in custom pack
    const customPackModal = document.getElementById('custom-product-modal');
    if (customPackModal) {
        const qtyCounters = customPackModal.querySelectorAll('.qty-counter');
        qtyCounters.forEach(cnt => {
            const minusBtn = cnt.querySelector('.minus');
            const plusBtn = cnt.querySelector('.plus');
            const input = cnt.querySelector('input');
            const itemCode = minusBtn.getAttribute('data-item');

            minusBtn.addEventListener('click', () => {
                let val = parseInt(input.value);
                if (val > 0) {
                    input.value = val - 1;
                    updateCustomPackTotal();
                }
            });

            plusBtn.addEventListener('click', () => {
                let total = getCustomPackSelectedSum();
                let val = parseInt(input.value);
                if (total < 5) {
                    input.value = val + 1;
                    updateCustomPackTotal();
                }
            });
        });
    }

    if (addCustomPackBtn) {
        addCustomPackBtn.addEventListener('click', confirmAndAddCustomPack);
    }


    // --- 8. CONTACT MODAL CLOSE HANDLER ---
    const btnCloseContact = document.getElementById('btn-close-contact');
    if (btnCloseContact) btnCloseContact.addEventListener('click', () => closeModal('contact-modal'));


    // --- 9. CATALOG PDF VIEWER TOGGLE ---
    const btnViewCatalog = document.getElementById('btn-view-catalog');
    const btnClosePdf = document.getElementById('btn-close-pdf');
    const pdfPreviewBox = document.getElementById('pdf-preview-box');

    if (btnViewCatalog && pdfPreviewBox) {
        btnViewCatalog.addEventListener('click', () => {
            pdfPreviewBox.classList.remove('hidden');
        });
    }
    if (btnClosePdf && pdfPreviewBox) {
        btnClosePdf.addEventListener('click', () => {
            pdfPreviewBox.classList.add('hidden');
        });
    }


    // --- 10. CHECK FOR RETURN STATUS FROM WEBPAY SIMULATION ---
    checkPaymentReturnParams();

    // --- 11. INITIALIZE DATA LOAD & COUNTER ---
    initializeVisitorCounter();
    updateCartCount();
    filterByCategory('TODOS');
});


// ==========================================
// STORE CORE FUNCTIONS
// ==========================================

let activeCategory = 'TODOS';

function buildCompactCardHtml(prod) {
    const priceFormatted = prod.price.toLocaleString('es-CL');
    const isOffer = prod.category === 'OFERTAS' || prod.isOffer || prod.price <= 5000;
    const sizesList = (prod.sizes && prod.sizes.length > 0) ? prod.sizes : ["Estándar"];
    const mainSize = sizesList[0];

    return `
    <div class="product-card" onclick="openProductDetailModal('${prod.id}')">
        <div class="product-image-container">
            ${isOffer ? `<span class="card-oferta-badge"><i class="fa-solid fa-fire"></i> Oferta</span>` : ''}
            <img src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.onerror=null; this.src='logo_disfrazate_tech.jpg';">
            <div class="image-expand-hint">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ver Imagen Completa
            </div>
        </div>
        
        <div class="product-card-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="card-category-cyan">${prod.category}</span>
                <span style="font-size: 0.75rem; font-weight: bold; color: var(--accent-cyan); background: rgba(0, 240, 255, 0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0, 240, 255, 0.3);"><i class="fa-solid fa-barcode"></i> ${prod.id}</span>
            </div>
            <h3 class="product-card-title" title="${prod.name}">${prod.name}</h3>
            
            <div class="card-badge-subtitle">
                <i class="fa-solid fa-star"></i> MEJOR PRECIO &bull; Talla ${mainSize}
            </div>
            
            <div class="card-price-display">$${priceFormatted}</div>
            
            <button type="button" class="btn-card-buy-purple" onclick="event.stopPropagation(); addItemWithDetailsFromCard('${prod.id}', this)">
                <i class="fa-solid fa-cart-plus"></i> Agregar al Carro
            </button>
        </div>
    </div>`;
}

function filterByCategory(category) {
    activeCategory = category;
    const productsTitle = document.getElementById('productos-title');
    
    // Update active state in nav container
    document.querySelectorAll('.nav-container .nav-link').forEach(link => {
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (category === 'TODOS') {
        currentProducts = [...baseCatalogo];
        if (productsTitle) productsTitle.textContent = "TODOS LOS DISFRACES";
    } else if (category === 'OFERTAS') {
        currentProducts = baseCatalogo.filter(p => p.category === 'OFERTAS' || p.isOffer || p.price <= 5000);
        if (productsTitle) productsTitle.textContent = "OFERTAS Y PROMOCIONES";
    } else {
        currentProducts = baseCatalogo.filter(p => p.category === category);
        if (productsTitle) productsTitle.textContent = `DISFRACES: ${category.toUpperCase()}`;
    }

    currentPage = 1;
    applyOrderingAndRender();
}

function applyOrderingAndRender() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        const value = sortSelect.value;
        if (value === 'price-asc') {
            currentProducts.sort((a, b) => a.price - b.price);
        } else if (value === 'price-desc') {
            currentProducts.sort((a, b) => b.price - a.price);
        } else {
            currentProducts.sort((a, b) => a.id.localeCompare(b.id));
        }
    }
    renderProductsGrid();
}

function switchProductView(mode) {
    currentViewMode = mode;
    const btnList = document.getElementById('view-list-btn');
    const btnGrid = document.getElementById('view-grid-btn');
    if (btnList && btnGrid) {
        btnList.classList.toggle('active', mode === 'list');
        btnGrid.classList.toggle('active', mode === 'grid');
    }
    renderProductsGrid();
}
window.switchProductView = switchProductView;
window.filterByCategory = filterByCategory;

function renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const searchInput = document.getElementById('search-input');
    const isSearching = searchInput && searchInput.value.trim().length > 0;

    // IF in "TODOS" mode and NOT searching: Render grouped 4-card rows per category (superahorraya style)
    if (activeCategory === 'TODOS' && !isSearching && currentViewMode === 'grid') {
        grid.className = 'products-sections-wrapper';
        
        const sections = [
            { id: 'OFERTAS', title: 'OFERTAS DESTACADAS', icon: 'fa-fire', filter: p => p.isOffer || p.price <= 5000 },
            { id: 'NIÑO', title: 'DISFRACES DE NIÑO', icon: 'fa-child', filter: p => p.category === 'NIÑO' },
            { id: 'NIÑA', title: 'DISFRACES DE NIÑA', icon: 'fa-child-dress', filter: p => p.category === 'NIÑA' },
            { id: 'MUJER', title: 'DISFRACES DE MUJER', icon: 'fa-user-nurse', filter: p => p.category === 'MUJER' },
            { id: 'HOMBRE', title: 'DISFRACES DE HOMBRE', icon: 'fa-user-tie', filter: p => p.category === 'HOMBRE' }
        ];

        let html = '';
        sections.forEach(sec => {
            const items = baseCatalogo.filter(sec.filter).slice(0, 4);
            if (items.length === 0) return;

            const cardsHtml = items.map(prod => buildCompactCardHtml(prod)).join('');

            html += `
            <div class="category-row-section">
                <div class="category-row-header">
                    <h3 class="category-row-title"><i class="fa-solid ${sec.icon} text-accent"></i> ${sec.title}</h3>
                    <a href="#productos" onclick="event.preventDefault(); filterByCategory('${sec.id}')" class="see-category-link">Ver todos <i class="fa-solid fa-chevron-right"></i></a>
                </div>
                <div class="products-grid">
                    ${cardsHtml}
                </div>
            </div>`;
        });

        grid.innerHTML = html;
        renderPagination(0);
        return;
    }

    // Single Category or Search Grid / List View
    if (currentViewMode === 'list') {
        grid.className = 'products-list-view';
    } else {
        grid.className = 'products-grid';
    }

    if (currentProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 30px; font-weight: bold;">
            No se encontraron productos en esta sección.
        </p>`;
        renderPagination(0);
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = currentProducts.slice(startIndex, endIndex);

    let html = '';
    paginatedItems.forEach(prod => {
        if (currentViewMode === 'list') {
            const priceFormatted = prod.price.toLocaleString('es-CL');
            const isOffer = prod.category === 'OFERTAS' || prod.isOffer || prod.price <= 5000;
            html += `
            <div class="product-list-item" onclick="openProductDetailModal('${prod.id}')" title="Haz clic para ver fotos completas y comprar">
                <div class="list-thumb-box">
                    ${isOffer ? `<span class="list-offer-tag">OFERTA</span>` : ''}
                    <img src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.onerror=null; this.src='logo_disfrazate_tech.jpg';">
                    <div class="thumb-zoom-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </div>
                </div>
                
                <div class="list-item-info">
                    <div class="list-item-meta">
                        <span class="list-code-badge"><i class="fa-solid fa-barcode"></i> CÓD: ${prod.id}</span>
                        <span class="list-cat-badge">&bull; ${prod.category}</span>
                    </div>
                    <h3 class="list-item-title">${prod.name}</h3>
                    <p class="list-item-desc"><i class="fa-solid fa-circle-check text-success"></i> Stock disponible &bull; Envío rápido a todo Santiago</p>
                </div>
                
                <div class="list-item-actions">
                    <div class="list-price-box">
                        <span class="list-main-price">$${priceFormatted}</span>
                    </div>
                    
                    <div class="list-btn-row">
                        <button type="button" class="btn-list-expand" onclick="event.stopPropagation(); openProductDetailModal('${prod.id}')">
                            <i class="fa-solid fa-expand"></i> Ver / Ampliar
                        </button>
                        <button type="button" class="btn-list-cart" title="Agregar al Carro" onclick="event.stopPropagation(); addItemToCartFromCard('${prod.id}', this)">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            html += buildCompactCardHtml(prod);
        }
    });

    grid.innerHTML = html;
    renderPagination(currentProducts.length);
}

function addItemWithDetailsFromCard(productId, btn) {
    const prod = baseCatalogo.find(p => p.id === productId);
    if (!prod) return;

    const qtyEl = document.getElementById(`qty-input-${productId}`);
    const sizeEl = document.getElementById(`size-select-${productId}`);

    const qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
    const selectedSize = sizeEl ? sizeEl.value : 'Estándar';

    addToCart(prod, qty, selectedSize);

    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Agregado!`;
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 1500);
    }
}
window.addItemWithDetailsFromCard = addItemWithDetailsFromCard;

function renderPagination(totalItems) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }

    controls.innerHTML = `
        <button class="btn-page" id="btn-prev-page" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i> Anterior
        </button>
        <span class="pagination-info">Página ${currentPage} de ${totalPages}</span>
        <button class="btn-page" id="btn-next-page" ${currentPage === totalPages ? 'disabled' : ''}>
            Siguiente <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProductsGrid();
            window.scrollTo({ top: document.getElementById('productos').offsetTop - 80, behavior: 'smooth' });
        }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProductsGrid();
            window.scrollTo({ top: document.getElementById('productos').offsetTop - 80, behavior: 'smooth' });
        }
    });
}


// ==========================================
// CART ACTION HANDLERS
// ==========================================

function addItemToCartFromCard(productId, buttonElement) {
    const card = buttonElement.closest('.product-card');
    const qtyInput = card.querySelector('.product-qty');
    const qty = parseInt(qtyInput.value) || 1;
    
    const sizeSelect = card.querySelector('.product-size');
    const size = sizeSelect ? sizeSelect.value : null;

    const flavorSelect = card.querySelector('.product-flavor');
    const flavor = flavorSelect ? flavorSelect.value : null;

    const product = baseCatalogo.find(p => p.id === productId);
    if (!product) return;

    // Create item identifier for checking existing items
    const selectedAttributes = [];
    if (size) selectedAttributes.push(`Talla: ${size}`);
    if (flavor) selectedAttributes.push(flavor);
    const attributesString = selectedAttributes.join(', ');

    const existingIndex = carrito.findIndex(item => 
        item.id === productId && 
        item.flavor === attributesString
    );

    if (existingIndex !== -1) {
        carrito[existingIndex].quantity += qty;
    } else {
        carrito.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: qty,
            flavor: attributesString // Reuse flavor field for attributes text string
        });
    }

    saveCart();
    updateCartCount();

    // Visual button micro-animation feedback
    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
    buttonElement.style.backgroundColor = 'var(--success)';
    
    setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.style.backgroundColor = '';
    }, 1000);
}

function saveCart() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function updateCartCount() {
    const count = carrito.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function removeFromCart(index) {
    carrito.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartList();
}

function renderCartList() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (carrito.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Tu carro está vacío.</p>';
        renderCartTotals();
        return;
    }

    let html = '';
    carrito.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const attrText = item.flavor ? `<br><small style="color: var(--accent);">${item.flavor}</small>` : '';
        html += `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}${attrText}</h4>
                <p>${item.quantity} x $${item.price.toLocaleString('es-CL')} = <strong>$${itemTotal.toLocaleString('es-CL')}</strong></p>
            </div>
            <button type="button" class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        `;
    });
    container.innerHTML = html;
    renderCartTotals();
}

function renderCartTotals() {
    const subtotalPrice = document.getElementById('cart-subtotal-price');
    const shippingPrice = document.getElementById('cart-shipping-price');
    const totalPrice = document.getElementById('cart-total-price');
    const communeSelect = document.getElementById('customer-commune');

    if (!subtotalPrice || !totalPrice) return;

    const subtotal = carrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    subtotalPrice.textContent = `$${subtotal.toLocaleString('es-CL')}`;

    let shippingCost = 0;
    if (communeSelect && communeSelect.value) {
        const option = communeSelect.options[communeSelect.selectedIndex];
        shippingCost = parseInt(option.getAttribute('data-cost')) || 0;
    }

    // Apply Free Shipping Rule
    if (subtotal >= 50000 && subtotal > 0) {
        shippingCost = 0;
        if (shippingPrice) shippingPrice.innerHTML = `<span style="color: var(--success); font-weight: bold;">GRATIS</span>`;
    } else {
        if (shippingPrice) shippingPrice.textContent = `$${shippingCost.toLocaleString('es-CL')}`;
    }

    const finalTotal = subtotal + shippingCost;
    totalPrice.textContent = `$${finalTotal.toLocaleString('es-CL')}`;
}


// ==========================================
// ACCESSORY CUSTOM PACK DIALOG LOGIC
// ==========================================

function openCustomPackModal(productId) {
    const customModal = document.getElementById('custom-product-modal');
    if (!customModal) return;

    // Reset counts
    document.getElementById('qty-mago').value = 0;
    document.getElementById('qty-varita').value = 0;
    document.getElementById('qty-alas').value = 0;
    document.getElementById('qty-maquillaje').value = 0;
    document.getElementById('qty-mascara').value = 0;
    
    updateCustomPackTotal();
    openModal('custom-product-modal');
}

function getCustomPackSelectedSum() {
    const m = parseInt(document.getElementById('qty-mago').value) || 0;
    const v = parseInt(document.getElementById('qty-varita').value) || 0;
    const a = parseInt(document.getElementById('qty-alas').value) || 0;
    const q = parseInt(document.getElementById('qty-maquillaje').value) || 0;
    const c = parseInt(document.getElementById('qty-mascara').value) || 0;
    return m + v + a + q + c;
}

function updateCustomPackTotal() {
    const total = getCustomPackSelectedSum();
    const totalText = document.getElementById('custom-pack-total');
    if (totalText) totalText.textContent = total;

    const addBtn = document.getElementById('add-custom-pack-btn');
    if (addBtn) {
        if (total === 5) {
            addBtn.disabled = false;
            addBtn.style.opacity = '1';
            addBtn.style.cursor = 'pointer';
        } else {
            addBtn.disabled = true;
            addBtn.style.opacity = '0.5';
            addBtn.style.cursor = 'not-allowed';
        }
    }
}

function confirmAndAddCustomPack() {
    const m = parseInt(document.getElementById('qty-mago').value) || 0;
    const v = parseInt(document.getElementById('qty-varita').value) || 0;
    const a = parseInt(document.getElementById('qty-alas').value) || 0;
    const q = parseInt(document.getElementById('qty-maquillaje').value) || 0;
    const c = parseInt(document.getElementById('qty-mascara').value) || 0;

    if (m + v + a + q + c !== 5) {
        alert('Debes seleccionar exactamente 5 artículos.');
        return;
    }

    const baseProduct = baseCatalogo.find(p => p.id === 'PACK-MIXTO');
    if (!baseProduct) return;

    // Build custom name lists
    const packItemsList = [];
    if (m > 0) packItemsList.push(`${m}x Sombrero Mago`);
    if (v > 0) packItemsList.push(`${v}x Varita Luz`);
    if (a > 0) packItemsList.push(`${a}x Alas Hada`);
    if (q > 0) packItemsList.push(`${q}x Maquillaje`);
    if (c > 0) packItemsList.push(`${c}x Máscara Payaso`);
    const details = packItemsList.join(', ');

    const uniquePackId = `PACK-CUSTOM-${m}-${v}-${a}-${q}-${c}`;

    carrito.push({
        id: uniquePackId,
        name: `Mega Pack Personalizado (5 Accesorios)`,
        price: 12990,
        image: baseProduct.image,
        category: "PROMOCIONES",
        quantity: 1,
        flavor: details
    });

    saveCart();
    updateCartCount();
    closeModal('custom-product-modal');
    alert('¡Tu Pack de Accesorios Personalizado ha sido agregado al carro!');
}


// ==========================================
// CHECKOUT & SERVER ORDER INTEGRATION
// ==========================================

async function submitOrderCheckout() {
    if (carrito.length === 0) {
        alert('El carro de compras está vacío.');
        return;
    }

    const name = document.getElementById('customer-name').value.trim();
    const rut = document.getElementById('customer-rut').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const communeSelect = document.getElementById('customer-commune');
    const address = document.getElementById('customer-address').value.trim();
    const legalCheckbox = document.getElementById('legal-checkbox');

    if (!name || !rut || !phone || !communeSelect.value || !address) {
        alert('Por favor complete todos los datos obligatorios (*) del formulario de despacho.');
        return;
    }

    if (!legalCheckbox.checked) {
        alert('Debe aceptar los términos del servicio para continuar.');
        return;
    }

    const subtotal = carrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const selectedOption = communeSelect.options[communeSelect.selectedIndex];
    let shippingCost = parseInt(selectedOption.getAttribute('data-cost')) || 0;
    if (subtotal >= 50000) shippingCost = 0; // Free shipping rule

    const finalTotal = subtotal + shippingCost;
    const orderId = "ORDEN-" + Math.floor(10000 + Math.random() * 90000);

    const orderData = {
        id: orderId,
        date: new Date().toLocaleString('es-CL'),
        isoDate: new Date().toISOString(),
        customerName: name,
        customerRut: rut,
        customerPhone: phone,
        customerCommune: communeSelect.value,
        customerAddress: address,
        items: carrito,
        total: finalTotal
    };

    // Disable checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando con Transbank...';
    checkoutBtn.disabled = true;

    try {
        // Send order to pending orders list on backend
        const response = await fetch('/api/guardar-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        
        if (data.success) {
            // Save temporary customer context to retrieve on success landing page
            localStorage.setItem('clienteTemporal', JSON.stringify({ nombre: name, direccion: address }));
            
            // Redirect simulating Webpay successful authorization loop callback
            setTimeout(() => {
                window.location.href = `index.html?pago=exito&orden=${orderId}`;
            }, 1500);
        } else {
            alert('Error en respuesta del servidor al guardar el pedido.');
            checkoutBtn.innerHTML = originalText;
            checkoutBtn.disabled = false;
        }
    } catch (err) {
        console.error("Error conectando con backend:", err);
        // Fallback: simulated payment loop directly client-side if server is not active
        alert('Servidor desconectado. Simulando pago directo cliente-servidor...');
        localStorage.setItem('clienteTemporal', JSON.stringify({ nombre: name, direccion: address }));
        
        // Simular pedidosPendientes local storage fallback for client demonstration
        let localPedidos = JSON.parse(localStorage.getItem('pedidosPendientes')) || [];
        localPedidos.push(orderData);
        localStorage.setItem('pedidosPendientes', JSON.stringify(localPedidos));

        setTimeout(() => {
            window.location.href = `index.html?pago=exito&orden=${orderId}&fallback=true`;
        }, 1500);
    }
}

function checkPaymentReturnParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('pago');
    const orderId = urlParams.get('orden');
    const isFallback = urlParams.get('fallback');

    if (paymentStatus === 'exito' && orderId) {
        const clientInfo = JSON.parse(localStorage.getItem('clienteTemporal')) || { nombre: 'Cliente Valioso', direccion: 'Dirección Registrada' };
        
        // Success notification modal trigger or message
        alert(`¡PAGO AUTORIZADO EXITOSAMENTE!\n\nTu número de orden es: ${orderId}\nDespacharemos tu disfraz a: ${clientInfo.direccion}\n\n¡Gracias por preferir Disfrazate.cl! 🎭`);
        
        // Save the successful transaction immediately to sales history local cache (as backup)
        if (isFallback) {
            let localSales = JSON.parse(localStorage.getItem('ventasLocales')) || [];
            const subtotal = carrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            localSales.push({
                id: orderId,
                date: new Date().toLocaleString('es-CL'),
                isoDate: new Date().toISOString(),
                customerName: clientInfo.nombre,
                customerAddress: clientInfo.direccion,
                items: [...carrito],
                total: subtotal + 3500
            });
            localStorage.setItem('ventasLocales', JSON.stringify(localSales));
        }

        // Clear shopping cart
        carrito = [];
        saveCart();
        updateCartCount();
        
        // Clean URL query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


// ==========================================
// VISITOR COUNTER IMPLEMENTATION
// ==========================================

function initializeVisitorCounter() {
    const counterContainer = document.getElementById('visitor-flip-counter');
    if (!counterContainer) return;

    function renderCounterDigits(num) {
        const strNum = num.toString().padStart(5, '0');
        counterContainer.innerHTML = '';
        strNum.split('').forEach(digit => {
            const span = document.createElement('span');
            span.className = 'flip-digit';
            span.textContent = digit;
            counterContainer.appendChild(span);
        });
    }

    // Call server counter first, with local storage fallback
    fetch('/api/visitas/up')
        .then(res => res.json())
        .then(data => {
            renderCounterDigits(data.count);
        })
        .catch(err => {
            console.warn("Server counter offline, running client fallback count:", err);
            let clientCount = parseInt(localStorage.getItem('disfrazate_visits_count')) || 2332;
            clientCount++;
            localStorage.setItem('disfrazate_visits_count', clientCount);
            renderCounterDigits(clientCount);
        });
}


// ==========================================
// GENERAL MODAL TOGGLES
// ==========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        if (modalId === 'cart-modal') {
            renderCartList();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Export custom functions for HTML inline triggers
window.openCustomPackModal = openCustomPackModal;
window.filterCategory = (cat) => {
    const navLink = document.querySelector(`.nav-container .nav-link[data-category="${cat}"]`);
    if (navLink) {
        navLink.click();
    } else {
        filterByCategory(cat);
    }
};
window.addItemToCartFromCard = addItemToCartFromCard;

// ==========================================
// PRODUCT DETAIL & LIGHTBOX EXPANSION MODAL
// ==========================================
let currentDetailProduct = null;
let currentDetailSize = null;

function openProductDetailModal(productId) {
    const prod = baseCatalogo.find(p => p.id === productId);
    if (!prod) return;

    currentDetailProduct = prod;
    
    const modalImg = document.getElementById('modal-detail-img');
    const modalCode = document.getElementById('modal-detail-code');
    const modalCat = document.getElementById('modal-detail-cat');
    const modalTitle = document.getElementById('modal-detail-title');
    const modalPrice = document.getElementById('modal-detail-price');
    const modalOldPriceLine = document.getElementById('modal-detail-old-price-line');
    const modalOldPrice = document.getElementById('modal-detail-old-price');
    const modalSavings = document.getElementById('modal-detail-savings');
    const modalSizes = document.getElementById('modal-detail-sizes');
    const qtyInput = document.getElementById('detail-qty-input');
    const whatsappBtn = document.getElementById('btn-whatsapp-detail');
    const badge = document.getElementById('modal-detail-badge');

    if (qtyInput) qtyInput.value = 1;

    if (modalImg) {
        modalImg.src = prod.highResImage || prod.image;
        modalImg.onerror = function() {
            this.onerror = null;
            this.src = prod.image || 'logo_disfrazate_tech.jpg';
        };
    }
    if (modalCode) modalCode.textContent = prod.id;
    if (modalCat) modalCat.textContent = prod.category;
    if (modalTitle) modalTitle.textContent = prod.name;
    if (modalPrice) modalPrice.innerHTML = `$${prod.price.toLocaleString('es-CL')}`;
    if (modalOldPriceLine) modalOldPriceLine.style.display = 'none';
    const isProdOffer = prod.isOffer || prod.category === 'OFERTAS' || prod.price <= 5000;
    if (badge) badge.style.display = isProdOffer ? 'inline-block' : 'none';

    // Populate Size Buttons
    if (modalSizes) {
        modalSizes.innerHTML = '';
        const sizesList = (prod.sizes && prod.sizes.length > 0) ? prod.sizes : ["Estándar"];
        currentDetailSize = sizesList[0];

        sizesList.forEach((s, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `size-btn ${idx === 0 ? 'active' : ''}`;
            btn.textContent = `Talla ${s}`;
            btn.onclick = () => {
                modalSizes.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDetailSize = s;
            };
            modalSizes.appendChild(btn);
        });
    }

    // Set WhatsApp Order Link
    if (whatsappBtn) {
        const msg = encodeURIComponent(`Hola Disfrázate! Quisiera pedir el disfraz ${prod.name} (Código ${prod.id}) en Talla ${currentDetailSize || 'Estándar'}.`);
        whatsappBtn.href = `https://wa.me/56989784973?text=${msg}`;
    }

    openModal('product-detail-modal');
}

function openFullscreenLightbox(imgSrc) {
    const lightbox = document.getElementById('fullscreen-lightbox');
    const fullImg = document.getElementById('lightbox-full-img');
    if (lightbox && fullImg) {
        fullImg.src = imgSrc;
        lightbox.classList.remove('hidden');
    }
}

function closeFullscreenLightbox() {
    const lightbox = document.getElementById('fullscreen-lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
    }
}

window.openProductDetailModal = openProductDetailModal;
window.openFullscreenLightbox = openFullscreenLightbox;
window.closeFullscreenLightbox = closeFullscreenLightbox;

document.addEventListener('DOMContentLoaded', () => {
    const btnCloseDetail = document.getElementById('btn-close-product-detail');
    if (btnCloseDetail) btnCloseDetail.addEventListener('click', () => closeModal('product-detail-modal'));

    document.getElementById('detail-qty-minus')?.addEventListener('click', () => {
        const input = document.getElementById('detail-qty-input');
        if (input && parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });

    document.getElementById('detail-qty-plus')?.addEventListener('click', () => {
        const input = document.getElementById('detail-qty-input');
        if (input && parseInt(input.value) < 99) {
            input.value = parseInt(input.value) + 1;
        }
    });

    document.getElementById('btn-add-detail-cart')?.addEventListener('click', () => {
        if (!currentDetailProduct) return;
        const qty = parseInt(document.getElementById('detail-qty-input')?.value || 1);
        
        addToCart({
            id: currentDetailProduct.id,
            name: currentDetailProduct.name,
            price: currentDetailProduct.price,
            image: currentDetailProduct.image,
            category: currentDetailProduct.category,
            size: currentDetailSize || 'Estándar',
            qty: qty
        });

        closeModal('product-detail-modal');
        openModal('cart-modal');
    });
});
