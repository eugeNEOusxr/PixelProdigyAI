#version 300 es
precision highp float;

// Material properties
#define PI 3.14159265359

// Inputs from vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vBitangent;
in vec2 vTexCoord;
in vec3 vColor;
in vec3 vViewDirection;
in mat3 vTBN;

// PBR Texture maps (4K support: 4096×4096)
uniform sampler2D uAlbedoMap;        // Base color (BC7)
uniform sampler2D uNormalMap;        // Normal map (BC5)
uniform sampler2D uMetallicMap;      // Metallic (BC4)
uniform sampler2D uRoughnessMap;     // Roughness (BC4)
uniform sampler2D uAOMap;            // Ambient Occlusion (BC4)
uniform sampler2D uHeightMap;        // Displacement/Height (BC4)
uniform sampler2D uEmissiveMap;      // Emissive (BC7)

// Environment maps for IBL
uniform samplerCube uIrradianceMap;  // Diffuse IBL
uniform samplerCube uPrefilterMap;   // Specular IBL
uniform sampler2D uBRDFLUT;          // BRDF lookup table

// Material parameters
uniform vec3 uAlbedo;
uniform float uMetallic;
uniform float uRoughness;
uniform float uAO;
uniform vec3 uEmissive;
uniform float uEmissiveStrength;

// Subsurface scattering
uniform bool uEnableSSS;
uniform vec3 uSSSColor;
uniform float uSSSStrength;
uniform float uSSSThickness;

// Lighting
uniform vec3 uLightPositions[4];
uniform vec3 uLightColors[4];
uniform vec3 uAmbientLight;

// Parallax occlusion mapping
uniform bool uEnableParallax;
uniform float uHeightScale;
uniform int uParallaxLayers;

// Anisotropic filtering (handled by texture setup)
uniform float uAnisotropy; // 16x

// Output
out vec4 fragColor;

// ==========================================
// PBR FUNCTIONS
// ==========================================

// Normal Distribution Function (GGX/Trowbridge-Reitz)
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float nom = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    
    return nom / denom;
}

// Geometry Function (Smith's Schlick-GGX)
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

// Fresnel (Schlick approximation)
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// ==========================================
// PARALLAX OCCLUSION MAPPING
// ==========================================

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir) {
    if (!uEnableParallax) return texCoords;
    
    // Number of depth layers
    float numLayers = float(uParallaxLayers);
    float layerDepth = 1.0 / numLayers;
    float currentLayerDepth = 0.0;
    
    // Amount to shift texture coordinates per layer
    vec2 P = viewDir.xy * uHeightScale;
    vec2 deltaTexCoords = P / numLayers;
    
    vec2 currentTexCoords = texCoords;
    float currentDepthMapValue = texture(uHeightMap, currentTexCoords).r;
    
    // Parallax occlusion mapping
    while(currentLayerDepth < currentDepthMapValue) {
        currentTexCoords -= deltaTexCoords;
        currentDepthMapValue = texture(uHeightMap, currentTexCoords).r;
        currentLayerDepth += layerDepth;
    }
    
    // Parallax occlusion with offset limiting
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;
    
    float afterDepth = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(uHeightMap, prevTexCoords).r - currentLayerDepth + layerDepth;
    
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);
    
    return finalTexCoords;
}

// ==========================================
// SUBSURFACE SCATTERING (APPROXIMATION)
// ==========================================

vec3 SubsurfaceScattering(vec3 L, vec3 V, vec3 N, vec3 albedo) {
    if (!uEnableSSS) return vec3(0.0);
    
    // Translucency approximation
    vec3 H = normalize(L + N * 0.5); // Distortion
    float VdotH = pow(clamp(dot(V, -H), 0.0, 1.0), uSSSThickness);
    
    vec3 sss = uSSSColor * albedo * VdotH * uSSSStrength;
    return sss;
}

// ==========================================
// MAIN SHADER
// ==========================================

void main() {
    // Transform view direction to tangent space for parallax
    vec3 viewDirTangent = normalize(transpose(vTBN) * vViewDirection);
    
    // Apply parallax occlusion mapping
    vec2 texCoords = ParallaxMapping(vTexCoord, viewDirTangent);
    
    // Discard pixels outside texture bounds
    if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
        discard;
    
    // Sample 4K textures with anisotropic filtering
    vec3 albedo = texture(uAlbedoMap, texCoords).rgb * uAlbedo * vColor;
    float metallic = texture(uMetallicMap, texCoords).r * uMetallic;
    float roughness = texture(uRoughnessMap, texCoords).r * uRoughness;
    float ao = texture(uAOMap, texCoords).r * uAO;
    vec3 emissive = texture(uEmissiveMap, texCoords).rgb * uEmissive * uEmissiveStrength;
    
    // Sample normal map and transform to world space
    vec3 normalMap = texture(uNormalMap, texCoords).rgb;
    normalMap = normalMap * 2.0 - 1.0; // Transform from [0,1] to [-1,1]
    vec3 N = normalize(vTBN * normalMap);
    
    vec3 V = normalize(vViewDirection);
    
    // Calculate F0 (surface reflection at zero incidence)
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    
    // Reflectance equation
    vec3 Lo = vec3(0.0);
    
    // Direct lighting from point lights
    for(int i = 0; i < 4; i++) {
        vec3 L = normalize(uLightPositions[i] - vPosition);
        vec3 H = normalize(V + L);
        float distance = length(uLightPositions[i] - vPosition);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = uLightColors[i] * attenuation;
        
        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
        
        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        vec3 specular = numerator / denominator;
        
        // Energy conservation
        vec3 kS = F;
        vec3 kD = vec3(1.0) - kS;
        kD *= 1.0 - metallic;
        
        float NdotL = max(dot(N, L), 0.0);
        
        // Add subsurface scattering
        vec3 sss = SubsurfaceScattering(L, V, N, albedo);
        
        Lo += (kD * albedo / PI + specular + sss) * radiance * NdotL;
    }
    
    // Image-Based Lighting (IBL)
    vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);
    vec3 kS = F;
    vec3 kD = 1.0 - kS;
    kD *= 1.0 - metallic;
    
    vec3 irradiance = texture(uIrradianceMap, N).rgb;
    vec3 diffuse = irradiance * albedo;
    
    vec3 R = reflect(-V, N);
    vec3 prefilteredColor = textureLod(uPrefilterMap, R, roughness * 10.0).rgb;
    vec2 brdf = texture(uBRDFLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;
    vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);
    
    vec3 ambient = (kD * diffuse + specular) * ao;
    
    // Combine lighting
    vec3 color = ambient + Lo + emissive;
    
    // HDR tonemapping (Reinhard)
    color = color / (color + vec3(1.0));
    
    // Gamma correction
    color = pow(color, vec3(1.0/2.2));
    
    fragColor = vec4(color, 1.0);
}
