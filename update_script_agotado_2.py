import re

with open("script.js", "r", encoding="utf-8") as f:
    text = f.read()

new_image_container_html = """
    const isSoldOut = !!prod.isSoldOut;
    let badgeHtml = "";
    if (isSoldOut) {
        badgeHtml = `<span class="card-oferta-badge" style="background:#555; color:#fff;"><i class="fa-solid fa-ban"></i> Agotado</span>`;
    } else if (isOffer) {
        badgeHtml = `<span class="card-oferta-badge"><i class="fa-solid fa-fire"></i> Oferta</span>`;
    }

    let imageContainerHtml = "";
    if (hasDualImages) {
        const img1 = encodeURI(prod.images[0]);
        const img2 = encodeURI(prod.images[1]);
        imageContainerHtml = `
        <div class="product-image-container dual-card-image-container ${isSoldOut ? 'sold-out-overlay' : ''}" style="${isSoldOut ? 'opacity:0.6; filter:grayscale(100%);' : ''}">
            ${badgeHtml}
            <div class="card-dual-images">
                <div class="card-single-img-wrapper" title="1° Con Modelo (Haz clic para ampliar)" onclick="event.stopPropagation(); openFullscreenLightbox('${prod.id}', '${img1}')">
                    <img src="${img1}" alt="${prod.name} con modelo" ${loadingAttr} decoding="async" onerror="this.onerror=null; this.src='logo_disfrazate_tech.jpg';">
                    <span class="card-img-tag">1° Modelo</span>
                </div>
                <div class="card-single-img-wrapper" title="2° Solo Disfraz (Haz clic para ampliar)" onclick="event.stopPropagation(); openFullscreenLightbox('${prod.id}', '${img2}')">
                    <img src="${img2}" alt="${prod.name} solo disfraz" ${loadingAttr} decoding="async" onerror="this.onerror=null; this.src='logo_disfrazate_tech.jpg';">
                    <span class="card-img-tag">2° Disfraz</span>
                </div>
            </div>
            <div class="image-expand-hint">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ver Fotos
            </div>
        </div>`;
    } else {
        const imgSrc = encodeURI(prod.image);
        imageContainerHtml = `
        <div class="product-image-container ${isSoldOut ? 'sold-out-overlay' : ''}" style="${isSoldOut ? 'opacity:0.6; filter:grayscale(100%);' : ''}">
            ${badgeHtml}
            <img src="${imgSrc}" alt="${prod.name}" ${loadingAttr} decoding="async" onerror="this.onerror=null; this.src='logo_disfrazate_tech.jpg';">
            <div class="image-expand-hint">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ver Foto Agrandada
            </div>
        </div>`;
    }"""

pattern1 = re.compile(r"let imageContainerHtml = '';\s*if \(hasDualImages\).*?</div>`;\s*}", re.DOTALL)
text = pattern1.sub(new_image_container_html.strip(), text)

new_button_html = """
            ${isSoldOut ? `
            <button type="button" class="btn-card-buy-purple" style="background: #333; border-color: #333; color: #888; cursor: not-allowed;" onclick="event.stopPropagation();">
                <i class="fa-solid fa-ban"></i> Agotado
            </button>
            ` : `
            <button type="button" class="btn-card-buy-purple" onclick="event.stopPropagation(); addItemWithDetailsFromCard('${prod.id}', this)">
                <i class="fa-solid fa-cart-plus"></i> Agregar al Carro
            </button>
            `}
"""

pattern2 = re.compile(r"<button type=\"button\" class=\"btn-card-buy-purple\" onclick=\"event\.stopPropagation\(\);\s*addItemWithDetailsFromCard\('\$\{prod\.id\}', this\)\\">\s*<i class=\"fa-solid fa-cart-plus\"></i> Agregar al Carro\s*</button>", re.DOTALL)
text = pattern2.sub(new_button_html.strip(), text)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated script.js successfully")
