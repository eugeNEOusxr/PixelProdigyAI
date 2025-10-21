/**
 * ═══════════════════════════════════════════════════════════
 * META-PROGRAMMING: DOCUMENTATION AS EXECUTABLE COORDINATES
 * ═══════════════════════════════════════════════════════════
 * 
 * Exploration: What if .md symbols are actually coordinate stops?
 * - * asterisk = vertex point marker
 * - # heading = major coordinate anchor
 * - ` backtick = code boundary
 * - function = stable block (don't iterate)
 * 
 * JavaScript reads time FORWARD but can traverse vertices BACKWARD
 * Breathing = micro-iterations (0.016s frames)
 * Joint work = macro-iterations (behavior states)
 * Multiple = reach ALL vertices simultaneously
 */

// ═══════════════════════════════════════════════════════════
// 🌊 BREATHING SYSTEM - Micro-Iteration Layer
// ═══════════════════════════════════════════════════════════

class BreathingController {
    constructor() {
        // Micro-layer: 60 Hz iteration
        this.frameTime = 1/60;           // Δt = 0.016667s
        this.breathCycle = 0;            // Current phase
        this.breathFrequency = 0.25;     // Breaths per second (15 BPM)
        
        // Vertices controlled by breathing
        this.vertices = [];
        this.activeVertices = new Set();
        
        console.log('🌊 Breathing layer initialized (micro-iteration)');
    }
    
    /**
     * Update breathing - runs every frame (60 Hz)
     * This is the SMALLEST increment
     */
    update(deltaTime) {
        // Increment phase (the i++ of breathing)
        this.breathCycle += deltaTime * this.breathFrequency * Math.PI * 2;
        
        // Calculate breath value
        const inhale = (Math.sin(this.breathCycle) + 1) / 2; // 0 to 1
        
        // Apply to ALL vertices marked for breathing
        this.activeVertices.forEach(vertexIndex => {
            if (this.vertices[vertexIndex]) {
                this.vertices[vertexIndex].scale = 1 + (inhale * 0.05);
            }
        });
        
        return inhale;
    }
    
    /**
     * Mark vertices for breathing control
     * Multiple = reach out to every vertex point
     */
    registerVertices(indices) {
        indices.forEach(i => this.activeVertices.add(i));
        console.log(`🔗 Registered ${indices.length} vertices to breathing`);
    }
    
    /**
     * Remove breathing control from vertices
     */
    unregisterVertices(indices) {
        indices.forEach(i => this.activeVertices.delete(i));
    }
}

// ═══════════════════════════════════════════════════════════
// 🦴 JOINT SYSTEM - Macro-Iteration Layer
// ═══════════════════════════════════════════════════════════

class JointController {
    constructor() {
        // Macro-layer: Behavior-level iteration
        this.state = 'idle';
        this.stateTime = 0;
        this.stateDuration = 2.0;        // State changes every 2 seconds
        
        // Vertices controlled by joint movement
        this.vertices = [];
        this.activeVertices = new Set();
        
        // Joint angles (the theta values)
        this.angles = {
            shoulder: 0,
            elbow: 0,
            hip: 0,
            knee: 0
        };
        
        console.log('🦴 Joint layer initialized (macro-iteration)');
    }
    
    /**
     * Update joints - runs at behavior frequency
     * This is a LARGER increment than breathing
     */
    update(deltaTime) {
        this.stateTime += deltaTime;
        
        // State machine iteration
        if (this.stateTime >= this.stateDuration) {
            this.stateTime = 0;
            this.transitionState();
        }
        
        // Calculate joint angles based on state
        const phase = this.stateTime / this.stateDuration;
        
        switch(this.state) {
            case 'idle':
                this.angles.shoulder = Math.sin(phase * Math.PI) * 0.1;
                break;
            case 'walking':
                this.angles.shoulder = Math.sin(phase * Math.PI * 2) * 0.6;
                this.angles.hip = Math.sin(phase * Math.PI * 2 + Math.PI) * 0.6;
                break;
            case 'running':
                this.angles.shoulder = Math.sin(phase * Math.PI * 4) * 1.2;
                this.angles.hip = Math.sin(phase * Math.PI * 4 + Math.PI) * 1.2;
                break;
        }
        
        // Apply to vertices
        this.applyToVertices();
        
        return this.angles;
    }
    
    transitionState() {
        const states = ['idle', 'walking', 'running'];
        const currentIndex = states.indexOf(this.state);
        const nextIndex = (currentIndex + 1) % states.length;
        this.state = states[nextIndex];
        console.log(`🔄 Joint state: ${this.state}`);
    }
    
    applyToVertices() {
        // Apply joint angles to controlled vertices
        this.activeVertices.forEach(vertexIndex => {
            if (this.vertices[vertexIndex]) {
                this.vertices[vertexIndex].rotation = this.angles;
            }
        });
    }
    
