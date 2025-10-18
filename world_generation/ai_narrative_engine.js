/**
 * PIXELVERSE AI NARRATIVE ENGINE (Node.js)
 * =======================================================================
 * Dynamic storytelling system that generates narratives based on:
 * - Player actions and combat outcomes
 * - AI personality types
 * - World events and consequences
 * - Character transformations (hero ↔ villain)
 * =======================================================================
 */

const fs = require('fs');
const path = require('path');

// ==========================================
// NARRATIVE TEMPLATES
// ==========================================

class NarrativeEngine {
    constructor() {
        this.storyArcs = new Map();
        this.characterMemories = new Map();
        this.worldEvents = [];
        this.narrativeHistory = [];
        
        this.initializeTemplates();
    }
    
    initializeTemplates() {
        // Combat outcome narratives
        this.combatNarratives = {
            victory: {
                aggressive: [
                    "{winner} unleashed a relentless assault, overwhelming {loser} with raw power.",
                    "With brutal efficiency, {winner} crushed {loser}'s defenses and emerged victorious.",
                    "{winner}'s aggressive tactics left {loser} no chance to counter."
                ],
                defensive: [
                    "{winner} patiently waited for the perfect opening, then struck decisively.",
                    "Through careful defense, {winner} exhausted {loser} before delivering the final blow.",
                    "{winner}'s impenetrable guard frustrated {loser} until victory was inevitable."
                ],
                tactical: [
                    "{winner} exploited {loser}'s weaknesses with surgical precision.",
                    "By analyzing every move, {winner} orchestrated {loser}'s downfall.",
                    "{winner}'s strategic brilliance outmaneuvered {loser} at every turn."
                ],
                chaotic: [
                    "In a whirlwind of unpredictable attacks, {winner} somehow prevailed over {loser}.",
                    "{winner}'s erratic fighting style confused {loser} beyond recovery.",
                    "Chaos reigned as {winner} defeated {loser} through sheer unpredictability."
                ],
                berserker: [
                    "Pushed to the brink, {winner} erupted with unstoppable rage, overwhelming {loser}.",
                    "{winner}'s fury grew with each wound, finally consuming {loser} entirely.",
                    "Blood-soaked and unrelenting, {winner} carved through {loser}'s defenses."
                ]
            },
            
            defeat: {
                aggressive: [
                    "{loser}'s aggressive advance left them exposed to {winner}'s counter.",
                    "Overconfidence led {loser} to underestimate {winner}, sealing their fate.",
                    "{loser} charged forward recklessly, walking straight into {winner}'s trap."
                ],
                defensive: [
                    "{loser}'s defensive stance proved too passive against {winner}'s onslaught.",
                    "While {loser} waited for an opening, {winner} found multiple breaches.",
                    "{loser}'s cautious approach allowed {winner} to control the battle."
                ]
            }
        };
        
        // Transformation narratives
        this.transformationNarratives = {
            heroToVillain: [
                "{name}'s noble intentions have been corrupted by power and betrayal.",
                "Once a beacon of hope, {name} now embraces the darkness they once fought.",
                "The line between hero and villain blurred until {name} crossed it entirely.",
                "{name}'s quest for justice twisted into a thirst for vengeance.",
                "Disillusioned by the world's cruelty, {name} became the monster they hunted."
            ],
            villainToHero: [
                "{name} found redemption in an unexpected moment of compassion.",
                "The darkness in {name}'s heart was pierced by a single act of kindness.",
                "Haunted by their past, {name} chose a new path toward redemption.",
                "{name} realized the futility of destruction and sought to atone.",
                "A spark of their former self reignited, transforming {name} into a hero once more."
            ],
            powerAwakening: [
                "Ancient power dormant within {name} surged forth in their moment of need.",
                "{name} transcended mortal limits, unlocking abilities beyond comprehension.",
                "The universe itself seemed to respond to {name}'s will.",
                "A forgotten legacy awakened in {name}, granting them godlike power.",
                "{name}'s true potential shattered all known limits."
            ]
        };
        
        // Dynamic quest generation
        this.questTemplates = {
            revenge: {
                title: "The Price of {resource}",
                description: "After {villain} stole the sacred {resource}, {hero} vowed to reclaim it at any cost.",
                objectives: ["Track {villain} through the {biome}", "Defeat {villain} in combat", "Recover the {resource}"]
            },
            rescue: {
                title: "Shadows of {location}",
                description: "{innocent} has been captured by {villain}. Only {hero} can navigate the dangers of {location}.",
                objectives: ["Infiltrate {location}", "Defeat {villain}'s minions", "Rescue {innocent}"]
            },
            discovery: {
                title: "The {artifact} Prophecy",
                description: "Ancient texts speak of {artifact}, hidden in {location}. {hero} seeks its power.",
                objectives: ["Decipher the ancient map", "Journey to {location}", "Claim {artifact}"]
            },
            betrayal: {
                title: "Broken Bonds",
                description: "{ally} has turned against {hero}, joining forces with {villain}. Trust lies shattered.",
                objectives: ["Confront {ally}", "Uncover the truth", "Choose: Redemption or Retribution"]
            }
        };
    }
    
