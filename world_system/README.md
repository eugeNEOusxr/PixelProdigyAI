# World System Files

## Large Generated Files (Not in Git)

The following large JSON files are generated and not tracked in Git to keep the repository mobile-friendly:

- `object_metadata.json` (79MB) - Object metadata database
- `world_object_placements.json` (31MB) - World object placement data
- `world_spatial_index.json` (36MB) - Spatial indexing for world objects

## Regenerating Files

If you need these files for development:

### Generate Object Metadata
```bash
cd world_system
./object_metadata_generator
```

### Generate World Placements
```bash
cd world_system
node world_object_placer.js
```

### Generate Loot Tables
```bash
cd world_system
node loot_table_generator.js
```

## Application Behavior

The application is designed to work gracefully without these files:
- **inventory_ui.js** - Has error handling and uses test items if metadata is unavailable
- **Main game** - Does not require these files for basic functionality
- Generated files are primarily for extended gameplay features

## Note

These files are in `.gitignore` to optimize repository size for mobile devices and faster cloning.
