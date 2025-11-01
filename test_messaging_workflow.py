#!/usr/bin/env python3
"""
Test script for messaging workflow
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_messaging_workflow():
    """Test complete messaging workflow"""
    
    print("Testing Messaging Workflow...")
    print("=" * 50)
    
    # Test data - replace with actual user IDs
    artisan_id = "test-artisan-id"
    
    # Test 1: Initialize conversation
    print("1. Testing POST /messages/init/{user_id}")
    try:
        response = requests.post(f"{BASE_URL}/messages/init/{artisan_id}")
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"Conversation initialized: {data.get('conversation', {}).get('artisan', {}).get('name', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 2: Get conversations
    print("2. Testing GET /messages/conversations")
    try:
        response = requests.get(f"{BASE_URL}/messages/conversations")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            conversations = response.json()
            print(f"Conversations found: {len(conversations)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 3: Send message
    print("3. Testing POST /messages/")
    try:
        message_data = {
            "receiver_id": artisan_id,
            "message": "Hello! I'm interested in your products.",
            "message_type": "text"
        }
        response = requests.post(f"{BASE_URL}/messages/", json=message_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Message sent: {data.get('message_data', {}).get('message', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print()
    
    # Test 4: Get conversation messages
    print("4. Testing GET /messages/{user_id}")
    try:
        response = requests.get(f"{BASE_URL}/messages/{artisan_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            messages = response.json()
            print(f"Messages in conversation: {len(messages)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_messaging_workflow()