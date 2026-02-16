#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour mettre à jour le CSV avec des URLs complètes pour les images
"""

import csv
import os
import urllib.parse

# Configuration
BASE_URL = "https://votre-domaine.com"  # À modifier avec votre domaine WordPress
IMAGE_PATH = "/wp-content/uploads/IMPEXO-IPHONE%2017%20SERIES12-31"

def normalize_filename(filename):
    """Normalise le nom de fichier pour correspondre aux fichiers réels"""
    if not filename or filename.strip() == "":
        return None
    
    # Supprime les espaces et convertit en majuscules pour correspondre aux fichiers
    filename = filename.strip()
    
    # Vérifie les différentes extensions possibles
    base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
    
    # Extensions possibles
    extensions = ['.JPG', '.jpg']
    
    # Retourne le nom normalisé (on garde l'extension originale si présente)
    if '.' in filename:
        return filename
    else:
        # Par défaut, on utilise .JPG
        return f"{base_name}.JPG"

def create_image_url(filename):
    """Crée une URL complète pour l'image"""
    if not filename:
        return ""
    
    normalized = normalize_filename(filename)
    if not normalized:
        return ""
    
    # Encode l'URL correctement
    encoded_filename = urllib.parse.quote(normalized)
    full_url = f"{BASE_URL}{IMAGE_PATH}/{encoded_filename}"
    return full_url

def update_csv(input_file, output_file):
    """Met à jour le CSV avec les URLs d'images"""
    rows = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows.append(header)
        
        # Trouve l'index de la colonne Images
        try:
            images_index = header.index('Images')
        except ValueError:
            print("Erreur: Colonne 'Images' non trouvée dans le CSV")
            return
        
        # Traite chaque ligne
        for row in reader:
            if len(row) > images_index:
                image_filename = row[images_index].strip()
                if image_filename:
                    # Crée l'URL complète
                    image_url = create_image_url(image_filename)
                    row[images_index] = image_url
                else:
                    row[images_index] = ""
            rows.append(row)
    
    # Écrit le nouveau CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    
    print(f"CSV mis a jour: {output_file}")
    print(f"{len(rows)-1} lignes traitees")

if __name__ == "__main__":
    input_file = "woocommerce_gammes_import.csv"
    output_file = "woocommerce_gammes_import_with_urls.csv"
    
    if not os.path.exists(input_file):
        print(f"ERREUR: Fichier introuvable: {input_file}")
        exit(1)
    
    print(f"Traitement de {input_file}...")
    print(f"Base URL: {BASE_URL}")
    print(f"Chemin images: {IMAGE_PATH}")
    print()
    
    update_csv(input_file, output_file)
    
    print()
    print("ATTENTION: N'oubliez pas de modifier BASE_URL dans le script avec votre domaine WordPress reel!")