    // ==========================================
    // NARRATIVE GENERATION
    // ==========================================
    
    generateCombatNarrative(winner, loser, combatData) {
        const personality = winner.personality || 'aggressive';
        const templates = this.combatNarratives.victory[personality] || 
                         this.combatNarratives.victory.aggressive;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        let narrative = template
            .replace(/{winner}/g, winner.name)
            .replace(/{loser}/g, loser.name);
        
        // Add context based on combat details
        if (combatData.isCriticalFinish) {
            narrative += " The final blow was a devastating critical strike that echoed across the battlefield.";
        }
        
        if (combatData.comboCount > 5) {
            narrative += ` A ${combatData.comboCount}-hit combo left no room for ${loser.name} to recover.`;
        }
        
        if (combatData.healthRemaining < 10) {
            narrative += ` ${winner.name} survived by a thread, battered but unbroken.`;
        }
        
        // Store in history
        this.narrativeHistory.push({
            type: 'combat',
            winner: winner.entityId,
            loser: loser.entityId,
            narrative,
            timestamp: Date.now()
        });
        
        return narrative;
    }
    
    generateTransformationNarrative(character, fromAlignment, toAlignment, trigger) {
        let templates;
        if (fromAlignment === 'hero' && toAlignment === 'villain') {
            templates = this.transformationNarratives.heroToVillain;
        } else if (fromAlignment === 'villain' && toAlignment === 'hero') {
            templates = this.transformationNarratives.villainToHero;
        } else {
            templates = this.transformationNarratives.powerAwakening;
        }
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        let narrative = template.replace(/{name}/g, character.name);
        
        // Add trigger context
        if (trigger) {
            narrative += ` ${trigger.description}`;
        }
        
        // Generate consequences
        const consequences = this.generateConsequences(character, toAlignment);
        narrative += ` ${consequences}`;
        
        this.narrativeHistory.push({
            type: 'transformation',
            characterId: character.entityId,
            fromAlignment,
            toAlignment,
            narrative,
            timestamp: Date.now()
        });
        
        return narrative;
    }
    
    generateConsequences(character, alignment) {
        const consequences = [
            `Allies who once trusted ${character.name} now view them with ${alignment === 'villain' ? 'fear' : 'hope'}.`,
            `The world will ${alignment === 'villain' ? 'tremble' : 'celebrate'} at ${character.name}'s transformation.`,
            `${character.name}'s new path will reshape the fate of the PixelVerse.`,
            `Those who knew ${character.name} before can hardly recognize them now.`
        ];
        
        return consequences[Math.floor(Math.random() * consequences.length)];
    }
    
