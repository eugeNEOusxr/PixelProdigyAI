/**
 * Generate 144 Unique AI Personalities
 * 12 Archetypes × 12 Specializations = 144 unique builders
 * 
 * Names curated from:
 * - Greek Mythology (gods, titans, heroes)
 * - Ancient Philosophers (Socrates, Plato, Aristotle, etc.)
 * - Historical Architects & Artists (Da Vinci, Michelangelo, etc.)
 * - Literary Characters (from classic and modern literature)
 */

const fs = require('fs');
const path = require('path');

// Curated name pools matching personality archetypes
const curatedNames = {
    // Perfectionist Builder - Architects, Engineers, Precision Masters
    perfectionist_builder: [
        'Hephaestus',      // Greek god of craftsmanship
        'Daedalus',        // Master architect of the Labyrinth
        'Vitruvius',       // Roman architect and engineer
        'Imhotep',         // Egyptian architect of pyramids
        'Archimedes',      // Greek mathematician and engineer
        'Leonardo',        // Da Vinci - perfectionist polymath
        'Brunelleschi',    // Renaissance architect
        'Euclid',          // Father of geometry
        'Pythagoras',      // Mathematical perfection
        'Tesla',           // Precision electrical engineer
        'Pacioli',         // Mathematical proportions
        'Apollodorus'      // Architect of Trajan's Column
    ],
    
    // Chaos Artist - Wild, Creative, Unpredictable
    chaos_artist: [
        'Dionysus',        // God of chaos and wine
        'Pan',             // God of wild nature
        'Eris',            // Goddess of chaos
        'Loki',            // Trickster (Norse, but fits)
        'Caravaggio',      // Chaotic baroque artist
        'Pollock',         // Abstract expressionist
        'Dali',            // Surrealist master
        'Rimbaud',         // Rebellious poet
        'Basquiat',        // Neo-expressionist chaos
        'Bosch',           // Hieronymus Bosch - chaotic visions
        'Kafka',           // Absurdist writer
        'Typhon'           // Most deadly creature in Greek myth
    ],
    
    // Zen Simplifier - Minimalist, Efficient, Elegant
    zen_simplifier: [
        'Diogenes',        // Cynic philosopher, extreme minimalist
        'Epicurus',        // Simple pleasures
        'Zeno',            // Stoic founder
        'Seneca',          // Stoic minimalist
        'Marcus',          // Marcus Aurelius - stoic emperor
        'Epictetus',       // Slave turned philosopher
        'Lao',             // Lao Tzu - simplicity master
        'Ockham',          // William of Ockham - "Ockham's Razor"
        'Thoreau',         // Walden - simple living
        'Muji',            // Minimalist design philosophy
        'Tanizaki',        // Japanese aesthetic minimalism
        'Solon'            // Athenian lawgiver, "nothing in excess"
    ],
    
    // Rapid Prototyper - Fast, Iterative, Experimental
    rapid_prototyper: [
        'Hermes',          // Swift messenger god
        'Prometheus',      // Bold innovator
        'Edison',          // Rapid iteration inventor
        'Tesla',           // (Alt) Fast prototyping
        'Brunel',          // Victorian rapid engineer
        'Gutenberg',       // Printing press innovator
        'Bell',            // Telephone rapid development
        'Marconi',         // Radio pioneer
        'Wright',          // Wright brothers - iterative flight
        'Ford',            // Assembly line innovation
        'Turing',          // Rapid computation pioneer
        'Phaethon'         // Reckless speed (son of Helios)
    ],
    
    // Nature Harmonist - Organic, Flowing, Biomimetic
    nature_harmonist: [
        'Demeter',         // Goddess of harvest
        'Persephone',      // Nature's cycle
        'Artemis',         // Goddess of wilderness
        'Gaia',            // Mother Earth
        'Chloris',         // Goddess of flowers
        'Daphne',          // Transformed into laurel tree
        'Silvanus',        // Roman forest god
        'Darwin',          // Natural selection
        'Linnaeus',        // Botanical classification
        'Thoreau',         // (Alt) Nature writer
        'Muir',            // John Muir - naturalist
        'Orpheus'          // Harmony with nature through music
    ],
    
    // Mechanical Genius - Steampunk, Clockwork, Inventive
    mechanical_genius: [
        'Hephaestus',      // (Alt) God of machinery
        'Talos',           // Bronze automaton
        'Daedalus',        // (Alt) Inventor
        'Archimedes',      // (Alt) Mechanical engineer
        'Hero',            // Hero of Alexandria - steam engine
        'Ctesibius',       // Father of pneumatics
        'Vaucanson',       // Automaton creator
        'Babbage',         // Difference engine
        'Watt',            // Steam engine perfection
        'Stephenson',      // Railway pioneer
        'Brunel',          // (Alt) Mechanical engineer
        'Volta'            // Electrical mechanics
    ],
    
    // Magical Theorist - Arcane, Mystical, Theoretical
    magical_theorist: [
        'Hecate',          // Goddess of magic
        'Circe',           // Powerful sorceress
        'Medea',           // Enchantress
        'Orpheus',         // (Alt) Mystical musician
        'Pythia',          // Oracle of Delphi
        'Tiresias',        // Blind prophet
        'Merlin',          // Legendary wizard
        'Flamel',          // Nicolas Flamel - alchemist
        'Paracelsus',      // Alchemist physician
        'Crowley',         // Aleister Crowley - occultist
        'Agrippa',         // Heinrich Agrippa - occult writer
        'Hermes'           // (Alt) Hermes Trismegistus - alchemy
    ],
    
    // Symmetry Obsessed - Perfect Balance, Crystalline
    symmetry_obsessed: [
        'Apollo',          // God of order and beauty
        'Athena',          // Perfect strategy and wisdom
        'Harmonia',        // Goddess of harmony
        'Euclid',          // (Alt) Geometric perfection
        'Fibonacci',       // Mathematical sequences
        'Vitruvius',       // (Alt) Perfect proportions
        'Palladio',        // Symmetrical architecture
        'Mandelbrot',      // Fractal symmetry
        'Escher',          // M.C. Escher - tessellations
        'Kepler',          // Planetary symmetry
        'Plato',           // Platonic solids
        'Chrysippus'       // Stoic logic and order
    ],
    
    // Resourceful Recycler - Adaptive, Scrappy, Efficient
    resourceful_recycler: [
        'Hestia',          // Goddess of hearth and home
        'Vulcan',          // Roman forge god (recycling metals)
        'Prometheus',      // (Alt) Resourceful titan
        'Odysseus',        // Master of adaptability
        'Robinson',        // Robinson Crusoe - survival
        'MacGyver',        // Ultimate improviser
        'Spartan',         // Spartan resourcefulness
        'Hannibal',        // Carthaginian general - resourceful
        'Shackleton',      // Antarctic survival
        'Franklin',        // Ben Franklin - inventive frugality
        'Quintillian',     // Resourceful rhetoric
        'Sisyphus'         // (Ironic) Endless resourcefulness
    ],
    
    // Balanced Thinker - Harmony, Moderation, Wisdom
    balanced_thinker: [
        'Athena',          // (Alt) Wisdom and strategy
        'Themis',          // Goddess of divine law and order
        'Solon',           // (Alt) Balanced lawgiver
        'Aristotle',       // Golden mean philosophy
        'Confucius',       // Balance and harmony
        'Solomon',         // Wise king
        'Aurelius',        // Marcus Aurelius (alt)
        'Pericles',        // Balanced Athenian leader
        'Lycurgus',        // Spartan balanced reforms
        'Thales',          // First philosopher - balance
        'Heraclitus',      // Balance of opposites
        'Chiron'           // Wise centaur - balance of beast/man
    ],
    
    // Surreal Visionary - Dreamlike, Abstract, Otherworldly
    surreal_visionary: [
        'Morpheus',        // God of dreams
        'Hypnos',          // God of sleep
        'Phantasos',       // God of surreal dreams
        'Icarus',          // Ambitious dreamer
        'Cassandra',       // Cursed visionary
        'Dali',            // (Alt) Salvador Dali
        'Blake',           // William Blake - visionary poet
        'Bosch',           // (Alt) Hieronymus Bosch
        'Magritte',        // Surrealist painter
        'Borges',          // Jorge Luis Borges - surreal writer
        'Calvino',         // Italo Calvino - imaginative
        'Eos'              // Goddess of dawn - liminal visions
    ],
    
    // Mathematical Purist - Logic, Precision, Theory
    mathematical_purist: [
        'Pythagoras',      // (Alt) Sacred geometry
        'Euclid',          // (Alt) Pure mathematics
        'Archimedes',      // (Alt) Mathematical genius
        'Hypatia',         // Female mathematician
        'Eratosthenes',    // Measured Earth mathematically
        'Apollonius',      // Conic sections
        'Diophantus',      // Father of algebra
        'Gauss',           // Prince of mathematics
        'Euler',           // Most prolific mathematician
        'Riemann',         // Advanced geometry
        'Noether',         // Emmy Noether - abstract algebra
        'Thales'           // (Alt) First mathematician
    ]
};

