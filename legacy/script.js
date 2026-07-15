




        // ============================================================
        // 🔥 SCENTRA CLOUD ERP - LOCAL STORAGE VERSION (FIREBASE REMOVED)
        // ============================================================

        // ---------- GLOBAL VARIABLES ----------
        var products = [];
        var sales = [];
        var invoices = [];
        var customers = [];
        var reviews = [];
        var expenses = [];
        var shops = [];
        var announcements = [];
        var cart = [];
        var editId = null;
        var invoiceId = 1001;
        var subEditId = null;
        var charts = {};
        var currentShopId = null;
        var CURRENCY = 'PKR';
        var shopCredentials = {};
        var isSuperAdmin = false;
        var isShopDisabled = false;
        var isLoading = true;
        var SUPABASE_URL = 'https://mitgvezvfdgslkgsmvcx.supabase.co';
        var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdGd2ZXp2ZmRnc2xrZ21zdmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjA0MTAsImV4cCI6MjA5OTY5NjQxMH0._TIAYkhoPYYlaRLAvL1Bplvihk0Voal-rQyAz_Hn4s4';
        var supabaseClient = null;

        // ---------- PASSWORD TOGGLE ----------
        function togglePass(id, btn) {
            var inp = document.getElementById(id);
            if (inp.type === 'password') { inp.type = 'text'; btn.innerHTML = '<i class="bi bi-eye-slash"></i>'; } 
            else { inp.type = 'password'; btn.innerHTML = '<i class="bi bi-eye"></i>'; }
        }

        // ---------- TODAY DATE ----------
        function today() { return new Date().toISOString().split('T')[0]; }

        // ---------- FORMAT CURRENCY ----------
        function formatCurrency(amount) { return CURRENCY + ' ' + Number(amount).toFixed(2); }

        // ---------- GET PRODUCT ----------
        function getProduct(id) {
            for (var i = 0; i < products.length; i++) {
                if (products[i].id === id) return products[i];
            }
            return null;
        }

        // ---------- GEN INVOICE ----------
        function genInvoice() { return 'INV-' + (invoiceId++); }

        // ---------- GET CURRENT SHOP ----------
        function getCurrentShop() {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === currentShopId) return shops[i];
            }
            return null;
        }

        // ---------- LOAD SHOP DATA ----------
        function loadShopData(shopId) {
            products = window['products_' + shopId] || [];
            sales = window['sales_' + shopId] || [];
            invoices = window['invoices_' + shopId] || [];
            customers = window['customers_' + shopId] || [];
            reviews = window['reviews_' + shopId] || [];
            expenses = window['expenses_' + shopId] || [];
        }

        function loadShopDataFromCache(shopId) {
            return window['products_' + shopId] && window['products_' + shopId].length > 0;
        }

        // ---------- SAVE SHOP DATA ----------
        function saveShopData(shopId) {
            window['products_' + shopId] = products;
            window['sales_' + shopId] = sales;
            window['invoices_' + shopId] = invoices;
            window['customers_' + shopId] = customers;
            window['reviews_' + shopId] = reviews;
            window['expenses_' + shopId] = expenses;
            saveAllDataToLocalStorage();
            if (supabaseClient) {
                saveShopDataToSupabase(shopId);
            }
        }

        // ---------- LOAD DATA (Supabase or localStorage) ----------
        function loadAllData(callback) {
            if (initSupabase()) {
                loadAllFromSupabase(function(success) {
                    if (success && shops.length) {
                        for (var i = 0; i < shops.length; i++) {
                            var sid = shops[i].id;
                            window['products_' + sid] = window['products_' + sid] || [];
                            window['sales_' + sid] = window['sales_' + sid] || [];
                            window['invoices_' + sid] = window['invoices_' + sid] || [];
                            window['customers_' + sid] = window['customers_' + sid] || [];
                            window['reviews_' + sid] = window['reviews_' + sid] || [];
                            window['expenses_' + sid] = window['expenses_' + sid] || [];
                        }
                        if (callback) callback(true);
                    } else {
                        loadFromLocalStorage(callback);
                    }
                });
            } else {
                loadFromLocalStorage(callback);
            }
        }

        function loadFromLocalStorage(callback) {
            var data = localStorage.getItem('scentra_data');
            if (data) {
                try {
                    var parsed = JSON.parse(data);
                    shops = parsed.shops || [];
                    announcements = parsed.announcements || [];
                    shopCredentials = parsed.shopCredentials || {};
                    invoiceId = parsed.invoiceId || 1001;
                    
                    for (var i = 0; i < shops.length; i++) {
                        var sid = shops[i].id;
                        window['products_' + sid] = parsed['products_' + sid] || [];
                        window['sales_' + sid] = parsed['sales_' + sid] || [];
                        window['invoices_' + sid] = parsed['invoices_' + sid] || [];
                        window['customers_' + sid] = parsed['customers_' + sid] || [];
                        window['reviews_' + sid] = parsed['reviews_' + sid] || [];
                        window['expenses_' + sid] = parsed['expenses_' + sid] || [];
                    }
                    if (callback) callback(true);
                    return;
                } catch(e) {
                    console.error("Parse error:", e);
                }
            }
            if (callback) callback(false);
        }

        // ---------- SAVE DATA TO LOCAL STORAGE ----------
        function saveAllDataToLocalStorage() {
            var data = {
                shops: shops,
                announcements: announcements,
                shopCredentials: shopCredentials,
                invoiceId: invoiceId
            };
            for (var i = 0; i < shops.length; i++) {
                var sid = shops[i].id;
                data['products_' + sid] = window['products_' + sid] || [];
                data['sales_' + sid] = window['sales_' + sid] || [];
                data['invoices_' + sid] = window['invoices_' + sid] || [];
                data['customers_' + sid] = window['customers_' + sid] || [];
                data['reviews_' + sid] = window['reviews_' + sid] || [];
                data['expenses_' + sid] = window['expenses_' + sid] || [];
            }
            localStorage.setItem('scentra_data', JSON.stringify(data));
            if (supabaseClient) {
                saveShopsToSupabase();
                saveAnnouncementsToSupabase();
            }
        }

        // ---------- SEED DEFAULT DATA ----------
        function seedDefaultData() {
            shops = [
                { id: 1, name: 'Oud Palace', owner: 'Ahmed', phone: '555-1001', email: 'ahmed@oud.com', 
                  package: 'Premium', payment: 'paid', expiry: '2026-12-31', status: 'active', 
                  openTime: '09:00', closeTime: '22:00', username: 'ahmed', password: 'ahmed123' },
                { id: 2, name: 'Rose Perfume', owner: 'Fatima', phone: '555-1002', email: 'fatima@rose.com',
                  package: 'Basic', payment: 'pending', expiry: '2026-07-15', status: 'expired', 
                  openTime: '10:00', closeTime: '21:00', username: 'fatima', password: 'fatima123' },
                { id: 3, name: 'Musk House', owner: 'Omar', phone: '555-1003', email: 'omar@musk.com',
                  package: 'Enterprise', payment: 'paid', expiry: '2026-11-01', status: 'active', 
                  openTime: '08:00', closeTime: '23:00', username: 'omar', password: 'omar123' }
            ];

            shopCredentials = {};
            for (var s = 0; s < shops.length; s++) {
                shopCredentials[shops[s].username] = { password: shops[s].password, shopId: shops[s].id };
            }

            for (var s = 0; s < shops.length; s++) {
                var sid = shops[s].id;
                window['products_' + sid] = [
                    { id: 1, name: 'Oud Royale', brand: 'Scentra', category: 'Oud', qty: 45, 
                      buyPrice: 4500, sellPrice: 8900, barcode: 'SKU001', desc: 'Premium oud' },
                    { id: 2, name: 'Rose Noir', brand: 'Scentra', category: 'Floral', qty: 32, 
                      buyPrice: 3800, sellPrice: 7500, barcode: 'SKU002', desc: 'Dark rose' }
                ];
                window['sales_' + sid] = [];
                window['invoices_' + sid] = [];
                window['customers_' + sid] = [];
                window['reviews_' + sid] = [];
                window['expenses_' + sid] = [];
            }

            announcements = [
                { id: 1, title: 'Welcome!', msg: 'System ready! Add your products and start selling.', 
                  date: today(), targetShop: null }
            ];
            invoiceId = 1001;
            saveAllDataToLocalStorage();
        }

        // ---------- INIT DATA ----------
        function initData() {
            document.getElementById('loadingScreen').style.display = 'flex';
            
            loadAllData(function(loaded) {
                if (!loaded || shops.length === 0) {
                    seedDefaultData();
                }
                finishInit();
            });
        }

        function finishInit() {
            document.getElementById('loadingScreen').style.display = 'none';
            isLoading = false;
            showPage('loginPage');
            populateShopDropdown();
            refreshAll();
        }

        // ---------- SUPABASE INIT ----------
        function initSupabase() {
            if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
                });
                return true;
            }
            return false;
        }

        // ---------- SUPABASE HELPERS ----------
        function loadAllFromSupabase(callback) {
            if (!supabaseClient) { if (callback) callback(false); return; }
            var loaded = 0;
            function checkDone() { loaded++; if (loaded >= 2 && callback) callback(true); }

            supabaseClient.from('shops').select('*').order('id').then(function(res) {
                if (res.data && res.data.length) {
                    shops = res.data;
                    shopCredentials = {};
                    invoiceId = shops.reduce(function(m, s) { return Math.max(m, s.invoice_id || 1001); }, 1001);
                    for (var i = 0; i < shops.length; i++) {
                        var s = shops[i];
                        shopCredentials[s.username] = { password: s.password, shopId: s.id };
                    }
                }
                checkDone();
            });

            supabaseClient.from('announcements').select('*').order('id').then(function(res) {
                if (res.data) announcements = res.data;
                checkDone();
            });
        }

        function saveShopDataToSupabase(shopId) {
            if (!supabaseClient) return;
            var tables = [
                { name: 'products', data: products },
                { name: 'sales', data: sales },
                { name: 'invoices', data: invoices },
                { name: 'customers', data: customers },
                { name: 'reviews', data: reviews },
                { name: 'expenses', data: expenses }
            ];
            for (var i = 0; i < tables.length; i++) {
                var t = tables[i];
                var records = [];
                for (var j = 0; j < t.data.length; j++) {
                    var copy = {};
                    for (var k in t.data[j]) { copy[k] = t.data[j][k]; }
                    copy.shop_id = shopId;
                    records.push(copy);
                }
                supabaseClient.from(t.name).upsert(records, { onConflict: 'id' }).then(function(r) {
                    if (r.error) console.error('Supabase save error:', r.error);
                });
            }
        }

        function loadShopDataFromSupabase(shopId, callback) {
            if (!supabaseClient) { if (callback) callback(); return; }
            var tables = ['products', 'sales', 'invoices', 'customers', 'reviews', 'expenses'];
            var loaded = 0;
            for (var i = 0; i < tables.length; i++) {
                makeLoader(tables[i], i);
            }
            function makeLoader(tableName, idx) {
                supabaseClient.from(tableName).select('*').eq('shop_id', shopId).then(function(res) {
                    if (res.data) {
                        var cleaned = [];
                        for (var j = 0; j < res.data.length; j++) {
                            var item = {};
                            for (var k in res.data[j]) {
                                if (k !== 'shop_id' && k !== 'created_at') item[k] = res.data[j][k];
                            }
                            cleaned.push(item);
                        }
                        window[tableName] = cleaned;
                    }
                    loaded++;
                    if (loaded === tables.length && callback) callback();
                });
            }
        }

        function deleteShopDataFromSupabase(shopId) {
            if (!supabaseClient) return;
            var tables = ['products', 'sales', 'invoices', 'customers', 'reviews', 'expenses'];
            for (var i = 0; i < tables.length; i++) {
                supabaseClient.from(tables[i]).delete().eq('shop_id', shopId).then();
            }
        }

        function saveShopsToSupabase() {
            if (!supabaseClient) return;
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                s.invoice_id = invoiceId;
            }
            supabaseClient.from('shops').upsert(shops, { onConflict: 'id' }).then();
        }

        function saveAnnouncementsToSupabase() {
            if (!supabaseClient) return;
            supabaseClient.from('announcements').upsert(announcements, { onConflict: 'id' }).then();
        }

        // ---------- POPULATE SHOP DROPDOWN ----------
        function populateShopDropdown() {
            var select = document.getElementById('shopUserSelect');
            var html = '<option value="">Select your shop</option>';
            for (var i = 0; i < shops.length; i++) {
                html += '<option value="' + shops[i].username + '">' + shops[i].name + ' (' + shops[i].username + ')</option>';
            }
            select.innerHTML = html;
        }

        // ---------- ADD NEW SHOP ----------
        function addNewShop() {
            var d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            document.getElementById('newShopExpiry').value = d.toISOString().split('T')[0];
            document.getElementById('newShopName').value = '';
            document.getElementById('newShopOwner').value = '';
            document.getElementById('newShopUsername').value = 'shop' + (shops.length + 1);
            document.getElementById('newShopPassword').value = 'shop' + (shops.length + 1) + '123';
            document.getElementById('newShopPhone').value = '';
            document.getElementById('newShopEmail').value = '';
            document.getElementById('newShopPackage').value = 'Basic';
            document.getElementById('newShopPayment').value = 'pending';
            document.getElementById('newShopOpen').value = '09:00';
            document.getElementById('newShopClose').value = '22:00';
            document.getElementById('newShopStatus').value = 'active';
            new bootstrap.Modal(document.getElementById('addShopModal')).show();
        }

        function saveNewShop() {
            var name = document.getElementById('newShopName').value.trim();
            var owner = document.getElementById('newShopOwner').value.trim();
            var username = document.getElementById('newShopUsername').value.trim();
            var password = document.getElementById('newShopPassword').value.trim();
            
            if (!name || !owner || !username || !password) {
                Swal.fire({ icon: 'error', title: 'Error!', text: 'All fields are required!', confirmButtonColor: '#7c3aed' });
                return;
            }
            
            if (shopCredentials[username]) {
                Swal.fire({ icon: 'error', title: 'Error!', text: 'Username already exists!', confirmButtonColor: '#7c3aed' });
                return;
            }
            
            var newId = 1;
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id >= newId) newId = shops[i].id + 1;
            }
            var shop = {
                id: newId,
                name: name,
                owner: owner,
                phone: document.getElementById('newShopPhone').value || 'N/A',
                email: document.getElementById('newShopEmail').value || 'N/A',
                package: document.getElementById('newShopPackage').value,
                payment: document.getElementById('newShopPayment').value,
                expiry: document.getElementById('newShopExpiry').value,
                status: document.getElementById('newShopStatus').value,
                openTime: document.getElementById('newShopOpen').value || '09:00',
                closeTime: document.getElementById('newShopClose').value || '22:00',
                username: username,
                password: password
            };
            shops.push(shop);
            shopCredentials[username] = { password: password, shopId: newId };
            window['products_' + newId] = [];
            window['sales_' + newId] = [];
            window['invoices_' + newId] = [];
            window['customers_' + newId] = [];
            window['reviews_' + newId] = [];
            window['expenses_' + newId] = [];

            bootstrap.Modal.getInstance(document.getElementById('addShopModal')).hide();
            Swal.fire({ icon: 'success', title: 'Shop Added!', confirmButtonColor: '#7c3aed' });
            saveAllDataToLocalStorage();
            refreshAll();
            populateShopDropdown();
        }

        // ---------- DELETE SHOP ----------
        function deleteShop(id) {
            var shop = null;
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) { shop = shops[i]; break; }
            }
            if (!shop) return;

            Swal.fire({
                title: 'Delete Shop?',
                text: 'Are you sure you want to delete "' + shop.name + '"?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#7c3aed',
                confirmButtonText: 'Yes, Delete!'
            }).then(function(result) {
                if (result.isConfirmed) {
                    delete shopCredentials[shop.username];
                    delete window['products_' + id];
                    delete window['sales_' + id];
                    delete window['invoices_' + id];
                    delete window['customers_' + id];
                    delete window['reviews_' + id];
                    delete window['expenses_' + id];
                    if (supabaseClient) {
                        deleteShopDataFromSupabase(id);
                        supabaseClient.from('shops').delete().eq('id', id).then();
                    }
                    var newShops = [];
                    for (var i = 0; i < shops.length; i++) {
                        if (shops[i].id !== id) newShops.push(shops[i]);
                    }
                    shops = newShops;
                    if (currentShopId === id) {
                        if (shops.length > 0) {
                            currentShopId = shops[0].id;
                            loadShopData(currentShopId);
                        }
                    }
                    saveAllDataToLocalStorage();
                    refreshAll();
                    populateShopDropdown();
                    Swal.fire({ icon: 'success', title: 'Deleted!', confirmButtonColor: '#7c3aed' });
                }
            });
        }

        // ---------- CHECK SHOP STATUS ----------
        function checkAndFreezeShop() {
            var shop = getCurrentShop();
            if (!shop) return false;
            
            var todayDate = new Date();
            var expiryDate = new Date(shop.expiry);
            var isExpired = todayDate > expiryDate;
            var isBlocked = shop.status === 'blocked' || shop.status === 'suspended';
            
            if (isExpired || isBlocked) {
                isShopDisabled = true;
                document.getElementById('shopDisabledOverlay').classList.add('show');
                if (isBlocked) {
                    document.querySelector('.shop-disabled-overlay .card h2').textContent = '⛔ Shop Blocked!';
                    document.querySelector('.shop-disabled-overlay .card .icon i').className = 'bi bi-slash-circle';
                } else {
                    document.querySelector('.shop-disabled-overlay .card h2').textContent = '⚠️ Subscription Expired!';
                    document.querySelector('.shop-disabled-overlay .card .icon i').className = 'bi bi-clock-history';
                }
                return true;
            } else {
                isShopDisabled = false;
                document.getElementById('shopDisabledOverlay').classList.remove('show');
                return false;
            }
        }

        function closeDisabledOverlay() {
            document.getElementById('shopDisabledOverlay').classList.remove('show');
            isShopDisabled = false;
            currentShopId = null;
            showPage('loginPage');
        }

        function requestRenewal() {
            Swal.fire({
                title: 'Request Renewal',
                text: 'Your renewal request has been sent to admin.',
                icon: 'info',
                confirmButtonColor: '#7c3aed'
            });
        }

        // ---------- RENDER DASHBOARD ----------
        function renderDashboard() {
            var shop = getCurrentShop();
            if (shop) {
                document.getElementById('shopNameDisplay').innerHTML = shop.name + ' <span>ERP</span>';
                document.getElementById('shopOwnerDisplay').textContent = '👤 ' + shop.owner;
                document.getElementById('expiryDateDisplay').textContent = 'Exp: ' + shop.expiry;
            }
            
            checkAndFreezeShop();
            updateShopTiming();
            renderShopAnnouncements();

            var totalP = products.length;
            var totalS = 0;
            for (var i = 0; i < products.length; i++) totalS += products[i].qty;
            var low = 0, out = 0;
            for (var i = 0; i < products.length; i++) {
                if (products[i].qty <= 5) low++;
                if (products[i].qty === 0) out++;
            }

            document.getElementById('todayDate').textContent = today();
            document.getElementById('dashStats').innerHTML =
                '<div class="col-6 col-xl-3 col-lg-4 col-md-6"><div class="stat-card" style="padding:0.6rem;"><div><h6 class="text-muted" style="font-size:0.65rem;">Products</h6><h2 style="font-size:1.2rem;">' + totalP +
                '</h2></div><i class="bi bi-box stat-icon" style="font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-xl-3 col-lg-4 col-md-6"><div class="stat-card" style="padding:0.6rem;"><div><h6 class="text-muted" style="font-size:0.65rem;">Stock</h6><h2 style="font-size:1.2rem;">' + totalS +
                '</h2></div><i class="bi bi-boxes stat-icon" style="font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-xl-3 col-lg-4 col-md-6"><div class="stat-card warning" style="padding:0.6rem;"><div><h6 class="text-muted" style="font-size:0.65rem;">Low</h6><h2 class="text-warning" style="font-size:1.2rem;">' + low +
                '</h2></div><i class="bi bi-exclamation-triangle stat-icon" style="font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-xl-3 col-lg-4 col-md-6"><div class="stat-card expired" style="padding:0.6rem;"><div><h6 class="text-muted" style="font-size:0.65rem;">Out</h6><h2 class="text-danger" style="font-size:1.2rem;">' + out +
                '</h2></div><i class="bi bi-x-circle stat-icon" style="font-size:1.3rem;"></i></div></div>';

            // Recent orders
            var recent = sales.slice(-5).reverse();
            var html = '';
            for (var i = 0; i < recent.length; i++) {
                var s = recent[i];
                html += '<tr><td>' + s.invoice + '</td><td>' + s.customer + '</td><td><span class="customer-source-badge">' +
                    (s.source || 'Walk-in') + '</span></td><td>' + formatCurrency(s.total) +
                    '</td><td><span class="badge-soft-primary">Done</span></td></tr>';
            }
            document.getElementById('recentOrders').innerHTML = html;

            // Top selling
            var ps = {};
            for (var i = 0; i < sales.length; i++) {
                for (var j = 0; j < sales[i].items.length; j++) {
                    var pid = sales[i].items[j].productId;
                    if (!ps[pid]) ps[pid] = 0;
                    ps[pid] += sales[i].items[j].qty;
                }
            }
            var top = Object.entries(ps).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 3);
            var topHtml = '';
            for (var i = 0; i < top.length; i++) {
                var p = getProduct(parseInt(top[i][0]));
                if (p) {
                    topHtml += '<li class="py-1 border-bottom d-flex justify-content-between"><span>' + p.name +
                        '</span><span class="fw-bold">' + top[i][1] + '</span></li>';
                }
            }
            document.getElementById('topSelling').innerHTML = topHtml;

            updateCharts();
        }

        function updateShopTiming() {
            var shop = getCurrentShop();
            if (!shop) return;
            var now = new Date();
            var currentTime = now.getHours() * 60 + now.getMinutes();
            var openTime = shop.openTime ? shop.openTime.split(':').map(Number) : [9, 0];
            var closeTime = shop.closeTime ? shop.closeTime.split(':').map(Number) : [22, 0];
            var openMinutes = openTime[0] * 60 + openTime[1];
            var closeMinutes = closeTime[0] * 60 + closeTime[1];
            var isOpen = currentTime >= openMinutes && currentTime < closeMinutes;
            var statusEl = document.getElementById('shopTimingStatus');
            if (isOpen) {
                statusEl.textContent = '🟢 Open';
                statusEl.className = 'badge-soft-primary';
            } else {
                statusEl.textContent = '🔴 Closed';
                statusEl.className = 'badge-expired';
            }
            document.getElementById('shopTimeDisplay').textContent =
                String(openTime[0]).padStart(2, '0') + ':' + String(openTime[1]).padStart(2, '0') + ' - ' +
                String(closeTime[0] > 12 ? closeTime[0] - 12 : closeTime[0]).padStart(2, '0') + ':' + String(closeTime[1])
                .padStart(2, '0') + (closeTime[0] >= 12 ? ' PM' : ' AM');
        }

        function renderShopAnnouncements() {
            var container = document.getElementById('shopAnnouncements');
            var shopAnnouncements = [];
            for (var i = 0; i < announcements.length; i++) {
                if (announcements[i].targetShop === null || announcements[i].targetShop === currentShopId) {
                    shopAnnouncements.push(announcements[i]);
                }
            }
            if (shopAnnouncements.length === 0) { container.innerHTML = ''; return; }
            var html = '';
            for (var i = 0; i < shopAnnouncements.length; i++) {
                var a = shopAnnouncements[i];
                html += '<div class="announcement-banner" style="padding:0.3rem 0.8rem;"><div class="d-flex justify-content-between align-items-center"><div><span class="announce-title" style="font-size:0.8rem;"><i class="bi bi-megaphone-fill text-gold me-1"></i>' +
                    a.title + '</span><span class="announce-date ms-1" style="font-size:0.6rem;">' + a.date +
                    '</span></div></div><p class="mb-0 mt-0" style="font-size:0.7rem;">' + a.msg + '</p></div>';
            }
            container.innerHTML = html;
        }

        // ---------- RENDER FUNCTIONS ----------
        function renderProducts() {
            var html = '';
            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                html += '<tr><td><strong>' + p.name + '</strong></td><td>' + p.brand + '</td><td>' + p.category +
                    '</td><td>' + p.qty + '</td><td>' + formatCurrency(p.sellPrice) + '</td><td class="text-success">' +
                    formatCurrency(p.sellPrice - p.buyPrice) +
                    '</td><td><button class="btn btn-sm btn-outline-primary-custom me-1" onclick="editProduct(' + p.id +
                    ')"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(' +
                    p.id + ')"><i class="bi bi-trash"></i></button></td></tr>';
            }
            document.getElementById('productsBody').innerHTML = html;
        }

        function renderStock() {
            var totalS = 0, sold = 0, val = 0;
            for (var i = 0; i < products.length; i++) {
                totalS += products[i].qty;
                val += products[i].buyPrice * products[i].qty;
            }
            for (var i = 0; i < sales.length; i++) {
                for (var j = 0; j < sales[i].items.length; j++) {
                    sold += sales[i].items[j].qty;
                }
            }
            var low = [];
            for (var i = 0; i < products.length; i++) {
                if (products[i].qty <= 5) low.push(products[i]);
            }
            document.getElementById('stockCards').innerHTML =
                '<div class="col-6 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Current</h6><h2 style="font-size:1.2rem;">' + totalS +
                '</h2></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Sold</h6><h2 style="font-size:1.2rem;">' + sold +
                '</h2></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card warning" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Low</h6><h2 class="text-warning" style="font-size:1.2rem;">' +
                low.length + '</h2></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Value</h6><h2 style="font-size:1rem;">' + formatCurrency(
                    val) + '</h2></div></div>';

            var html = '';
            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                var soldCount = 0;
                for (var j = 0; j < sales.length; j++) {
                    for (var k = 0; k < sales[j].items.length; k++) {
                        if (sales[j].items[k].productId === p.id) soldCount += sales[j].items[k].qty;
                    }
                }
                var status = 'In Stock', badge = 'badge-soft-primary';
                if (p.qty === 0) { status = 'Out';
                    badge = 'badge-expired'; } else if (p.qty <= 5) { status = 'Low';
                    badge = 'badge-warning'; }
                html += '<tr><td>' + p.name + '</td><td>' + p.qty + '</td><td>' + soldCount + '</td><td><span class="' +
                    badge + '">' + status + '</span></td></tr>';
            }
            document.getElementById('stockBody').innerHTML = html;
        }

        function renderInvoices() {
            var html = '';
            for (var i = 0; i < invoices.length; i++) {
                var inv = invoices[i];
                html += '<tr><td><strong>' + inv.id + '</strong></td><td>' + inv.customer +
                    '</td><td><span class="customer-source-badge">' + (inv.source || 'Walk-in') +
                    '</span></td><td>' + formatCurrency(inv.total) + '</td><td>' + inv.date +
                    '</td><td><span class="badge-soft-primary">' + (inv.payment || 'Cash') +
                    '</span></td><td><button class="btn btn-sm btn-outline-primary-custom" onclick="printInvoice(\'' +
                    inv.id + '\')"><i class="bi bi-printer"></i></button></td></tr>';
            }
            document.getElementById('invoicesBody').innerHTML = html;
        }

        function renderCustomers() {
            var html = '';
            for (var i = 0; i < customers.length; i++) {
                var c = customers[i];
                html += '<tr><td><strong>' + c.name + '</strong></td><td>' + c.phone + '</td><td>' + c.email +
                    '</td><td><span class="customer-source-badge">' + (c.source || 'Walk-in') +
                    '</span></td><td>' + c.orders + '</td><td>' + formatCurrency(c.spent) + '</td></tr>';
            }
            document.getElementById('customersBody').innerHTML = html;
        }

        function renderReviews() {
            var html = '';
            for (var i = 0; i < reviews.length; i++) {
                var r = reviews[i];
                var stars = '';
                for (var j = 0; j < r.rating; j++) stars += '★';
                for (var j = r.rating; j < 5; j++) stars += '☆';
                html += '<div class="border-bottom py-2"><div class="d-flex justify-content-between flex-wrap"><h6 style="font-size:0.8rem;">' + r.customer +
                    ' ⭐ ' + stars + '</h6><span class="badge-soft-primary">' + r.status +
                    '</span></div><p class="text-muted" style="font-size:0.7rem;">' + r.review + '</p>';
                if (r.reply) {
                    html += '<p class="text-success" style="font-size:0.7rem;"><strong>Reply:</strong> ' + r.reply + '</p>';
                } else {
                    html += '<button class="btn btn-sm btn-outline-primary-custom" onclick="replyReview(' + r.id +
                        ')">Reply</button>';
                }
                html += '</div>';
            }
            document.getElementById('reviewsContainer').innerHTML = html;
        }

        function renderProfit() {
            var totalP = 0, totalE = 0;
            for (var i = 0; i < sales.length; i++) {
                for (var j = 0; j < sales[i].items.length; j++) {
                    var p = getProduct(sales[i].items[j].productId);
                    if (p) {
                        totalP += (p.sellPrice - p.buyPrice) * sales[i].items[j].qty;
                    }
                }
            }
            for (var i = 0; i < expenses.length; i++) totalE += expenses[i].amount;
            document.getElementById('profitCards').innerHTML =
                '<div class="col-4 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Profit</h6><h2 class="text-success" style="font-size:1.1rem;">' +
                formatCurrency(totalP) + '</h2></div></div>' +
                '<div class="col-4 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Expenses</h6><h2 class="text-danger" style="font-size:1.1rem;">' +
                formatCurrency(totalE) + '</h2></div></div>' +
                '<div class="col-4 col-md-3"><div class="stat-card" style="padding:0.6rem;"><h6 class="text-muted" style="font-size:0.65rem;">Net</h6><h2 style="font-size:1.1rem;">' +
                formatCurrency(totalP - totalE) + '</h2></div></div>';
        }

        function renderExpenses() {
            var html = '';
            for (var i = 0; i < expenses.length; i++) {
                var e = expenses[i];
                html += '<div class="d-flex justify-content-between border-bottom py-1"><span style="font-size:0.7rem;">' + e.desc + ' (' + e
                    .date + ')</span><span class="fw-bold" style="font-size:0.7rem;">' + formatCurrency(e.amount) + '</span></div>';
            }
            document.getElementById('expensesList').innerHTML = html;
        }

        // ---------- SUPER RENDER ----------
        function renderSuper() {
            var total = shops.length;
            var active = 0, expired = 0, blocked = 0;
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                var isExpired = new Date(s.expiry) <= new Date();
                if (s.status === 'blocked' || s.status === 'suspended') blocked++;
                else if (s.status === 'active' && !isExpired) active++;
                else if (s.status === 'expired' || isExpired) expired++;
            }

            document.getElementById('superStats').innerHTML =
                '<div class="col-6 col-md-3"><div class="stat-card" style="padding:0.6rem;"><div><h6 class="text-muted" style="color:#b8a8d4 !important;font-size:0.65rem;">Total</h6><h2 style="color:#e8dff5 !important;font-size:1.2rem;">' + total +
                '</h2></div><i class="bi bi-shop stat-icon" style="color:var(--gold) !important;font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card" style="padding:0.6rem;"><div><h6 class="text-muted" style="color:#b8a8d4 !important;font-size:0.65rem;">Active</h6><h2 style="color:#4ade80 !important;font-size:1.2rem;">' + active +
                '</h2></div><i class="bi bi-check-circle stat-icon" style="color:#4ade80 !important;font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card expired" style="padding:0.6rem;"><div><h6 class="text-muted" style="color:#b8a8d4 !important;font-size:0.65rem;">Expired</h6><h2 style="color:#f87171 !important;font-size:1.2rem;">' + expired +
                '</h2></div><i class="bi bi-clock-history stat-icon" style="color:#f87171 !important;font-size:1.3rem;"></i></div></div>' +
                '<div class="col-6 col-md-3"><div class="stat-card blocked" style="padding:0.6rem;"><div><h6 class="text-muted" style="color:#b8a8d4 !important;font-size:0.65rem;">Blocked</h6><h2 style="color:#9ca3af !important;font-size:1.2rem;">' + blocked +
                '</h2></div><i class="bi bi-slash-circle stat-icon" style="color:#9ca3af !important;font-size:1.3rem;"></i></div></div>';

            var html = '';
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                var isExpired = new Date(s.expiry) <= new Date();
                var statusClass = 'badge-soft-primary', statusText = 'Active';
                if (s.status === 'blocked' || s.status === 'suspended') { statusClass = 'badge-blocked';
                    statusText = s.status; } else if (s.status === 'expired' || isExpired) { statusClass =
                        'badge-expired';
                    statusText = 'Expired'; }
                html += '<tr><td><strong style="color:#e8dff5 !important;">' + s.name +
                    '</strong></td><td style="color:#b8a8d4 !important;">' + s.owner +
                    '</td><td style="color:#b8a8d4 !important;">' + s.package +
                    '</td><td style="color:#b8a8d4 !important;">' + s.expiry +
                    '</td><td><span class="' + (s.payment === 'paid' ? 'badge-soft-primary' : 'badge-warning') + '">' +
                    s.payment + '</span></td><td><span class="' + statusClass + '">' + statusText +
                    '</span></td><td><button class="btn btn-sm btn-outline-primary-custom me-1" onclick="manageShop(' +
                    s.id + ')">Manage</button><button class="btn btn-sm btn-outline-danger-custom" onclick="deleteShop(' +
                    s.id + ')"><i class="bi bi-trash"></i></button></td></tr>';
            }
            document.getElementById('superShops').innerHTML = html;

            var gridHtml = '';
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                var isExpired = new Date(s.expiry) <= new Date();
                var cardClass = '';
                if (s.status === 'blocked' || s.status === 'suspended') cardClass = 'blocked';
                else if (s.status === 'expired' || isExpired) cardClass = 'expired';
                gridHtml += '<div class="col-12 col-md-6 col-lg-4"><div class="super-shop-card ' + cardClass +
                    '" style="padding:0.6rem;"><h5 style="color:#e8dff5 !important;font-size:0.9rem;">' + s.name +
                    ' <small style="color:#b8a8d4 !important;font-size:0.65rem;">(' + s.owner +
                    ')</small></h5><p style="color:#b8a8d4 !important;font-size:0.7rem;">' + s.package +
                    ' · <span class="shop-status" style="color:#e8dff5 !important;">' + s.status +
                    '</span></p><p style="color:#b8a8d4 !important;font-size:0.65rem;"><small>Expires: ' + s.expiry +
                    '</small></p><div class="shop-actions"><button class="btn btn-sm btn-primary-custom" onclick="manageShop(' +
                    s.id + ')">Manage</button><button class="btn btn-sm btn-outline-success" onclick="activateShop(' +
                    s.id + ')">Activate</button><button class="btn btn-sm btn-outline-danger" onclick="blockShop(' +
                    s.id + ')">Block</button><button class="btn btn-sm btn-outline-danger-custom" onclick="deleteShop(' +
                    s.id + ')"><i class="bi bi-trash"></i></button></div></div></div>';
            }
            document.getElementById('allShopsGrid').innerHTML = gridHtml;

            var subsHtml = '';
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                var expClass = new Date(s.expiry) <= new Date() ? 'expired' : '';
                subsHtml += '<div class="super-shop-card mb-1 ' + expClass +
                    '" style="padding:0.6rem;"><div class="d-flex justify-content-between align-items-center flex-wrap"><div><strong style="color:#e8dff5 !important;font-size:0.8rem;">' +
                    s.name + '</strong> <span style="color:#b8a8d4 !important;font-size:0.7rem;">- ' + s.package +
                    '</span></div><div style="color:#b8a8d4 !important;font-size:0.65rem;">Expires: ' + s.expiry +
                    ' | <span class="' + (s.payment === 'paid' ? 'badge-soft-primary' : 'badge-warning') + '">' + s
                    .payment +
                    '</span></div><div><button class="btn btn-sm btn-outline-primary-custom me-1" onclick="editSubscription(' +
                    s.id + ')">Edit</button><button class="btn btn-sm btn-outline-danger-custom" onclick="deleteShop(' +
                    s.id + ')"><i class="bi bi-trash"></i></button></div></div></div>';
            }
            document.getElementById('subsList').innerHTML = subsHtml;

            var payHtml = '';
            for (var i = 0; i < shops.length; i++) {
                var s = shops[i];
                payHtml += '<div class="super-shop-card mb-1" style="padding:0.6rem;"><div class="d-flex justify-content-between align-items-center flex-wrap"><div><strong style="color:#e8dff5 !important;font-size:0.8rem;">' +
                    s.name + '</strong> <span style="color:#b8a8d4 !important;font-size:0.7rem;">- ' + s.owner +
                    '</span></div><div><span class="' + (s.payment === 'paid' ? 'badge-soft-primary' :
                        'badge-warning') + '">' + (s.payment === 'paid' ? '✅ Paid' : '⏳ Pending') +
                    '</span></div></div></div>';
            }
            document.getElementById('paymentsList').innerHTML = payHtml;

            var blockedShops = [];
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].status === 'blocked' || shops[i].status === 'suspended') blockedShops.push(shops[i]);
            }
            var blockedHtml = '';
            if (blockedShops.length) {
                for (var i = 0; i < blockedShops.length; i++) {
                    var s = blockedShops[i];
                    blockedHtml += '<div class="super-shop-card mb-1 blocked" style="padding:0.6rem;"><div class="d-flex justify-content-between align-items-center flex-wrap"><div><strong style="color:#e8dff5 !important;font-size:0.8rem;">' +
                        s.name +
                        '</strong> <span style="color:#b8a8d4 !important;font-size:0.7rem;">- ' + s.status +
                        '</span></div><div><button class="btn btn-sm btn-outline-primary-custom me-1" onclick="activateShop(' +
                        s.id +
                        ')">Unblock</button><button class="btn btn-sm btn-outline-danger-custom" onclick="deleteShop(' +
                        s.id + ')"><i class="bi bi-trash"></i></button></div></div></div>';
                }
            } else {
                blockedHtml = '<p style="color:#b8a8d4 !important;font-size:0.75rem;">No blocked shops</p>';
            }
            document.getElementById('blockedList').innerHTML = blockedHtml;

            var annHtml = '';
            for (var i = 0; i < announcements.length; i++) {
                var a = announcements[i];
                var targetName = a.targetShop ? 'Specific Shop' : 'All Shops';
                for (var j = 0; j < shops.length; j++) {
                    if (shops[j].id === a.targetShop) targetName = shops[j].name;
                }
                annHtml += '<div class="card-premium p-2 mb-1" style="padding:0.6rem;"><div class="d-flex justify-content-between flex-wrap"><h6 style="color:#e8dff5 !important;font-size:0.8rem;">' +
                    a.title + '</h6><span class="badge-soft-primary">' + a.date +
                    '</span></div><p style="color:#b8a8d4 !important;font-size:0.7rem;">' + a.msg +
                    '</p><small style="color:#b8a8d4 !important;font-size:0.6rem;">Target: ' + targetName +
                    '</small><button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteAnnounce(' + a.id +
                    ')"><i class="bi bi-trash"></i></button></div>';
            }
            document.getElementById('announceList').innerHTML = annHtml;
        }

        function updateCharts() {
            var labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            for (var key in charts) {
                if (charts[key]) charts[key].destroy();
            }

            var c1 = document.getElementById('salesChart');
            if (c1) {
                var ctx = c1.getContext('2d');
                charts.salesChart = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: [{
                        label: 'Sales',
                        data: [12000, 19000, 28000, 24000, 31000, 48000],
                        borderColor: '#7c3aed',
                        tension: 0.3
                    }] }, options: { responsive: true, maintainAspectRatio: false } });
            }
            var c2 = document.getElementById('profitChart');
            if (c2) {
                var ctx = c2.getContext('2d');
                charts.profitChart = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{
                        label: 'Profit',
                        data: [4000, 7000, 11000, 9000, 15000, 22000],
                        backgroundColor: '#7c3aed'
                    }] }, options: { responsive: true, maintainAspectRatio: false } });
            }
            var c3 = document.getElementById('superRevenue');
            if (c3) {
                var ctx = c3.getContext('2d');
                charts.superRevenue = new Chart(ctx, { type: 'bar', data: { labels: ['W1', 'W2', 'W3', 'W4'],
                        datasets: [{ label: 'Revenue', data: [32000, 48000, 51000, 69000],
                            backgroundColor: 'rgba(212,175,55,0.8)' }] }, options: { responsive: true, maintainAspectRatio: false } });
            }
            var c4 = document.getElementById('superStatus');
            if (c4) {
                var ctx = c4.getContext('2d');
                charts.superStatus = new Chart(ctx, { type: 'doughnut', data: { labels: ['Active', 'Expired',
                            'Blocked'
                        ], datasets: [{ data: [18, 6, 4], backgroundColor: ['#4ade80', '#f87171',
                                '#9ca3af'
                            ] }] }, options: { responsive: true, maintainAspectRatio: false } });
            }
        }

        // ---------- PRODUCT CRUD ----------
        function addProductModal() {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            document.getElementById('pName').value = '';
            document.getElementById('pBrand').value = '';
            document.getElementById('pCategory').value = '';
            document.getElementById('pQty').value = 10;
            document.getElementById('pBuy').value = 2000;
            document.getElementById('pSell').value = 3500;
            document.getElementById('pBarcode').value = 'SKU' + Date.now();
            document.getElementById('pDesc').value = '';
            new bootstrap.Modal(document.getElementById('addProductModal')).show();
        }

        function saveProduct() {
            if (isShopDisabled) return;
            var product = {
                id: Date.now(),
                name: document.getElementById('pName').value || 'New',
                brand: document.getElementById('pBrand').value || 'Scentra',
                category: document.getElementById('pCategory').value || 'General',
                qty: parseInt(document.getElementById('pQty').value) || 0,
                buyPrice: parseFloat(document.getElementById('pBuy').value) || 0,
                sellPrice: parseFloat(document.getElementById('pSell').value) || 0,
                barcode: document.getElementById('pBarcode').value || 'SKU' + Date.now(),
                desc: document.getElementById('pDesc').value || ''
            };
            products.push(product);
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            saveShopData(currentShopId);
            Swal.fire({ icon: 'success', title: 'Product Added!', confirmButtonColor: '#7c3aed' });
            refreshAll();
        }

        function editProduct(id) {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            var p = getProduct(id);
            if (!p) return;
            editId = id;
            document.getElementById('eName').value = p.name || '';
            document.getElementById('eBrand').value = p.brand || '';
            document.getElementById('eCategory').value = p.category || '';
            document.getElementById('eQty').value = p.qty || 0;
            document.getElementById('eBuy').value = p.buyPrice || 0;
            document.getElementById('eSell').value = p.sellPrice || 0;
            document.getElementById('eBarcode').value = p.barcode || '';
            document.getElementById('eDesc').value = p.desc || '';
            new bootstrap.Modal(document.getElementById('editProductModal')).show();
        }

        function updateProduct() {
            if (isShopDisabled) return;
            var p = getProduct(editId);
            if (!p) return;
            p.name = document.getElementById('eName').value || p.name;
            p.brand = document.getElementById('eBrand').value || p.brand;
            p.category = document.getElementById('eCategory').value || p.category;
            p.qty = parseFloat(document.getElementById('eQty').value) || 0;
            p.buyPrice = parseFloat(document.getElementById('eBuy').value) || 0;
            p.sellPrice = parseFloat(document.getElementById('eSell').value) || 0;
            p.barcode = document.getElementById('eBarcode').value || p.barcode;
            p.desc = document.getElementById('eDesc').value || p.desc;
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            saveShopData(currentShopId);
            Swal.fire({ icon: 'success', title: 'Updated!', confirmButtonColor: '#7c3aed' });
            refreshAll();
        }

        function deleteProduct(id) {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            Swal.fire({ title: 'Delete Product?', icon: 'warning', showCancelButton: true,
                confirmButtonColor: '#dc3545', cancelButtonColor: '#7c3aed' }).then(function(r) {
                if (r.isConfirmed) {
                    var newProducts = [];
                    for (var i = 0; i < products.length; i++) {
                        if (products[i].id !== id) newProducts.push(products[i]);
                    }
                    products = newProducts;
                    saveShopData(currentShopId);
                    Swal.fire({ icon: 'success', title: 'Deleted!', confirmButtonColor: '#7c3aed' });
                    refreshAll();
                }
            });
        }

        // ---------- POS FUNCTIONS ----------
        function searchProduct(q) {
            var res = document.getElementById('posResults');
            if (!q.trim()) { res.innerHTML = ''; return; }
            var found = [];
            for (var i = 0; i < products.length; i++) {
                if (products[i].name.toLowerCase().includes(q.toLowerCase()) || products[i].barcode.includes(q)) {
                    found.push(products[i]);
                }
            }
            var html = '';
            for (var i = 0; i < found.length; i++) {
                var p = found[i];
                html += '<div class="pos-cart-item" onclick="addToCart(' + p.id + ')" style="padding:0.2rem 0.5rem;cursor:pointer;"><span>' + p.name + ' - ' +
                    formatCurrency(p.sellPrice) + ' (' + p.qty + ')</span><button class="btn btn-sm btn-primary-custom">Add</button></div>';
            }
            res.innerHTML = html;
        }

        function addToCart(id) {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            var p = getProduct(id);
            if (!p || p.qty <= 0) { alert('Out of stock!'); return; }
            var exist = null;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].productId === id) { exist = cart[i]; break; }
            }
            if (exist) { if (exist.qty >= p.qty) { alert('Not enough stock!'); return; }
                exist.qty++; } else cart.push({ productId: id, qty: 1, price: p.sellPrice });
            renderCart();
        }

        function addToCartFromSearch() {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            var q = document.getElementById('posSearch').value;
            if (!q) { alert('Search first!'); return; }
            var found = [];
            for (var i = 0; i < products.length; i++) {
                if (products[i].name.toLowerCase().includes(q.toLowerCase()) || products[i].barcode.includes(q)) {
                    found.push(products[i]);
                }
            }
            if (found.length) addToCart(found[0].id);
            else alert('Not found');
        }

        function removeFromCart(index) { cart.splice(index, 1);
            renderCart(); }

        function renderCart() {
            var cont = document.getElementById('posCart');
            if (!cart.length) { cont.innerHTML = '<p class="text-muted" style="font-size:0.7rem;">Cart empty</p>';
                updateTotal(); return; }
            var html = '';
            for (var i = 0; i < cart.length; i++) {
                var it = cart[i];
                var p = getProduct(it.productId);
                html += '<div class="pos-cart-item" style="padding:0.2rem 0.5rem;"><span>' + (p ? p.name : 'Unknown') + ' x' + it.qty + ' - ' +
                    formatCurrency(it.price * it.qty) +
                    '</span><button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(' + i +
                    ')"><i class="bi bi-x"></i></button></div>';
            }
            cont.innerHTML = html;
            updateTotal();
        }

        function updateTotal() {
            var disc = parseFloat(document.getElementById('posDiscount').value) || 0;
            var tax = parseFloat(document.getElementById('posTax').value) || 0;
            var sub = 0;
            for (var i = 0; i < cart.length; i++) sub += cart[i].price * cart[i].qty;
            var dAmt = sub * (disc / 100);
            var tAmt = (sub - dAmt) * (tax / 100);
            document.getElementById('posTotal').textContent = (sub - dAmt + tAmt).toFixed(2);
        }

        function completeSale() {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            if (!cart.length) { alert('Cart empty!'); return; }
            var disc = parseFloat(document.getElementById('posDiscount').value) || 0;
            var tax = parseFloat(document.getElementById('posTax').value) || 0;
            var payment = document.getElementById('posPayment').value;
            var source = document.getElementById('posSource').value;
            var sub = 0;
            for (var i = 0; i < cart.length; i++) sub += cart[i].price * cart[i].qty;
            var total = sub - (sub * (disc / 100)) + ((sub - sub * (disc / 100)) * (tax / 100));
            for (var i = 0; i < cart.length; i++) {
                var p = getProduct(cart[i].productId);
                if (p) p.qty -= cart[i].qty;
            }
            var inv = genInvoice();
            var items = [];
            for (var i = 0; i < cart.length; i++) {
                items.push({ productId: cart[i].productId, qty: cart[i].qty, price: cart[i].price });
            }
            var saleData = { id: Date.now(), items: items, total: total, date: today(), customer: 'Walk-in',
                invoice: inv, payment: payment, source: source };
            sales.push(saleData);
            invoices.push({ id: inv, customer: 'Walk-in', total: total, date: today(), payment: payment,
                source: source });
            var existing = null;
            for (var i = 0; i < customers.length; i++) {
                if (customers[i].name === 'Walk-in') { existing = customers[i]; break; }
            }
            if (!existing) {
                customers.push({ id: Date.now(), name: 'Walk-in', phone: '', email: '', orders: 0, spent: 0,
                    source: source });
                existing = customers[customers.length - 1];
            }
            existing.orders += 1;
            existing.spent += total;
            saveShopData(currentShopId);
            Swal.fire({ icon: 'success', title: 'Sale Complete!', text: 'Invoice: ' + inv + ' | Total: ' +
                    formatCurrency(total) + ' | Payment: ' + payment + ' | Source: ' + source,
                confirmButtonColor: '#7c3aed' });
            cart = [];
            document.getElementById('posDiscount').value = 0;
            document.getElementById('posTax').value = 5;
            document.getElementById('posSearch').value = '';
            document.getElementById('posResults').innerHTML = '';
            renderCart();
            refreshAll();
        }

        function clearCart() { cart = [];
            renderCart();
            document.getElementById('posSearch').value = '';
            document.getElementById('posResults').innerHTML = ''; }

        function replyReview(id) {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            Swal.fire({ title: 'Reply', input: 'textarea', inputLabel: 'Your reply', showCancelButton: true,
                confirmButtonColor: '#7c3aed' }).then(function(r) {
                if (r.isConfirmed && r.value) {
                    for (var i = 0; i < reviews.length; i++) {
                        if (reviews[i].id === id) {
                            reviews[i].reply = r.value;
                            reviews[i].status = 'replied';
                            break;
                        }
                    }
                    saveShopData(currentShopId);
                    refreshAll();
                    Swal.fire({ icon: 'success', title: 'Replied!', confirmButtonColor: '#7c3aed' });
                }
            });
        }

        function addExpense() {
            if (isShopDisabled) { Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' }); return; }
            Swal.fire({ title: 'Add Expense',
                html: '<input class="swal2-input" id="expDesc" placeholder="Description" value="Office" style="font-size:0.9rem;"><input class="swal2-input" id="expAmt" type="number" placeholder="Amount" value="500" style="font-size:0.9rem;">',
                showCancelButton: true, confirmButtonColor: '#7c3aed' }).then(function(r) {
                if (r.isConfirmed) {
                    expenses.push({ id: Date.now(), desc: document.getElementById('expDesc').value || 'Expense',
                        amount: parseFloat(document.getElementById('expAmt').value) || 0, date: today() });
                    saveShopData(currentShopId);
                    refreshAll();
                    Swal.fire({ icon: 'success', title: 'Added!', confirmButtonColor: '#7c3aed' });
                }
            });
        }

        function genReport(type) {
            var res = document.getElementById('reportResult');
            var data = [], title = '';
            if (type === 'daily') { data = sales.filter(function(s) { return s.date === today(); });
                title = 'Daily Report'; } else if (type === 'weekly') { data = sales.slice(-7);
                title = 'Weekly Report'; } else if (type === 'monthly') { data = sales.filter(function(s) { return s
                        .date.startsWith(today().slice(0, 7)); });
                title = 'Monthly Report'; } else { data = sales;
                title = 'Yearly Report'; }
            var total = 0;
            for (var i = 0; i < data.length; i++) total += data[i].total;
            var html = '<h6 style="font-size:0.85rem;">' + title + '</h6><p style="font-size:0.75rem;">Sales: ' + data.length + ' | Revenue: ' + formatCurrency(total) +
                '</p><div class="table-responsive"><table class="table table-custom"><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Payment</th><th>Source</th></tr></thead><tbody>';
            for (var i = 0; i < data.length; i++) {
                var s = data[i];
                html += '<tr><td>' + s.invoice + '</td><td>' + s.date + '</td><td>' + formatCurrency(s.total) +
                    '</td><td>' + (s.payment || 'Cash') + '</td><td><span class="customer-source-badge">' + (s
                        .source || 'Walk-in') + '</span></td></tr>';
            }
            html += '</tbody></table></div>';
            res.innerHTML = html;
        }

        // ---------- SUPER ADMIN FUNCTIONS ----------
        function manageShop(id) {
            var shop = null;
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) { shop = shops[i]; break; }
            }
            if (!shop) return;
            var isExpired = new Date(shop.expiry) <= new Date();
            var isBlocked = shop.status === 'blocked' || shop.status === 'suspended';
            Swal.fire({
                title: 'Manage ' + shop.name,
                html: '<div class="text-start" style="font-size:0.8rem;"><p><strong>Status:</strong> ' + shop.status + (isExpired ?
                    ' ⚠️ Expired' : '') + (isBlocked ? ' ⛔ Blocked' : '') +
                    '</p><p><strong>Package:</strong> ' + shop.package + '</p><p><strong>Expiry:</strong> ' + shop
                    .expiry + '</p><p><strong>Payment:</strong> ' + shop.payment +
                    '</p><p><strong>Username:</strong> ' + shop.username + '</p><p><strong>Password:</strong> ' + shop
                    .password +
                    '</p><hr><button class="btn btn-sm btn-success" onclick="activateShop(' + id +
                    ')">Activate</button> <button class="btn btn-sm btn-warning" onclick="suspendShop(' + id +
                    ')">Suspend</button> <button class="btn btn-sm btn-danger" onclick="blockShop(' + id + ')">' + (
                        isBlocked ? 'Blocked' : 'Block') +
                    '</button> <button class="btn btn-sm btn-primary-custom" onclick="renewShop(' + id +
                    ')">Renew +1Y</button> <button class="btn btn-sm btn-gold-custom" onclick="extendShop(' +
                    id + ')">+30 Days</button>' +
                    '<hr><button class="btn btn-sm btn-danger" onclick="deleteShop(' + id +
                    ')"><i class="bi bi-trash"></i> Delete</button></div>',
                showConfirmButton: false,
                showCloseButton: true
            });
        }

        function activateShop(id) {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) { shops[i].status = 'active';
                    shops[i].payment = 'paid'; break; }
            }
            saveAllDataToLocalStorage();
            refreshAll();
            Swal.fire({ icon: 'success', title: 'Activated!', confirmButtonColor: '#7c3aed' });
        }

        function suspendShop(id) {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) { shops[i].status = 'suspended'; break; }
            }
            saveAllDataToLocalStorage();
            refreshAll();
            Swal.fire({ icon: 'info', title: 'Suspended', confirmButtonColor: '#7c3aed' });
        }

        function blockShop(id) {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) {
                    if (shops[i].status === 'blocked' || shops[i].status === 'suspended') {
                        Swal.fire({ icon: 'info', title: 'Already Blocked', confirmButtonColor: '#7c3aed' });
                        return;
                    }
                    shops[i].status = 'blocked';
                    break;
                }
            }
            saveAllDataToLocalStorage();
            refreshAll();
            Swal.fire({ icon: 'error', title: 'Blocked!', text: 'Shop is now blocked.',
                confirmButtonColor: '#7c3aed' });
        }

        function renewShop(id) {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) {
                    var d = new Date();
                    d.setFullYear(d.getFullYear() + 1);
                    shops[i].expiry = d.toISOString().split('T')[0];
                    shops[i].payment = 'paid';
                    shops[i].status = 'active';
                    break;
                }
            }
            saveAllDataToLocalStorage();
            refreshAll();
            Swal.fire({ icon: 'success', title: 'Renewed for 1 Year!', confirmButtonColor: '#7c3aed' });
        }

        function extendShop(id) {
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) {
                    var d = new Date(shops[i].expiry);
                    d.setDate(d.getDate() + 30);
                    shops[i].expiry = d.toISOString().split('T')[0];
                    shops[i].payment = 'paid';
                    shops[i].status = 'active';
                    break;
                }
            }
            saveAllDataToLocalStorage();
            refreshAll();
            Swal.fire({ icon: 'success', title: 'Extended 30 Days!', confirmButtonColor: '#7c3aed' });
        }

        function addSubscription() {
            var select = document.getElementById('subShopSelect');
            var html = '';
            for (var i = 0; i < shops.length; i++) {
                html += '<option value="' + shops[i].id + '">' + shops[i].name + '</option>';
            }
            select.innerHTML = html;
            document.getElementById('subPackage').value = 'Basic';
            var d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            document.getElementById('subExpiry').value = d.toISOString().split('T')[0];
            document.getElementById('subPayment').value = 'Cash';
            document.getElementById('subPaymentStatus').value = 'pending';
            subEditId = null;
            new bootstrap.Modal(document.getElementById('subscriptionModal')).show();
        }

        function editSubscription(id) {
            var s = null;
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === id) { s = shops[i]; break; }
            }
            if (!s) return;
            var select = document.getElementById('subShopSelect');
            var html = '';
            for (var i = 0; i < shops.length; i++) {
                html += '<option value="' + shops[i].id + '" ' + (shops[i].id === id ? 'selected' : '') + '>' + shops[i]
                    .name + '</option>';
            }
            select.innerHTML = html;
            document.getElementById('subPackage').value = s.package;
            document.getElementById('subExpiry').value = s.expiry;
            document.getElementById('subPayment').value = s.paymentMethod || 'Cash';
            document.getElementById('subPaymentStatus').value = s.payment;
            subEditId = id;
            new bootstrap.Modal(document.getElementById('subscriptionModal')).show();
        }

        function saveSubscription() {
            var shopId = parseInt(document.getElementById('subShopSelect').value);
            var s = null;
            for (var i = 0; i < shops.length; i++) {
                if (shops[i].id === shopId) { s = shops[i]; break; }
            }
            if (s) {
                s.package = document.getElementById('subPackage').value;
                s.expiry = document.getElementById('subExpiry').value;
                s.paymentMethod = document.getElementById('subPayment').value;
                s.payment = document.getElementById('subPaymentStatus').value;
                if (s.payment === 'paid' && s.status !== 'blocked' && s.status !== 'suspended') s.status = 'active';
                else if (s.payment === 'pending') s.status = 'expired';
            }
            bootstrap.Modal.getInstance(document.getElementById('subscriptionModal')).hide();
            saveAllDataToLocalStorage();
            Swal.fire({ icon: 'success', title: 'Subscription Saved!', confirmButtonColor: '#7c3aed' });
            refreshAll();
        }

        function addAnnounce() {
            var shopOptions = '';
            for (var i = 0; i < shops.length; i++) {
                shopOptions += '<option value="' + shops[i].id + '">' + shops[i].name + '</option>';
            }
            Swal.fire({
                title: 'New Announcement',
                html: '<input class="swal2-input" id="annTitle" placeholder="Title" style="font-size:0.9rem;"><textarea class="swal2-input" id="annMsg" placeholder="Message" style="font-size:0.9rem;"></textarea><select class="swal2-input" id="annTarget" style="font-size:0.9rem;"><option value="all">All Shops</option>' +
                    shopOptions + '</select>',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed'
            }).then(function(r) {
                if (r.isConfirmed) {
                    var target = document.getElementById('annTarget').value;
                    announcements.push({ id: Date.now(), title: document.getElementById('annTitle').value ||
                            'New', msg: document.getElementById('annMsg').value || 'No message',
                        date: today(), targetShop: target === 'all' ? null : parseInt(target) });
                    saveAllDataToLocalStorage();
                    refreshAll();
                    Swal.fire({ icon: 'success', title: 'Announcement Sent!',
                        confirmButtonColor: '#7c3aed' });
                }
            });
        }

        function deleteAnnounce(id) {
            Swal.fire({ title: 'Delete Announcement?', icon: 'warning', showCancelButton: true,
                confirmButtonColor: '#dc3545', cancelButtonColor: '#7c3aed' }).then(function(r) {
                if (r.isConfirmed) {
                    var newAnn = [];
                    for (var i = 0; i < announcements.length; i++) {
                        if (announcements[i].id !== id) newAnn.push(announcements[i]);
                    }
                    announcements = newAnn;
                    saveAllDataToLocalStorage();
                    refreshAll();
                    Swal.fire({ icon: 'success', title: 'Deleted!', confirmButtonColor: '#7c3aed' });
                }
            });
        }

        // ---------- LOGIN FUNCTIONS ----------
        function shopLogin() {
            var username = document.getElementById('shopUserSelect').value;
            var password = document.getElementById('shopPass').value.trim();
            var errorEl = document.getElementById('shopLoginError');

            if (!username) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Please select a shop!';
                setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
                return;
            }

            if (shopCredentials[username] && shopCredentials[username].password === password) {
                errorEl.style.display = 'none';
                isSuperAdmin = false;
                currentShopId = shopCredentials[username].shopId;
                loadShopData(currentShopId);
                var shop = getCurrentShop();
                if (shop && (shop.status === 'blocked' || shop.status === 'suspended')) {
                    errorEl.style.display = 'block';
                    errorEl.textContent = 'This shop is blocked! Contact admin.';
                    setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
                    currentShopId = null;
                    return;
                }
                if (shop && shop.expiry) {
                    var expDate = new Date(shop.expiry);
                    var todayDate = new Date();
                    todayDate.setHours(0,0,0,0);
                    if (todayDate > expDate) {
                        errorEl.style.display = 'block';
                        errorEl.textContent = 'Subscription expired! Contact admin to renew.';
                        setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
                        currentShopId = null;
                        return;
                    }
                }
                if (supabaseClient && !loadShopDataFromCache(currentShopId)) {
                    loadShopDataFromSupabase(currentShopId, function() {
                        window['products_' + currentShopId] = products;
                        window['sales_' + currentShopId] = sales;
                        window['invoices_' + currentShopId] = invoices;
                        window['customers_' + currentShopId] = customers;
                        window['reviews_' + currentShopId] = reviews;
                        window['expenses_' + currentShopId] = expenses;
                        showPage('shopDashboard');
                        document.getElementById('shopPass').value = '';
                        refreshAll();
                        Swal.fire({ icon: 'success', title: 'Welcome!', text: 'Shop Admin Dashboard', confirmButtonColor: '#7c3aed', timer: 1500 });
                    });
                } else {
                    showPage('shopDashboard');
                    document.getElementById('shopPass').value = '';
                    refreshAll();
                    Swal.fire({ icon: 'success', title: 'Welcome!', text: 'Shop Admin Dashboard', confirmButtonColor: '#7c3aed', timer: 1500 });
                }
            } else {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Invalid password!';
                setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
            }
        }

        function superLogin() {
            var username = document.getElementById('superUser').value.trim();
            var password = document.getElementById('superPass').value.trim();
            var errorEl = document.getElementById('superLoginError');

            if (username === 'admin' && password === 'admin123') {
                errorEl.style.display = 'none';
                isSuperAdmin = true;
                showPage('superDashboard');
                document.getElementById('superPass').value = '';
                refreshAll();
                Swal.fire({ icon: 'success', title: 'Welcome Super Admin!', text: 'Full control panel', confirmButtonColor: '#7c3aed', timer: 1500 });
            } else {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Invalid username or password!';
                setTimeout(function() { errorEl.style.display = 'none'; }, 3000);
            }
        }

        function showPage(id) {
            var pages = document.querySelectorAll('.page');
            for (var i = 0; i < pages.length; i++) {
                pages[i].classList.remove('active-page');
            }
            document.getElementById(id).classList.add('active-page');
        }

        function refreshAll() {
            if (isLoading) return;
            renderDashboard();
            renderProducts();
            renderStock();
            renderInvoices();
            renderCustomers();
            renderReviews();
            renderProfit();
            renderExpenses();
            renderSuper();
            renderCart();
            populateShopDropdown();
        }

        // ---------- NAVIGATION ----------
        document.querySelectorAll('#shopNav .nav-link[data-section]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (isShopDisabled) {
                    Swal.fire({ icon: 'warning', title: 'Access Denied', text: 'Your shop is expired or blocked.', confirmButtonColor: '#7c3aed' });
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                document.querySelectorAll('#shopNav .nav-link').forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('#shopDashboard .section-content').forEach(function(el) {
                    el.classList.remove('active-section');
                });
                var target = document.getElementById(this.dataset.section);
                if (target) target.classList.add('active-section');
                if (this.dataset.section === 'sales') renderCart();
            });
        });

        document.querySelectorAll('#superNav .nav-link[data-super]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('#superNav .nav-link').forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                document.querySelectorAll('#superDashboard .super-section').forEach(function(el) {
                    el.classList.remove('active-section');
                });
                var target = document.getElementById(this.dataset.super);
                if (target) target.classList.add('active-section');
            });
        });

        // ---------- LOGOUT ----------
        document.getElementById('shopLogout').addEventListener('click', function() {
            if (currentShopId !== null) saveShopData(currentShopId);
            currentShopId = null;
            isSuperAdmin = false;
            isShopDisabled = false;
            document.getElementById('shopDisabledOverlay').classList.remove('show');
            showPage('loginPage');
        });

        document.getElementById('superLogout').addEventListener('click', function() {
            isSuperAdmin = false;
            showPage('loginPage');
        });

        // ---------- ENTER KEY SUPPORT ----------
        document.getElementById('shopPass').addEventListener('keydown', function(e) { if (e.key === 'Enter') shopLogin(); });
        document.getElementById('superPass').addEventListener('keydown', function(e) { if (e.key === 'Enter') superLogin(); });

        // ---------- INIT ----------
        document.addEventListener('DOMContentLoaded', function() {
            initData();
        });

        // ---------- GLOBAL FUNCTIONS ----------
        window.togglePass = togglePass;
        window.addProductModal = addProductModal;
        window.saveProduct = saveProduct;
        window.editProduct = editProduct;
        window.updateProduct = updateProduct;
        window.deleteProduct = deleteProduct;
        window.addToCart = addToCart;
        window.addToCartFromSearch = addToCartFromSearch;
        window.removeFromCart = removeFromCart;
        window.completeSale = completeSale;
        window.clearCart = clearCart;
        function printInvoice(invId) {
            var inv = null;
            for (var i = 0; i < invoices.length; i++) {
                if (invoices[i].id === invId) { inv = invoices[i]; break; }
            }
            if (!inv) { alert('Invoice not found!'); return; }
            var sale = null;
            for (var i = 0; i < sales.length; i++) {
                if (sales[i].invoice === invId) { sale = sales[i]; break; }
            }
            var shop = getCurrentShop();
            var shopName = shop ? shop.name : 'Scentra ERP';
            var itemsHtml = '';
            if (sale && sale.items) {
                for (var i = 0; i < sale.items.length; i++) {
                    var item = sale.items[i];
                    var prod = getProduct(item.productId);
                    var name = prod ? prod.name : 'Item #' + item.productId;
                    itemsHtml += '<tr><td>' + name + '</td><td>' + item.qty + '</td><td>' + formatCurrency(item.price) + '</td><td>' + formatCurrency(item.price * item.qty) + '</td></tr>';
                }
            }
            var w = window.open('', '_blank');
            w.document.write('<!DOCTYPE html><html><head><title>Invoice ' + invId + '</title>');
            w.document.write('<style>');
            w.document.write('*{margin:0;padding:0;box-sizing:border-box;font-family:"Inter",sans-serif}');
            w.document.write('body{padding:20px;color:#1e1b2e}');
            w.document.write('.bill-header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px dashed #7c3aed}');
            w.document.write('.bill-header h2{font-size:20px;font-weight:800;color:#7c3aed}');
            w.document.write('.bill-header h2 span{color:#d4af37}');
            w.document.write('.bill-header p{font-size:12px;color:#666;margin:2px 0}');
            w.document.write('.bill-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:13px}');
            w.document.write('.bill-info div{flex:1}');
            w.document.write('.bill-info .label{font-weight:600;color:#7c3aed}');
            w.document.write('table{width:100%;border-collapse:collapse;margin-bottom:15px;font-size:13px}');
            w.document.write('th{background:#f8f7fc;color:#1e1b2e;font-weight:600;padding:8px;border-bottom:2px solid #7c3aed;text-align:left;font-size:12px}');
            w.document.write('td{padding:6px 8px;border-bottom:1px solid #eee;font-size:12px}');
            w.document.write('td:last-child,th:last-child{text-align:right}');
            w.document.write('td:nth-child(2),th:nth-child(2){text-align:center}');
            w.document.write('td:nth-child(3),th:nth-child(3){text-align:right}');
            w.document.write('.bill-totals{text-align:right;margin-bottom:20px;font-size:13px}');
            w.document.write('.bill-totals div{margin:3px 0}');
            w.document.write('.bill-totals .grand-total{font-size:16px;font-weight:800;color:#7c3aed;border-top:2px solid #7c3aed;padding-top:5px;margin-top:5px}');
            w.document.write('.bill-footer{text-align:center;font-size:11px;color:#999;border-top:1px dashed #ccc;padding-top:15px;margin-top:10px}');
            w.document.write('.bill-footer p{margin:3px 0}');
            w.document.write('@media print{body{padding:10px}button{display:none}}');
            w.document.write('</style></head><body>');
            w.document.write('<div class="bill-header">');
            w.document.write('<h2>MS <span>Techno</span></h2>');
            w.document.write('<p>' + shopName + '</p>');
            w.document.write('<p style="margin-top:5px;font-weight:600;font-size:14px;">INVOICE</p>');
            w.document.write('</div>');
            w.document.write('<div class="bill-info">');
            w.document.write('<div><span class="label">Invoice# </span>' + invId + '</div>');
            w.document.write('<div><span class="label">Date: </span>' + inv.date + '</div>');
            w.document.write('<div><span class="label">Customer: </span>' + (inv.customer || 'Walk-in') + '</div>');
            w.document.write('</div>');
            w.document.write('<div class="bill-info">');
            w.document.write('<div><span class="label">Payment: </span>' + (inv.payment || 'Cash') + '</div>');
            w.document.write('<div><span class="label">Source: </span>' + (inv.source || 'Walk-in') + '</div>');
            w.document.write('<div></div>');
            w.document.write('</div>');
            w.document.write('<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>');
            w.document.write('<div class="bill-totals">');
            w.document.write('<div><strong>Total:</strong> ' + formatCurrency(inv.total) + '</div>');
            w.document.write('</div>');
            w.document.write('<div class="bill-footer">');
            w.document.write('<p><strong>MS Techno</strong> — Cloud Perfume Management</p>');
            w.document.write('<p>Thank you for your business!</p>');
            w.document.write('</div>');
            w.document.write('<div style="text-align:center;margin-top:15px">');
            w.document.write('<button onclick="window.print()" style="background:#7c3aed;color:#fff;border:none;padding:10px 30px;border-radius:60px;font-weight:600;font-size:14px;cursor:pointer">Print / Save PDF</button>');
            w.document.write('</div>');
            w.document.write('</body></html>');
            w.document.close();
        }

        window.searchProduct = searchProduct;
        window.updateTotal = updateTotal;
        window.replyReview = replyReview;
        window.addExpense = addExpense;
        window.genReport = genReport;
        window.manageShop = manageShop;
        window.activateShop = activateShop;
        window.suspendShop = suspendShop;
        window.blockShop = blockShop;
        window.renewShop = renewShop;
        window.extendShop = extendShop;
        window.addSubscription = addSubscription;
        window.editSubscription = editSubscription;
        window.saveSubscription = saveSubscription;
        window.addAnnounce = addAnnounce;
        window.deleteAnnounce = deleteAnnounce;
        window.deleteShop = deleteShop;
        window.addNewShop = addNewShop;
        window.saveNewShop = saveNewShop;
        window.closeDisabledOverlay = closeDisabledOverlay;
        window.requestRenewal = requestRenewal;
        window.printInvoice = printInvoice;
        window.shopLogin = shopLogin;
        window.superLogin = superLogin;