    generateDynamicQuest(hero, context) {
        const questTypes = Object.keys(this.questTemplates);
        const questType = questTypes[Math.floor(Math.random() * questTypes.length)];
        const template = this.questTemplates[questType];
        
        // Fill in variables with world context
        const variables = {
            hero: hero.name,
            villain: this.selectVillain(context),
            resource: this.selectResource(),
            location: this.selectLocation(context),
            biome: this.selectBiome(),
            artifact: this.selectArtifact(),
            innocent: this.selectInnocent(),
            ally: this.selectAlly(hero)
        };
        
        const quest = {
            id: `quest_${Date.now()}`,
            type: questType,
            title: this.fillTemplate(template.title, variables),
            description: this.fillTemplate(template.description, variables),
            objectives: template.objectives.map(obj => this.fillTemplate(obj, variables)),
            narrative: this.generateQuestNarrative(questType, variables),
            rewards: this.generateRewards(questType),
            timestamp: Date.now()
        };
        
        return quest;
    }
    
    fillTemplate(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        return result;
    }
    
    generateQuestNarrative(questType, variables) {
        const narratives = {
            revenge: `${variables.hero}'s blood boiled as they learned of ${variables.villain}'s treachery. The ${variables.resource} was more than an object—it was a symbol of everything they fought to protect. Now, the hunt begins.`,
            
            rescue: `Screams echoed from ${variables.location} as ${variables.innocent} disappeared into the shadows. ${variables.hero} knew the risks, but hesitation was not an option. Some bonds are worth dying for.`,
            
            discovery: `The ${variables.artifact} whispered to ${variables.hero} in dreams, calling from the depths of ${variables.location}. Power beyond imagination awaited—but so did unspeakable dangers.`,
            
            betrayal: `Trust shattered like glass when ${variables.ally} removed their mask, revealing allegiance to ${variables.villain}. ${variables.hero} stood at a crossroads: vengeance or mercy? The choice would define their very soul.`
        };
        
        return narratives[questType] || "A new adventure awaits.";
    }
    
    // ==========================================
    // WORLD STATE TRACKING
    // ==========================================
    
    recordEvent(eventType, data) {
        const event = {
            type: eventType,
            data,
            timestamp: Date.now(),
            consequences: []
        };
        
        // Generate consequences based on event type
        switch (eventType) {
            case 'city_destroyed':
                event.consequences.push(`Refugees flee from ${data.cityName}, seeking shelter elsewhere.`);
                event.consequences.push(`The economy collapses in regions dependent on ${data.cityName}.`);
                break;
                
            case 'alliance_formed':
                event.consequences.push(`${data.faction1} and ${data.faction2} unite, reshaping the political landscape.`);
                break;
                
            case 'artifact_discovered':
                event.consequences.push(`The ${data.artifactName} radiates power, attracting heroes and villains alike.`);
                break;
        }
        
        this.worldEvents.push(event);
        
        // Propagate consequences to active story arcs
        this.updateStoryArcs(event);
        
        return event;
    }
    
    updateStoryArcs(event) {
        for (const [arcId, arc] of this.storyArcs) {
            // Check if event affects this story arc
            if (arc.affectedBy.includes(event.type)) {
                arc.events.push(event);
                arc.narrative += ` ${this.generateArcUpdate(arc, event)}`;
            }
        }
    }
    
    generateArcUpdate(arc, event) {
        return `In response to ${event.type}, the balance of power shifted dramatically.`;
    }
    
    // ==========================================
    // CHARACTER MEMORY & RELATIONSHIPS
    // ==========================================
    
    updateCharacterMemory(characterId, memory) {
        if (!this.characterMemories.has(characterId)) {
            this.characterMemories.set(characterId, {
                battles: [],
                encounters: [],
                allies: [],
                enemies: [],
                transformations: [],
                emotionalState: 'neutral'
            });
        }
        
        const memories = this.characterMemories.get(characterId);
        
        if (memory.type === 'battle') {
            memories.battles.push(memory);
            
            // Update emotional state based on outcome
            if (memory.won) {
                memories.emotionalState = memory.wasClose ? 'determined' : 'confident';
            } else {
                memories.emotionalState = 'vengeful';
            }
        }
        
        return memories;
    }
    
