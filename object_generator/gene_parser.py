#!/usr/bin/env python3
"""
GENE Language Parser
Converts human-readable GENE code to 3D geometry with anatomical layer precision
"""

import re
import json
import math
from typing import Dict, List, Tuple, Any

class GENEParser:
    """Revolutionary 3D object parser using natural language commands"""
    
    # ========================================
    # VOCABULARY DEFINITIONS
    # ========================================
    
    DIRECTIONS = {
        # Cardinal (6)
        'forward': (1, 0, 0), 'backward': (-1, 0, 0),
        'upward': (0, 1, 0), 'downward': (0, -1, 0),
        'leftward': (0, 0, 1), 'rightward': (0, 0, -1),
        
        # Diagonal (8)
        'upleft': (0, 1, 1), 'upright': (0, 1, -1),
        'downleft': (0, -1, 1), 'downright': (0, -1, -1),
        'forwardleft': (1, 0, 1), 'forwardright': (1, 0, -1),
        'backwardleft': (-1, 0, 1), 'backwardright': (-1, 0, -1),
        
        # Rotational (6)
        'clockwise': 'rotate_cw', 'counterclockwise': 'rotate_ccw',
        'spiral': 'spiral_path', 'twist': 'twist_transform',
        'curve': 'curve_path', 'arc': 'arc_path',
        
        # Relational (4)
        'toward': 'toward_target', 'away': 'away_target',
        'around': 'around_target', 'through': 'through_target'
    }
    
    MATERIALS = {
        # Organic
        'skin': {'roughness': 0.6, 'metalness': 0.0, 'color': '#F5CBA7', 'subsurface': 0.3},
        'flesh': {'roughness': 0.8, 'metalness': 0.0, 'color': '#C04040', 'subsurface': 0.5},
        'bone': {'roughness': 0.4, 'metalness': 0.0, 'color': '#FFFEF0', 'hardness': 0.9},
        'cartilage': {'roughness': 0.5, 'metalness': 0.0, 'color': '#E0E0E0', 'flexibility': 0.7},
        'fat': {'roughness': 0.9, 'metalness': 0.0, 'color': '#FFF8DC', 'softness': 0.9},
        'tendon': {'roughness': 0.6, 'metalness': 0.0, 'color': '#F0F0F0', 'tensile': 0.8},
        'ligament': {'roughness': 0.6, 'metalness': 0.0, 'color': '#F5F5DC', 'tensile': 0.8},
        
        # Manufactured
        'wood': {'roughness': 0.8, 'metalness': 0.0, 'color': '#8B4513'},
        'metal': {'roughness': 0.2, 'metalness': 1.0, 'color': '#C0C0C0'},
        'glass': {'roughness': 0.0, 'metalness': 0.0, 'color': '#FFFFFF', 'transmission': 0.9},
        'plastic': {'roughness': 0.5, 'metalness': 0.0, 'color': '#FFFFFF'},
        'fabric': {'roughness': 1.0, 'metalness': 0.0, 'color': '#808080'},
        'leather': {'roughness': 0.7, 'metalness': 0.0, 'color': '#654321'},
        'concrete': {'roughness': 0.9, 'metalness': 0.0, 'color': '#A0A0A0'},
        'ceramic': {'roughness': 0.3, 'metalness': 0.0, 'color': '#FFFFFF'},
        
        # Natural
        'stone': {'roughness': 0.9, 'metalness': 0.0, 'color': '#808080'},
        'clay': {'roughness': 1.0, 'metalness': 0.0, 'color': '#B87333'},
        'sand': {'roughness': 1.0, 'metalness': 0.0, 'color': '#C2B280'},
        'water': {'roughness': 0.0, 'metalness': 0.0, 'color': '#0080FF', 'transmission': 0.8},
        'ice': {'roughness': 0.1, 'metalness': 0.0, 'color': '#E0FFFF', 'transparency': 0.7},
        'crystal': {'roughness': 0.0, 'metalness': 0.3, 'color': '#FFFFFF', 'refraction': 1.5}
    }
    
    LAYER_TYPES = {
        # Anatomical layers
        'skeletal': {'depth': 0, 'color': '#FFFEF0', 'opacity': 1.0},
        'muscular': {'depth': 1, 'color': '#C04040', 'opacity': 0.8},
        'vascular': {'depth': 2, 'color': '#FF0000', 'opacity': 0.6},
        'nervous': {'depth': 3, 'color': '#FFFF00', 'opacity': 0.5},
        'lymphatic': {'depth': 4, 'color': '#90EE90', 'opacity': 0.4},
        'organ': {'depth': 5, 'color': '#8B4513', 'opacity': 0.7},
        'fascia': {'depth': 6, 'color': '#F0F0F0', 'opacity': 0.3},
        'dermis': {'depth': 7, 'color': '#FFD7A0', 'opacity': 0.8},
        'epidermis': {'depth': 8, 'color': '#F5CBA7', 'opacity': 1.0},
        'subcutaneous': {'depth': 9, 'color': '#FFF8DC', 'opacity': 0.5},
        
        # Object layers
        'core': {'depth': 0, 'purpose': 'structural'},
        'structure': {'depth': 1, 'purpose': 'support'},
        'padding': {'depth': 2, 'purpose': 'comfort'},
        'covering': {'depth': 3, 'purpose': 'protection'},
        'surface': {'depth': 4, 'purpose': 'interface'},
        'coating': {'depth': 5, 'purpose': 'finish'}
    }
    
    def __init__(self):
        self.objects = []
        self.current_object = None
        self.anatomical_mode = False
        
    # ========================================
    # PARSING METHODS
    # ========================================
    
    def parse_measurement(self, text: str) -> float:
        """Convert measurement text to meters"""
        # Extract number and unit
        match = re.match(r'([\d.]+)(mm|cm|m|inch|foot)', text.lower())
        if not match:
            return 1.0
        
        value = float(match.group(1))
        unit = match.group(2)
        
        # Convert to meters
        conversions = {
            'mm': 0.001,
            'cm': 0.01,
            'm': 1.0,
            'inch': 0.0254,
            'foot': 0.3048
        }
        
        return value * conversions.get(unit, 1.0)
    
    def parse_gene_line(self, gene_code: str) -> Dict[str, Any]:
        """Parse single GENE statement
        
        Format: OBJECT_TYPE > LAYER > SHAPE DIRECTION SIZE MATERIAL MODIFIERS
        Example: CHAIR > seat > surface forward 50cm cushion soft
        """
        # Split by layer separator
        parts = [p.strip() for p in gene_code.split('>')]
        
        if len(parts) < 3:
            return None
        
        object_type = parts[0].upper()
        layer = parts[1].lower()
        commands = parts[2].split()
        
        geometry = {
            'object_type': object_type,
            'layer': layer,
            'shape': 'cube',  # default
            'position': [0, 0, 0],
            'size': [1, 1, 1],
            'rotation': [0, 0, 0],
            'material': self.MATERIALS.get('wood', {}),
            'modifiers': [],
            'metadata': {}
        }
        
        # Parse commands sequentially
        i = 0
        current_direction = [0, 0, 0]
        
        while i < len(commands):
            cmd = commands[i].lower()
            
            # Shape primitives
            if cmd in ['cube', 'sphere', 'cylinder', 'cone', 'pyramid', 'blob', 'droplet', 'egg']:
                geometry['shape'] = cmd
                i += 1
            
            # Directions
            elif cmd in self.DIRECTIONS:
                direction = self.DIRECTIONS[cmd]
                if isinstance(direction, tuple):
                    # Get next size if available
                    if i + 1 < len(commands) and any(unit in commands[i+1] for unit in ['cm', 'mm', 'm', 'inch']):
                        distance = self.parse_measurement(commands[i+1])
                        current_direction = [d * distance for d in direction]
                        i += 2
                    else:
                        current_direction = direction
                        i += 1
                else:
                    geometry['modifiers'].append(direction)
                    i += 1
            
            # Materials
            elif cmd in self.MATERIALS:
                geometry['material'] = self.MATERIALS[cmd]
                i += 1
            
            # Size with units
            elif any(unit in cmd for unit in ['cm', 'mm', 'm', 'inch', 'foot']):
                size = self.parse_measurement(cmd)
                geometry['size'] = [size, size, size]
                i += 1
            
            # Diameter (for cylinders/spheres)
            elif cmd == 'diameter' and i + 1 < len(commands):
                diameter = self.parse_measurement(commands[i+1])
                geometry['metadata']['diameter'] = diameter
                i += 2
            
            # Repeat count
            elif cmd == 'repeat' and i + 1 < len(commands):
                geometry['metadata']['repeat'] = int(commands[i+1])
                i += 2
            
            # Attachment points
            elif cmd == 'attach' and i + 1 < len(commands):
                geometry['metadata']['attach_to'] = commands[i+1]
                i += 2
            
            # Modifiers (smooth, rough, soft, etc.)
            else:
                geometry['modifiers'].append(cmd)
                i += 1
        
        # Apply direction to position
        if current_direction != [0, 0, 0]:
            geometry['position'] = current_direction
        
        return geometry
    
    def parse_multi_line_gene(self, gene_code: str) -> Dict[str, Any]:
        """Parse multi-line GENE code (full objects with layers)"""
        lines = [line.strip() for line in gene_code.split('\n') if line.strip() and not line.startswith('#')]
        
        if not lines:
            return None
        
        # Get object type from first line
        first_parts = lines[0].split('>')
        object_type = first_parts[0].strip().upper()
        
        # Check if anatomical
        is_anatomical = 'HUMAN_BODY' in object_type or any(
            layer in lines[0].lower() for layer in ['skeletal', 'muscular', 'organ', 'dermis']
        )
        
        parsed_object = {
            'type': object_type,
            'anatomical': is_anatomical,
            'layers': {},
            'metadata': {
                'total_layers': 0,
                'toggleable': is_anatomical,
                'precision': 'medical' if is_anatomical else 'standard'
            }
        }
        
        # Parse each line
        for line in lines:
            geometry = self.parse_gene_line(line)
            if geometry:
                layer = geometry['layer']
                
                if layer not in parsed_object['layers']:
                    parsed_object['layers'][layer] = []
                
                parsed_object['layers'][layer].append(geometry)
                parsed_object['metadata']['total_layers'] = len(parsed_object['layers'])
        
        return parsed_object
    
    # ========================================
    # GEOMETRY GENERATION
    # ========================================
    
    def generate_cube(self, size: List[float]) -> Dict:
        """Generate cube vertices and faces"""
        sx, sy, sz = size[0]/2, size[1]/2, size[2]/2
        
        vertices = [
            [-sx, -sy, -sz], [sx, -sy, -sz], [sx, sy, -sz], [-sx, sy, -sz],  # front
            [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz]       # back
        ]
        
        faces = [
            [0, 1, 2, 3],  # front
            [4, 5, 6, 7],  # back
            [0, 1, 5, 4],  # bottom
            [2, 3, 7, 6],  # top
            [0, 3, 7, 4],  # left
            [1, 2, 6, 5]   # right
        ]
        
        return {'vertices': vertices, 'faces': faces, 'type': 'cube'}
    
    def generate_sphere(self, radius: float, segments: int = 32) -> Dict:
        """Generate sphere vertices using UV sphere algorithm"""
        vertices = []
        faces = []
        
        for i in range(segments + 1):
            theta = i * math.pi / segments
            sin_theta = math.sin(theta)
            cos_theta = math.cos(theta)
            
            for j in range(segments + 1):
                phi = j * 2 * math.pi / segments
                sin_phi = math.sin(phi)
                cos_phi = math.cos(phi)
                
                x = radius * sin_theta * cos_phi
                y = radius * cos_theta
                z = radius * sin_theta * sin_phi
                
                vertices.append([x, y, z])
        
        # Generate faces (quads)
        for i in range(segments):
            for j in range(segments):
                v1 = i * (segments + 1) + j
                v2 = v1 + 1
                v3 = (i + 1) * (segments + 1) + j + 1
                v4 = v3 - 1
                
                faces.append([v1, v2, v3, v4])
        
        return {'vertices': vertices, 'faces': faces, 'type': 'sphere'}
    
    def generate_cylinder(self, height: float, radius: float, segments: int = 32) -> Dict:
        """Generate cylinder vertices"""
        vertices = []
        faces = []
        
        # Bottom cap center
        vertices.append([0, 0, 0])
        # Top cap center
        vertices.append([0, height, 0])
        
        # Bottom and top rings
        for i in range(segments):
            angle = i * 2 * math.pi / segments
            x = radius * math.cos(angle)
            z = radius * math.sin(angle)
            
            vertices.append([x, 0, z])      # bottom ring
            vertices.append([x, height, z]) # top ring
        
        # Bottom cap faces
        for i in range(segments):
            v1 = 0
            v2 = 2 + i * 2
            v3 = 2 + ((i + 1) % segments) * 2
            faces.append([v1, v2, v3])
        
        # Top cap faces
        for i in range(segments):
            v1 = 1
            v2 = 3 + i * 2
            v3 = 3 + ((i + 1) % segments) * 2
            faces.append([v1, v3, v2])
        
        # Side faces
        for i in range(segments):
            v1 = 2 + i * 2
            v2 = 3 + i * 2
            v3 = 3 + ((i + 1) % segments) * 2
            v4 = 2 + ((i + 1) % segments) * 2
            faces.append([v1, v2, v3, v4])
        
        return {'vertices': vertices, 'faces': faces, 'type': 'cylinder'}
    
    def generate_blob(self, size: float) -> Dict:
        """Generate organic blob using perturbed sphere"""
        import random
        sphere = self.generate_sphere(size / 2, segments=16)
        
        # Perturb vertices for organic look
        for vertex in sphere['vertices']:
            perturbation = [random.uniform(-0.2, 0.2) * size for _ in range(3)]
            vertex[0] += perturbation[0]
            vertex[1] += perturbation[1]
            vertex[2] += perturbation[2]
        
        sphere['type'] = 'blob'
        return sphere
    
    def generate_geometry(self, parsed_geometry: Dict) -> Dict:
        """Generate 3D geometry from parsed GENE data"""
        shape = parsed_geometry['shape']
        size = parsed_geometry['size']
        
        if shape == 'cube':
            return self.generate_cube(size)
        elif shape == 'sphere':
            return self.generate_sphere(size[0] / 2)
        elif shape == 'cylinder':
            height = size[1]
            radius = parsed_geometry['metadata'].get('diameter', size[0]) / 2
            return self.generate_cylinder(height, radius)
        elif shape == 'blob':
            return self.generate_blob(size[0])
        else:
            # Default to cube
            return self.generate_cube(size)
    
    # ========================================
    # EXPORT METHODS
    # ========================================
    
    def export_to_threejs(self, parsed_object: Dict) -> str:
        """Export to Three.js compatible JSON"""
        threejs_data = {
            'metadata': {
                'version': 4.5,
                'type': 'Object',
                'generator': 'GENE Parser',
                'object_type': parsed_object['type'],
                'anatomical': parsed_object['anatomical']
            },
            'geometries': [],
            'materials': [],
            'object': {
                'type': 'Group',
                'children': []
            }
        }
        
        material_index = 0
        
        for layer_name, geometries in parsed_object['layers'].items():
            layer_group = {
                'type': 'Group',
                'name': layer_name,
                'userData': {
                    'layer': layer_name,
                    'toggleable': parsed_object['anatomical']
                },
                'children': []
            }
            
            for geom in geometries:
                # Generate geometry
                geo_data = self.generate_geometry(geom)
                
                # Add to geometries array
                geometry_uuid = f"geo_{len(threejs_data['geometries'])}"
                threejs_data['geometries'].append({
                    'uuid': geometry_uuid,
                    'type': 'BufferGeometry',
                    'data': {
                        'attributes': {
                            'position': {
                                'itemSize': 3,
                                'type': 'Float32Array',
                                'array': [coord for vertex in geo_data['vertices'] for coord in vertex]
                            }
                        },
                        'index': {
                            'type': 'Uint16Array',
                            'array': [idx for face in geo_data['faces'] for idx in face]
                        }
                    }
                })
                
                # Add material
                material_uuid = f"mat_{material_index}"
                threejs_data['materials'].append({
                    'uuid': material_uuid,
                    'type': 'MeshStandardMaterial',
                    'color': geom['material'].get('color', '#808080'),
                    'roughness': geom['material'].get('roughness', 0.5),
                    'metalness': geom['material'].get('metalness', 0.0),
                    'transparent': geom['material'].get('transmission', 0) > 0,
                    'opacity': 1.0 - geom['material'].get('transmission', 0)
                })
                material_index += 1
                
                # Add mesh to layer group
                layer_group['children'].append({
                    'type': 'Mesh',
                    'geometry': geometry_uuid,
                    'material': material_uuid,
                    'position': geom['position'],
                    'rotation': geom['rotation'],
                    'scale': [1, 1, 1]
                })
            
            threejs_data['object']['children'].append(layer_group)
        
        return json.dumps(threejs_data, indent=2)
    
    def export_to_vls(self, parsed_object: Dict) -> str:
        """Convert GENE to compressed VLS format"""
        # This creates a hybrid: GENE readability with VLS compression
        vls_code = f"{parsed_object['type']}:"
        
        for layer_name, geometries in parsed_object['layers'].items():
            vls_code += f"/{layer_name}:"
            
            for geom in geometries:
                # Simple position encoding (can be enhanced)
                pos = geom['position']
                vls_code += f"A{int(pos[0]*10)}B{int(pos[1]*10)}C{int(pos[2]*10)}."
        
        return vls_code