// Literary character traits for additional depth
const literaryCharacters = {
    perfectionist: ['Atticus Finch', 'Jean Valjean', 'Sherlock Holmes', 'Professor McGonagall', 'Gandalf', 'Hermione Granger', 'Batman', 'Captain America', 'Mr. Darcy', 'Aragorn'],
    chaotic: ['Tyler Durden', 'Holden Caulfield', 'Captain Jack Sparrow', 'Loki', 'Joker', 'Deadpool', 'Beetlejuice', 'Mad Hatter', 'Puck', 'Ferris Bueller'],
    minimalist: ['Thoreau', 'Siddhartha', 'Bartleby', 'Meursault', 'The Little Prince', 'Frodo', 'Yoda', 'Uncle Iroh', 'Miyagi', 'Dumbledore'],
    rapid: ['Flash', 'Quicksilver', 'Sonic', 'Road Runner', 'Dash', 'Speedy Gonzales', 'Pietro', 'Impulse', 'Kid Flash', 'Mercury'],
    nature: ['Mowgli', 'Tarzan', 'Pocahontas', 'San', 'Radagast', 'Poison Ivy', 'Lorax', 'Fern', 'Johnny Appleseed', 'Mother Nature'],
    mechanical: ['Tony Stark', 'Doc Brown', 'Q', 'Syndrome', 'Hiro', 'Wasabi', 'Donatello', 'Gadget', 'Inspector Gadget', 'WALL-E'],
    magical: ['Dumbledore', 'Gandalf', 'Merlin', 'Doctor Strange', 'Willow', 'Zatanna', 'Constantine', 'Yen Sid', 'Prospero', 'Circe'],
    symmetry: ['Spock', 'Data', 'Vision', 'Dr. Manhattan', 'Sheldon Cooper', 'L', 'Neo', 'Morpheus', 'Oracle', 'Architect'],
    resourceful: ['MacGyver', 'Robinson Crusoe', 'Katniss', 'Bear Grylls', 'Les Stroud', 'Tom Hanks (Cast Away)', 'Matt Damon (Martian)', 'Rick Grimes', 'Daryl Dixon', 'Michonne'],
    balanced: ['Atticus', 'Gandalf', 'Dumbledore', 'Obi-Wan', 'Uncle Iroh', 'Yoda', 'Professor X', 'Jean-Luc Picard', 'Morpheus', 'Mr. Miyagi'],
    surreal: ['Alice', 'Cheshire Cat', 'Willy Wonka', 'Doctor Who', 'Rick Sanchez', 'Salvador Dali', 'Hatter', 'Caterpillar', 'Q', 'Morpheus'],
    mathematical: ['John Nash', 'Alan Turing', 'Katherine Johnson', 'Good Will Hunting', 'Pi', 'Code Breaker', 'Crypto', 'Enigma', 'Mathematician', 'Theorist']
};