    getCharacterRelationship(char1Id, char2Id) {
        const memories = this.characterMemories.get(char1Id);
        if (!memories) return 'neutral';
        
        if (memories.allies.includes(char2Id)) return 'allied';
        if (memories.enemies.includes(char2Id)) return 'hostile';
        
        return 'neutral';
    }
    
    // ==========================================
    // HELPER METHODS
    // ==========================================
    
    selectVillain(context) {
        const villains = ['Shadow Lord', 'Corrupted Sage', 'Void Serpent', 'Dark Alchemist', 'Chaos Bringer'];
        return villains[Math.floor(Math.random() * villains.length)];
    }
    
    selectResource() {
        const resources = ['Crystal Heart', 'Phoenix Tear', 'Dragon Scale', 'Eternal Flame', 'Void Shard'];
        return resources[Math.floor(Math.random() * resources.length)];
    }
    
    selectLocation(context) {
        const locations = ['Obsidian Fortress', 'Whispering Catacombs', 'Sky Temple', 'Abyssal Ruins', 'Frozen Citadel'];
        return locations[Math.floor(Math.random() * locations.length)];
    }
    
    selectBiome() {
        const biomes = ['Crimson Wastes', 'Crystal Forests', 'Volcanic Peaks', 'Shadow Marshes', 'Celestial Plains'];
        return biomes[Math.floor(Math.random() * biomes.length)];
    }
    
    selectArtifact() {
        const artifacts = ['Crown of Eternity', 'Blade of Destiny', 'Amulet of Souls', 'Staff of Realms', 'Orb of Truth'];
        return artifacts[Math.floor(Math.random() * artifacts.length)];
    }
    
    selectInnocent() {
        const innocents = ['village elder', 'lost child', 'captured healer', 'imprisoned scholar', 'enslaved miner'];
        return innocents[Math.floor(Math.random() * innocents.length)];
    }
    
    selectAlly(hero) {
        return `${hero.name}'s trusted companion`;
    }
    
    generateRewards(questType) {
        const rewards = {
            revenge: { experience: 1000, gold: 500, item: 'Avenging Blade' },
            rescue: { experience: 800, gold: 300, reputation: '+500 with rescued faction' },
            discovery: { experience: 1200, artifact: 'legendary', abilityUnlock: true },
            betrayal: { experience: 1500, moralityChoice: true, companionGained: 'maybe' }
        };
        
        return rewards[questType] || { experience: 500, gold: 200 };
    }
    
    // ==========================================
    // EXPORT / SAVE SYSTEM
    // ==========================================
    
    exportNarrativeHistory(filename) {
        const data = {
            narrativeHistory: this.narrativeHistory,
            worldEvents: this.worldEvents,
            characterMemories: Array.from(this.characterMemories.entries()),
            timestamp: Date.now()
        };
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`[Narrative Engine] Exported ${this.narrativeHistory.length} narratives to ${filename}`);
    }
    
    generateWorldSummary() {
        const summary = {
            totalNarratives: this.narrativeHistory.length,
            totalEvents: this.worldEvents.length,
            activeStoryArcs: this.storyArcs.size,
            trackedCharacters: this.characterMemories.size,
            recentEvents: this.worldEvents.slice(-5)
        };
        
        return summary;
    }
}

// ==========================================
// INTEGRATION WITH COMBAT SYSTEM
// ==========================================

class CombatNarrativeIntegration {
    constructor(narrativeEngine) {
        this.narrative = narrativeEngine;
    }
    
