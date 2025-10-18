// Outline Shader for Object Highlighting
// WebGL 2.0 GLSL Shaders

// ========== VERTEX SHADER ==========
const outlineVertexShader = `#version 300 es
precision highp float;

// Attributes
in vec3 aPosition;
in vec3 aNormal;

// Uniforms
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uOutlineWidth;
uniform float uTime;

// Varyings
out vec3 vNormal;
out vec3 vPosition;

void main() {
    // Calculate normal in world space
    vec3 worldNormal = normalize(mat3(uModelMatrix) * aNormal);
    
    // Expand vertices along normal for outline effect
    vec3 expandedPosition = aPosition + worldNormal * uOutlineWidth;
    
    // Add subtle pulse animation
    float pulse = sin(uTime * 3.0) * 0.1 + 1.0;
    expandedPosition += worldNormal * uOutlineWidth * pulse * 0.2;
    
    // Transform position
    vec4 worldPosition = uModelMatrix * vec4(expandedPosition, 1.0);
    vec4 viewPosition = uViewMatrix * worldPosition;
    gl_Position = uProjectionMatrix * viewPosition;
    
    // Pass to fragment shader
    vNormal = worldNormal;
    vPosition = worldPosition.xyz;
}
`;

// ========== FRAGMENT SHADER ==========
const outlineFragmentShader = `#version 300 es
precision highp float;

// Varyings
in vec3 vNormal;
in vec3 vPosition;

// Uniforms
uniform vec4 uOutlineColor;
uniform float uTime;
uniform vec3 uCameraPosition;

// Output
out vec4 fragColor;

void main() {
    // Calculate view direction
    vec3 viewDir = normalize(uCameraPosition - vPosition);
    
    // Fresnel effect - brighter on edges
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
    
    // Animated glow
    float glow = sin(uTime * 4.0) * 0.3 + 0.7;
    
    // Combine effects
    vec4 finalColor = uOutlineColor;
    finalColor.rgb *= glow;
    finalColor.a *= fresnel;
    
    // Add brightness boost
    finalColor.rgb += vec3(0.2) * fresnel;
    
    fragColor = finalColor;
}
`;

// ========== HIGHLIGHT SHADER (ALTERNATIVE) ==========
const highlightVertexShader = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vTexCoord;

void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    vec4 viewPosition = uViewMatrix * worldPosition;
    gl_Position = uProjectionMatrix * viewPosition;
    
    vNormal = normalize(mat3(uModelMatrix) * aNormal);
    vPosition = worldPosition.xyz;
    vTexCoord = aTexCoord;
}
`;

const highlightFragmentShader = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vTexCoord;

uniform vec4 uHighlightColor;
uniform float uTime;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;
uniform bool uUseTexture;

out vec4 fragColor;

void main() {
    // Base color from texture or white
    vec4 baseColor = uUseTexture ? texture(uTexture, vTexCoord) : vec4(1.0);
    
    // Rim lighting effect
    vec3 viewDir = normalize(uCameraPosition - vPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 3.0);
    
    // Pulse animation
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    
    // Combine base color with highlight
    vec4 highlightEffect = uHighlightColor * rim * pulse;
    
    // Mix base and highlight
    fragColor = mix(baseColor, uHighlightColor, 0.3) + highlightEffect;
    fragColor.a = baseColor.a;
}
`;

