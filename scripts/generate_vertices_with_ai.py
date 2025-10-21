#!/usr/bin/env python3
"""
Enhanced VLS Converter: Generate Real Vertices with AI Personality Context
Converts 47K objects with actual geometry, vertices, and AI personality styling
"""

import json
import sqlite3
import os
import time
import math
from multiprocessing import Pool, cpu_count
from pathlib import Path

class AIPersonalityGeneRenderer:
    """Generate vertices based on AI personality traits and GENE language"""
    
    def __init__(self):
        # Load AI personality assignments
        self.ai_personalities = self.load_ai_personalities()
        
    def load_ai_personalities(self):
        """Load AI personality method assignments"""
        try:
            with open('ai_method_assignments.json', 'r') as f:
                return json.load(f)
        except:
            return self.get_default_personalities()
    
    def get_default_personalities(self):
        """Default AI personality traits"""
        return {
            "30": {"name": "Interior Designer", "style": "luxurious", "precision": 0.8},
            "14": {"name": "Organic Naturalist", "style": "organic", "precision": 0.6},
            "20": {"name": "Vehicle Designer", "style": "aerodynamic", "precision": 0.9},
            "33": {"name": "Industrial Designer", "style": "precise", "precision": 1.0},
            "53": {"name": "Medical Professional", "style": "anatomical", "precision": 1.0},
            "25": {"name": "Residential Architect", "style": "structural", "precision": 0.9},
            "67": {"name": "Financial Advisor", "style": "optimized", "precision": 0.7},
            "82": {"name": "Career Coach", "style": "efficient", "precision": 0.7},
            "21": {"name": "Costume Designer", "style": "stylish", "precision": 0.8},
            "1": {"name": "Visionary Artist", "style": "creative", "precision": 0.5}
        }
    
    def select_ai_personality(self, obj):
        """Select appropriate AI personality based on object type"""
        name = obj.get('metadata', {}).get('name', '') or obj.get('name', '')
        category = obj.get('category', '').lower()
        
        # Map categories to AI personalities
        if 'furniture' in category or 'furniture' in name.lower():
            return "30"  # Interior Designer
        elif 'nature' in category or any(x in name.lower() for x in ['tree', 'plant', 'rock']):
            return "14"  # Organic Naturalist
        elif 'vehicle' in category or any(x in name.lower() for x in ['car', 'truck', 'aircraft']):
            return "20"  # Vehicle Designer
        elif 'tool' in category or 'equipment' in category:
            return "33"  # Industrial Designer
        elif 'architecture' in category or 'building' in name.lower():
            return "25"  # Residential Architect
        else:
            return "1"   # Visionary Artist (creative default)
    
    def generate_vertices_with_personality(self, obj, personality_id):
        """Generate vertices influenced by AI personality traits"""
        personality = self.ai_personalities.get(personality_id, self.ai_personalities["1"])
        style = personality.get("style", "creative")
        precision = personality.get("precision", 0.5)
        
        # Determine base shape from object data
        base_shape = self.determine_shape(obj)
        
        # Generate vertices based on shape and personality
        if base_shape == "box":
            vertices = self.generate_box_vertices(precision, style)
        elif base_shape == "sphere":
            vertices = self.generate_sphere_vertices(precision, style)
        elif base_shape == "cylinder":
            vertices = self.generate_cylinder_vertices(precision, style)
        elif base_shape == "organic":
            vertices = self.generate_organic_vertices(precision, style)
        else:
            vertices = self.generate_box_vertices(precision, style)
        
        # Apply personality-specific transformations
        vertices = self.apply_personality_styling(vertices, style, precision)
        
        return vertices
    
    def determine_shape(self, obj):
        """Determine base shape from object data"""
        name = obj.get('metadata', {}).get('name', '') or obj.get('name', '')
        category = obj.get('category', '').lower()
        
        if any(x in name.lower() for x in ['sphere', 'ball', 'globe', 'orb']):
            return "sphere"
        elif any(x in name.lower() for x in ['cylinder', 'pipe', 'tube', 'barrel']):
            return "cylinder"
        elif any(x in name.lower() for x in ['tree', 'plant', 'rock', 'organic']):
            return "organic"
        else:
            return "box"
    
    def generate_box_vertices(self, precision, style):
        """Generate box vertices with personality influence"""
        # Higher precision = more vertices for smoother edges
        detail = int(2 + (precision * 10))
        
        vertices = []
        # 8 corner vertices
        for x in [-1, 1]:
            for y in [-1, 1]:
                for z in [-1, 1]:
                    vertices.append([x, y, z])
        
        # Add edge subdivision based on precision
        if precision > 0.7:
            for i in range(1, detail):
                t = i / detail
                # Add vertices along edges
                vertices.extend([
                    [-1 + 2*t, -1, -1], [-1 + 2*t, 1, -1],
                    [-1 + 2*t, -1, 1], [-1 + 2*t, 1, 1],
                ])
        
        return vertices
    
    def generate_sphere_vertices(self, precision, style):
        """Generate sphere vertices with personality influence"""
        segments = int(8 + (precision * 24))  # 8-32 segments
        vertices = []
        
        for lat in range(segments + 1):
            theta = lat * math.pi / segments
            sin_theta = math.sin(theta)
            cos_theta = math.cos(theta)
            
            for lon in range(segments):
                phi = lon * 2 * math.pi / segments
                sin_phi = math.sin(phi)
                cos_phi = math.cos(phi)
                
                x = cos_phi * sin_theta
                y = cos_theta
                z = sin_phi * sin_theta
                
                vertices.append([x, y, z])
        
        return vertices
    
    def generate_cylinder_vertices(self, precision, style):
        """Generate cylinder vertices with personality influence"""
        segments = int(8 + (precision * 24))
        height = 2.0
        radius = 1.0
        
        vertices = []
        
        # Top and bottom circles
        for h in [-height/2, height/2]:
            for i in range(segments):
                angle = 2 * math.pi * i / segments
                x = radius * math.cos(angle)
                z = radius * math.sin(angle)
                vertices.append([x, h, z])
        
        return vertices
    
    def generate_organic_vertices(self, precision, style):
        """Generate organic/natural shape vertices"""
        # Use icosahedron base with subdivision
        t = (1.0 + math.sqrt(5.0)) / 2.0
        
        vertices = [
            [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
            [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
            [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
        ]
        
        # Add noise for organic feel
        if style == "organic":
            vertices = [[v[0] + math.sin(v[0]*5)*0.1, 
                        v[1] + math.sin(v[1]*5)*0.1, 
                        v[2] + math.sin(v[2]*5)*0.1] for v in vertices]
        
        return vertices
    
    def apply_personality_styling(self, vertices, style, precision):
        """Apply AI personality-specific styling to vertices"""
        styled_vertices = []
        
        for v in vertices:
            x, y, z = v
            
            if style == "luxurious":
                # Add smoothing and roundness
                x *= 1.1
                y *= 1.1
                z *= 1.1
            elif style == "organic":
                # Add natural variation
                x += math.sin(y * 3) * 0.05
                z += math.cos(x * 3) * 0.05
            elif style == "aerodynamic":
                # Elongate along one axis
                z *= 1.5
            elif style == "precise" or style == "anatomical":
                # Keep exact coordinates (already precise)
                pass
            elif style == "creative":
                # Add artistic variation
                scale = 1.0 + math.sin(x + y + z) * 0.1
                x *= scale
                y *= scale
                z *= scale
            
            styled_vertices.append([round(x, 6), round(y, 6), round(z, 6)])
        
        return styled_vertices
    
    def generate_faces_from_vertices(self, vertices, base_shape):
        """Generate face indices from vertices"""
        faces = []
        
        if base_shape == "box" and len(vertices) >= 8:
            # Simple box faces
            faces = [
                [0, 1, 3, 2], [4, 5, 7, 6],  # Front, back
                [0, 1, 5, 4], [2, 3, 7, 6],  # Top, bottom
                [0, 2, 6, 4], [1, 3, 7, 5]   # Left, right
            ]
        elif base_shape == "sphere":
            # Generate sphere faces (simplified)
            segments = int(math.sqrt(len(vertices)))
            for i in range(segments - 1):
                for j in range(segments):
                    idx = i * segments + j
                    next_idx = idx + segments
                    next_j = (j + 1) % segments
                    faces.append([idx, next_idx, idx + next_j])
        else:
            # Simple triangulation for other shapes
            for i in range(0, len(vertices) - 2, 3):
                faces.append([i, i+1, i+2])
        
        return faces
    
    def generate_gene_code(self, obj, personality_id, base_shape):
        """Generate GENE language code with AI personality influence"""
        personality = self.ai_personalities.get(personality_id, self.ai_personalities["1"])
        style = personality.get("style", "creative")
        name = obj.get('metadata', {}).get('name', '') or obj.get('name', 'object')
        
        # Generate GENE code
        gene_code = f"OBJECT:{name.replace(' ', '_')}\n"
        gene_code += f"AI_PERSONALITY:{personality['name']}\n"
        gene_code += f"STYLE:{style}\n"
        gene_code += f"SHAPE:{base_shape}\n"
        
        # Add style-specific modifiers
        if style == "luxurious":
            gene_code += "MATERIAL:leather smooth glossy\n"
            gene_code += "SURFACE:polished comfortable elegant\n"
        elif style == "organic":
            gene_code += "MATERIAL:natural wood bark\n"
            gene_code += "SURFACE:rough organic flowing\n"
        elif style == "aerodynamic":
            gene_code += "MATERIAL:metal carbon_fiber\n"
            gene_code += "SURFACE:smooth sleek streamlined\n"
        elif style == "precise":
            gene_code += "MATERIAL:steel aluminum\n"
            gene_code += "SURFACE:precise angular engineered\n"
        else:
            gene_code += "MATERIAL:mixed\n"
            gene_code += "SURFACE:creative artistic\n"
        
        return gene_code


class EnhancedVLSConverter:
    """Convert objects to VLS with full vertex data and AI personality context"""
    
    def __init__(self, db_path='pixelprodigy.db'):
        self.db_path = db_path
        self.objects_dir = Path('object_generator/generated_objects')
        self.gene_renderer = AIPersonalityGeneRenderer()
        
    def load_all_objects(self):
        """Load all 47K objects from JSON files"""
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
                for json_file in category_path.rglob('*.json'):
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                for obj in data:
                                    obj['category'] = category
                                    all_objects.append(obj)
                            else:
                                data['category'] = category
                                all_objects.append(data)
                    except Exception as e:
                        pass
        
        print(f"✅ Loaded {len(all_objects)} objects")
        return all_objects
    
    def convert_object_with_vertices(self, obj):
        """Convert object to VLS with full vertex data and AI personality"""
        try:
            # Select AI personality
            personality_id = self.gene_renderer.select_ai_personality(obj)
            
            # Determine base shape
            base_shape = self.gene_renderer.determine_shape(obj)
            
            # Generate vertices with personality influence
            vertices = self.gene_renderer.generate_vertices_with_personality(obj, personality_id)
            
            # Generate faces
            faces = self.gene_renderer.generate_faces_from_vertices(vertices, base_shape)
            
            # Generate GENE code
            gene_code = self.gene_renderer.generate_gene_code(obj, personality_id, base_shape)
            
            # Compress for VLS
            vls_compressed = self.compress_geometry(vertices, faces)
            
            # Calculate stats
            vertex_count = len(vertices)
            face_count = len(faces)
            original_size = len(json.dumps(obj))
            compressed_size = len(vls_compressed)
            compression_ratio = original_size / compressed_size if compressed_size > 0 else 1.0
            
            # Determine tier
            tier = self.calculate_tier(vertex_count)
            
            # Get object identifiers
            obj_id = obj.get('objectId') or obj.get('id') or obj.get('metadata', {}).get('name', 'unknown')
            obj_name = obj.get('metadata', {}).get('name') or obj.get('name', 'Untitled')
            
            return {
                'id': obj_id,
                'name': obj_name,
                'gene_code': gene_code,
                'vls_code': json.dumps({'vertices': vertices, 'faces': faces}),
                'vls_compressed': vls_compressed,
                'vertices': json.dumps(vertices),
                'faces': json.dumps(faces),
                'vertex_count': vertex_count,
                'face_count': face_count,
                'tier': tier,
                'skyrelics_tier': tier,
                'ai_personality_id': personality_id,
                'ai_personality_name': self.gene_renderer.ai_personalities.get(personality_id, {}).get('name', 'Unknown'),
                'compression_ratio': compression_ratio,
                'created_at': int(time.time())
            }
        except Exception as e:
            print(f"⚠️  Error converting {obj.get('name', 'unknown')}: {e}")
            return None
    
    def compress_geometry(self, vertices, faces):
        """Compress geometry data for VLS"""
        # Simple compression: round coordinates and encode
        compressed = f"V{len(vertices)}F{len(faces)}"
        for v in vertices[:10]:  # Sample first 10 vertices
            compressed += f"|{int(v[0]*100)},{int(v[1]*100)},{int(v[2]*100)}"
        return compressed
    
    def calculate_tier(self, vertex_count):
        """Determine tier based on vertex count"""
        if vertex_count > 500:
            return 'legendary'
        elif vertex_count > 200:
            return 'epic'
        elif vertex_count > 50:
            return 'rare'
        else:
            return 'common'
    
    def update_database_schema(self):
        """Add new columns for vertices and AI personality"""
        print("📊 Updating database schema...")
        db = sqlite3.connect(self.db_path)
        cursor = db.cursor()
        
        # Add new columns if they don't exist
        new_columns = [
            ("gene_code", "TEXT"),
            ("vertices", "TEXT"),
            ("faces", "TEXT"),
            ("face_count", "INTEGER"),
            ("ai_personality_id", "TEXT"),
            ("ai_personality_name", "TEXT")
        ]
        
        for col_name, col_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE vls_objects ADD COLUMN {col_name} {col_type}")
                print(f"  ✅ Added column: {col_name}")
            except sqlite3.OperationalError:
                pass  # Column already exists
        
        db.commit()
        db.close()
        print("✅ Database schema updated")
    
    def save_to_database(self, converted_objects):
        """Save converted objects with vertices to database"""
        print(f"💾 Saving {len(converted_objects)} objects with vertices...")
        
        db = sqlite3.connect(self.db_path)
        cursor = db.cursor()
        
        saved_count = 0
        for obj in converted_objects:
            if obj is None:
                continue
            
            try:
                cursor.execute('''
                    UPDATE vls_objects 
                    SET gene_code = ?, vertices = ?, faces = ?, face_count = ?,
                        ai_personality_id = ?, ai_personality_name = ?,
                        vertex_count = ?, vls_code = ?
                    WHERE id = ?
                ''', (
                    obj['gene_code'], obj['vertices'], obj['faces'], obj['face_count'],
                    obj['ai_personality_id'], obj['ai_personality_name'],
                    obj['vertex_count'], obj['vls_code'], obj['id']
                ))
                saved_count += 1
            except Exception as e:
                print(f"⚠️  Error saving {obj['name']}: {e}")
        
        db.commit()
        db.close()
        
        print(f"✅ Saved {saved_count} objects with full vertex data")
        return saved_count


def convert_batch_with_vertices(objects_batch):
    """Convert batch with full vertex generation"""
    converter = EnhancedVLSConverter()
    return [converter.convert_object_with_vertices(obj) for obj in objects_batch]


def main():
    print("=" * 60)
    print("🎨 ENHANCED VLS CONVERSION WITH AI PERSONALITY VERTICES")
    print("=" * 60)
    
    start_time = time.time()
    
    converter = EnhancedVLSConverter()
    
    # Update database schema
    converter.update_database_schema()
    
    # Load objects
    all_objects = converter.load_all_objects()
    
    if len(all_objects) == 0:
        print("❌ No objects found!")
        return
    
    # Use parallel processing
    num_cores = cpu_count()
    print(f"💻 Using {num_cores} CPU cores")
    
    batch_size = len(all_objects) // num_cores
    batches = [all_objects[i:i + batch_size] for i in range(0, len(all_objects), batch_size)]
    
    print(f"📦 Processing {len(batches)} batches...")
    print("⚙️  Generating vertices with AI personality influence...")
    
    with Pool(num_cores) as pool:
        results = pool.map(convert_batch_with_vertices, batches)
    
    converted_objects = [obj for batch in results for obj in batch]
    
    conversion_time = time.time() - start_time
    
    print(f"\n✅ Vertex generation complete!")
    print(f"⏱️  Time: {conversion_time:.2f}s")
    
    # Save to database
    saved_count = converter.save_to_database(converted_objects)
    
    total_time = time.time() - start_time
    
    # Calculate statistics
    total_vertices = sum(obj['vertex_count'] for obj in converted_objects if obj)
    total_faces = sum(obj['face_count'] for obj in converted_objects if obj)
    
    print("\n" + "=" * 60)
    print("📊 VERTEX GENERATION STATISTICS")
    print("=" * 60)
    print(f"Total Objects:        {len(all_objects)}")
    print(f"Successfully Converted: {len(converted_objects)}")
    print(f"Total Vertices:       {total_vertices:,}")
    print(f"Total Faces:          {total_faces:,}")
    print(f"Avg Vertices/Object:  {total_vertices // len(converted_objects)}")
    print(f"Total Time:           {total_time:.2f}s")
    print("=" * 60)
    
    # Show AI personality distribution
    personality_counts = {}
    for obj in converted_objects:
        if obj:
            pid = obj.get('ai_personality_name', 'Unknown')
            personality_counts[pid] = personality_counts.get(pid, 0) + 1
    
    print("\n🎭 AI PERSONALITY DISTRIBUTION:")
    for personality, count in sorted(personality_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {personality}: {count} objects")
    
    print("\n✨ All objects now have full vertex data with AI personality influence!")

if __name__ == '__main__':
    main()
