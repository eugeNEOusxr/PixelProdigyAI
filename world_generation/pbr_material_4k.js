
// ==========================================
// 4K SHADER INTEGRATION FOR RENDERING ENGINE
// Add this to rendering_engine.js
// ==========================================

class PBRMaterial4K {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.program = shaderProgram;
        
        // Texture units
        this.textureUnits = {
            albedo: 0,
            normal: 1,
            metallic: 2,
            roughness: 3,
            ao: 4,
            height: 5,
            emissive: 6,
            irradiance: 7,
            prefilter: 8,
            brdfLUT: 9
        };
        
        // Material parameters
        this.params = {
            albedo: [1.0, 1.0, 1.0],
            metallic: 0.0,
            roughness: 0.5,
            ao: 1.0,
            emissive: [0.0, 0.0, 0.0],
            emissiveStrength: 0.0,
            enableSSS: false,
            sssColor: [1.0, 0.5, 0.3],
            sssStrength: 0.5,
            sssThickness: 2.0,
            enableParallax: false,
            heightScale: 0.05,
            parallaxLayers: 32,
            anisotropy: 16.0
        };
        
        this.textures = {};
    }
    
    loadTexture4K(name, url) {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Temporary 1x1 pixel
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                      new Uint8Array([255, 255, 255, 255]));
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // Generate mipmaps
            gl.generateMipmap(gl.TEXTURE_2D);
            
            // 4K texture settings
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            
            // Anisotropic filtering (16x)
            const ext = gl.getExtension('EXT_texture_filter_anisotropic');
            if (ext) {
                const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, max));
            }
        };
        
        image.src = url;
        this.textures[name] = texture;
        
        return texture;
    }
    
    bind() {
        const gl = this.gl;
        gl.useProgram(this.program);
        
        // Bind textures
        Object.keys(this.textures).forEach(name => {
            const unit = this.textureUnits[name];
            if (unit !== undefined) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, this.textures[name]);
            }
        });
        
        // Set uniforms
        this.setUniforms();
    }
    
    setUniforms() {
        const gl = this.gl;
        const program = this.program;
        
        // Material parameters
        gl.uniform3fv(gl.getUniformLocation(program, 'uAlbedo'), this.params.albedo);
        gl.uniform1f(gl.getUniformLocation(program, 'uMetallic'), this.params.metallic);
        gl.uniform1f(gl.getUniformLocation(program, 'uRoughness'), this.params.roughness);
        gl.uniform1f(gl.getUniformLocation(program, 'uAO'), this.params.ao);
        gl.uniform3fv(gl.getUniformLocation(program, 'uEmissive'), this.params.emissive);
        gl.uniform1f(gl.getUniformLocation(program, 'uEmissiveStrength'), this.params.emissiveStrength);
        
        // SSS parameters
        gl.uniform1i(gl.getUniformLocation(program, 'uEnableSSS'), this.params.enableSSS);
        gl.uniform3fv(gl.getUniformLocation(program, 'uSSSColor'), this.params.sssColor);
        gl.uniform1f(gl.getUniformLocation(program, 'uSSSStrength'), this.params.sssStrength);
        gl.uniform1f(gl.getUniformLocation(program, 'uSSSThickness'), this.params.sssThickness);
        
        // Parallax parameters
        gl.uniform1i(gl.getUniformLocation(program, 'uEnableParallax'), this.params.enableParallax);
        gl.uniform1f(gl.getUniformLocation(program, 'uHeightScale'), this.params.heightScale);
        gl.uniform1i(gl.getUniformLocation(program, 'uParallaxLayers'), this.params.parallaxLayers);
        
        // Texture samplers
        gl.uniform1i(gl.getUniformLocation(program, 'uAlbedoMap'), this.textureUnits.albedo);
        gl.uniform1i(gl.getUniformLocation(program, 'uNormalMap'), this.textureUnits.normal);
        gl.uniform1i(gl.getUniformLocation(program, 'uMetallicMap'), this.textureUnits.metallic);
        gl.uniform1i(gl.getUniformLocation(program, 'uRoughnessMap'), this.textureUnits.roughness);
        gl.uniform1i(gl.getUniformLocation(program, 'uAOMap'), this.textureUnits.ao);
        gl.uniform1i(gl.getUniformLocation(program, 'uHeightMap'), this.textureUnits.height);
        gl.uniform1i(gl.getUniformLocation(program, 'uEmissiveMap'), this.textureUnits.emissive);
    }
}

// Usage example:
// const material = new PBRMaterial4K(gl, pbrShaderProgram);
// material.loadTexture4K('albedo', 'textures/wood_albedo_4k.png');
// material.loadTexture4K('normal', 'textures/wood_normal_4k.png');
// material.params.roughness = 0.8;
// material.bind();