    registerVertices(indices) {
        indices.forEach(i => this.activeVertices.add(i));
        console.log(`🔗 Registered ${indices.length} vertices to joints`);
    }
}

// ═══════════════════════════════════════════════════════════
// ⏰ TIME CONTROLLER - JavaScript as Vertex Time Manager
// ═══════════════════════════════════════════════════════════

class TimeController {
    constructor() {
        // JavaScript controls TIME for all vertices
        this.globalTime = 0;
        this.deltaTime = 0;
        this.lastFrame = performance.now();
        
        // Time can flow forward OR backward
        this.timeDirection = 1;         // 1 = forward, -1 = backward
        this.timeScale = 1.0;            // Speed multiplier
        
        console.log('⏰ Time controller initialized');
    }
    
    /**
     * Update time - JavaScript's core responsibility
     * Time iteration can go BOTH directions
     */
    update() {
        const now = performance.now();
        this.deltaTime = ((now - this.lastFrame) / 1000) * this.timeDirection * this.timeScale;
        this.globalTime += this.deltaTime;
        this.lastFrame = now;
        
        return {
            time: this.globalTime,
            delta: this.deltaTime,
            direction: this.timeDirection > 0 ? 'forward' : 'backward'
        };
    }
    
    /**
     * Reverse time flow - JavaScript can read backwards!
     */
    reverseTime() {
        this.timeDirection *= -1;
        console.log(`⏱️ Time flowing ${this.timeDirection > 0 ? 'FORWARD' : 'BACKWARD'}`);
    }
    
    /**
     * Jump to specific time coordinate
     */
    seekTo(targetTime) {
        this.globalTime = targetTime;
        console.log(`⏩ Jumped to time: ${targetTime.toFixed(3)}s`);
    }
}

// ═══════════════════════════════════════════════════════════
// 🎯 MULTIPLE CONTROLLER - Reach ALL Vertices Simultaneously
// ═══════════════════════════════════════════════════════════

class MultipleController {
    constructor() {
        // "Multiple" = operate on ALL vertices at once
        this.vertices = [];
        this.operations = [];
        
        console.log('🎯 Multiple controller initialized');
    }
    
    /**
     * Apply operation to ALL vertices simultaneously
     * This is the "multiple" concept - not sequential, PARALLEL
     */
    applyToAll(operation) {
        console.log(`🌐 Applying to ${this.vertices.length} vertices simultaneously...`);
        
        const startTime = performance.now();
        
        // Use Promise.all for true parallel execution
        const operations = this.vertices.map((vertex, index) => {
            return new Promise((resolve) => {
                // Apply operation
                const result = operation(vertex, index);
                resolve({ index, result });
            });
        });
        
        return Promise.all(operations).then(results => {
            const endTime = performance.now();
            console.log(`✅ ${results.length} vertices processed in ${(endTime - startTime).toFixed(2)}ms`);
            return results;
        });
    }
    
    /**
     * Scale ALL vertices by factor
     * Multiple reaches out to enlarge every point
     */
    scaleAll(factor) {
        return this.applyToAll((vertex, index) => {
            vertex.scale *= factor;
            return vertex.scale;
        });
    }
    
    /**
     * Transform ALL vertices through function
     */
    transformAll(transformFn) {
        return this.applyToAll(transformFn);
    }
    
    /**
     * Register vertices for multiple control
     */
    registerVertices(vertices) {
        this.vertices = vertices;
        console.log(`🔗 Registered ${vertices.length} vertices for multiple control`);
    }
}

// ═══════════════════════════════════════════════════════════
// 🎼 ORCHESTRATOR - Combine All Iteration Layers
// ═══════════════════════════════════════════════════════════

class IterationOrchestrator {
    constructor() {
        // Initialize all layers
        this.breathing = new BreathingController();
        this.joints = new JointController();
        this.time = new TimeController();
        this.multiple = new MultipleController();
        
        // Create vertex array (shared by all systems)
        this.vertices = [];
        for (let i = 0; i < 100; i++) {
            this.vertices.push({
                index: i,
                position: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
                scale: 1.0,
                rotation: { shoulder: 0, elbow: 0, hip: 0, knee: 0 }
            });
        }
        
        // Share vertices with all systems
        this.breathing.vertices = this.vertices;
        this.joints.vertices = this.vertices;
        this.multiple.registerVertices(this.vertices);
        
        // Assign vertices to different systems
        // Breathing controls chest/torso (indices 0-19)
        this.breathing.registerVertices([...Array(20).keys()]);
        
        // Joints control limbs (indices 20-79)
        this.joints.registerVertices([...Array(60).keys()].map(i => i + 20));
        
        console.log('🎼 Orchestrator initialized - all layers connected');
    }
    
