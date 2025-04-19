import re
import json
from bs4 import BeautifulSoup
import uuid # <-- Import the uuid module

# --- Configuration ---
html_file_path = 'Willkommen im Eimer - Freiburgs bestem Music Pub.txt' # Make sure this matches the uploaded file name
output_json_filename = 'eimer_drinks.json'
# --- End Configuration ---

# Function to clean text and price
def clean_text(text):
    """Removes extra whitespace and leading/trailing spaces."""
    return re.sub(r'\s+', ' ', text).strip()

def parse_price(price_str):
    """Converts price string (e.g., '4,20€') to float."""
    if not price_str:
        return None
    cleaned_price = price_str.replace('€', '').replace('.', '').replace(',', '.')
    try:
        return float(cleaned_price)
    except ValueError:
        return None

# --- Main Parsing Logic ---
drinks_data = []
try:
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
except FileNotFoundError:
    print(f"Error: HTML file not found at '{html_file_path}'")
    exit()

soup = BeautifulSoup(html_content, 'html.parser')

# Map table IDs to categories
category_map = {
    "supsystic-table-6": "Bier vom Fass",
    "supsystic-table-7": "Flaschenbier",
    "supsystic-table-8": "Alkoholfreie Getränke",
    "supsystic-table-9": "Heiße Getränke",
    "supsystic-table-10": "Heißgetränke mit Spirit",
    "supsystic-table-11": "Wein / Sekt",
    "supsystic-table-13": "Longdrinks / Cocktails",
    "supsystic-table-12": "Shots / Brands / Aperitifs",
}

parsed_rows_details = set() # To track rows already processed as descriptions

# --- 1. Parse Tables ---
for table_id, category in category_map.items():
    table = soup.find('table', id=table_id)
    if not table:
        print(f"Warning: Table with id {table_id} not found.")
        continue

    tbody = table.find('tbody')
    if not tbody:
        continue

    rows = tbody.find_all('tr')
    row_index = -1
    for row in rows:
        row_index += 1
        row_key = (table_id, row_index)

        if row_key in parsed_rows_details:
            continue

        cells = row.find_all('td')
        if not cells or "colspan" in cells[0].attrs or "keine daten" in cells[0].get_text(strip=True).lower():
             continue

        num_cols = len(cells)
        name = ""
        size = ""
        price_str = ""
        details = ""
        potential_description_row_key = None

        # --- (Parsing logic for different categories remains the same) ---
        try:
            if category in ["Bier vom Fass", "Flaschenbier", "Alkoholfreie Getränke", "Wein / Sekt"]:
                # ... (existing parsing logic) ...
                 if num_cols >= 4:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    details_col2 = clean_text(cells[1].get_text(separator=" ", strip=True))
                    size = clean_text(cells[2].get_text(separator=" ", strip=True))
                    price_str = clean_text(cells[3].get_text(separator=" ", strip=True))
                    if details_col2: details = details_col2
                 elif num_cols == 3:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    size = clean_text(cells[1].get_text(separator=" ", strip=True))
                    price_str = clean_text(cells[2].get_text(separator=" ", strip=True))
                 elif num_cols == 2:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    price_str = clean_text(cells[1].get_text(separator=" ", strip=True))

            elif category in ["Heiße Getränke"]:
                # ... (existing parsing logic) ...
                 if num_cols >= 2:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    price_str = clean_text(cells[1].get_text(separator=" ", strip=True))

            elif category in ["Heißgetränke mit Spirit", "Longdrinks / Cocktails", "Shots / Brands / Aperitifs"]:
                # ... (existing parsing logic) ...
                 if num_cols >= 3:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    italic_inline = cells[0].find('i') or cells[0].find(class_='italic')
                    if italic_inline:
                        details = clean_text(italic_inline.get_text(separator=" ", strip=True))
                        name = clean_text(name.replace(details, ''))
                    if not details:
                        next_row = row.find_next_sibling('tr')
                        if next_row:
                            next_cells = next_row.find_all('td')
                            if len(next_cells) >= 1:
                                first_next_cell_text = clean_text(next_cells[0].get_text(separator=" ", strip=True))
                                is_likely_description = (len(next_cells) < num_cols or not parse_price(clean_text(next_cells[-1].get_text())))
                                if first_next_cell_text and is_likely_description :
                                    details = first_next_cell_text
                                    potential_description_row_key = (table_id, row_index + 1)
                    if category == "Shots / Brands / Aperitifs" and len(cells) > 1:
                         size_text = clean_text(cells[1].get_text(separator=" ").strip())
                         if size_text and size_text.lower().endswith('cl'): size = size_text
                    price_str = clean_text(cells[-1].get_text(separator=" ").strip())
                 elif num_cols == 2:
                    name = clean_text(cells[0].get_text(separator=" ", strip=True))
                    price_str = clean_text(cells[1].get_text(separator=" ", strip=True))

        except IndexError:
             print(f"Warning: Row parsing error in {category} for cells: {[c.get_text(strip=True) for c in cells]}")
             continue
        # --- (End of existing parsing logic block) ---

        price = parse_price(price_str)

        if name and price is not None and price > 0:
            # --- ADD ID HERE ---
            drink_id = str(uuid.uuid4())
            # -------------------
            drink_entry = {
                "id": drink_id, # <-- Add the ID field
                "category": category,
                "name": name.replace('<br>', '').replace('<br/>','').strip(),
                "price": price
            }
            if details: drink_entry["details"] = details
            if size: drink_entry["size"] = size

            drinks_data.append(drink_entry)

            if potential_description_row_key:
                parsed_rows_details.add(potential_description_row_key)