// 12 Core Personality Archetypes
const archetypes = [
    {
        type: 'perfectionist_builder',
        baseTraits: { creativity: 85, precision: 98, speed: 45, chaos: 10, resource_efficiency: 85 },
        style: 'geometric_precision',
        growth_rate: 1.2,
        detail: 'high'
    },
    {
        type: 'chaos_artist',
        baseTraits: { creativity: 99, precision: 30, speed: 95, chaos: 98, resource_efficiency: 40 },
        style: 'organic_chaos',
        growth_rate: 2.5,
        detail: 'extreme'
    },
    {
        type: 'zen_simplifier',
        baseTraits: { creativity: 75, precision: 90, speed: 50, chaos: 15, resource_efficiency: 99 },
        style: 'minimal_elegance',
        growth_rate: 0.5,
        detail: 'optimized'
    },
    {
        type: 'rapid_prototyper',
        baseTraits: { creativity: 70, precision: 55, speed: 99, chaos: 60, resource_efficiency: 50 },
        style: 'iterative_rapid',
        growth_rate: 3.0,
        detail: 'low'
    },
    {
        type: 'nature_harmonist',
        baseTraits: { creativity: 85, precision: 70, speed: 60, chaos: 35, resource_efficiency: 95 },
        style: 'biomimetic_flow',
        growth_rate: 1.0,
        detail: 'medium'
    },
    {
        type: 'mechanical_genius',
        baseTraits: { creativity: 92, precision: 85, speed: 65, chaos: 45, resource_efficiency: 70 },
        style: 'steampunk_mechanical',
        growth_rate: 1.5,
        detail: 'high'
    },
    {
        type: 'magical_theorist',
        baseTraits: { creativity: 96, precision: 75, speed: 55, chaos: 70, resource_efficiency: 60 },
        style: 'arcane_geometry',
        growth_rate: 1.3,
        detail: 'high'
    },
    {
        type: 'symmetry_obsessed',
        baseTraits: { creativity: 80, precision: 99, speed: 45, chaos: 5, resource_efficiency: 85 },
        style: 'crystalline_perfect',
        growth_rate: 1.1,
        detail: 'high'
    },
    {
        type: 'resourceful_recycler',
        baseTraits: { creativity: 85, precision: 50, speed: 75, chaos: 80, resource_efficiency: 95 },
        style: 'post_apocalyptic',
        growth_rate: 1.8,
        detail: 'medium'
    },
    {
        type: 'balanced_thinker',
        baseTraits: { creativity: 75, precision: 75, speed: 75, chaos: 50, resource_efficiency: 75 },
        style: 'harmonious_balance',
        growth_rate: 1.0,
        detail: 'medium'
    },
    {
        type: 'surreal_visionary',
        baseTraits: { creativity: 99, precision: 40, speed: 60, chaos: 85, resource_efficiency: 55 },
        style: 'dreamscape_fluid',
        growth_rate: 2.0,
        detail: 'extreme'
    },
    {
        type: 'mathematical_purist',
        baseTraits: { creativity: 85, precision: 99, speed: 40, chaos: 20, resource_efficiency: 88 },
        style: 'mathematical_precision',
        growth_rate: 0.9,
        detail: 'high'
    }
];

