"""
Genera versiones "modeladas por una persona" de las fotos de disfraces
desde DIS-0042 en adelante según su CATEGORÍA (MUJER, HOMBRE, NIÑA, NIÑO)
y DESCRIPCIÓN del archivo Excel INVENTARIO HALLOWEEN (3).xlsx.

Requisitos:
    pip install openai pillow openpyxl

Uso:
    1. Define la variable de entorno OPENAI_API_KEY o pégala en OPENAI_API_KEY.
    2. Ejecuta: python generar_imagenes.py
"""

import base64
import os
import re
import sys
from pathlib import Path

import openpyxl
from openai import OpenAI

# Pega tu propia API key aquí, o usa la variable de entorno OPENAI_API_KEY
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

CARPETA_CATALOGO = Path(__file__).parent
ARCHIVO_EXCEL = CARPETA_CATALOGO.parent / "INVENTARIO HALLOWEEN (3).xlsx"
PRIMER_CODIGO_A_PROCESAR = 42  # DIS-0042 en adelante

PATRON_CODIGO = re.compile(r"(?:DIS|dis)-?0*(\d+)")


def cargar_inventario() -> dict[int, dict]:
    """Carga categorías y descripciones desde el archivo Excel."""
    inventario = {}
    if not ARCHIVO_EXCEL.exists():
        print(f"Advertencia: No se encontró el archivo Excel en {ARCHIVO_EXCEL}")
        return inventario

    wb = openpyxl.load_workbook(ARCHIVO_EXCEL)
    sheet = wb.active

    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row or not row[0]:
            continue
        code_raw = str(row[0]).strip()
        match = PATRON_CODIGO.search(code_raw)
        if match:
            num = int(match.group(1))
            desc = str(row[1]).strip() if len(row) > 1 and row[1] else ""
            cat = str(row[3]).strip().upper() if len(row) > 3 and row[3] else "HOMBRE"
            inventario[num] = {"descripcion": desc, "categoria": cat}

    return inventario


def obtener_prompt_por_categoria(desc: str, cat: str) -> str:
    """Construye un prompt personalizado según si es MUJER, HOMBRE, NIÑA o NIÑO."""
    desc_str = f" ({desc})" if desc else ""
    cat_upper = cat.upper()

    if "MUJER" in cat_upper:
        sujeto = "una MODELO MUJER ADULTA"
    elif "NIÑA" in cat_upper or "NINA" in cat_upper:
        sujeto = "una NIÑA MODELO (infantil)"
    elif "NIÑO" in cat_upper or "NINO" in cat_upper:
        sujeto = "un NIÑO MODELO (infantil)"
    else:  # HOMBRE por defecto
        sujeto = "un MODELO HOMBRE ADULTO"

    return (
        f"Toma este disfraz{desc_str} como referencia y genera una fotografia de producto de e-commerce "
        f"donde {sujeto} esta usando el disfraz completo, de pie, de cuerpo entero, sobre fondo blanco "
        f"liso de estudio, iluminacion uniforme de catalogo profesional, sin texto ni marcas de agua. "
        f"Respeta los colores, cortes y detalles originales del disfraz."
    )


def numero_de_archivo(nombre: str) -> int | None:
    match = PATRON_CODIGO.search(nombre)
    return int(match.group(1)) if match else None


def listar_archivos_a_procesar() -> list[Path]:
    archivos = []
    for archivo in CARPETA_CATALOGO.iterdir():
        if archivo.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        numero = numero_de_archivo(archivo.stem)
        if numero is not None and numero >= PRIMER_CODIGO_A_PROCESAR:
            archivos.append(archivo)
    return sorted(archivos, key=lambda p: numero_de_archivo(p.stem))


def generar_reemplazo(cliente: OpenAI, archivo: Path, prompt: str) -> None:
    with open(archivo, "rb") as imagen_original:
        resultado = cliente.images.edit(
            model="gpt-image-1",
            image=imagen_original,
            prompt=prompt,
            size="1024x1024",
        )

    datos = base64.b64decode(resultado.data[0].b64_json)
    archivo.write_bytes(datos)


def main() -> None:
    if not OPENAI_API_KEY:
        sys.exit(
            "Falta la API key de OpenAI. Defínela en la variable de entorno OPENAI_API_KEY "
            "o pégala en la constante OPENAI_API_KEY del script."
        )

    inventario = cargar_inventario()
    print(f"Cargado inventario de Excel con {len(inventario)} items.")

    cliente = OpenAI(api_key=OPENAI_API_KEY)
    archivos = listar_archivos_a_procesar()
    total = len(archivos)
    print(f"Se procesarán {total} imágenes (DIS-{PRIMER_CODIGO_A_PROCESAR:04d} hasta DIS-{numero_de_archivo(archivos[-1].stem):04d}).\n")

    exitosos = 0
    errores = 0

    for idx, archivo in enumerate(archivos, start=1):
        num = numero_de_archivo(archivo.stem)
        info = inventario.get(num, {"descripcion": "", "categoria": "HOMBRE"})
        cat = info["categoria"]
        desc = info["descripcion"]
        prompt = obtener_prompt_por_categoria(desc, cat)

        print(f"[{idx}/{total}] Procesando {archivo.name} [{cat} - {desc}]...", end=" ", flush=True)
        try:
            generar_reemplazo(cliente, archivo, prompt)
            print("OK")
            exitosos += 1
        except Exception as error:
            print(f"ERROR: {error}")
            errores += 1

    print(f"\nResumen: {exitosos} completadas exitosamente, {errores} con error.")


if __name__ == "__main__":
    main()
