const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files with aggressive cache headers for images and assets
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.json') || filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else if (filePath.endsWith('.webp') || filePath.endsWith('.jpg') || filePath.endsWith('.png') || filePath.endsWith('.mp4') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));

// DB File Paths
const PEDIDOS_FILE = path.join(__dirname, 'pedidos.json');
const VENTAS_FILE = path.join(__dirname, 'ventas.json');
const VISITAS_FILE = path.join(__dirname, 'visitas.json');

// Initialize database files if they do not exist
if (!fs.existsSync(PEDIDOS_FILE)) {
    fs.writeFileSync(PEDIDOS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(VENTAS_FILE)) {
    fs.writeFileSync(VENTAS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(VISITAS_FILE)) {
    fs.writeFileSync(VISITAS_FILE, JSON.stringify({ count: 2332 }, null, 2));
}

// Helper to read JSON safely
const readJsonFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
        return [];
    }
};

// Helper to write JSON safely
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};

// ==========================================
// VISITOR COUNTER API
// ==========================================
app.get('/api/visitas', (req, res) => {
    try {
        const visitas = JSON.parse(fs.readFileSync(VISITAS_FILE, 'utf-8'));
        res.json({ count: visitas.count });
    } catch (error) {
        res.status(500).json({ error: 'Error leyendo visitas' });
    }
});

app.get('/api/visitas/up', (req, res) => {
    try {
        const visitas = JSON.parse(fs.readFileSync(VISITAS_FILE, 'utf-8'));
        visitas.count += 1;
        fs.writeFileSync(VISITAS_FILE, JSON.stringify(visitas, null, 2));
        res.json({ count: visitas.count });
    } catch (error) {
        res.status(500).json({ error: 'Error incrementando visitas' });
    }
});

// ==========================================
// ORDERS API (PEDIDOS)
// ==========================================
app.get('/api/pedidos', (req, res) => {
    const pedidos = readJsonFile(PEDIDOS_FILE);
    res.json(pedidos);
});

app.post('/api/guardar-pedido', (req, res) => {
    try {
        const nuevoPedido = req.body;
        if (!nuevoPedido.id || !nuevoPedido.items || !nuevoPedido.total) {
            return res.status(400).json({ error: 'Datos de pedido incompletos.' });
        }
        
        const pedidos = readJsonFile(PEDIDOS_FILE);
        pedidos.push(nuevoPedido);
        writeJsonFile(PEDIDOS_FILE, pedidos);
        
        console.log(`Nuevo pedido guardado: ${nuevoPedido.id}`);
        res.json({ success: true, id: nuevoPedido.id });
    } catch (error) {
        res.status(500).json({ error: 'Error guardando pedido.' });
    }
});

app.post('/api/despachar-pedido', (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID de pedido requerido.' });
        }

        const pedidos = readJsonFile(PEDIDOS_FILE);
        const index = pedidos.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        const pedidoDespachado = pedidos.splice(index, 1)[0];
        
        // Save remaining orders
        writeJsonFile(PEDIDOS_FILE, pedidos);

        // Move to sales
        const sales = readJsonFile(VENTAS_FILE);
        // Ensure properties exist
        pedidoDespachado.date = new Date().toLocaleString('es-CL');
        pedidoDespachado.isoDate = new Date().toISOString();
        
        sales.push(pedidoDespachado);
        writeJsonFile(VENTAS_FILE, sales);

        console.log(`Pedido despachado y registrado en ventas: ${id}`);
        res.json({ success: true, order: pedidoDespachado });
    } catch (error) {
        console.error("Error despachando pedido:", error);
        res.status(500).json({ error: 'Error al despachar el pedido.' });
    }
});

// ==========================================
// SALES API (VENTAS)
// ==========================================
app.get('/api/ventas', (req, res) => {
    const sales = readJsonFile(VENTAS_FILE);
    res.json(sales);
});

// Route for saving direct sales
app.post('/api/guardar-venta', (req, res) => {
    try {
        const newSale = req.body;
        const sales = readJsonFile(VENTAS_FILE);
        sales.push(newSale);
        writeJsonFile(VENTAS_FILE, sales);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error guardando venta.' });
    }
});

// Download Sales Excel Report
app.get('/api/descargar-excel-ventas', (req, res) => {
    try {
        const sales = readJsonFile(VENTAS_FILE);
        const xlsx = require('xlsx');
        
        // Flatten order structures for Excel columns
        const flatData = sales.map(s => {
            const itemsString = s.items.map(i => `${i.quantity}x ${i.name} ${i.flavor ? `(${i.flavor})` : ''}`).join(', ');
            return {
                "ID Orden": s.id,
                "Fecha Venta": s.date,
                "Cliente": s.customerName,
                "RUT": s.customerRut || 'N/A',
                "Dirección": s.customerAddress,
                "Comuna": s.customerCommune || 'N/A',
                "Productos": itemsString,
                "Total Venta": s.total
            };
        });

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(flatData);
        
        // Set column widths for readability
        const wscols = [
            { wch: 15 }, // ID Orden
            { wch: 22 }, // Fecha Venta
            { wch: 25 }, // Cliente
            { wch: 15 }, // RUT
            { wch: 30 }, // Dirección
            { wch: 15 }, // Comuna
            { wch: 50 }, // Productos
            { wch: 15 }  // Total Venta
        ];
        worksheet['!cols'] = wscols;

        xlsx.utils.book_append_sheet(workbook, worksheet, "Ventas_Disfrazate");
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Ventas_Disfrazate.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error("Error exportando Excel:", error);
        res.status(500).send("Error generando el reporte en Excel");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Servidor de Disfrazate.cl iniciado`);
    console.log(`🌐 Escuchando en: http://localhost:${PORT}`);
    console.log(`=================================================`);
});