// 12 Specialization Domains
const specializations = [
    { domain: 'architecture', focus: 'castles_and_fortresses', biome: 'mountains', directive: 'Build mathematically perfect fortifications with optimal defense angles' },
    { domain: 'nature', focus: 'treehouse_villages', biome: 'forest', directive: 'Grow structures like plants - start small, evolve naturally' },
    { domain: 'mechanical', focus: 'clockwork_towers', biome: 'industrial', directive: 'Build intricate machines with gears, pistons, and moving parts' },
    { domain: 'mystical', focus: 'mage_towers', biome: 'mystical', directive: 'Construct reality-bending structures with impossible angles' },
    { domain: 'aquatic', focus: 'underwater_cities', biome: 'ocean', directive: 'Design structures that flow with ocean currents and marine life patterns' },
    { domain: 'urban', focus: 'megacities', biome: 'urban', directive: 'Maximum population density with optimal traffic flow' },
    { domain: 'celestial', focus: 'space_stations', biome: 'space', directive: 'Build the future - chrome, neon, and hovering platforms' },
    { domain: 'crystalline', focus: 'crystal_caves', biome: 'tundra', directive: 'Perfect crystalline symmetry in every structure' },
    { domain: 'ancient', focus: 'ancient_temples', biome: 'ruins', directive: 'Build as the ancients did - stone by stone, with reverence' },
    { domain: 'elemental', focus: 'wind_spires', biome: 'storm_peaks', directive: 'Harness storms - lightning rods and wind turbines' },
    { domain: 'acoustic', focus: 'amphitheaters', biome: 'canyon', directive: 'Structures that sing - every surface optimized for acoustics' },
    { domain: 'chromatic', focus: 'light_cathedrals', biome: 'rainbow_valley', directive: 'Light and color as building materials' }
];

