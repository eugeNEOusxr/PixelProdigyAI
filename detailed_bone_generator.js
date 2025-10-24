// Detailed Anatomical Bone Generator for PixelProdigy3D
// Creates bones with proper anatomical features using custom vertex paths

/**
 * Create a detailed femur (thigh bone) with anatomical features
 * @param {string} side - 'left' or 'right'
 * @param {THREE.Material} material - Bone material
 * @returns {THREE.Group} - Complete femur with all features
 */
function createDetailedFemur(side, material) {
  const femurGroup = new THREE.Group();
  femurGroup.name = `${side} Femur (Detailed)`;
  
  // === FEMORAL HEAD (Ball joint at hip) ===
  // Round ball that fits into hip socket
  const headGeom = new THREE.SphereGeometry(0.15, 16, 16);
  const head = new THREE.Mesh(headGeom, material);
  head.name = 'Femoral Head';
  head.position.set(0, 3.5, 0); // Top of bone
  femurGroup.add(head);
  
  // === FEMORAL NECK (Connects head to shaft) ===
  // Angled connector - anatomically important!
  const neckGeom = new THREE.CylinderGeometry(0.08, 0.10, 0.6, 12);
  const neck = new THREE.Mesh(neckGeom, material);
  neck.name = 'Femoral Neck';
  neck.position.set(side === 'right' ? 0.1 : -0.1, 3.2, 0);
  neck.rotation.z = side === 'right' ? -Math.PI/6 : Math.PI/6;
  femurGroup.add(neck);
  
  // === GREATER TROCHANTER (Hip attachment point) ===
  const greaterTrocGeom = new THREE.BoxGeometry(0.12, 0.2, 0.1);
  const greaterTroc = new THREE.Mesh(greaterTrocGeom, material);
  greaterTroc.name = 'Greater Trochanter';
  greaterTroc.position.set(side === 'right' ? 0.15 : -0.15, 3.0, 0);
  femurGroup.add(greaterTroc);
  
  // === LESSER TROCHANTER (Muscle attachment) ===
  const lesserTrocGeom = new THREE.BoxGeometry(0.08, 0.12, 0.08);
  const lesserTroc = new THREE.Mesh(lesserTrocGeom, material);
  lesserTroc.name = 'Lesser Trochanter';
  lesserTroc.position.set(side === 'right' ? -0.08 : 0.08, 2.8, -0.05);
  femurGroup.add(lesserTroc);
  
  // === FEMORAL SHAFT (Main bone body) ===
  // Custom geometry with proper taper
  const shaftSegments = 20;
  const shaftVertices = [];
  const shaftIndices = [];
  
  for (let i = 0; i <= shaftSegments; i++) {
    const t = i / shaftSegments;
    const y = 2.7 - (t * 2.5); // Goes from 2.7 to 0.2
    
    // Radius varies along shaft (wider at top, narrower in middle, wider at bottom)
    let radius;
    if (t < 0.3) {
      radius = 0.10 - (t * 0.04); // Taper from top
    } else if (t < 0.7) {
      radius = 0.06; // Narrow middle (diaphysis)
    } else {
      radius = 0.06 + ((t - 0.7) * 0.06); // Widen at bottom
    }
    
    // Create circular ring of vertices
    const segments = 16;
    for (let j = 0; j < segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      shaftVertices.push(x, y, z);
    }
    
    // Create triangles between rings
    if (i < shaftSegments) {
      for (let j = 0; j < segments; j++) {
        const current = i * segments + j;
        const next = i * segments + ((j + 1) % segments);
        const nextRow = (i + 1) * segments + j;
        const nextRowNext = (i + 1) * segments + ((j + 1) % segments);
        
        shaftIndices.push(current, next, nextRow);
        shaftIndices.push(next, nextRowNext, nextRow);
      }
    }
  }
  
  const shaftGeom = new THREE.BufferGeometry();
  shaftGeom.setAttribute('position', new THREE.Float32BufferAttribute(shaftVertices, 3));
  shaftGeom.setIndex(shaftIndices);
  shaftGeom.computeVertexNormals();
  
  const shaft = new THREE.Mesh(shaftGeom, material);
  shaft.name = 'Femoral Shaft (Diaphysis)';
  femurGroup.add(shaft);
  
  // === LINEA ASPERA (Ridge on back of shaft) ===
  const lineaGeom = new THREE.BoxGeometry(0.02, 2.0, 0.04);
  const linea = new THREE.Mesh(lineaGeom, material);
  linea.name = 'Linea Aspera';
  linea.position.set(0, 1.5, -0.07);
  femurGroup.add(linea);
  
  // === MEDIAL CONDYLE (Inner knee bump) ===
  const medialCondyleGeom = new THREE.SphereGeometry(0.15, 12, 12);
  const medialCondyle = new THREE.Mesh(medialCondyleGeom, material);
  medialCondyle.name = 'Medial Condyle';
  medialCondyle.position.set(side === 'right' ? -0.08 : 0.08, 0.1, 0.05);
  medialCondyle.scale.set(1, 0.8, 1.2);
  femurGroup.add(medialCondyle);
  
  // === LATERAL CONDYLE (Outer knee bump) ===
  const lateralCondyleGeom = new THREE.SphereGeometry(0.15, 12, 12);
  const lateralCondyle = new THREE.Mesh(lateralCondyleGeom, material);
  lateralCondyle.name = 'Lateral Condyle';
  lateralCondyle.position.set(side === 'right' ? 0.08 : -0.08, 0.1, 0.05);
  lateralCondyle.scale.set(1, 0.8, 1.2);
  femurGroup.add(lateralCondyle);
  
  // === PATELLAR GROOVE (Where kneecap slides) ===
  const patellarGrooveGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16, 1, true);
  const patellarGroove = new THREE.Mesh(patellarGrooveGeom, material);
  patellarGroove.name = 'Patellar Groove';
  patellarGroove.position.set(0, 0.1, 0.12);
  patellarGroove.rotation.x = Math.PI / 2;
  femurGroup.add(patellarGroove);
  
  // === INTERCONDYLAR FOSSA (Notch between condyles) ===
  const fossaGeom = new THREE.BoxGeometry(0.08, 0.15, 0.12);
  const fossa = new THREE.Mesh(fossaGeom, material);
  fossa.name = 'Intercondylar Fossa';
  fossa.position.set(0, 0.05, -0.05);
  femurGroup.add(fossa);
  
  console.log(`✅ Created detailed ${side} femur with ${shaftVertices.length / 3} vertices in shaft`);
  console.log(`   Features: Head, Neck, Trochanters, Shaft, Condyles, Patellar Groove`);
  
  return femurGroup;
}

