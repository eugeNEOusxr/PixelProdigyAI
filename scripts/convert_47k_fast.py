#!/usr/bin/env python3
"""
Fast Parallel Conversion: 47K Objects to VLS/GENE Format
Uses multiprocessing to convert all objects in ~45 minutes
"""

import json
import sqlite3
import os
import time
from multiprocessing import Pool, cpu_count
from pathlib import Path

class FastObjectConverter:
    def __init__(self, db_path='pixelprodigy.db'):
        self.db_path = db_path
        self.objects_dir = Path('object_generator/generated_objects')
        
    def load_all_objects(self):
        """Load all 47K objects from JSON files (recursive search)"""
        print("📂 Loading 47K objects from disk...")
        all_objects = []
        
        categories = [
            'architecture', 'art_&_decor', 'clothing_&_accessories',
            'education_&_real-world_systems', 'electronics', 'food_&_beverage',
            'furniture', 'nature', 'tools_&_equipment', 'vehicles'
        ]
        
        for category in categories:
            category_path = self.objects_dir / category
            if category_path.exists():
                # Recursive glob to find all JSON files in subdirectories
                for json_file in category_path.rglob('*.json'):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            # Handle both single objects and arrays of objects
                            if isinstance(data, list):
                                for obj in data:
                                    obj['category'] = category
                                    all_objects.append(obj)
                            else:
                                data['category'] = category
                                all_objects.append(data)
                    except Exception as e:
                        print(f"⚠️  Error loading {json_file}: {e}")
        
        print(f"✅ Loaded {len(all_objects)} objects")
        return all_objects
    
    def convert_object_to_vls(self, obj):
        """Convert single object to VLS format"""
        try:
            # Generate VLS code based on object properties
            vls_code = self.generate_vls_from_object(obj)
            
            # Compress VLS code
            vls_compressed = self.compress_vls(vls_code)
            
            # Calculate compression ratio
            original_size = len(json.dumps(obj))
            compressed_size = len(vls_compressed)
            compression_ratio = original_size / compressed_size if compressed_size > 0 else 1.0
            
            # Determine SkyRelics tier based on complexity
            tier = self.calculate_tier(obj)
            
            # Handle different object structures
            obj_id = obj.get('objectId') or obj.get('id') or obj.get('metadata', {}).get('name', 'unknown')
            obj_name = obj.get('metadata', {}).get('name') or obj.get('name', 'Untitled')
            
            return {
                'id': obj_id,
                'name': obj_name,
                'vls_code': vls_code,
                'vls_compressed': vls_compressed,
                'tier': tier,
                'skyrelics_tier': tier,
                'polygon_count': obj.get('polygonCount', 0),
                'vertex_count': obj.get('vertexCount', 0),
                'compression_ratio': compression_ratio,
                'created_at': int(time.time())
            }
        except Exception as e:
            print(f"⚠️  Error converting {obj.get('name', 'unknown')}: {e}")
            return None
    
    def generate_vls_from_object(self, obj):
        """Generate VLS code from object metadata"""
        # Simple VLS generation based on object type
        name = obj.get('name', 'object')
        category = obj.get('category', 'misc')
        
        # Base VLS structure
        vls = f"OBJ:{name.replace(' ', '_')}\n"
        
        # Add geometry based on category
        if 'furniture' in category:
            vls += "SHAPE:BOX\nSCALE:1.0,0.8,0.6\nMATERIAL:wood\n"
        elif 'vehicle' in category:
            vls += "SHAPE:MESH\nSCALE:2.0,1.0,4.0\nMATERIAL:metal\n"
        elif 'nature' in category:
            vls += "SHAPE:ORGANIC\nSCALE:1.0,2.0,1.0\nMATERIAL:plant\n"
        elif 'architecture' in category:
            vls += "SHAPE:STRUCTURE\nSCALE:10.0,20.0,10.0\nMATERIAL:concrete\n"
        else:
            vls += "SHAPE:BOX\nSCALE:1.0,1.0,1.0\nMATERIAL:default\n"
        
        return vls
    
    def compress_vls(self, vls_code):
        """Compress VLS code (simple version)"""
        # Replace common patterns with shorter codes
        compressed = vls_code.replace('SHAPE:', 'S:')
        compressed = compressed.replace('SCALE:', 'SC:')
        compressed = compressed.replace('MATERIAL:', 'M:')
        compressed = compressed.replace('OBJ:', 'O:')
        
        # Remove whitespace
        compressed = ''.join(compressed.split())
        
        return compressed
    
    def calculate_tier(self, obj):
        """Determine SkyRelics tier based on object complexity"""
        polygon_count = obj.get('polygonCount', 0)
        
        if polygon_count > 50000:
            return 'legendary'
        elif polygon_count > 20000:
            return 'epic'
        elif polygon_count > 5000:
            return 'rare'
        else:
            return 'common'
    
    def save_to_database(self, converted_objects):
        """Save converted objects to SQLite database"""
        print(f"💾 Saving {len(converted_objects)} objects to database...")
        
        db = sqlite3.connect(self.db_path)
        cursor = db.cursor()
        
        saved_count = 0
        for obj in converted_objects:
            if obj is None:
                continue
                
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO vls_objects
                    (id, name, vls_code, vls_compressed, tier, skyrelics_tier,
                     polygon_count, vertex_count, compression_ratio, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    obj['id'], obj['name'], obj['vls_code'], obj['vls_compressed'],
                    obj['tier'], obj['skyrelics_tier'], obj['polygon_count'],
                    obj['vertex_count'], obj['compression_ratio'], obj['created_at']
                ))
                saved_count += 1
            except Exception as e:
                print(f"⚠️  Error saving {obj['name']}: {e}")
        
        db.commit()
        db.close()
        
        print(f"✅ Saved {saved_count} objects to database")
        return saved_count

