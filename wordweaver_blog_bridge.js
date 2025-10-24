/**
 * 🔗 WordWeaver Blog Bridge
 * Connects pixelprodigy_blog.html to pixelprodigy3d.html via WordWeaver Engine
 * 
 * This script enables:
 * 1. "View in 3D" button on blog posts
 * 2. Real-time blog → 3D conversion
 * 3. Synchronized navigation between 2D blog and 3D universe
 * 
 * Eugene Ousos - PixelProdigy AI
 * October 24, 2025
 */

// ============================================
// INTEGRATION FOR BLOG (pixelprodigy_blog.html)
// ============================================

/**
 * Add "View in 3D" buttons to blog posts
 * Call this after posts are rendered
 */
function addView3DButtons() {
  const posts = JSON.parse(localStorage.getItem('pixelprodigy_posts') || '[]');
  
  posts.forEach((post) => {
    const postCard = document.querySelector(`[data-post-id="${post.id}"]`);
    
    if (postCard && !postCard.querySelector('.view-3d-btn')) {
      const button = document.createElement('button');
      button.className = 'view-3d-btn';
      button.innerHTML = '🧬 View in 3D Universe';
      button.style.cssText = `
        padding: 8px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
        transition: transform 0.2s;
      `;
      
      button.addEventListener('click', () => {
        // Store selected post ID for 3D universe
        localStorage.setItem('wordweaver_selected_post', post.id);
        
        // Navigate to 3D universe
        window.location.href = 'pixelprodigy3d.html?mode=wordweaver';
      });
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
      });
      
      // Add to post card footer
      const footer = postCard.querySelector('.post-footer') || postCard;
      footer.appendChild(button);
    }
  });
  
  console.log('✅ Added "View in 3D" buttons to blog posts');
}

/**
 * Enhanced post modal with 3D preview
 */
function enhancePostModal() {
  // When modal opens, add 3D preview option
  const originalOpenModal = window.openPostModal;
  
  if (originalOpenModal) {
    window.openPostModal = function(postId) {
      // Call original modal function
      originalOpenModal(postId);
      
      // Add 3D preview button to modal
      setTimeout(() => {
        const modal = document.getElementById('postModal');
        if (modal && !modal.querySelector('.modal-3d-preview')) {
          const previewBtn = document.createElement('button');
          previewBtn.className = 'modal-3d-preview';
          previewBtn.innerHTML = '🧬 View 3D Structure';
          previewBtn.style.cssText = `
            width: 100%;
            padding: 12px;
            background: rgba(102, 126, 234, 0.2);
            border: 2px solid rgba(102, 126, 234, 0.4);
            border-radius: 8px;
            color: #667eea;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
          `;
          
          previewBtn.addEventListener('click', () => {
            localStorage.setItem('wordweaver_selected_post', postId);
            window.location.href = 'pixelprodigy3d.html?mode=wordweaver';
          });
          
          const modalContent = modal.querySelector('.modal-content');
          if (modalContent) {
            modalContent.appendChild(previewBtn);
          }
        }
      }, 100);
    };
  }
}

/**
 * Add "Open 3D Gallery" button to blog header
 */
function addGalleryButton() {
  const header = document.querySelector('.header') || document.querySelector('.nav-buttons');
  
  if (header && !header.querySelector('.gallery-3d-btn')) {
    const button = document.createElement('button');
    button.className = 'nav-btn gallery-3d-btn';
    button.innerHTML = '🌌 3D Gallery';
    button.addEventListener('click', () => {
      window.location.href = 'pixelprodigy3d.html?mode=wordweaver&gallery=all';
    });
    
    header.appendChild(button);
    console.log('✅ Added 3D Gallery button to header');
  }
}

// ============================================
// INTEGRATION FOR 3D UNIVERSE (pixelprodigy3d.html)
// ============================================

/**
 * Initialize WordWeaver in 3D universe
 * Call this after Three.js scene is set up
 */
function initWordWeaverIn3D(scene, camera) {
  // Check if coming from blog
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const gallery = urlParams.get('gallery');
  const selectedPostId = localStorage.getItem('wordweaver_selected_post');
  
  if (mode !== 'wordweaver') {
    return; // Not in WordWeaver mode
  }
  
  // Load WordWeaver engine
  const script = document.createElement('script');
  script.src = 'wordweaver_engine.js';
  script.onload = () => {
    window.wordWeaver = new WordWeaverEngine(scene, camera);
    
    if (gallery === 'all') {
      // Load all blog posts as 3D gallery
      loadBlogGallery();
    } else if (selectedPostId) {
      // Load single selected post
      loadSinglePost(selectedPostId);
    }
    
    // Add WordWeaver UI controls
    addWordWeaverUI();
  };
  document.head.appendChild(script);
  
  console.log('🧬 WordWeaver mode activated in 3D universe');
}

/**
 * Load all blog posts as 3D gallery
 */
function loadBlogGallery() {
  const posts = JSON.parse(localStorage.getItem('pixelprodigy_posts') || '[]');
  
  if (posts.length === 0) {
    console.warn('No blog posts found in localStorage');
    return;
  }
  
  console.log(`📚 Loading ${posts.length} posts into 3D gallery...`);
  
  posts.forEach((post, i) => {
    setTimeout(() => {
      const structure = window.wordWeaver.weavePost(post);
      
      // Arrange in circular gallery
      const angle = (i / posts.length) * Math.PI * 2;
      const radius = 8;
      structure.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      
      // Rotate to face center
      structure.lookAt(0, 0, 0);
      
      scene.add(structure);
      
      console.log(`✅ [${i+1}/${posts.length}] Woven: "${post.title}"`);
    }, i * 300); // Stagger creation for smooth loading
  });
  
  // Position camera to see full gallery
  if (camera) {
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
  }
}