// Name prefixes (12) and suffixes (12) for variety
const namePrefixes = ['Aria', 'Blaze', 'Coral', 'Dex', 'Echo', 'Flora', 'Gizmo', 'Hex', 'Ice', 'Junk', 'Karma', 'Luna'];
const nameSuffixes = ['Storm', 'Void', 'Nova', 'Prism', 'Quantum', 'Root', 'Sage', 'Opus', 'Metro', 'Spark', 'Zenith', 'Ember'];

// Title generators
const titles = [
    'the Architect', 'the Chaotic', 'the Minimalist', 'the Speed Demon',
    'the Harmonist', 'the Inventor', 'the Mystic', 'the Crystallographer',
    'the Salvager', 'the Philosopher', 'the Dreamweaver', 'the Purist',
    'the Builder', 'the Creator', 'the Shaper', 'the Designer',
    'the Engineer', 'the Artisan', 'the Craftsman', 'the Master',
    'the Visionary', 'the Theorist', 'the Strategist', 'the Tactician'
];

function generatePersonalities() {
    const personalities = [];
    const usedNames = new Set();
    let id = 1;

    // Generate 144 personalities (12 archetypes × 12 specializations)
    for (let a = 0; a < archetypes.length; a++) {
        for (let s = 0; s < specializations.length; s++) {
            const archetype = archetypes[a];
            const specialization = specializations[s];
            
            // Get curated name from matching archetype
            const namePool = curatedNames[archetype.type] || [];
            const baseName = namePool[s % namePool.length] || 'Unknown';
            
            // Add title/domain for uniqueness with better combinations
            let name;
            let attempts = 0;
            do {
                const titleVariants = [
                    `${baseName} the ${specialization.domain.charAt(0).toUpperCase() + specialization.domain.slice(1)}`,
                    `${baseName} of ${specialization.biome.charAt(0).toUpperCase() + specialization.biome.slice(1)}`,
                    `Master ${baseName}`,
                    `${baseName} the ${archetype.detail.charAt(0).toUpperCase() + archetype.detail.slice(1)}`,
                    `${baseName} ${id}`,
                    `${baseName} the Great`,
                    `${baseName} the Wise`,
                    `${baseName} the Bold`,
                    baseName
                ];
                
                // Cycle through title variants to ensure uniqueness
                name = titleVariants[attempts % titleVariants.length];
                attempts++;
            } while (usedNames.has(name) && attempts < 20);
            
            // If still duplicate after 20 attempts, force uniqueness with ID
            if (usedNames.has(name)) {
                name = `${baseName}_${id}`;
            }
            
            usedNames.add(name);
            
            // Add trait variation (±5-15 points for uniqueness)
            const traits = {};
            Object.keys(archetype.baseTraits).forEach(key => {
                const base = archetype.baseTraits[key];
                const variation = Math.floor(Math.random() * 15) - 7;
                traits[key] = Math.max(5, Math.min(99, base + variation));
            });
            
            // Create personality with historical/philosophical context
            const personality = {
                id: `ai_${String(id).padStart(3, '0')}`,
                name: name,
                personality_type: archetype.type,
                traits: traits,
                building_style: archetype.style,
                preferred_biome: specialization.biome,
                focus: specialization.focus,
                realm_seed: 1000 + id,
                specialization: specialization.domain,
                ai_directive: specialization.directive,
                vertex_growth_rate: archetype.growth_rate + (Math.random() * 0.4 - 0.2),
                detail_preference: archetype.detail,
                historical_context: getHistoricalContext(baseName, archetype.type),
                philosophical_quote: getPhilosophicalQuote(archetype.type)
            };
            
            personalities.push(personality);
            id++;
        }
    }

    return personalities;
}

