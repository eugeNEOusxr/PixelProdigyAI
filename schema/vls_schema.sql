-- PixelProdigy VLS Database Schema
-- Vertex Language System storage and processing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Personalities reference table
CREATE TABLE ai_personalities (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    focus VARCHAR(255),
    style_traits JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- VLS Objects (converted from existing 47K objects)
CREATE TABLE vls_objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    type VARCHAR(100),
    sub_type VARCHAR(100),
    
    -- VLS Encoding
    vls_code TEXT NOT NULL,
    vls_compressed TEXT NOT NULL,
    compression_ratio FLOAT,
    vertex_count INT,
    
    -- AI Attribution
    created_by_personality_id INT REFERENCES ai_personalities(id),
    morphed_by_personality_ids INT[],
    
    -- Metadata
    metadata JSONB,
    visual_properties JSONB,
    physical_properties JSONB,
    
    -- Pricing
    price_mpt INT,
    price_usd DECIMAL(10,2),
    rarity VARCHAR(50),
    
    -- Performance
    render_time_ms INT,
    load_time_ms INT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- VLS Templates (reusable patterns)
CREATE TABLE vls_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Base VLS pattern
    base_vls TEXT NOT NULL,
    parameters JSONB, -- Variable parameters for customization
    
    -- Personality attribution
    created_by_personality_id INT REFERENCES ai_personalities(id),
    
    -- Usage stats
    use_count INT DEFAULT 0,
    avg_compression_ratio FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- VLS Dialects (personality-specific syntax)
CREATE TABLE vls_dialects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personality_id INT REFERENCES ai_personalities(id) UNIQUE,
    dialect_name VARCHAR(100) NOT NULL,
    
    -- Style modifiers
    style_modifiers JSONB NOT NULL,
    -- Example: {"smoothing": 3, "symmetry": true, "organic_curves": true}
    
    -- Syntax rules
    syntax_rules JSONB NOT NULL,
    -- Example: {"curve_operator": "~", "smooth_suffix": "a-z"}
    
    -- Example transforms
    example_transforms JSONB,
    -- Example: {"input": "A5B5C2", "output": "Aa5Bb5Cc2~"}
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- VLS Compression Cache
CREATE TABLE vls_compression_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_vls TEXT NOT NULL,
    compressed_vls TEXT NOT NULL,
    compression_ratio FLOAT NOT NULL,
    algorithm VARCHAR(50),
    
    -- Performance metrics
    compression_time_ms INT,
    decompression_time_ms INT,
    
    -- Usage tracking
    access_count INT DEFAULT 0,
    last_accessed TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- VLS Generation Log (AI collaboration tracking)
CREATE TABLE vls_generation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id VARCHAR(100) REFERENCES vls_objects(object_id),
    
    -- Multi-AI workflow
    primary_personality_id INT REFERENCES ai_personalities(id),
    collaborating_personality_ids INT[],
    
    -- Partitioning record
    workload_partition JSONB,
    -- Example: {"walls": 25, "floor": 29, "furniture": 30}
    
    -- Processing metrics
    generation_time_ms INT,
    total_personalities INT,
    parallel_processing BOOLEAN DEFAULT false,
    
    -- VLS evolution
    initial_vls TEXT,
    final_vls TEXT,
    morph_iterations INT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- VLS Mesh Cache (rendered Three.js geometries)
CREATE TABLE vls_mesh_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id VARCHAR(100) REFERENCES vls_objects(object_id),
    vls_hash VARCHAR(64) UNIQUE, -- SHA256 of VLS code
    
    -- Cached geometry data
    vertices_json JSONB, -- Store as JSON for quick access
    faces_json JSONB,
    normals_json JSONB,
    
    -- Material properties
    materials_json JSONB,
    
    -- Performance
    render_time_ms INT,
    vertex_count INT,
    face_count INT,
    
    -- Cache management
    access_count INT DEFAULT 0,
    last_accessed TIMESTAMP,
    cache_size_bytes INT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- User VLS Customizations
CREATE TABLE user_vls_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Reference to users table (to be created)
    object_id VARCHAR(100) REFERENCES vls_objects(object_id),
    
    -- Custom VLS modifications
    original_vls TEXT NOT NULL,
    customized_vls TEXT NOT NULL,
    
    -- Personality preference
    preferred_personality_id INT REFERENCES ai_personalities(id),
    
    -- User notes
    customization_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vls_objects_category ON vls_objects(category);
CREATE INDEX idx_vls_objects_personality ON vls_objects(created_by_personality_id);
CREATE INDEX idx_vls_objects_rarity ON vls_objects(rarity);
CREATE INDEX idx_vls_objects_price ON vls_objects(price_mpt);
CREATE INDEX idx_vls_templates_category ON vls_templates(category);
CREATE INDEX idx_vls_templates_personality ON vls_templates(created_by_personality_id);
CREATE INDEX idx_vls_mesh_cache_hash ON vls_mesh_cache(vls_hash);
CREATE INDEX idx_vls_generation_log_primary_personality ON vls_generation_log(primary_personality_id);

-- Full-text search on object names
CREATE INDEX idx_vls_objects_name_fts ON vls_objects USING gin(to_tsvector('english', name));

-- Materialized view for compression statistics
CREATE MATERIALIZED VIEW vls_compression_stats AS
SELECT 
    category,
    created_by_personality_id,
    COUNT(*) as object_count,
    AVG(compression_ratio) as avg_compression,
    MIN(compression_ratio) as min_compression,
    MAX(compression_ratio) as max_compression,
    AVG(vertex_count) as avg_vertices,
    AVG(render_time_ms) as avg_render_time
FROM vls_objects
GROUP BY category, created_by_personality_id;

-- Function to update compression ratio
CREATE OR REPLACE FUNCTION calculate_compression_ratio()
RETURNS TRIGGER AS $$
BEGIN
    NEW.compression_ratio := LENGTH(NEW.vls_compressed)::FLOAT / LENGTH(NEW.vls_code)::FLOAT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate compression ratio
CREATE TRIGGER trg_calculate_compression_ratio
BEFORE INSERT OR UPDATE ON vls_objects
FOR EACH ROW
EXECUTE FUNCTION calculate_compression_ratio();

-- Function to log VLS generation
CREATE OR REPLACE FUNCTION log_vls_generation(
    p_object_id VARCHAR(100),
    p_primary_personality_id INT,
    p_collaborating_ids INT[],
    p_workload_partition JSONB,
    p_generation_time_ms INT,
    p_initial_vls TEXT,
    p_final_vls TEXT
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO vls_generation_log (
        object_id,
        primary_personality_id,
        collaborating_personality_ids,
        workload_partition,
        generation_time_ms,
        total_personalities,
        parallel_processing,
        initial_vls,
        final_vls,
        morph_iterations
    ) VALUES (
        p_object_id,
        p_primary_personality_id,
        p_collaborating_ids,
        p_workload_partition,
        p_generation_time_ms,
        COALESCE(array_length(p_collaborating_ids, 1), 0) + 1,
        COALESCE(array_length(p_collaborating_ids, 1), 0) > 0,
        p_initial_vls,
        p_final_vls,
        1
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Sample AI Personalities insert
INSERT INTO ai_personalities (id, name, category, focus, style_traits) VALUES
(30, 'Interior Designer', 'Creative & Artistic', 'Luxury Interiors', '{"smoothing": 3, "symmetry": true, "organic_curves": true}'::jsonb),
(33, 'Industrial Designer', 'Architecture & Spatial', 'Precision Products', '{"sharp_edges": true, "angular": true, "metal_focus": true}'::jsonb),
(14, 'Organic Naturalist', 'Creative & Artistic', 'Biophilic Retreats', '{"asymmetry": true, "organic_noise": true, "natural_materials": true}'::jsonb),
(20, 'Concept Vehicle Designer', 'Creative & Artistic', 'Futuristic Mobility', '{"aerodynamic": true, "sleek_lines": true, "performance": true}'::jsonb),
(37, 'Entertainment Venue Architect', 'Architecture & Spatial', 'Immersive Experiences', '{"dramatic": true, "atmospheric": true, "lighting_focus": true}'::jsonb);

-- Sample VLS Dialect insert
INSERT INTO vls_dialects (personality_id, dialect_name, style_modifiers, syntax_rules, example_transforms) VALUES
(30, 'Organic Luxury', 
    '{"smoothing": 3, "curve_emphasis": true, "warm_colors": true}'::jsonb,
    '{"curve_operator": "~", "smooth_suffix": "a-z", "symmetry_axis": "@"}'::jsonb,
    '{"basic_chair": {"input": "A5B5C2", "output": "Aa5Bb5Cc2~"}, "sofa": {"input": "A8B4C6", "output": "A8a~B4b~C6c~"}}'::jsonb
);

-- Views for common queries
CREATE VIEW vls_objects_with_personalities AS
SELECT 
    o.*,
    p.name as personality_name,
    p.category as personality_category,
    p.focus as personality_focus
FROM vls_objects o
LEFT JOIN ai_personalities p ON o.created_by_personality_id = p.id;

-- Refresh compression stats view
CREATE OR REPLACE FUNCTION refresh_compression_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vls_compression_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE vls_objects IS 'Core VLS object storage - all 47K objects encoded in Vertex Language System';
COMMENT ON TABLE vls_templates IS 'Reusable VLS patterns for rapid object generation';
COMMENT ON TABLE vls_dialects IS 'Personality-specific VLS syntax variations';
COMMENT ON TABLE vls_generation_log IS 'Tracks multi-AI collaborative object generation';
COMMENT ON TABLE vls_mesh_cache IS 'Pre-rendered Three.js geometries for instant loading';
