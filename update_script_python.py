
import re

with open("script.js", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
"""    if (footerAdminBtn) {
        footerAdminBtn.addEventListener(\x27click\x27, (e) => {
            e.preventDefault();
            redirectDashboardUrl = \x27pedidos.html\x27;
            openModal(\x27login-modal\x27);
        });
    }""",
"""    if (footerAdminBtn) {
        footerAdminBtn.addEventListener(\x27click\x27, (e) => {
            e.preventDefault();
            redirectDashboardUrl = \x27admin.html\x27;
            openModal(\x27login-modal\x27);
        });
    }"""
)

old_logic = """        submitLoginBtn.addEventListener(\x27click\x27, () => {
            const user = document.getElementById(\x27login-user\x27).value.trim();
            const pass = loginPass.value.trim();
            const errorMsg = document.getElementById(\x27login-error\x27);

            if (user === \x27admin\x27 && pass === \x27disfrazate123\x27) {
                errorMsg.style.display = \x27none\x27;
                closeModal(\x27login-modal\x27);
                // Redirect user to admin page
                window.location.href = redirectDashboardUrl;
            } else {
                errorMsg.style.display = \x27block\x27;
            }
        });"""

new_logic = """        submitLoginBtn.addEventListener(\x27click\x27, async () => {
            const user = document.getElementById(\x27login-user\x27).value.trim();
            const pass = loginPass.value.trim();
            const errorMsg = document.getElementById(\x27login-error\x27);

            // Legacy local login
            if (user === \x27admin\x27 && pass === \x27disfrazate123\x27) {
                errorMsg.style.display = \x27none\x27;
                closeModal(\x27login-modal\x27);
                window.location.href = redirectDashboardUrl;
                return;
            }

            // New Admin Login using API
            try {
                const res = await fetch(\x27/api/admin/stats\x27, {
                    method: \x27POST\x27,
                    headers: { \x27Content-Type\x27: \x27application/json\x27 },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const data = await res.json();
                
                if (data.success) {
                    errorMsg.style.display = \x27none\x27;
                    closeModal(\x27login-modal\x27);
                    sessionStorage.setItem(\x27adminData\x27, JSON.stringify(data));
                    window.location.href = redirectDashboardUrl === \x27admin.html\x27 ? \x27admin.html\x27 : redirectDashboardUrl;
                } else {
                    errorMsg.style.display = \x27block\x27;
                }
            } catch (err) {
                console.error(err);
                errorMsg.style.display = \x27block\x27;
            }
        });"""

text = text.replace(old_logic, new_logic)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated script.js")