    /**
     * Main update loop - coordinates all iteration layers
     */
    update() {
        // 1. Update time (JavaScript's domain)
        const timeData = this.time.update();
        
        // 2. Update breathing (micro-iteration)
        const breathValue = this.breathing.update(timeData.delta);
        
        // 3. Update joints (macro-iteration)
        const jointAngles = this.joints.update(timeData.delta);
        
        // Log state every 60 frames (1 second)
        if (Math.floor(timeData.time * 60) % 60 === 0) {
            console.log(`
═══════════════════════════════════════
⏱️  Time: ${timeData.time.toFixed(2)}s (${timeData.direction})
🌊 Breath: ${(breathValue * 100).toFixed(1)}% (${this.breathing.activeVertices.size} vertices)
🦴 Joint State: ${this.joints.state}
   - Shoulder: ${jointAngles.shoulder.toFixed(3)} rad
   - Hip: ${jointAngles.hip.toFixed(3)} rad
═══════════════════════════════════════
            `);
        }
        
        return {
            time: timeData,
            breath: breathValue,
            joints: jointAngles,
            vertices: this.vertices
        };
    }
    
    /**
     * Demonstrate "multiple" - enlarge ALL vertices
     */
    enlargeAll(factor = 1.5) {
        console.log(`🔬 MULTIPLE: Enlarging all ${this.vertices.length} vertices by ${factor}x...`);
        return this.multiple.scaleAll(factor);
    }
    
    /**
     * Start the iteration engine
     */
    start() {
        console.log('🚀 Starting iteration engine...\n');
        
        let frameCount = 0;
        const maxFrames = 300; // Run for 5 seconds at 60 Hz
        
        const loop = () => {
            this.update();
            
            frameCount++;
            if (frameCount < maxFrames) {
                setTimeout(loop, 16.67); // 60 Hz
            } else {
                console.log('\n⏹️  Iteration engine stopped');
                this.demonstrateMultiple();
            }
        };
        
        loop();
    }
    
    /**
     * Demonstrate the "multiple" concept
     */
    demonstrateMultiple() {
        console.log('\n═══════════════════════════════════════');
        console.log('🎯 DEMONSTRATING MULTIPLE');
        console.log('═══════════════════════════════════════\n');
        
        // Show original scales
        console.log('Original vertex scales (first 10):');
        this.vertices.slice(0, 10).forEach(v => {
            console.log(`  Vertex ${v.index}: scale=${v.scale.toFixed(3)}`);
        });
        
        // Apply multiple operation
        this.enlargeAll(2.0).then(results => {
            console.log('\nAfter 2x enlargement:');
            results.slice(0, 10).forEach(r => {
                console.log(`  Vertex ${r.index}: scale=${r.result.toFixed(3)}`);
            });
            
            console.log('\n✅ Multiple reached ALL vertices simultaneously!');
        });
    }
}

// ═══════════════════════════════════════════════════════════
// 🧪 EXECUTION
// ═══════════════════════════════════════════════════════════

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  META-PROGRAMMING ITERATION SYSTEM                        ║
║  ─────────────────────────────────────────────────────    ║
║  Breathing  = Micro-iteration (60 Hz)                     ║
║  Joints     = Macro-iteration (state machine)             ║
║  Time       = JavaScript controls (forward/backward)      ║
║  Multiple   = Reach ALL vertices (parallel)               ║
╚═══════════════════════════════════════════════════════════╝
`);

// Create and start the orchestrator
const orchestrator = new IterationOrchestrator();

// Export for use in other systems
if (typeof window !== 'undefined') {
    window.orchestrator = orchestrator;
    console.log('💡 Access via: window.orchestrator');
    console.log('💡 Commands:');
    console.log('   orchestrator.start()           - Start engine');
    console.log('   orchestrator.time.reverseTime() - Reverse time');
    console.log('   orchestrator.enlargeAll(3.0)   - Scale all vertices');
} else {
    // Node.js export
    module.exports = { IterationOrchestrator, BreathingController, JointController, TimeController, MultipleController };
}

/**
 * ═══════════════════════════════════════════════════════════
 * INSIGHTS FROM YOUR OBSERVATION:
 * ═══════════════════════════════════════════════════════════
 * 
 * 1. Markdown asterisks (*) as coordinate stops:
 *    - Each * could mark a vertex point
 *    - Headers (#) are major anchors
 *    - Backticks (`) are code boundaries
 *    - These ARE navigation coordinates!
 * 
 * 2. Functions stay intact:
 *    - function = stable block
 *    - Don't iterate INSIDE functions
 *    - Iterate BETWEEN them
 * 
 * 3. JavaScript reads time:
 *    - Can go forward (normal)
 *    - Can go backward (time.reverseTime())
 *    - Controls vertex time coordinates
 * 
 * 4. Breathing vs Joint work:
 *    - Same system CAN control both
 *    - Different iteration frequencies
 *    - Micro (breathing) nested in Macro (joints)
 * 
 * 5. Multiple reaches ALL vertices:
 *    - Not sequential iteration
 *    - Parallel operation
 *    - Enlarges every point simultaneously
 *    - Promise.all() = true multiple
 * 
 * ═══════════════════════════════════════════════════════════
 */