// Historical context for each figure
function getHistoricalContext(name, type) {
    const contexts = {
        'Hephaestus': 'Greek god of fire, metalworking, and craftsmanship. Built the palaces of the gods on Mount Olympus.',
        'Daedalus': 'Legendary craftsman who designed the Labyrinth of Crete. Father of Icarus.',
        'Vitruvius': 'Roman architect whose De Architectura defined principles of architecture for millennia.',
        'Archimedes': 'Greek mathematician and engineer. Invented the Archimedean screw and discovered principles of leverage.',
        'Leonardo': 'Leonardo da Vinci - Renaissance polymath. Painter, architect, inventor, scientist.',
        'Dionysus': 'Greek god of wine, chaos, and ecstasy. Represents liberation from mundane reality.',
        'Pan': 'Greek god of the wild, shepherds, and rustic music. Embodies untamed nature.',
        'Diogenes': 'Cynic philosopher who lived in a barrel. Rejected material possessions entirely.',
        'Epicurus': 'Founded philosophy of pleasure through simple living and friendship.',
        'Hermes': 'Greek messenger god. Swift, clever, and adaptable. Conductor of souls.',
        'Prometheus': 'Titan who stole fire from gods to give to humanity. Champion of innovation.',
        'Demeter': 'Greek goddess of harvest and agriculture. Represents the cycle of growth.',
        'Gaia': 'Primordial Greek goddess personifying the Earth itself.',
        'Hero': 'Hero of Alexandria - invented the first steam engine (aeolipile) in 1st century AD.',
        'Hecate': 'Greek goddess of magic, crossroads, and necromancy. Triple-faced goddess.',
        'Circe': 'Powerful sorceress from Homer\'s Odyssey. Transformed men into animals.',
        'Apollo': 'Greek god of music, poetry, art, prophecy, and order. Epitome of balance.',
        'Athena': 'Greek goddess of wisdom, strategy, and just warfare. Born from Zeus\' head fully armored.',
        'Odysseus': 'Hero of Homer\'s Odyssey. Master of cunning and resourcefulness.',
        'Aristotle': 'Greek philosopher who founded the Lyceum. Advocate of the "Golden Mean".',
        'Morpheus': 'Greek god of dreams. Shapes and forms the dreams of mortals.',
        'Pythagoras': 'Greek philosopher and mathematician. Founded Pythagoreanism, believed "all is number".',
        'Euclid': 'Father of geometry. Wrote Elements, most influential mathematics textbook in history.',
        'Hypatia': 'Alexandrian mathematician, astronomer, and philosopher. First recorded female mathematician.',
        'Solon': 'Athenian statesman and poet. One of the Seven Sages. "Nothing in excess."',
        'Plato': 'Greek philosopher. Founded the Academy. Student of Socrates, teacher of Aristotle.',
        'Thales': 'Pre-Socratic philosopher. First to use deductive reasoning. "Know thyself."',
        'Seneca': 'Stoic philosopher and statesman. "It is not because things are difficult that we do not dare."',
        'Marcus': 'Marcus Aurelius - Roman emperor and Stoic philosopher. Wrote Meditations.',
        'Confucius': 'Chinese philosopher. Founded Confucianism emphasizing morality and social harmony.',
        'Tesla': 'Nikola Tesla - Serbian-American inventor. Pioneered AC electricity and wireless communication.',
        'Edison': 'Thomas Edison - American inventor. Held 1,093 patents. "Genius is 1% inspiration, 99% perspiration."',
        'Darwin': 'Charles Darwin - Naturalist who proposed theory of evolution by natural selection.',
        'Gauss': 'Carl Friedrich Gauss - "Prince of Mathematicians". Contributions to number theory and statistics.',
        'Euler': 'Leonhard Euler - Most prolific mathematician. Wrote 866 papers and books.',
        'Imhotep': 'Egyptian architect who designed the first pyramid (Step Pyramid of Djoser).',
        'Vulcan': 'Roman god of fire and forge. Equivalent to Greek Hephaestus.',
        'Fibonacci': 'Italian mathematician. Introduced Hindu-Arabic numerals to Europe and the Fibonacci sequence.',
        'Icarus': 'Greek mythology - flew too close to the sun with wax wings. Symbol of ambition and hubris.',
        'Cassandra': 'Trojan princess cursed to speak true prophecies that no one believed.',
        'Dali': 'Salvador Dalí - Spanish surrealist painter. Known for melting clocks and dreamscapes.',
        'Blake': 'William Blake - English poet and painter. Visionary romantic artist.',
        'Borges': 'Jorge Luis Borges - Argentine writer. Master of magical realism and philosophical fiction.',
        'Orpheus': 'Greek legendary musician. His songs could charm all living things and even stones.',
        'Chiron': 'Wisest of all centaurs. Tutor to many Greek heroes including Achilles and Jason.',
        'Sisyphus': 'Greek king condemned to eternally push a boulder uphill. Symbol of absurdism.',
        'Hannibal': 'Carthaginian general who crossed the Alps with war elephants to attack Rome.',
        'Franklin': 'Benjamin Franklin - American polymath. Inventor, scientist, diplomat, and founding father.',
        'Robinson': 'Robinson Crusoe - literary character who survived alone on an island for 28 years.',
        'MacGyver': 'TV character known for solving complex problems with everyday materials.',
        'Shackleton': 'Ernest Shackleton - Antarctic explorer who saved his entire crew against impossible odds.',
        'Thoreau': 'Henry David Thoreau - American philosopher. Lived deliberately at Walden Pond for 2 years.'
    };
    
    return contexts[name] || `Master of ${type.replace(/_/g, ' ')}`;
}

