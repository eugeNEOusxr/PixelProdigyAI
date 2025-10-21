#!/usr/bin/env python3
"""
SQLite Database Initialization - Ultra-Fast Setup
Creates all tables needed for PixelProdigy Gaming Platform
"""

import sqlite3
import os
import time
import json
from datetime import datetime

def init_database():
    """Initialize SQLite database with all tables"""
    db_path = 'pixelprodigy.db'
    
    # Remove existing database if needed (for fresh start)
    if os.path.exists(db_path):
        print(f"⚠️  Database already exists: {db_path}")
        print("   Using existing database...")
        db = sqlite3.connect(db_path)
    else:
        db = sqlite3.connect(db_path)
        print(f"✅ Creating new database: {db_path}")
    
    cursor = db.cursor()
    
    # 1. VLS Objects Table
    print("📋 Creating vls_objects table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vls_objects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            vls_code TEXT,
            vls_compressed TEXT,
            tier TEXT,
            skyrelics_tier TEXT,
            polygon_count INTEGER,
            vertex_count INTEGER,
            compression_ratio REAL,
            created_at INTEGER
        )
    ''')
    
    # 2. Gaming Terrain Table
    print("📋 Creating gaming_terrain table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gaming_terrain (
            id TEXT PRIMARY KEY,
            city_id TEXT,
            lat REAL,
            lng REAL,
            vls_code TEXT,
            destructible BOOLEAN,
            last_modified INTEGER
        )
    ''')
    
    # 3. Real Cities Table
    print("📋 Creating cities_real table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cities_real (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            lat REAL,
            lng REAL,
            population INTEGER,
            country TEXT
        )
    ''')
    
    # 4. SkyRelics Cities Table
    print("📋 Creating cities_skyrelics table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cities_skyrelics (
            id TEXT PRIMARY KEY,
            real_city_id TEXT,
            name TEXT NOT NULL,
            towers INTEGER DEFAULT 0,
            dungeons INTEGER DEFAULT 0,
            quests INTEGER DEFAULT 0,
            tier TEXT
        )
    ''')
    
    # 5. Creator Earnings Table
    print("📋 Creating creator_earnings table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS creator_earnings (
            id TEXT PRIMARY KEY,
            creator_id TEXT,
            object_id TEXT,
            downloads INTEGER DEFAULT 0,
            revenue REAL DEFAULT 0.0,
            created_at INTEGER
        )
    ''')
    
    # 6. Subscriptions Table
    print("📋 Creating subscriptions table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            user_id TEXT PRIMARY KEY,
            tier TEXT,
            max_renders INTEGER,
            monthly_renders_remaining INTEGER,
            expires_at INTEGER
        )
    ''')
    
    # 7. Destruction Log Table (for multiplayer sync)
    print("📋 Creating destruction_log table...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS destruction_log (
            id TEXT PRIMARY KEY,
            city_id TEXT,
            player_id TEXT,
            position_x REAL,
            position_y REAL,
            position_z REAL,
            radius REAL,
            power INTEGER,
            timestamp INTEGER
        )
    ''')
    
    # Commit changes
    db.commit()
    
    # Seed with real cities
    print("\n🌍 Seeding real cities...")
    seed_real_cities(cursor)
    
    # Seed with SkyRelics cities
    print("🎮 Seeding SkyRelics cities...")
    seed_skyrelics_cities(cursor)
    
    # Seed with subscription tiers
    print("💰 Seeding subscription tiers...")
    seed_subscriptions(cursor)
    
    db.commit()
    
    # Get database stats
    cursor.execute("SELECT COUNT(*) FROM cities_real")
    real_cities = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM cities_skyrelics")
    skyrelics_cities = cursor.fetchone()[0]
    
    # Close connection
    db.close()
    
    # Print summary
    print("\n" + "="*60)
    print("✅ SQLite Database Initialized Successfully!")
    print("="*60)
    print(f"📁 Database: {db_path}")
    print(f"📊 Tables: 7")
    print(f"🌍 Real Cities: {real_cities}")
    print(f"🎮 SkyRelics Cities: {skyrelics_cities}")
    print(f"⏱️  Ready for 47K object conversion")
    print("="*60)

def seed_real_cities(cursor):
    """Seed database with major world cities"""
    cities = [
        ("nyc", "New York City", 40.7128, -74.0060, 8_000_000, "USA"),
        ("la", "Los Angeles", 34.0522, -118.2437, 3_900_000, "USA"),
        ("chicago", "Chicago", 41.8781, -87.6298, 2_700_000, "USA"),
        ("tokyo", "Tokyo", 35.6762, 139.6503, 14_000_000, "Japan"),
        ("london", "London", 51.5074, -0.1278, 9_000_000, "UK"),
        ("paris", "Paris", 48.8566, 2.3522, 2_161_000, "France"),
        ("dubai", "Dubai", 25.2048, 55.2708, 3_600_000, "UAE"),
        ("singapore", "Singapore", 1.3521, 103.8198, 5_700_000, "Singapore"),
        ("sydney", "Sydney", -33.8688, 151.2093, 5_300_000, "Australia"),
        ("toronto", "Toronto", 43.6532, -79.3832, 2_900_000, "Canada"),
        ("berlin", "Berlin", 52.5200, 13.4050, 3_600_000, "Germany"),
        ("barcelona", "Barcelona", 41.3851, 2.1734, 1_600_000, "Spain"),
        ("moscow", "Moscow", 55.7558, 37.6173, 12_600_000, "Russia"),
        ("bangkok", "Bangkok", 13.7563, 100.5018, 8_300_000, "Thailand"),
        ("hong_kong", "Hong Kong", 22.3193, 114.1694, 7_500_000, "Hong Kong"),
    ]
    
    for city_id, name, lat, lng, population, country in cities:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO cities_real 
                (id, name, lat, lng, population, country)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (city_id, name, lat, lng, population, country))
        except Exception as e:
            print(f"  ⚠️  Error seeding {name}: {e}")

def seed_skyrelics_cities(cursor):
    """Create SkyRelics gaming cities above real cities"""
    skyrelics_data = [
        ("skyrelics_nyc", "nyc", "SkyTower NYC", 100, 50, 200, "legendary"),
        ("skyrelics_la", "la", "Sky Angels LA", 80, 40, 150, "epic"),
        ("skyrelics_tokyo", "tokyo", "Sky Towers Tokyo", 120, 60, 250, "legendary"),
        ("skyrelics_london", "london", "Sky Kingdom London", 90, 45, 180, "epic"),
        ("skyrelics_dubai", "dubai", "Sky Towers Dubai", 110, 55, 220, "legendary"),
        ("skyrelics_paris", "paris", "Sky Citadel Paris", 85, 42, 160, "epic"),
        ("skyrelics_singapore", "singapore", "Sky Harbor Singapore", 95, 48, 190, "epic"),
        ("skyrelics_sydney", "sydney", "Sky Realm Sydney", 80, 40, 150, "epic"),
        ("skyrelics_toronto", "toronto", "Sky Towers Toronto", 75, 37, 140, "common"),
        ("skyrelics_berlin", "berlin", "Sky Citadel Berlin", 88, 44, 175, "epic"),
    ]
    
    for sky_id, real_city, name, towers, dungeons, quests, tier in skyrelics_data:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO cities_skyrelics
                (id, real_city_id, name, towers, dungeons, quests, tier)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (sky_id, real_city, name, towers, dungeons, quests, tier))
        except Exception as e:
            print(f"  ⚠️  Error seeding {name}: {e}")

def seed_subscriptions(cursor):
    """Create subscription tier templates"""
    tiers = [
        ("free", 10, 10),           # 10 renders/month
        ("premium", 100, 100),       # 100 renders/month, $9.99
        ("pro", 1000000, 1000000),   # Unlimited renders, $49.99
    ]
    
    for tier_name, max_renders, monthly_renders in tiers:
        print(f"  📌 Tier template: {tier_name.upper()} ({max_renders} renders/month)")

if __name__ == '__main__':
    start_time = time.time()
    init_database()
    elapsed = time.time() - start_time
    print(f"\n⏱️  Setup time: {elapsed:.2f}s")
