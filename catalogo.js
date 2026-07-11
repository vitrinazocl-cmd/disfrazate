const catalogoProductos = [
    // OFERTAS (Special Offers & Promotions)
    { 
        id: 'OF-TERROR', 
        name: "Combo Terror Completo (Disfraz Calavera + Maquillaje)", 
        price: 14990, 
        category: "OFERTAS", 
        image: "https://images.unsplash.com/photo-1508349682734-1828d7165157?q=80&w=600&auto=format&fit=crop",
        sizes: ["S", "M", "L"],
        flavors: ["Estilo Catrina", "Estilo Esqueleto"] 
    },
    { 
        id: 'OF-VENECIANA', 
        name: "Pack 3 Máscaras Venecianas Premium (Glitter)", 
        price: 8990, 
        category: "OFERTAS", 
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop",
        flavors: ["Surtido Dorado", "Surtido Plateado", "Surtido Multicolor"] 
    },
    { 
        id: 'OF-CAPAMAGICA', 
        name: "Capa Mágica de Terciopelo con Capucha", 
        price: 7990, 
        category: "OFERTAS", 
        image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop",
        flavors: ["Negro Místico", "Rojo Vampiro", "Púrpura Bruja"] 
    },

    // NIÑOS (Kids Costumes)
    { 
        id: 'KID-DINO', 
        name: "Disfraz de Dinosaurio Inflable Infantil", 
        price: 18990, 
        category: "NIÑOS", 
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop",
        sizes: ["Estándar (4-10 años)"],
        flavors: ["T-Rex Verde", "T-Rex Azul", "T-Rex Naranja"] 
    },
    { 
        id: 'KID-PRINCESA', 
        name: "Vestido Princesa Encantada de Hadas", 
        price: 12990, 
        category: "NIÑOS", 
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop",
        sizes: ["Talla 4", "Talla 6", "Talla 8", "Talla 10"],
        flavors: ["Celeste Cenicienta", "Rosado Aurora", "Amarillo Bella"] 
    },
    { 
        id: 'KID-HERO', 
        name: "Disfraz de Superhéroe con Capa y Máscara", 
        price: 11500, 
        category: "NIÑOS", 
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
        sizes: ["Talla 6", "Talla 8", "Talla 10"],
        flavors: ["Rojo Araña", "Azul Patriota", "Negro Murciélago"] 
    },
    {
        id: 'KID-PIRATITA',
        name: "Disfraz Pirata Bucanero Infantil",
        price: 10990,
        category: "NIÑOS",
        image: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?q=80&w=600&auto=format&fit=crop",
        sizes: ["Talla 4", "Talla 6", "Talla 8"]
    },

    // ADULTOS (Adult Costumes)
    { 
        id: 'AD-PIRATA', 
        name: "Disfraz Pirata Corsario Adulto Lujo", 
        price: 21990, 
        category: "ADULTOS", 
        image: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?q=80&w=600&auto=format&fit=crop",
        sizes: ["M", "L", "XL"],
        flavors: ["Capitán Bucanero", "Corsaria Rebelde"] 
    },
    { 
        id: 'AD-BRUJA', 
        name: "Disfraz de Hechicera Gótica de la Noche", 
        price: 19990, 
        category: "ADULTOS", 
        image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop",
        sizes: ["S", "M", "L", "XL"]
    },
    { 
        id: 'AD-PAYASO', 
        name: "Máscara de Payaso de Terror Realista (Látex)", 
        price: 8990, 
        category: "ADULTOS", 
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop",
        flavors: ["Payaso Sonrisa Siniestra", "Payaso Ojos Negros"] 
    },
    {
        id: 'AD-VAMPIRO',
        name: "Capa Drácula Terciopelo Adulto",
        price: 9990,
        category: "ADULTOS",
        image: "https://images.unsplash.com/photo-1508349682734-1828d7165157?q=80&w=600&auto=format&fit=crop"
    },

    // ACCESORIOS (Accessories)
    { 
        id: 'ACC-MAGO', 
        name: "Sombrero de Mago Clásico Terciopelo", 
        price: 4500, 
        category: "ACCESORIOS", 
        image: "https://images.unsplash.com/photo-1514894780887-121968d00567?q=80&w=600&auto=format&fit=crop" 
    },
    { 
        id: 'ACC-VARITA', 
        name: "Varita Mágica con Efectos de Luz y Sonido", 
        price: 3200, 
        category: "ACCESORIOS", 
        image: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=600&auto=format&fit=crop" 
    },
    { 
        id: 'ACC-ALAS', 
        name: "Set Alas de Hada Brillantes con Varita", 
        price: 5990, 
        category: "ACCESORIOS", 
        image: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?q=80&w=600&auto=format&fit=crop",
        flavors: ["Rosa Purpurina", "Blanco Celestial", "Celeste Mágico"] 
    },
    { 
        id: 'ACC-MAQUILLAJE', 
        name: "Set de Maquillaje Cremoso Profesional 12 Colores", 
        price: 7500, 
        category: "ACCESORIOS", 
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop" 
    },

    // CUMPLEAÑOS (Birthday Decorations & Themes)
    { 
        id: 'BD-SETDINO', 
        name: "Mega Set de Decoración Cumpleaños Dinosaurio", 
        price: 8990, 
        category: "CUMPLEAÑOS", 
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop",
        flavors: ["Set 10 Personas", "Set 20 Personas (+ $5.000)"] 
    },
    { 
        id: 'BD-CUBIERTOS', 
        name: "Packs de Cubiertos Biodegradables Temáticos", 
        price: 2500, 
        category: "CUMPLEAÑOS", 
        image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=600&auto=format&fit=crop",
        flavors: ["Diseño Unicornio", "Diseño Spiderman", "Diseño Dinosaurio"] 
    },
    { 
        id: 'BD-GLOBOS', 
        name: "Globos de Helio de Personajes Gigantes", 
        price: 3990, 
        category: "CUMPLEAÑOS", 
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop",
        flavors: ["Número Dorado", "Estrella Metálica", "Personaje Infantil"] 
    },

    // PROMOCIONES / PACK PERSONALIZADO (Custom Promo)
    { 
        id: 'PACK-MIXTO', 
        name: "Crea tu Pack de Accesorios (Elige 5 artículos)", 
        price: 12990, 
        category: "PROMOCIONES", 
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop",
        isCustom: true 
    }
];
