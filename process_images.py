
import os
import glob
from PIL import Image
import rembg

input_folder = "catalogo 4"
output_folder = "catalogo 4_procesadas"

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Get remaining images
images = ["DIS-0322.jpg", "DIS-0323.jpg", "DIS-0324.jpg", "DIS-0325.jpg", "DIS-0326.jpg", "DIS-0327.jpg", "DIS-0328.jpg"]

for img_name in images:
    input_path = os.path.join(input_folder, img_name)
    if not os.path.exists(input_path):
        continue
        
    output_name = img_name.replace(".jpg", "_catalog.jpg")
    output_path = os.path.join(output_folder, output_name)
    
    print(f"Processing {img_name}...")
    try:
        # Open the input image
        with open(input_path, "rb") as f:
            input_bytes = f.read()
        
        # Remove background (returns image bytes)
        subject_bytes = rembg.remove(input_bytes)
        
        # Open subject image and prepare for white background
        import io
        subject_image = Image.open(io.BytesIO(subject_bytes)).convert("RGBA")
        
        # Create a white background image of the same size
        white_bg = Image.new("RGBA", subject_image.size, "WHITE")
        
        # Paste the subject on the white background using the subject alpha as mask
        white_bg.paste(subject_image, (0, 0), subject_image)
        
        # Convert to RGB and save as JPG
        final_image = white_bg.convert("RGB")
        final_image.save(output_path, "JPEG", quality=95)
        print(f"Successfully saved {output_name}")
    except Exception as e:
        print(f"Error processing {img_name}: {e}")

print("All done!")
