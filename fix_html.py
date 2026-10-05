import re
with open('script.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = r\"\"\"    let imageContainerHtml = '';
    if (hasDualImages) {
        const img1 = encodeURI(prod.images[0]);
        const img2 = encodeURI(prod.images[1]);
        imageContainerHtml = 
        <div class=\"product-image-container dual-card-image-container\">
            
            <div class=\"card-dual-images\">
                <div class=\"card-single-img-wrapper\" title=\"1° Con Modelo (Haz clic para ampliar)\" onclick=\"event.stopPropagation(); openFullscreenLightbox('', '')\">
                    <img src=\"\" alt=\" con modelo\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
                    <span class=\"card-img-tag\">1° Modelo</span>
                </div>
                <div class=\"card-single-img-wrapper\" title=\"2° Solo Disfraz (Haz clic para ampliar)\" onclick=\"event.stopPropagation(); openFullscreenLightbox('', '')\">
                    <img src=\"\" alt=\" solo disfraz\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
                    <span class=\"card-img-tag\">2° Disfraz</span>
                </div>
            </div>
            <div class=\"image-expand-hint\">
                <i class=\"fa-solid fa-magnifying-glass-plus\"></i> Ver Fotos
            </div>
        </div>;
    } else {
        const imgSrc = encodeURI(prod.image);
        imageContainerHtml = 
        <div class=\"product-image-container\">
            
            <img src=\"\" alt=\"\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
            <div class=\"image-expand-hint\">
                <i class=\"fa-solid fa-magnifying-glass-plus\"></i> Ver Foto Agrandada
            </div>
        </div>;
    }\"\"\"

replacement = r\"\"\"    let imageContainerHtml = '';
    
    const isSoldOut = !!prod.isSoldOut;
    let badgeHtml = \"\";
    if (isSoldOut) {
        badgeHtml = <span class=\"card-oferta-badge\" style=\"background:#555; color:#fff;\"><i class=\"fa-solid fa-ban\"></i> Agotado</span>;
    } else if (isOffer) {
        badgeHtml = <span class=\"card-oferta-badge\"><i class=\"fa-solid fa-fire\"></i> Oferta</span>;
    }

    if (hasDualImages) {
        const img1 = encodeURI(prod.images[0]);
        const img2 = encodeURI(prod.images[1]);
        imageContainerHtml = 
        <div class=\"product-image-container dual-card-image-container \" style=\"\">
            
            <div class=\"card-dual-images\">
                <div class=\"card-single-img-wrapper\" title=\"1° Con Modelo (Haz clic para ampliar)\" onclick=\"event.stopPropagation(); openFullscreenLightbox('', '')\">
                    <img src=\"\" alt=\" con modelo\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
                    <span class=\"card-img-tag\">1° Modelo</span>
                </div>
                <div class=\"card-single-img-wrapper\" title=\"2° Solo Disfraz (Haz clic para ampliar)\" onclick=\"event.stopPropagation(); openFullscreenLightbox('', '')\">
                    <img src=\"\" alt=\" solo disfraz\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
                    <span class=\"card-img-tag\">2° Disfraz</span>
                </div>
            </div>
            <div class=\"image-expand-hint\">
                <i class=\"fa-solid fa-magnifying-glass-plus\"></i> Ver Fotos
            </div>
        </div>;
    } else {
        const imgSrc = encodeURI(prod.image);
        imageContainerHtml = 
        <div class=\"product-image-container \" style=\"\">
            
            <img src=\"\" alt=\"\"  decoding=\"async\" onerror=\"this.onerror=null; this.src='logo_disfrazate_tech.jpg';\">
            <div class=\"image-expand-hint\">
                <i class=\"fa-solid fa-magnifying-glass-plus\"></i> Ver Foto Agrandada
            </div>
        </div>;
    }\"\"\"

text = text.replace(target, replacement)
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(text)
print(\"Replaced image container.\")
