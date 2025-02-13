import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

# Load environment variables from .env.local
load_dotenv('.env.local')

# Get MongoDB connection details
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB = os.getenv('MONGODB_DB')

def import_links():
    # Connect to MongoDB
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DB]
    
    # Create or get the collection
    links_collection = db.static_links
    
    # Read the JSON file
    with open('data/www_links_20250213_143022.json', 'r') as file:
        links_data = json.load(file)
    
    # Add metadata to each page
    for page in links_data:
        page['created_at'] = datetime.utcnow()
        page['updated_at'] = datetime.utcnow()
        
        # Add status tracking to each link
        for link in page['links']:
            link['is_updated'] = False
            link['updated_at'] = None
            link['updated_by'] = None

    # Insert the data
    try:
        # Delete existing data if any
        links_collection.delete_many({})
        
        # Insert new data
        result = links_collection.insert_many(links_data)
        print(f"Successfully imported {len(result.inserted_ids)} pages")
        
    except Exception as e:
        print(f"Error importing data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    import_links() 