# --- 2. Parse Absinthe Section ---
absinthe_section = soup.find(lambda tag: tag.name == 'h2' and 'Absinthe' in tag.get_text())
if absinthe_section:
    current_element = absinthe_section.find_next_sibling()
    while current_element and current_element.name != 'h2':
        if current_element.name == 'h3':
            name_parts = [t.strip() for t in current_element.get_text(separator='\n').split('\n') if t.strip()]
            if len(name_parts) >= 2:
                name = name_parts[0]
                details_h3 = name_parts[1]

                price_p = current_element.find_next_sibling('p', string=re.compile(r'2cl:.*€.*4cl:.*€'))
                if price_p:
                    price_text = price_p.get_text()
                    prices_2cl = re.findall(r'2cl:\s*([\d,.]+)€', price_text)
                    prices_4cl = re.findall(r'4cl:\s*([\d,.]+)€', price_text)

                    if prices_2cl:
                        price_2cl = parse_price(prices_2cl[0])
                        if price_2cl is not None:
                             # --- ADD ID HERE ---
                             drinks_data.append({
                                 "id": str(uuid.uuid4()), # <-- Add ID
                                 "category": "Absinthe",
                                 "name": f"{name}",
                                 "size": "2cl",
                                 "details": details_h3,
                                 "price": price_2cl
                             })
                    if prices_4cl:
                        price_4cl = parse_price(prices_4cl[0])
                        if price_4cl is not None:
                             # --- ADD ID HERE ---
                             drinks_data.append({
                                 "id": str(uuid.uuid4()), # <-- Add ID
                                 "category": "Absinthe",
                                 "name": f"{name}",
                                 "size": "4cl",
                                 "details": details_h3,
                                 "price": price_4cl
                             })

        current_element = current_element.find_next_sibling()


# --- Output to JSON ---
try:
    with open(output_json_filename, 'w', encoding='utf-8') as f:
        json.dump(drinks_data, f, indent=4, ensure_ascii=False)
    print(f"Successfully extracted {len(drinks_data)} drinks with IDs to '{output_json_filename}'")
except IOError as e:
    print(f"Error writing JSON file: {e}")