    onCombatComplete(winner, loser, combatData) {
        // Generate narrative
        const narrative = this.narrative.generateCombatNarrative(winner, loser, combatData);
        
        // Update character memories
        this.narrative.updateCharacterMemory(winner.entityId, {
            type: 'battle',
            opponent: loser.entityId,
            won: true,
            wasClose: combatData.healthRemaining < 20,
            timestamp: Date.now()
        });
        
        this.narrative.updateCharacterMemory(loser.entityId, {
            type: 'battle',
            opponent: winner.entityId,
            won: false,
            timestamp: Date.now()
        });
        
        // Check for transformation triggers
        if (combatData.consecutiveWins >= 5) {
            this.triggerTransformation(winner, 'powerAwakening', {
                description: `After ${combatData.consecutiveWins} consecutive victories, something within ${winner.name} changed forever.`
            });
        }
        
        if (combatData.killedInnocent) {
            this.triggerTransformation(winner, 'heroToVillain', {
                description: `The death of an innocent broke something in ${winner.name}'s soul.`
            });
        }
        
        return narrative;
    }
    
    triggerTransformation(character, transformationType, trigger) {
        const fromAlignment = character.alignment || 'hero';
        const toAlignment = transformationType === 'heroToVillain' ? 'villain' : 
                           transformationType === 'villainToHero' ? 'hero' : fromAlignment;
        
        const narrative = this.narrative.generateTransformationNarrative(
            character, fromAlignment, toAlignment, trigger
        );
        
        // Apply stat changes based on transformation
        if (toAlignment === 'villain') {
            character.stats.attackPower *= 1.3;
            character.stats.defense *= 0.8;
            character.personality = 'aggressive';
        } else if (toAlignment === 'hero') {
            character.stats.defense *= 1.2;
            character.stats.magicPower *= 1.1;
            character.personality = 'defensive';
        }
        
        character.alignment = toAlignment;
        
        return narrative;
    }
}

// ==========================================
// DEMO / EXPORT
// ==========================================

if (require.main === module) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           AI NARRATIVE ENGINE DEMO                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const engine = new NarrativeEngine();
    
    // Demo characters
    const hero = {
        entityId: 'hero_001',
        name: 'Aria the Brave',
        personality: 'aggressive',
        alignment: 'hero'
    };
    
    const villain = {
        entityId: 'villain_001',
        name: 'Malachar the Corruptor',
        personality: 'tactical',
        alignment: 'villain'
    };
    
    // Generate combat narrative
    console.log('📖 COMBAT NARRATIVE:\n');
    const combatNarrative = engine.generateCombatNarrative(hero, villain, {
        isCriticalFinish: true,
        comboCount: 7,
        healthRemaining: 8
    });
    console.log(combatNarrative);
    console.log();
    
    // Generate transformation
    console.log('⚡ TRANSFORMATION NARRATIVE:\n');
    const transformNarrative = engine.generateTransformationNarrative(
        hero, 'hero', 'villain', 
        { description: 'Betrayed by those she swore to protect.' }
    );
    console.log(transformNarrative);
    console.log();
    
    // Generate quest
    console.log('🗺️  DYNAMIC QUEST:\n');
    const quest = engine.generateDynamicQuest(hero, {});
    console.log(`Title: ${quest.title}`);
    console.log(`Description: ${quest.description}`);
    console.log(`Objectives:`);
    quest.objectives.forEach((obj, i) => console.log(`  ${i + 1}. ${obj}`));
    console.log(`\nNarrative: ${quest.narrative}`);
    console.log();
    
    // Record world event
    console.log('🌍 WORLD EVENT:\n');
    const event = engine.recordEvent('city_destroyed', { cityName: 'Genesis City' });
    console.log(`Event: ${event.type}`);
    console.log(`Consequences:`);
    event.consequences.forEach(c => console.log(`  - ${c}`));
    console.log();
    
    // Export
    const filename = path.join(__dirname, 'narrative_history.json');
    engine.exportNarrativeHistory(filename);
    
    console.log('\n✅ Demo complete!');
}

module.exports = { NarrativeEngine, CombatNarrativeIntegration };
