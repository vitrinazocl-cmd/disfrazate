
import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# According to the log, rembg is looking for bria-rmbg
model_url = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/bria-rmbg-2.0.onnx"
model_dir = os.path.expanduser("~/.rembg/models/bria-rmbg")
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, "bria-rmbg.onnx")

print(f"Downloading {model_url} to {model_path}...")
urllib.request.urlretrieve(model_url, model_path)
print("Download complete!")
