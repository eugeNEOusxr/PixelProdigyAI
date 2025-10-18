#version 300 es
precision highp float;

// Attributes
in vec3 aPosition;
in vec3 aNormal;
in vec3 aTangent;
in vec3 aBitangent;
in vec2 aTexCoord;
in vec3 aColor;

// Uniforms
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uCameraPosition;

// Outputs to fragment shader
out vec3 vPosition;
out vec3 vNormal;
out vec3 vTangent;
out vec3 vBitangent;
out vec2 vTexCoord;
out vec3 vColor;
out vec3 vViewDirection;
out mat3 vTBN;

void main() {
    // Transform position
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    
    // Pass world-space position
    vPosition = worldPosition.xyz;
    
    // Transform normal, tangent, bitangent to world space
    vNormal = normalize(uNormalMatrix * aNormal);
    vTangent = normalize(uNormalMatrix * aTangent);
    vBitangent = normalize(uNormalMatrix * aBitangent);
    
    // Create TBN matrix for tangent-space normal mapping
    vTBN = mat3(vTangent, vBitangent, vNormal);
    
    // Pass texture coordinates (support 4K: 0-1 range)
    vTexCoord = aTexCoord;
    
    // Pass vertex color
    vColor = aColor;
    
    // Calculate view direction
    vViewDirection = normalize(uCameraPosition - vPosition);
}
