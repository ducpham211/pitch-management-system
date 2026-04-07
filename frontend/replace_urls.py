import os
import re

directory = r"d:\WorkSpace\IE303\doAn\frontend\src"

mappings = {
    r"/tim-san": r"/pitches",
    r"/san/": r"/pitches/",
    r"/thanh-toan": r"/checkout",
    r"/ghep-tran": r"/matches",
    r"/dang-nhap": r"/login",
    r"/dang-ky": r"/register",
    r"/tin-nhan": r"/messages",
    r"/ho-so": r"/profile",
    r"/chu-san": r"/owner"
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content
    for old, new in mappings.items():
        # Using string replace since they are exact route paths
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(directory):
    for filename in files:
        if filename.endswith(".tsx") or filename.endswith(".ts"):
            replace_in_file(os.path.join(root, filename))

print("Done.")