def main():
    """Demo GENE parser with anatomical example"""
    parser = GENEParser()
    
    print("🧬 GENE Language Parser - Anatomical Demo")
    print("=" * 60)
    print()
    
    # Example: Simple skeletal arm
    gene_code = """
HUMAN_BODY > skeletal > humerus cylinder downward 35cm diameter 2cm bone smooth
HUMAN_BODY > skeletal > radius cylinder downward 25cm diameter 1.5cm bone smooth attach humerus
HUMAN_BODY > skeletal > ulna cylinder downward 25cm diameter 1.5cm bone smooth attach humerus
HUMAN_BODY > muscular > biceps blob forward 30cm upward 25cm flesh soft attach humerus
HUMAN_BODY > muscular > triceps blob backward 30cm upward 25cm flesh soft attach humerus
HUMAN_BODY > vascular > brachial_artery cylinder downward 30cm diameter 0.4cm blood flowing
HUMAN_BODY > dermis > skin_layer covering thickness 2mm skin smooth
HUMAN_BODY > epidermis > outer_skin covering thickness 0.5mm skin tone medium
    """
    
    print("Input GENE Code:")
    print("-" * 60)
    print(gene_code)
    print()
    
    # Parse
    parsed = parser.parse_multi_line_gene(gene_code)
    
    print("Parsed Structure:")
    print("-" * 60)
    print(f"Object Type: {parsed['type']}")
    print(f"Anatomical: {parsed['anatomical']}")
    print(f"Total Layers: {parsed['metadata']['total_layers']}")
    print(f"Precision: {parsed['metadata']['precision']}")
    print()
    
    print("Layers:")
    for layer_name, geometries in parsed['layers'].items():
        print(f"  • {layer_name}: {len(geometries)} objects")
    print()
    
    # Export to Three.js
    print("Exporting to Three.js format...")
    threejs_json = parser.export_to_threejs(parsed)
    
    with open('gene_output.json', 'w') as f:
        f.write(threejs_json)
    
    print("✅ Saved to: gene_output.json")
    print()
    
    # Export to VLS
    vls_compressed = parser.export_to_vls(parsed)
    print("VLS Compressed:")
    print("-" * 60)
    print(vls_compressed)
    print()
    
    print("📊 Statistics:")
    print(f"  GENE Code Length: {len(gene_code)} characters")
    print(f"  VLS Compressed: {len(vls_compressed)} characters")
    print(f"  Compression Ratio: {len(gene_code) / len(vls_compressed):.2f}x")
    print()
    
    print("🎯 Next Steps:")
    print("  1. Load gene_output.json in Three.js viewer")
    print("  2. Toggle layers (skeletal, muscular, vascular, dermis, epidermis)")
    print("  3. View anatomical precision with 8+ layer system")
    print()


if __name__ == "__main__":
    main()
