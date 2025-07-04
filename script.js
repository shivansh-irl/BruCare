// Shopping Cart Array
let cart = [];

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Selecting various elements from the DOM
    const pageLinks = document.querySelectorAll('.page-link');
    const pageSections = document.querySelectorAll('.page-section');
    const navLinksDesktop = document.querySelectorAll('.nav-menu-desktop .nav-link');
    const navLinksMobile = document.querySelectorAll('#mobile-nav-menu .nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');

    // Cart Elements
    const openCartBtn = document.getElementById('openCartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartItemCountEl = document.getElementById('cartItemCount');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');


    // --- Navigation and Page Setup ---
    function showSection(targetId) {
        pageSections.forEach(section => section.classList.remove('active'));
        navLinksDesktop.forEach(link => link.classList.remove('active-nav'));
        navLinksMobile.forEach(link => link.classList.remove('active-nav'));

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            navLinksDesktop.forEach(link => {
                if (link.getAttribute('href') === `#${targetId}`) link.classList.add('active-nav');
            });
            navLinksMobile.forEach(link => {
                if (link.getAttribute('href') === `#${targetId}`) link.classList.add('active-nav');
            });

            const cards = targetSection.querySelectorAll('.product-card, .hero-text, .hero-image-container, .section-title');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.05}s`;
                card.style.opacity = '0'; 
                card.style.transform = 'translateY(20px)';
                void card.offsetWidth; 
                if (card.classList.contains('hero-text')) card.style.animationName = 'slideInLeft';
                else if (card.classList.contains('hero-image-container')) card.style.animationName = 'slideInRight';
                else if (card.classList.contains('section-title')) card.style.animationName = 'fadeInDown';
                else card.style.animationName = 'fadeInUp';
            });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId); 
            if (mobileNavMenu.classList.contains('active')) {
                mobileNavMenu.classList.remove('active');
            }
            if(history.pushState) {
                history.pushState(null, null, `#${targetId}`);
            } else {
                location.hash = `#${targetId}`;
            }
        });
    });
    
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        showSection(hash || 'home'); 
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', () => mobileNavMenu.classList.toggle('active'));
    }
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // --- Shopping Cart Logic ---
    function openCartModal() {
        updateCartDisplay();
        cartModal.style.display = "flex";
    }

    function closeCartModal() {
        cartModal.style.display = "none";
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCartModal);
    if (closeCartModalBtn) closeCartModalBtn.addEventListener('click', closeCartModal);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productId = card.dataset.productId;
            const productName = card.dataset.productName;
            const productPrice = parseFloat(card.dataset.productPrice);
            addItemToCart(productId, productName, productPrice);
             // Optional: Show a quick confirmation
            showSimpleModal("Added to Cart!", `${productName} has been added to your cart.`);
        });
    });

    function addItemToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        updateCartDisplay();
    }

    function updateCartItemQuantity(id, newQuantity) {
        const itemInCart = cart.find(item => item.id === id);
        if (itemInCart) {
            itemInCart.quantity = newQuantity;
            if (itemInCart.quantity <= 0) {
                removeItemFromCart(id); // Remove if quantity is 0 or less
            } else {
                updateCartDisplay();
            }
        }
    }
    
    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Clear current items
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item', 'flex', 'items-center', 'justify-between', 'py-3', 'border-b', 'border-slate-700');
                itemElement.innerHTML = `
                    <div class="cart-item-details flex-grow">
                        <p class="cart-item-name text-gray-200 font-semibold">${item.name}</p>
                        <p class="cart-item-price text-sm text-gray-400">$${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-quantity flex items-center">
                        <button class="quantity-change text-yellow-400 hover:text-yellow-300" data-id="${item.id}" data-change="-1">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="w-12 text-center bg-slate-700 border border-slate-600 rounded mx-2 p-1 text-gray-200" data-id="${item.id}" readonly>
                        <button class="quantity-change text-yellow-400 hover:text-yellow-300" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <div class="cart-item-subtotal text-gray-200 font-semibold w-20 text-right mx-2">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item-btn bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs" data-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
                itemCount += item.quantity;
            });
        }
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
        cartItemCountEl.textContent = itemCount;
        // Add event listeners for new remove and quantity buttons
        addCartItemEventListeners();
    }

    function addCartItemEventListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                removeItemFromCart(e.target.dataset.id);
            });
        });
        document.querySelectorAll('.quantity-change').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                const change = parseInt(e.target.dataset.change);
                const itemInCart = cart.find(item => item.id === itemId);
                if (itemInCart) {
                    updateCartItemQuantity(itemId, itemInCart.quantity + change);
                }
            });
        });
         // Prevent direct input in quantity fields to force use of buttons
        document.querySelectorAll('.cart-item-quantity input[type="number"]').forEach(input => {
            input.addEventListener('change', (e) => { // Or 'input' event for real-time
                const itemId = e.target.dataset.id;
                let newQuantity = parseInt(e.target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1; // Reset to 1 if invalid
                }
                updateCartItemQuantity(itemId, newQuantity);
            });
        });
    }
    
    if(clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            updateCartDisplay();
            showSimpleModal("Cart Cleared", "Your shopping cart has been emptied.");
        });
    }

    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                showSimpleModal("Checkout", "Thank you for your order! (This is a demo checkout).");
                cart = []; // Clear cart after mock checkout
                updateCartDisplay();
                closeCartModal();
            } else {
                showSimpleModal("Empty Cart", "Your cart is empty. Please add items before checking out.");
            }
        });
    }
    updateCartDisplay(); // Initial call to set cart count to 0 if empty
            
    // --- Vet Search Functionality (Mock) ---
    const searchVetBtn = document.getElementById('searchVetBtn');
    const locationInput = document.getElementById('locationInput');
    const vetResultsDiv = document.getElementById('vetResults');

    if (searchVetBtn) {
        searchVetBtn.addEventListener('click', function() {
            const location = locationInput.value.trim();
            vetResultsDiv.innerHTML = ''; 

            if (location === '') {
                showSimpleModal("Vet Search", "Please enter a location to search for vets.");
                return;
            }
            
            const searchingEl = document.createElement('p');
            searchingEl.className = 'text-center text-gray-400 italic';
            searchingEl.textContent = `Searching for vets near "${location}"...`;
            vetResultsDiv.appendChild(searchingEl);

            setTimeout(() => {
                vetResultsDiv.innerHTML = ''; 
                const mockVets = [ 
                    { name: 'Happy Paws Veterinary Clinic', address: `123 Main St, ${location}`, phone: '555-1234', hours: 'Mon-Fri 9am-6pm' },
                    { name: 'City Pet Hospital', address: `456 Oak Ave, ${location}`, phone: '555-5678', hours: 'Mon-Sat 8am-7pm, Sun 10am-4pm (Emergency)' },
                    { name: `${location} Animal Care`, address: `789 Pine Ln, ${location}`, phone: '555-9012', hours: '24/7 Emergency Services' }
                ];

                if (mockVets.length > 0) {
                    mockVets.forEach((vet, index) => {
                        const vetEl = document.createElement('div');
                        vetEl.className = 'vet-item bg-slate-700 p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/40';
                        vetEl.style.opacity = '0'; 
                        vetEl.style.transform = 'translateY(10px)'; 
                        vetEl.innerHTML = `
                            <h3 class="text-xl font-semibold text-purple-300 mb-2">${vet.name}</h3>
                            <p class="text-gray-300"><strong class="text-gray-100">Address:</strong> ${vet.address}</p>
                            <p class="text-gray-300"><strong class="text-gray-100">Phone:</strong> ${vet.phone}</p>
                            <p class="text-gray-300"><strong class="text-gray-100">Hours:</strong> ${vet.hours}</p>
                        `;
                        vetResultsDiv.appendChild(vetEl);
                        setTimeout(() => {
                            vetEl.style.opacity = '1';
                            vetEl.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                } else {
                    vetResultsDiv.innerHTML = '<p class="text-center text-gray-400">No vets found for this location (demo). Try another search.</p>';
                }
            }, 1500); 
        });
    }

    // --- Simple Modal Functions ---
    const simpleMessageModal = document.getElementById('messageModal');
    const simpleModalMessageText = document.getElementById('modalMessageText');
    const simpleModalTitleEl = document.getElementById('simpleModalTitle');

    window.showSimpleModal = function(title, message) { 
        simpleModalTitleEl.textContent = title;
        simpleModalMessageText.textContent = message;
        simpleMessageModal.style.display = "flex";
    }

    window.closeSimpleModal = function() { 
        simpleMessageModal.style.display = "none";
    }
            
    window.onclick = function(event) {
        if (event.target == simpleMessageModal) {
            closeSimpleModal();
        }
        // Removed AI modal close condition
        if (event.target == cartModal) { // Close cart modal on outside click
            closeCartModal();
        }
    }

    // Initialize the first page view
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('home'); 
        if(history.replaceState) {
            history.replaceState(null, null, '#home');
        }
    }
});