/**
 * Create a detailed skull (cranium) with anatomical features
 * @param {THREE.Material} material - Bone material
 * @returns {THREE.Group} - Complete skull
 */
function createDetailedSkull(material) {
  const skullGroup = new THREE.Group();
  skullGroup.name = 'Detailed Skull';
  
  // === CRANIAL VAULT (Main skull dome) ===
  const craniumGeom = new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const cranium = new THREE.Mesh(craniumGeom, material);
  cranium.name = 'Cranium (Vault)';
  cranium.position.y = 0.3;
  skullGroup.add(cranium);
  
  // === FRONTAL BONE (Forehead) ===
  const frontalGeom = new THREE.SphereGeometry(0.52, 20, 20, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.25);
  const frontal = new THREE.Mesh(frontalGeom, material);
  frontal.name = 'Frontal Bone';
  frontal.position.set(0, 0.3, 0.5);
  frontal.rotation.x = -Math.PI / 6;
  skullGroup.add(frontal);
  
  // === TEMPORAL BONES (Sides of skull) ===
  const temporalGeom = new THREE.BoxGeometry(0.15, 0.25, 0.3);
  
  const leftTemporal = new THREE.Mesh(temporalGeom, material);
  leftTemporal.name = 'Left Temporal Bone';
  leftTemporal.position.set(-0.5, 0.1, 0);
  skullGroup.add(leftTemporal);
  
  const rightTemporal = new THREE.Mesh(temporalGeom, material);
  rightTemporal.name = 'Right Temporal Bone';
  rightTemporal.position.set(0.5, 0.1, 0);
  skullGroup.add(rightTemporal);
  
  // === OCCIPITAL BONE (Back of skull) ===
  const occipitalGeom = new THREE.SphereGeometry(0.48, 20, 20, Math.PI * 0.8, Math.PI * 0.4, Math.PI * 0.3, Math.PI * 0.4);
  const occipital = new THREE.Mesh(occipitalGeom, material);
  occipital.name = 'Occipital Bone';
  occipital.position.set(0, 0.1, -0.45);
  skullGroup.add(occipital);
  
  // === FORAMEN MAGNUM (Hole where spine connects) ===
  const foramenGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  const foramen = new THREE.Mesh(foramenGeom, new THREE.MeshStandardMaterial({ color: 0x000000 }));
  foramen.name = 'Foramen Magnum';
  foramen.position.set(0, -0.3, -0.3);
  foramen.rotation.x = Math.PI / 2;
  skullGroup.add(foramen);
  
  // === ZYGOMATIC ARCH (Cheekbone) ===
  const zygomaticGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
  
  const leftZygomatic = new THREE.Mesh(zygomaticGeom, material);
  leftZygomatic.name = 'Left Zygomatic Arch';
  leftZygomatic.position.set(-0.42, 0, 0.2);
  leftZygomatic.rotation.z = Math.PI / 2;
  skullGroup.add(leftZygomatic);
  
  const rightZygomatic = new THREE.Mesh(zygomaticGeom, material);
  rightZygomatic.name = 'Right Zygomatic Arch';
  rightZygomatic.position.set(0.42, 0, 0.2);
  rightZygomatic.rotation.z = Math.PI / 2;
  skullGroup.add(rightZygomatic);
  
  // === ORBIT (Eye sockets) - Detailed ===
  const orbitGeom = new THREE.SphereGeometry(0.12, 16, 16);
  
  const leftOrbit = new THREE.Mesh(orbitGeom, new THREE.MeshStandardMaterial({ color: 0x000000 }));
  leftOrbit.name = 'Left Orbit';
  leftOrbit.position.set(-0.18, 0.2, 0.48);
  leftOrbit.scale.set(1, 1.2, 0.8);
  skullGroup.add(leftOrbit);
  
  const rightOrbit = new THREE.Mesh(orbitGeom, new THREE.MeshStandardMaterial({ color: 0x000000 }));
  rightOrbit.name = 'Right Orbit';
  rightOrbit.position.set(0.18, 0.2, 0.48);
  rightOrbit.scale.set(1, 1.2, 0.8);
  skullGroup.add(rightOrbit);
  
  // === NASAL CAVITY (Nose hole) ===
  const nasalGeom = new THREE.BoxGeometry(0.08, 0.15, 0.08);
  const nasal = new THREE.Mesh(nasalGeom, new THREE.MeshStandardMaterial({ color: 0x000000 }));
  nasal.name = 'Nasal Cavity';
  nasal.position.set(0, 0.05, 0.54);
  skullGroup.add(nasal);
  
  // === MAXILLA (Upper jaw) ===
  const maxillaGeom = new THREE.BoxGeometry(0.4, 0.2, 0.3);
  const maxilla = new THREE.Mesh(maxillaGeom, material);
  maxilla.name = 'Maxilla';
  maxilla.position.set(0, -0.1, 0.4);
  maxilla.scale.set(1, 0.6, 1);
  skullGroup.add(maxilla);
  
  // === UPPER TEETH (8 visible) ===
  for (let i = 0; i < 8; i++) {
    const toothGeom = new THREE.BoxGeometry(0.04, 0.08, 0.04);
    const tooth = new THREE.Mesh(toothGeom, new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
    tooth.name = `Upper Tooth ${i + 1}`;
    tooth.position.set(-0.14 + (i * 0.04), -0.15, 0.54);
    skullGroup.add(tooth);
  }
  
  console.log(`✅ Created detailed skull with anatomical features`);
  
  return skullGroup;
}

// Export for use in main file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createDetailedFemur, createDetailedSkull };
}
