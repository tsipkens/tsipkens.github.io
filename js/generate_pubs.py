
import json
import time
import requests
import yaml  # Added for YAML support

# Configuration
INPUT_DOI_FILE = "js\\article-doi.yaml"  # Changed to YAML
OUTPUT_JSON_FILE = "js\\article.json"
EMAIL = "tsipkens@nrc-cnrc.gc.ca"

def format_authors(author_list):
    """Formats Crossref author objects into the string style used by pubs.js"""
    formatted = []
    for a in author_list:
        family = a.get("family", "")
        given = a.get("given", "")
        # Create initials (e.g., "Timothy A." -> "T. A.")
        initials = ""
        if given:
            initials = " ".join([f"{name[0]}." for name in given.split()])
        
        name = f"{initials} {family}".strip() if initials else family
        formatted.append(name)

    if len(formatted) == 1:
        return formatted[0]
    elif len(formatted) == 2:
        return f"{formatted[0]} and {formatted[1]}"
    elif len(formatted) > 2:
        return ", ".join(formatted[:-1]) + ", and " + formatted[-1]
    return ""

def main():
    print(f"Reading DOIs from {INPUT_DOI_FILE}...")
    try:
        with open(INPUT_DOI_FILE, "r", encoding="utf-8") as f:
            doi_list = yaml.safe_load(f)  # Loaded using yaml.safe_load instead of json.load
    except FileNotFoundError:
        print(f"Error: {INPUT_DOI_FILE} not found.")
        return

    pub_data = []
    headers = {
        "Accept": "application/json",
        "User-Agent": f"PublicationGenerator/1.0 (mailto:{EMAIL})"
    }

    print(f"Fetching metadata for {len(doi_list)} publications from Crossref...")
    
    for i, doi in enumerate(doi_list):
        clean_doi = doi
        url = f"https://api.crossref.org/works/{clean_doi}?mailto={EMAIL}"
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"  [Warning] Status {response.status_code} for DOI: {doi}")
                continue
            
            item = response.json().get("message", {})
            
            # Extract year
            date_parts = (
                item.get("published-print", {}).get("date-parts") or
                item.get("published-online", {}).get("date-parts") or
                item.get("published", {}).get("date-parts") or
                item.get("created", {}).get("date-parts")
            )
            year = str(date_parts[0][0]) if date_parts and date_parts[0] else None

            # Extract title
            titles = item.get("title", [])
            title = titles[0].rstrip(".") if titles else ""

            # Extract journal
            containers = item.get("container-title", [])
            journal = containers[0] if containers else ""

            pub_obj = {
                "author": format_authors(item.get("author")) if item.get("author") else "",
                "title": title,
                "journal": journal,
                "pages": item.get("page", None),
                "volume": item.get("volume", None),
                "number": item.get("issue", None),
                "year": year,
                "honours": "",
                "badge": None,
                "doi": f"https://doi.org/{item.get('DOI', clean_doi)}"
            }
            
            pub_data.append(pub_obj)
            print(f"  [{i+1}/{len(doi_list)}] Fetched: {title[:40]}...")
            
            # Polite pause to be nice to Crossref servers locally
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  [Error] Failed to fetch {doi}: {e}")

    # Save compiled JSON
    with open(OUTPUT_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(pub_data, f, indent=2, ensure_ascii=False)
        
    print(f"\nSuccess! Generated {OUTPUT_JSON_FILE} with {len(pub_data)} entries.")

if __name__ == "__main__":
    main()