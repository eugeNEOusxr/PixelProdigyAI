#!/bin/bash

# Train Ollama with mathematical principles for 3D vertex generation
# Usage: ./train_ollama.sh

echo "🦙 Training Ollama Llama 3.1 for 3D Geometry..."
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama not running. Start it with: ollama serve"
    exit 1
fi

# Check if llama3.1:8b is installed
if ! ollama list | grep -q "llama3.1:8b"; then
    echo "📦 Downloading llama3.1:8b (this takes ~5-10 min)..."
    ollama pull llama3.1:8b
fi

echo "✅ Ollama ready!"
echo ""

# The core training prompt
TRAINING_PROMPT="You are now a 3D geometry expert. You will generate Three.js code for procedural 3D objects.

CORE PRINCIPLES:
1. Golden Ratio (φ = 1.618) - Use for proportions
2. Fibonacci (0,1,1,2,3,5,8,13...) - Use for sequences
3. Golden Angle (2.399963 rad) - Use for spirals
4. Platonic Solids - Use for base shapes
5. Fractals - Use for organic complexity
6. Perlin Noise - Use for terrain
7. Parametric Equations - Use for curves

ALWAYS:
- Return executable JavaScript for Three.js
- Use BufferGeometry (not Geometry - deprecated)
- Include position, normal, UV attributes
- Optimize vertex count
- Add mathematical comments
- Follow sacred geometry principles

NEVER:
- Use random() without purpose
- Ignore performance
- Return explanations (code only)
- Forget to compute normals

Example output format:
\`\`\`javascript
function createFibonacciSphere(count = 1000, radius = 10) {
    const positions = new Float32Array(count * 3);
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = 2 * Math.PI * i / PHI;
        
        positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
        positions[i * 3 + 1] = y * radius;
        positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}
\`\`\`

You are ready to generate 3D worlds. Respond \"READY\" if you understand."

echo "📖 Feeding training prompt to Ollama..."
echo ""

# Send training to Ollama
RESPONSE=$(curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"llama3.1:8b\",
  \"prompt\": $(echo "$TRAINING_PROMPT" | jq -Rs .),
  \"stream\": false,
  \"options\": {
    \"temperature\": 0.1
  }
}" | jq -r '.response')

echo "🤖 Llama 3.1 Response:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -qi "ready"; then
    echo "✅ Training successful! Ollama is ready for 3D geometry generation."
    echo ""
    echo "🧪 Test it with:"
    echo "  ollama run llama3.1:8b 'Generate a Fibonacci sphere with 500 points. Return Three.js code only.'"
else
    echo "⚠️  Training sent, but uncertain response. Try running test prompts manually."
fi

echo ""
echo "🌟 Next: Run test_ollama_api.html to verify geometry generation"