/**
 * Load single blog post
 */
function loadSinglePost(postId) {
  const posts = JSON.parse(localStorage.getItem('pixelprodigy_posts') || '[]');
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    console.error(`Post ${postId} not found`);
    return;
  }
  
  console.log(`🧵 Weaving post: "${post.title}"`);
  
  const structure = window.wordWeaver.weavePost(post);
  structure.position.set(0, 0, 0);
  scene.add(structure);
  
  // Position camera for optimal view
  if (camera) {
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);
  }
  
  // Clear selected post from storage
  localStorage.removeItem('wordweaver_selected_post');
}

/**
 * Add WordWeaver UI controls to 3D universe
 */
function addWordWeaverUI() {
  // Check if UI already exists
  if (document.getElementById('wordweaver-ui')) return;
  
  const ui = document.createElement('div');
  ui.id = 'wordweaver-ui';
  ui.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    max-width: 300px;
    z-index: 900;
  `;
  
  ui.innerHTML = `
    <div style="font-size: 1.2rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px;">
      🧬 WordWeaver Controls
    </div>
    
    <div style="margin-bottom: 15px;">
      <div style="font-size: 0.85rem; color: #999; margin-bottom: 8px;">Structures Loaded:</div>
      <div id="ww-structure-count" style="font-size: 1.5rem; color: #667eea; font-weight: 600;">0</div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <div style="font-size: 0.85rem; color: #999; margin-bottom: 8px;">Total Words:</div>
      <div id="ww-word-count" style="font-size: 1.5rem; color: #764ba2; font-weight: 600;">0</div>
    </div>
    
    <button id="ww-toggle-layer" style="width: 100%; padding: 10px; background: rgba(102, 126, 234, 0.2); border: 2px solid rgba(102, 126, 234, 0.4); border-radius: 6px; color: #667eea; font-weight: 600; cursor: pointer; margin-bottom: 8px;">
      👁️ Toggle Layers
    </button>
    
    <button id="ww-clear-all" style="width: 100%; padding: 10px; background: rgba(239, 68, 68, 0.2); border: 2px solid rgba(239, 68, 68, 0.4); border-radius: 6px; color: #ef4444; font-weight: 600; cursor: pointer; margin-bottom: 8px;">
      🗑️ Clear All
    </button>
    
    <button id="ww-back-to-blog" style="width: 100%; padding: 10px; background: rgba(102, 126, 234, 0.15); border: 2px solid rgba(102, 126, 234, 0.3); border-radius: 6px; color: #fff; font-weight: 600; cursor: pointer;">
      ← Back to Blog
    </button>
  `;
  
  document.body.appendChild(ui);
  
  // Update stats
  function updateStats() {
    if (!window.wordWeaver) return;
    
    document.getElementById('ww-structure-count').textContent = window.wordWeaver.postStructures.size;
    
    let totalWords = 0;
    window.wordWeaver.postStructures.forEach((structure) => {
      const muscles = structure.children.find(c => c.name === 'muscles');
      if (muscles) {
        totalWords += muscles.children.length;
      }
    });
    
    document.getElementById('ww-word-count').textContent = totalWords;
  }
  
  // Update stats every second
  setInterval(updateStats, 1000);
  updateStats();
  
  // Button handlers
  document.getElementById('ww-toggle-layer').addEventListener('click', () => {
    if (!window.wordWeaver) return;
    
    // Toggle skin layer visibility
    window.wordWeaver.postStructures.forEach((structure) => {
      const skin = structure.children.find(c => c.name === 'skin');
      if (skin) {
        skin.visible = !skin.visible;
      }
    });
  });
  
  document.getElementById('ww-clear-all').addEventListener('click', () => {
    if (window.wordWeaver) {
      window.wordWeaver.clearAll();
      updateStats();
    }
  });
  
  document.getElementById('ww-back-to-blog').addEventListener('click', () => {
    window.location.href = 'pixelprodigy_blog.html';
  });
  
  console.log('✅ WordWeaver UI added to 3D universe');
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

// For blog page
if (window.location.pathname.includes('pixelprodigy_blog.html')) {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      addView3DButtons();
      enhancePostModal();
      addGalleryButton();
      
      // Re-add buttons when posts are filtered/searched
      const originalRenderPosts = window.renderPosts;
      if (originalRenderPosts) {
        window.renderPosts = function(...args) {
          originalRenderPosts.apply(this, args);
          setTimeout(addView3DButtons, 100);
        };
      }
    }, 500);
  });
}

// For 3D universe page
if (window.location.pathname.includes('pixelprodigy3d.html')) {
  window.addEventListener('DOMContentLoaded', () => {
    // Wait for scene to be initialized
    const checkScene = setInterval(() => {
      if (typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        clearInterval(checkScene);
        initWordWeaverIn3D(scene, camera);
      }
    }, 100);
  });
}

// ============================================
// EXPORT FOR MANUAL INTEGRATION
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addView3DButtons,
    enhancePostModal,
    addGalleryButton,
    initWordWeaverIn3D,
    loadBlogGallery,
    loadSinglePost,
    addWordWeaverUI
  };
}
