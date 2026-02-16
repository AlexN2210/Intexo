#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour remplacer le domaine WordPress dans le CSV
Usage: python update_domain.py votre-domaine.com
"""

import sys
import re

def update_domain_in_csv(csv_file, new_domain):
    """Remplace le domaine dans le CSV"""
    with open(csv_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remplace le domaine
    old_pattern = r'https://votre-domaine\.com'
    new_url = f'https://{new_domain}'
    updated_content = re.sub(old_pattern, new_url, content)
    
    # Écrit le fichier mis à jour
    with open(csv_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"Domaine mis a jour: {new_url}")
    print(f"Fichier modifie: {csv_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_domain.py votre-domaine.com")
        print("Exemple: python update_domain.py mon-site.com")
        sys.exit(1)
    
    domain = sys.argv[1]
    csv_file = "woocommerce_gammes_import.csv"
    
    update_domain_in_csv(csv_file, domain)
