
import re

with open("server.js", "r", encoding="utf-8") as f:
    text = f.read()

new_code = """
app.get("/api/visitas", (req, res) => {
    try {
        const visitas = JSON.parse(fs.readFileSync(VISITAS_FILE, "utf-8"));
        // Remove history from public endpoint to avoid leaking info to regular users
        res.json({ count: visitas.count });
    } catch (error) {
        res.status(500).json({ error: "Error leyendo visitas" });
    }
});

app.get("/api/visitas/up", (req, res) => {
    try {
        const visitas = JSON.parse(fs.readFileSync(VISITAS_FILE, "utf-8"));
        if (!visitas.history) visitas.history = [];
        
        visitas.count += 1;
        
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"] || "Unknown";
        const date = new Date().toISOString();
        
        visitas.history.unshift({ ip, userAgent, date });
        if (visitas.history.length > 1000) visitas.history = visitas.history.slice(0, 1000);
        
        fs.writeFileSync(VISITAS_FILE, JSON.stringify(visitas, null, 2));
        res.json({ count: visitas.count });
    } catch (error) {
        res.status(500).json({ error: "Error incrementando visitas" });
    }
});

// Admin endpoint for stats
app.post("/api/admin/stats", (req, res) => {
    const { username, password } = req.body;
    if (username === "disfrazate" && password === "disfrazate2027$") {
        try {
            const visitas = JSON.parse(fs.readFileSync(VISITAS_FILE, "utf-8"));
            const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE, "utf-8"));
            const ventas = JSON.parse(fs.readFileSync(VENTAS_FILE, "utf-8"));
            res.json({ success: true, visitas, pedidos, ventas });
        } catch (e) {
            res.status(500).json({ success: false, message: "Error reading data files" });
        }
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});
"""

text = re.sub(r"app\.get\(\x27/api/visitas\x27,.*?\x27Error incrementando visitas\x27 \});\s*\}\);", new_code.strip(), text, flags=re.DOTALL)

with open("server.js", "w", encoding="utf-8") as f:
    f.write(text)
