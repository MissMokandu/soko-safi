#!/usr/bin/env python3
"""
Test script for artisan profile functionality
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_artisan_endpoints():
    """Test all artisan profile endpoints"""
    
    # Test data - replace with actual artisan ID from your database
    artisan_id = "test-artisan-id"
    
    print("Testing Artisan Profile Endpoints...")
    print("=" * 50)
    
    # Test 1: Get artisan profile
    print("1. Testing GET /artisan/{id}")
    try:
        response = requests.get(f"{BASE_URL}/artisan/{artisan_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Profile: {data.get('full_name', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 2: Get artisan products
    print("2. Testing GET /artisan/{id}/products")
    try:
        response = requests.get(f"{BASE_URL}/artisan/{artisan_id}/products")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"Products found: {len(products)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 3: Get artisan stats
    print("3. Testing GET /artisan/{id}/stats")
    try:
        response = requests.get(f"{BASE_URL}/artisan/{artisan_id}/stats")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"Stats: {json.dumps(stats, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 4: Get artisan reviews
    print("4. Testing GET /artisan/{id}/reviews")
    try:
        response = requests.get(f"{BASE_URL}/artisan/{artisan_id}/reviews")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            reviews = response.json()
            print(f"Reviews found: {len(reviews)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_artisan_endpoints()