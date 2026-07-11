// REPLACE THE LINK BELOW WITH YOUR ACTUAL /exec URL FROM GOOGLE APPS SCRIPT
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyzV8WPyxvM2eV8quYrPvYAk05H-0r5MdCDdRuirfWjGcDfQO21_LnSyRRXKX-NOqQ2/exec"; 
let currentUser = null;

// --- LOGIN ---
function attemptLogin() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    if(!user || !pass) { alert("Enter login details"); return; }
    
    fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "login", username: user, password: pass }) })
    .then(r => r.json()).then(d => {
        if(d.status === "success") { 
            currentUser = d.user; 
            document.getElementById("loginView").style.display = "none"; 
            document.getElementById("appHeader").style.display = "block"; 
            showView('saleView'); 
        } else { alert(d.message); }
    }).catch(e => { console.error(e); alert("Connection error. Check console for details."); });
}

// --- CATEGORY FILTERING ---
function handleExpShopChange() {
    const shop = document.getElementById("expShop").value;
    const cat = document.getElementById("expCategory");
    cat.innerHTML = "";
    if (shop === "Fine Dine Restaurant") {
        ["Vegetables", "Chicken", "Fish", "Grocery", "Other"].forEach(c => cat.innerHTML += `<option value="${c}">${c}</option>`);
    } else {
        ["Rent", "Product Purchase", "Other"].forEach(c => cat.innerHTML += `<option value="${c}">${c}</option>`);
    }
}

// --- DASHBOARD ---
function loadDashboard() {
    fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "getDashboard", username: currentUser.name }) })
    .then(r => r.json()).then(d => {
        const grid = document.querySelector(".dash-grid"); 
        grid.innerHTML = "<h3>📊 Hisab</h3>";
        let html = "<table style='width:100%; border-collapse:collapse;'><tr><th>Shop</th><th>Amt</th><th>Rem</th><th>Save</th></tr>";
        d.logs.forEach((l) => {
            html += `<tr><td>${l.shop}</td>
                <td><input type="number" id="amt_${l.index}" value="${l.amt}" style="width:50px"></td>
                <td><input type="text" id="rem_${l.index}" value="${l.rem}" style="width:60px"></td>
                <td><button onclick="saveEdit(${l.index})">Save</button></td></tr>`;
        });
        grid.innerHTML += html + "</table>";
    });
}

function saveEdit(index) {
    const amt = document.getElementById('amt_'+index).value;
    const rem = document.getElementById('rem_'+index).value;
    fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "updateLog", index: index, amt: amt, rem: rem }) })
    .then(() => { alert("Updated!"); loadDashboard(); });
}

// --- SUBMISSIONS ---
function submitSale() {
    const shop = document.getElementById("saleShop").value;
    const amt = document.getElementById("saleAmount").value;
    fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "recordSale", user: currentUser.name, shop: shop, amount: amt, method: "Cash", remarks: "" }) })
    .then(() => alert("Sale Saved"));
}

function submitExpense() {
    const shop = document.getElementById("expShop").value;
    const cat = document.getElementById("expCategory").value;
    const amt = document.getElementById("expAmount").value;
    const rem = document.getElementById("expRemarks").value;
    fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "recordExpense", user: currentUser.name, shop: shop, category: cat, amount: amt, remarks: rem }) })
    .then(() => alert("Expense Saved"));
}

// --- UTILS ---
function showView(id) {
    document.querySelectorAll(".view-card").forEach(c => c.style.display="none");
    document.getElementById(id).style.display="block";
    if(id === 'dashView') loadDashboard();
    else if(id === 'expenseView') handleExpShopChange();
}

function logout() { location.reload(); }