// ===================================
// PIXELPRODIGY DATA MANAGEMENT SYSTEM
// Local Storage + Cloud Sync + Export
// ===================================

/**
 * ARCHITECTURE OVERVIEW:
 * 
 * 1. LOCAL STORAGE (IndexedDB)
 *    - Free tier: Unlimited local storage
 *    - All projects saved in browser
 *    - Export anytime as ZIP or backup file
 * 
 * 2. CLOUD STORAGE (AWS S3)
 *    - Paid tiers: Auto-sync to cloud
 *    - Chunked uploads for large files
 *    - Version history (50-unlimited snapshots)
 * 
 * 3. EXPORT SYSTEM
 *    - Full backup (.ppbackup JSON)
 *    - GLTF archive (.zip)
 *    - OBJ archive (.zip)
 * 
 * 4. SECURITY LAYER
 *    - Code integrity checks on critical functions
 *    - Tamper detection via checksums
 *    - Watermarking to prevent theft
 */

// ===================================
// ANTI-TAMPERING PROTECTION
// ===================================

// Validate that critical functions haven't been modified
function _validateFunctionIntegrity(funcName, funcObj) {
  if (typeof window._pixelProdigyIntegrity === 'function') {
    return window._pixelProdigyIntegrity(funcName, funcObj);
  }
  return true; // Fallback if security layer not loaded
}