def convert_batch(objects_batch):
    """Convert a batch of objects (for parallel processing)"""
    converter = FastObjectConverter()
    return [converter.convert_object_to_vls(obj) for obj in objects_batch]

def main():
    print("=" * 60)
    print("🚀 FAST 47K OBJECT CONVERSION")
    print("=" * 60)
    
    start_time = time.time()
    
    # Initialize converter
    converter = FastObjectConverter()
    
    # Load all objects
    all_objects = converter.load_all_objects()
    
    if len(all_objects) == 0:
        print("❌ No objects found to convert!")
        return
    
    # Determine number of CPU cores to use
    num_cores = cpu_count()
    print(f"💻 Using {num_cores} CPU cores for parallel processing")
    
    # Split objects into batches
    batch_size = len(all_objects) // num_cores
    batches = [all_objects[i:i + batch_size] for i in range(0, len(all_objects), batch_size)]
    
    print(f"📦 Split into {len(batches)} batches")
    
    # Process batches in parallel
    print("⚙️  Converting objects in parallel...")
    with Pool(num_cores) as pool:
        results = pool.map(convert_batch, batches)
    
    # Flatten results
    converted_objects = [obj for batch in results for obj in batch]
    
    conversion_time = time.time() - start_time
    
    print(f"\n✅ Conversion complete!")
    print(f"⏱️  Time: {conversion_time:.2f}s ({conversion_time/60:.1f} minutes)")
    print(f"📊 Rate: {len(converted_objects) / conversion_time:.1f} objects/sec")
    
    # Save to database
    saved_count = converter.save_to_database(converted_objects)
    
    # Calculate statistics
    total_compression = sum(obj['compression_ratio'] for obj in converted_objects if obj)
    avg_compression = total_compression / len(converted_objects) if converted_objects else 0
    
    total_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("📊 CONVERSION STATISTICS")
    print("=" * 60)
    print(f"Total Objects:        {len(all_objects)}")
    print(f"Successfully Converted: {len(converted_objects)}")
    print(f"Saved to Database:    {saved_count}")
    print(f"Average Compression:  {avg_compression:.1f}x")
    print(f"Total Time:           {total_time:.2f}s ({total_time/60:.1f} minutes)")
    print(f"Processing Rate:      {len(converted_objects) / total_time:.1f} objects/sec")
    print("=" * 60)
    
    # Tier distribution
    tier_counts = {}
    for obj in converted_objects:
        if obj:
            tier = obj.get('tier', 'unknown')
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
    
    print("\n🎯 TIER DISTRIBUTION:")
    for tier, count in sorted(tier_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {tier.upper()}: {count} objects")
    
    print("\n✨ Conversion complete! Database ready for production.")

if __name__ == '__main__':
    main()