function getPhilosophicalQuote(type) {
    const quotes = {
        'perfectionist_builder': '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle',
        'chaos_artist': '"In chaos, there is fertility." - Anaïs Nin',
        'zen_simplifier': '"Simplicity is the ultimate sophistication." - Leonardo da Vinci',
        'rapid_prototyper': '"Move fast and break things." - Mark Zuckerberg',
        'nature_harmonist': '"In every walk with nature, one receives far more than he seeks." - John Muir',
        'mechanical_genius': '"The machine does not isolate man from the great problems of nature but plunges him more deeply into them." - Antoine de Saint-Exupéry',
        'magical_theorist': '"Any sufficiently advanced technology is indistinguishable from magic." - Arthur C. Clarke',
        'symmetry_obsessed': '"Symmetry is what we see at a glance; based on the fact that there is no reason for any difference." - Blaise Pascal',
        'resourceful_recycler': '"Necessity is the mother of invention." - Plato',
        'balanced_thinker': '"The golden mean is the best." - Aristotle',
        'surreal_visionary': '"I don\'t do drugs. I am drugs." - Salvador Dalí',
        'mathematical_purist': '"Mathematics is the language in which God has written the universe." - Galileo Galilei'
    };
    
    return quotes[type] || '"Build with wisdom, create with passion."';
}

// Generate and save
console.log('🤖 Generating 144 AI Personalities...\n');

const personalities = generatePersonalities();

console.log(`✅ Generated ${personalities.length} unique personalities\n`);

// Show summary
const archetypeCounts = {};
const specializationCounts = {};

personalities.forEach(p => {
    archetypeCounts[p.personality_type] = (archetypeCounts[p.personality_type] || 0) + 1;
    specializationCounts[p.specialization] = (specializationCounts[p.specialization] || 0) + 1;
});

console.log('📊 Distribution by Archetype:');
Object.entries(archetypeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
});

console.log('\n📊 Distribution by Specialization:');
Object.entries(specializationCounts).forEach(([spec, count]) => {
    console.log(`   ${spec}: ${count}`);
});

// Show sample personalities
console.log('\n🎭 Sample Personalities:\n');
for (let i = 0; i < 10; i++) {
    const p = personalities[Math.floor(Math.random() * personalities.length)];
    console.log(`${p.name} (${p.id})`);
    console.log(`  Type: ${p.personality_type} | Specialization: ${p.specialization}`);
    console.log(`  Creativity: ${p.traits.creativity} | Precision: ${p.traits.precision} | Speed: ${p.traits.speed}`);
    console.log(`  Directive: "${p.ai_directive}"`);
    console.log('');
}

// Save to file
const output = {
    ai_test_players: personalities,
    meta_ai_curation_rules: {
        priority_order: [
            'direction_over_perfection',
            'efficient_iteration',
            'personality_consistency',
            'resource_optimization',
            'visual_distinctiveness'
        ],
        build_evaluation_criteria: {
            structural_integrity: 0.2,
            aesthetic_appeal: 0.25,
            resource_efficiency: 0.2,
            personality_match: 0.2,
            innovation: 0.15
        },
        intervention_thresholds: {
            low_efficiency: 0.3,
            structural_failure: 0.1,
            personality_deviation: 0.4
        },
        parallel_building: {
            max_concurrent_per_personality: 4,
            total_concurrent_limit: 144,
            queue_strategy: 'priority_weighted'
        }
    },
    system_info: {
        total_personalities: personalities.length,
        archetypes: Object.keys(archetypeCounts).length,
        specializations: Object.keys(specializationCounts).length,
        generated: new Date().toISOString()
    }
};

const outputPath = path.join(__dirname, 'ai_test_players', 'ai_personalities.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n💾 Saved to: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
console.log('\n✨ Generation complete!\n');