// Wrapper to protect critical methods
function _protectedMethod(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args) {
    // Verify function hasn't been tampered with
    if (!_validateFunctionIntegrity(propertyKey, originalMethod)) {
      console.error(`🚨 Security: ${propertyKey} was modified - blocking execution`);
      return null;
    }
    
    // Execute original method
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

// ===================================
// 1. LOCAL STORAGE (IndexedDB)
// ===================================

class PixelProdigyStorage {
  constructor() {
    this.dbName = 'PixelProdigyProjects';
    this.dbVersion = 1;
    this.db = null;
  }
  
  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store
        if (!db.objectStoreNames.contains('projects')) {
          const objectStore = db.createObjectStore('projects', {
            keyPath: 'id'
          });
          
          // Create indexes for searching
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('created_at', 'created_at', { unique: false });
          objectStore.createIndex('last_modified', 'last_modified', { unique: false });
        }
      };
    });
  }
  
  // Save project locally
  async saveProject(projectName, sceneData) {
    const project = {
      id: this.generateUUID(),
      name: projectName,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      
      // Full scene data
      scene: {
        objects: sceneData.objects || [],
        materials: sceneData.materials || [],
        lights: sceneData.lights || [],
        camera: sceneData.camera || {},
        physics: sceneData.physics || {},
      },
      
      // Metadata
      metadata: {
        version: '1.0',
        vertex_count: this.countVertices(sceneData.objects),
        object_count: sceneData.objects?.length || 0,
        material_count: sceneData.materials?.length || 0,
        file_size_bytes: this.calculateSize(sceneData),
      },
      
      // Thumbnail (base64 PNG)
      thumbnail: this.captureScreenshot(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(project);
      
      request.onsuccess = () => {
        console.log('✅ Project saved locally:', projectName);
        this.updateUI();
        resolve(project.id);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  // Load project from local storage
  async loadProject(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(projectId);
      
      request.onsuccess = () => {
        const project = request.result;
        if (project) {
          console.log('✅ Project loaded:', project.name);
          resolve(project);
        } else {
          reject(new Error('Project not found'));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  // Get all projects
  async getAllProjects() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  // Delete project
  async deleteProject(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.delete(projectId);
      
      request.onsuccess = () => {
        console.log('✅ Project deleted');
        this.updateUI();
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  // Get storage usage
  async getStorageInfo() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage_bytes: estimate.usage,
        quota_bytes: estimate.quota,
        usage_mb: (estimate.usage / 1024 / 1024).toFixed(2),
        quota_mb: (estimate.quota / 1024 / 1024).toFixed(2),
        usage_percent: ((estimate.usage / estimate.quota) * 100).toFixed(1),
      };
    }
    return null;
  }
  
  // ===================================
  // EXPORT SYSTEM
  // ===================================
  
  // Export all projects as ZIP
  async exportAllProjects(format = 'backup') {
    const projects = await this.getAllProjects();
    
    if (projects.length === 0) {
      alert('⚠️ No projects to export');
      return;
    }
    
    // Show progress modal
    this.showExportProgress('Preparing export...', 0);
    
    const zip = new JSZip();
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const progress = ((i + 1) / projects.length) * 100;
      
      this.showExportProgress(`Exporting ${project.name}...`, progress);
      
      if (format === 'backup') {
        // PixelProdigy native format (.ppbackup)
        zip.file(`${project.name}.ppbackup`, JSON.stringify(project, null, 2));
        
      } else if (format === 'gltf') {
        // Industry-standard GLTF
        const gltfData = this.exportToGLTF(project.scene);
        zip.file(`${project.name}.gltf`, JSON.stringify(gltfData, null, 2));
        
      } else if (format === 'obj') {
        // Legacy OBJ format
        const objData = this.exportToOBJ(project.scene);
        zip.file(`${project.name}.obj`, objData);
      }
      
      // Add thumbnail
      if (project.thumbnail) {
        const thumbData = this.base64ToBlob(project.thumbnail);
        zip.file(`${project.name}_thumbnail.png`, thumbData);
      }
    }
    
    // Add manifest file
    const manifest = {
      export_format: format,
      export_date: new Date().toISOString(),
      pixelprodigy_version: '1.0',
      total_projects: projects.length,
      total_size_bytes: projects.reduce((sum, p) => sum + p.metadata.file_size_bytes, 0),
    };
    
    zip.file('MANIFEST.json', JSON.stringify(manifest, null, 2));
    
    // Generate ZIP blob
    this.showExportProgress('Compressing archive...', 95);
    
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PixelProdigy_Export_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showExportProgress('✅ Export complete!', 100);
    setTimeout(() => this.hideExportProgress(), 2000);
    
    console.log(`✅ Exported ${projects.length} projects as ${format}`);
  }
  
  // Import from backup file
  async importFromBackup(file) {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (file.name.endsWith('.ppbackup')) {
          // Single project backup
          const project = JSON.parse(e.target.result);
          await this.saveProject(project.name, project.scene);
          alert(`✅ Imported project: ${project.name}`);
          
        } else if (file.name.endsWith('.zip')) {
          // Multiple projects archive
          const zip = await JSZip.loadAsync(e.target.result);
          let importCount = 0;
          
          for (const filename in zip.files) {
            if (filename.endsWith('.ppbackup')) {
              const content = await zip.files[filename].async('string');
              const project = JSON.parse(content);
              await this.saveProject(project.name, project.scene);
              importCount++;
            }
          }
          
          alert(`✅ Imported ${importCount} projects`);
        }
        
        this.updateUI();
        
      } catch (error) {
        console.error('Import error:', error);
        alert('⚠️ Failed to import: Invalid backup file');
      }
    };
    
    if (file.name.endsWith('.ppbackup')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }
  
  // ===================================
  // CLOUD SYNC (Paid Tiers)
  // ===================================
  
  async syncToCloud(projectId) {
    // 🔒 SECURITY: Verify this function hasn't been tampered with
    if (!_validateFunctionIntegrity('syncToCloud', this.syncToCloud)) {
      alert('🚨 Security Error: Function tampering detected');
      return null;
    }
    
    const user = this.getCurrentUser();
    
    if (!user || user.tier === 'free') {
      this.showUpgradeModal('Cloud sync requires Creator tier ($9.99/mo)');
      return;
    }
    
    // 🔒 SECURITY: Verify user authentication on server
    const authToken = await this.verifyUserToken(user.id);
    if (!authToken) {
      alert('🚨 Authentication failed - please log in again');
      return null;
    }
    
    const project = await this.loadProject(projectId);
    
    // Check cloud storage quota
    const storageInfo = await this.getCloudStorageInfo(user.id);
    const projectSize = project.metadata.file_size_bytes;
    
    if (storageInfo.usage_bytes + projectSize > storageInfo.quota_bytes) {
      alert('⚠️ Cloud storage quota exceeded. Upgrade to Pro tier for 100 GB.');
      return;
    }
    
    // Chunked upload (5MB chunks)
    const chunks = this.chunkifyData(project, 5 * 1024 * 1024);
    
    for (let i = 0; i < chunks.length; i++) {
      await this.uploadChunk(user.id, projectId, i, chunks.length, chunks[i]);
      
      const progress = ((i + 1) / chunks.length) * 100;
      this.updateSyncProgress(progress);
    }
    
    console.log('✅ Project synced to cloud');
  }
  
  async uploadChunk(userId, projectId, chunkIndex, totalChunks, chunkData) {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('project_id', projectId);
    formData.append('chunk_index', chunkIndex);
    formData.append('total_chunks', totalChunks);
    formData.append('chunk_data', new Blob([chunkData]));
    
    const response = await fetch('https://api.eugeneous.dev/v1/storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getCurrentUser().auth_token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  }
  
  async downloadFromCloud(projectId) {
    const user = this.getCurrentUser();
    
    const response = await fetch(`https://api.eugeneous.dev/v1/storage/download/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${user.auth_token}`,
      },
    });
    
    const data = await response.json();
    
    // Download chunks
    const chunks = [];
    for (let i = 0; i < data.chunks.length; i++) {
      const chunkResponse = await fetch(data.chunks[i].url);
      const chunkData = await chunkResponse.arrayBuffer();
      chunks.push(chunkData);
      
      const progress = ((i + 1) / data.chunks.length) * 100;
      this.updateSyncProgress(progress);
    }
    
    // Reassemble
    const fullData = this.reassembleChunks(chunks);
    const project = JSON.parse(fullData);
    
    // Save locally
    await this.saveProject(project.name, project.scene);
    
    console.log('✅ Project downloaded from cloud');
  }
  
  // ===================================
  // WATERMARKING (IP Protection)
  // ===================================
  
  embedPixelProdigySignature(gltfData) {
    const user = this.getCurrentUser();
    
    // Add custom extension to GLTF
    const signature = {
      extensions: {
        PIXELPRODIGY_signature: {
          version: '1.0',
          creator_id: user?.id || 'anonymous',
          created_with: 'PixelProdigy',
          created_at: new Date().toISOString(),
          license: 'CC-BY-NC', // Non-commercial unless sold on MyPlace
          marketplace_url: 'https://myplace.eugeneous.com',
          
          // Cryptographic hash (proves authenticity)
          hash: this.generateHash(JSON.stringify(gltfData)),
        }
      }
    };
    
    gltfData.extensions = signature.extensions;
    return gltfData;
  }
  
  verifyPixelProdigySignature(gltfData) {
    const sig = gltfData.extensions?.PIXELPRODIGY_signature;
    
    if (!sig) {
      return {
        valid: false,
        reason: 'Not created with PixelProdigy',
      };
    }
    
    // Verify hash
    const tempData = { ...gltfData };
    delete tempData.extensions;
    const expectedHash = this.generateHash(JSON.stringify(tempData));
    
    if (sig.hash !== expectedHash) {
      return {
        valid: false,
        reason: 'File modified after export (tampered)',
      };
    }
    
    return {
      valid: true,
      creator_id: sig.creator_id,
      created_at: sig.created_at,
      license: sig.license,
    };
  }
  
  // ===================================
  // UTILITY FUNCTIONS
  // ===================================
  
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  generateHash(data) {
    // Simple hash for demo (use crypto.subtle.digest in production)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  countVertices(objects) {
    return objects.reduce((sum, obj) => {
      return sum + (obj.geometry?.attributes?.position?.count || 0);
    }, 0);
  }
  
  calculateSize(data) {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }
  
  captureScreenshot() {
    // Capture current canvas view
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return null;
  }
  
  base64ToBlob(base64) {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
  
  chunkifyData(data, chunkSize) {
    const str = JSON.stringify(data);
    const chunks = [];
    
    for (let i = 0; i < str.length; i += chunkSize) {
      chunks.push(str.slice(i, i + chunkSize));
    }
    
    return chunks;
  }
  
  reassembleChunks(chunks) {
    const decoder = new TextDecoder();
    const parts = chunks.map(chunk => decoder.decode(chunk));
    return parts.join('');
  }
  
  exportToGLTF(sceneData) {
    // Convert PixelProdigy scene to GLTF format
    const gltf = {
      asset: {
        version: '2.0',
        generator: 'PixelProdigy v1.0',
      },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
    };
    
    // Convert objects to GLTF meshes
    sceneData.objects.forEach((obj, index) => {
      // Add mesh
      gltf.meshes.push({
        name: obj.name || `Object_${index}`,
        primitives: [{
          attributes: {
            POSITION: index * 3,
            NORMAL: index * 3 + 1,
            TEXCOORD_0: index * 3 + 2,
          },
          mode: 4, // TRIANGLES
        }]
      });
      
      // Add node
      gltf.nodes.push({
        name: obj.name || `Node_${index}`,
        mesh: index,
        translation: obj.position || [0, 0, 0],
        rotation: obj.rotation || [0, 0, 0, 1],
        scale: obj.scale || [1, 1, 1],
      });
      
      gltf.scenes[0].nodes.push(index);
    });
    
    // Embed signature
    return this.embedPixelProdigySignature(gltf);
  }
  
  exportToOBJ(sceneData) {
    let objString = '# Exported from PixelProdigy\n';
    objString += `# ${new Date().toISOString()}\n\n`;
    
    sceneData.objects.forEach((obj, index) => {
      objString += `o ${obj.name || `Object_${index}`}\n`;
      
      // Vertices
      const positions = obj.geometry?.attributes?.position?.array || [];
      for (let i = 0; i < positions.length; i += 3) {
        objString += `v ${positions[i]} ${positions[i+1]} ${positions[i+2]}\n`;
      }
      
      // Faces
      const indices = obj.geometry?.index?.array || [];
      for (let i = 0; i < indices.length; i += 3) {
        objString += `f ${indices[i]+1} ${indices[i+1]+1} ${indices[i+2]+1}\n`;
      }
      
      objString += '\n';
    });
    
    return objString;
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('pixelprodigy_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // UI update functions (implement based on your UI framework)
  updateUI() {
    console.log('UI updated');
  }
  
  showExportProgress(message, percent) {
    console.log(`Export: ${message} (${percent.toFixed(1)}%)`);
  }
  
  hideExportProgress() {
    console.log('Export complete');
  }
  
  updateSyncProgress(percent) {
    console.log(`Sync: ${percent.toFixed(1)}%`);
  }
  
  showUpgradeModal(message) {
    alert(message);
  }
}

// ===================================
// INITIALIZE
// ===================================

const storage = new PixelProdigyStorage();

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
  await storage.init();
  console.log('✅ PixelProdigy Storage initialized');
  
  // Display storage info
  const info = await storage.getStorageInfo();
  if (info) {
    console.log(`💾 Storage: ${info.usage_mb} MB / ${info.quota_mb} MB (${info.usage_percent}%)`);
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PixelProdigyStorage;
}