// ========== SHADER MANAGER CLASS ==========
class OutlineShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.outlineProgram = null;
        this.highlightProgram = null;
        this.uniformLocations = {};
        
        this.init();
    }
    
    init() {
        // Compile outline shader
        this.outlineProgram = this.createShaderProgram(
            outlineVertexShader,
            outlineFragmentShader
        );
        
        // Compile highlight shader
        this.highlightProgram = this.createShaderProgram(
            highlightVertexShader,
            highlightFragmentShader
        );
        
        // Get uniform locations
        this.cacheUniformLocations();
        
        console.log('✓ Outline shaders compiled');
    }
    
    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        // Create vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
            return null;
        }
        
        // Create fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
            return null;
        }
        
        // Create program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    cacheUniformLocations() {
        const gl = this.gl;
        
        // Outline program uniforms
        this.uniformLocations.outline = {
            uModelMatrix: gl.getUniformLocation(this.outlineProgram, 'uModelMatrix'),
            uViewMatrix: gl.getUniformLocation(this.outlineProgram, 'uViewMatrix'),
            uProjectionMatrix: gl.getUniformLocation(this.outlineProgram, 'uProjectionMatrix'),
            uOutlineWidth: gl.getUniformLocation(this.outlineProgram, 'uOutlineWidth'),
            uOutlineColor: gl.getUniformLocation(this.outlineProgram, 'uOutlineColor'),
            uTime: gl.getUniformLocation(this.outlineProgram, 'uTime'),
            uCameraPosition: gl.getUniformLocation(this.outlineProgram, 'uCameraPosition')
        };
        
        // Highlight program uniforms
        this.uniformLocations.highlight = {
            uModelMatrix: gl.getUniformLocation(this.highlightProgram, 'uModelMatrix'),
            uViewMatrix: gl.getUniformLocation(this.highlightProgram, 'uViewMatrix'),
            uProjectionMatrix: gl.getUniformLocation(this.highlightProgram, 'uProjectionMatrix'),
            uHighlightColor: gl.getUniformLocation(this.highlightProgram, 'uHighlightColor'),
            uTime: gl.getUniformLocation(this.highlightProgram, 'uTime'),
            uCameraPosition: gl.getUniformLocation(this.highlightProgram, 'uCameraPosition'),
            uTexture: gl.getUniformLocation(this.highlightProgram, 'uTexture'),
            uUseTexture: gl.getUniformLocation(this.highlightProgram, 'uUseTexture')
        };
    }
    
    renderOutline(mesh, matrices, color, time) {
        const gl = this.gl;
        const program = this.outlineProgram;
        const uniforms = this.uniformLocations.outline;
        
        gl.useProgram(program);
        
        // Set uniforms
        gl.uniformMatrix4fv(uniforms.uModelMatrix, false, matrices.model);
        gl.uniformMatrix4fv(uniforms.uViewMatrix, false, matrices.view);
        gl.uniformMatrix4fv(uniforms.uProjectionMatrix, false, matrices.projection);
        gl.uniform1f(uniforms.uOutlineWidth, 0.05);
        gl.uniform4f(uniforms.uOutlineColor, color.r, color.g, color.b, color.a);
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform3fv(uniforms.uCameraPosition, matrices.cameraPosition);
        
        // Disable depth test for outline
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Render mesh
        mesh.bind();
        mesh.draw();
        mesh.unbind();
        
        // Re-enable depth test
        gl.enable(gl.DEPTH_TEST);
    }
    
    renderHighlight(mesh, matrices, color, time, texture = null) {
        const gl = this.gl;
        const program = this.highlightProgram;
        const uniforms = this.uniformLocations.highlight;
        
        gl.useProgram(program);
        
        // Set uniforms
        gl.uniformMatrix4fv(uniforms.uModelMatrix, false, matrices.model);
        gl.uniformMatrix4fv(uniforms.uViewMatrix, false, matrices.view);
        gl.uniformMatrix4fv(uniforms.uProjectionMatrix, false, matrices.projection);
        gl.uniform4f(uniforms.uHighlightColor, color.r, color.g, color.b, color.a);
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform3fv(uniforms.uCameraPosition, matrices.cameraPosition);
        
        // Texture
        if (texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniforms.uTexture, 0);
            gl.uniform1i(uniforms.uUseTexture, 1);
        } else {
            gl.uniform1i(uniforms.uUseTexture, 0);
        }
        
        // Render with blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        mesh.bind();
        mesh.draw();
        mesh.unbind();
    }
}

// ========== OBJECT HIGHLIGHTER ==========
class ObjectHighlighter {
    constructor(gl) {
        this.gl = gl;
        this.shaderManager = new OutlineShaderManager(gl);
        this.highlightedObjects = new Map();
        this.defaultColor = { r: 1.0, g: 0.8, b: 0.2, a: 1.0 }; // Gold
        this.startTime = performance.now();
    }
    
    highlightObject(objectId, mesh, matrices, color = null) {
        const highlightColor = color || this.defaultColor;
        
        this.highlightedObjects.set(objectId, {
            mesh: mesh,
            matrices: matrices,
            color: highlightColor
        });
    }
    
    removeHighlight(objectId) {
        this.highlightedObjects.delete(objectId);
    }
    
    clearAll() {
        this.highlightedObjects.clear();
    }
    
    render(cameraMatrices) {
        if (this.highlightedObjects.size === 0) return;
        
        const time = (performance.now() - this.startTime) / 1000.0;
        
        // First pass: render outlines
        for (const [objectId, data] of this.highlightedObjects) {
            const matrices = {
                model: data.matrices.model,
                view: cameraMatrices.view,
                projection: cameraMatrices.projection,
                cameraPosition: cameraMatrices.cameraPosition
            };
            
            this.shaderManager.renderOutline(
                data.mesh,
                matrices,
                data.color,
                time
            );
        }
        
        // Second pass: render highlight overlay
        for (const [objectId, data] of this.highlightedObjects) {
            const matrices = {
                model: data.matrices.model,
                view: cameraMatrices.view,
                projection: cameraMatrices.projection,
                cameraPosition: cameraMatrices.cameraPosition
            };
            
            this.shaderManager.renderHighlight(
                data.mesh,
                matrices,
                data.color,
                time
            );
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OutlineShaderManager,
        ObjectHighlighter,
        outlineVertexShader,
        outlineFragmentShader,
        highlightVertexShader,
        highlightFragmentShader
    };
}

console.log('✓ Outline shaders loaded');
