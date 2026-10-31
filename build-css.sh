npx -y tailwindcss@3.4.19 -c tailwind.config.js -i src/input.css -o styles/styles.css --minify
python3 -c 'from pathlib import Path; import re; p=Path("styles/styles.css"); p.write_text(re.sub(r"/\*.*?\*/", "", p.read_text(), flags=re.S))'
