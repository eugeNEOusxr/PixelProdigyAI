#!/bin/bash
# Train Ollama with mathematical principles and test geometry generation

echo "🦙 Training Llama 3.1 with Mathematical Principles"
echo "===================================================="
echo ""

# Test 1: Fibonacci Sphere
echo "📐 Test 1: Generate Fibonacci Sphere Code"
echo "-------------------------------------------"
curl -s http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "You are a mathematical genius specializing in 3D geometry and Three.js. Generate JavaScript code to create a Fibonacci sphere with 500 points using THREE.BufferGeometry. Use the golden angle (2.399963 radians) for optimal point distribution. Return ONLY executable JavaScript code, no explanations.",
  "stream": false,
  "options": {
    "temperature": 0.2
  }
}' | python3 -c "import sys, json; print(json.load(sys.stdin)['response'])" > fibonacci_sphere.js

echo "✅ Generated fibonacci_sphere.js"
echo ""

# Test 2: Golden Ratio Building
echo "🏛️  Test 2: Generate Golden Ratio Building"
echo "-------------------------------------------"
curl -s http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "You are an architect AI. Design a medieval building using golden ratio proportions (φ = 1.618). Return JSON with this structure: {\"width\": number, \"height\": number, \"depth\": number, \"floors\": number}. The building should be 10 units wide. Calculate height and depth using golden ratio. Return ONLY valid JSON.",
  "stream": false,
  "options": {
    "temperature": 0.3
  }
}' | python3 -c "import sys, json; print(json.load(sys.stdin)['response'])" > building_spec.json

echo "✅ Generated building_spec.json"
echo ""

# Test 3: Village Layout
echo "🏘️  Test 3: Generate Village Layout"
echo "-----------------------------------"
curl -s http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "You are a world architect. Design a forest village with 10 buildings using golden ratio spacing (1.618). Return JSON with this exact structure: {\"village\": \"name\", \"biome\": \"forest\", \"buildings\": [{\"type\": \"town_hall\", \"position\": [x, z], \"scale\": [w, h, d]}]}. Distribute buildings in a circular pattern. Return ONLY valid JSON, no markdown.",
  "stream": false,
  "options": {
    "temperature": 0.5
  }
}' | python3 -c "import sys, json; print(json.load(sys.stdin)['response'])" > village_layout.json

echo "✅ Generated village_layout.json"
echo ""

# Test 4: Quest Generation
echo "📖 Test 4: Generate Fantasy Quest"
echo "----------------------------------"
curl -s http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "You are a fantasy storyteller. Create a quest for a forest village. Return JSON with: {\"name\": \"quest name\", \"objective\": \"what to do\", \"npcs\": [\"npc1\", \"npc2\"], \"reward\": \"reward description\"}. Make it creative and engaging. Return ONLY valid JSON.",
  "stream": false,
  "options": {
    "temperature": 0.8
  }
}' | python3 -c "import sys, json; print(json.load(sys.stdin)['response'])" > quest.json

echo "✅ Generated quest.json"
echo ""

# Show results
echo "📊 Results Summary"
echo "=================="
echo ""
echo "Fibonacci Sphere Code:"
head -20 fibonacci_sphere.js
echo "..."
echo ""
echo "Building Spec:"
cat building_spec.json | python3 -m json.tool 2>/dev/null || cat building_spec.json
echo ""
echo "Village Layout:"
cat village_layout.json | python3 -m json.tool 2>/dev/null || cat village_layout.json
echo ""
echo "Quest:"
cat quest.json | python3 -m json.tool 2>/dev/null || cat quest.json
echo ""
echo "✅ All tests complete! Files saved to current directory."
