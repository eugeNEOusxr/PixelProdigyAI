/**
 * Object Metadata Generator
 * Categorizes and assigns gameplay stats to all 99,640 VLS objects
 * C++ for high-performance batch processing
 */

#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <string>
#include <random>
#include <cmath>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <chrono>

// Object category
enum class ObjectCategory {
    FURNITURE,      // 15,000 objects - Chairs, tables, beds, etc.
    WEAPONS,        // 12,000 objects - Swords, bows, staves, etc.
    ARMOR,          // 18,000 objects - Helmets, chestplates, boots, etc.
    VEHICLES,       // 8,000 objects - Horses, carts, ships, etc.
    RESOURCES,      // 20,000 objects - Trees, rocks, plants, etc.
    DECORATIONS,    // 26,640 objects - Non-interactive props
    CONTAINERS,     // Chests, barrels, crates
    CONSUMABLES,    // Potions, food, scrolls
    MATERIALS,      // Crafting materials
    QUEST_ITEMS     // Special quest-related items
};

// Rarity tiers
enum class Rarity {
    COMMON,         // 70% - White
    UNCOMMON,       // 20% - Green
    RARE,           // 7% - Blue
    EPIC,           // 2.5% - Purple
    LEGENDARY,      // 0.5% - Orange
    MYTHIC          // 0.01% - Red
};

// Equipment slot
enum class EquipSlot {
    NONE,
    HEAD, CHEST, LEGS, FEET,
    WEAPON_MAIN, WEAPON_OFF,
    BACK, SHOULDERS, HANDS,
    WAIST, NECK, FINGER
};

// Object metadata structure
struct ObjectMetadata {
    std::string id;
    std::string name;
    std::string description;
    ObjectCategory category;
    Rarity rarity;
    
    // Gameplay stats
    int level;
    int price;
    float weight;
    int stackSize;
    
    // Equipment stats
    EquipSlot equipSlot;
    int damage;
    int defense;
    int durability;
    int strength;
    int agility;
    int intelligence;
    int vitality;
    
    // Requirements
    int requiredLevel;
    std::string requiredClass;
    std::string requiredSkill;
    
    // Interaction
    std::string interactionType;
    float interactionTime;
    int interactionYield;
    
    // Spawning
    std::string biome;
    float spawnChance;
    int respawnTime;
    
    // VLS reference
    std::string vlsFile;
    std::string textureFile;
    
    ObjectMetadata() : 
        level(1), price(0), weight(0), stackSize(1),
        equipSlot(EquipSlot::NONE), damage(0), defense(0), 
        durability(0), strength(0), agility(0), intelligence(0), vitality(0),
        requiredLevel(1), interactionTime(0), interactionYield(0),
        spawnChance(1.0f), respawnTime(0) {}
};

// Random generator
class RandomGenerator {
private:
    std::mt19937 gen;
    std::uniform_real_distribution<float> dist;
    
public:
    RandomGenerator() : gen(std::random_device{}()), dist(0.0f, 1.0f) {}
    
    float random() {
        return dist(gen);
    }
    
    int randomInt(int min, int max) {
        return min + static_cast<int>(random() * (max - min + 1));
    }
    
    Rarity randomRarity() {
        float roll = random();
        if (roll < 0.7f) return Rarity::COMMON;
        if (roll < 0.9f) return Rarity::UNCOMMON;
        if (roll < 0.97f) return Rarity::RARE;
        if (roll < 0.995f) return Rarity::EPIC;
        if (roll < 0.9999f) return Rarity::LEGENDARY;
        return Rarity::MYTHIC;
    }
};

// Object Metadata Generator
class ObjectMetadataGenerator {
private:
    RandomGenerator rng;
    std::vector<ObjectMetadata> objects;
    std::map<ObjectCategory, int> categoryCounts;
    
    // Category target counts
    const std::map<ObjectCategory, int> targetCounts = {
        {ObjectCategory::FURNITURE, 15000},
        {ObjectCategory::WEAPONS, 12000},
        {ObjectCategory::ARMOR, 18000},
        {ObjectCategory::VEHICLES, 8000},
        {ObjectCategory::RESOURCES, 20000},
        {ObjectCategory::DECORATIONS, 26640}
    };
    
    // Name prefixes by category
    std::vector<std::string> furniturePrefixes = {
        "Oak", "Pine", "Mahogany", "Birch", "Ebony", "Ivory", "Velvet", "Silk"
    };
    
    std::vector<std::string> weaponPrefixes = {
        "Iron", "Steel", "Silver", "Gold", "Mithril", "Dragon", "Demon", "Ancient"
    };
    
    std::vector<std::string> armorPrefixes = {
        "Leather", "Chain", "Plate", "Scale", "Royal", "Knight's", "Ranger's", "Mage's"
    };
    
    std::vector<std::string> vehiclePrefixes = {
        "Swift", "Sturdy", "Royal", "War", "Merchant's", "Explorer's", "Racing"
    };
    
    std::vector<std::string> resourcePrefixes = {
        "Common", "Rich", "Ancient", "Magical", "Rare", "Abundant"
    };
    
public:
    ObjectMetadataGenerator() {
        for (auto& pair : targetCounts) {
            categoryCounts[pair.first] = 0;
        }
    }
    
    void generateAllObjects() {
        auto start = std::chrono::high_resolution_clock::now();
        
        std::cout << "=== Generating Object Metadata ===" << std::endl;
        
        // Generate each category
        generateFurniture(15000);
        generateWeapons(12000);
        generateArmor(18000);
        generateVehicles(8000);
        generateResources(20000);
        generateDecorations(26640);
        
        auto end = std::chrono::high_resolution_clock::now();
        float duration = std::chrono::duration<float>(end - start).count();
        
        std::cout << "\n✓ Generated " << objects.size() << " objects in " 
                  << duration << " seconds" << std::endl;
        std::cout << "Rate: " << (objects.size() / duration) << " objects/sec" << std::endl;
    }
    
    void generateFurniture(int count) {
        std::cout << "\nGenerating furniture (" << count << ")..." << std::endl;
        
        std::vector<std::string> types = {
            "Chair", "Table", "Bed", "Desk", "Bookshelf", "Cabinet", 
            "Chest", "Bench", "Stool", "Wardrobe", "Couch", "Dresser"
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "furniture_" + std::to_string(i + 1);
            obj.category = ObjectCategory::FURNITURE;
            obj.rarity = Rarity::COMMON;
            
            // Random type and prefix
            std::string prefix = furniturePrefixes[rng.randomInt(0, furniturePrefixes.size() - 1)];
            std::string type = types[rng.randomInt(0, types.size() - 1)];
            obj.name = prefix + " " + type;
            obj.description = "A " + obj.name + " for decoration or use";
            
            // Stats
            obj.level = rng.randomInt(1, 50);
            obj.price = rng.randomInt(10, 500);
            obj.weight = rng.randomInt(5, 100) / 10.0f;
            obj.stackSize = 1;
            
            // Interaction
            obj.interactionType = "use";
            obj.interactionTime = 0.5f;
            
            // VLS reference
            obj.vlsFile = "generated_objects/furniture/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/furniture/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::FURNITURE]++;
        }
        
        std::cout << "✓ Generated " << count << " furniture items" << std::endl;
    }
    
    void generateWeapons(int count) {
        std::cout << "\nGenerating weapons (" << count << ")..." << std::endl;
        
        std::vector<std::string> types = {
            "Sword", "Axe", "Mace", "Dagger", "Spear", "Bow", 
            "Crossbow", "Staff", "Wand", "Hammer", "Greatsword"
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "weapon_" + std::to_string(i + 1);
            obj.category = ObjectCategory::WEAPONS;
            obj.rarity = rng.randomRarity();
            
            // Random type and prefix
            std::string prefix = weaponPrefixes[rng.randomInt(0, weaponPrefixes.size() - 1)];
            std::string type = types[rng.randomInt(0, types.size() - 1)];
            obj.name = prefix + " " + type;
            obj.description = "A weapon of " + prefix + " quality";
            
            // Base stats by level
            obj.level = rng.randomInt(1, 100);
            obj.requiredLevel = std::max(1, obj.level - 5);
            
            // Rarity multipliers
            float rarityMult = getRarityMultiplier(obj.rarity);
            
            // Weapon stats
            obj.damage = static_cast<int>(obj.level * 2 * rarityMult);
            obj.durability = rng.randomInt(50, 200);
            obj.price = static_cast<int>(obj.level * 10 * rarityMult);
            obj.weight = rng.randomInt(10, 50) / 10.0f;
            obj.stackSize = 1;
            
            // Stat bonuses
            obj.strength = rng.randomInt(0, static_cast<int>(obj.level * rarityMult / 5));
            obj.agility = rng.randomInt(0, static_cast<int>(obj.level * rarityMult / 5));
            
            // Equipment slot
            obj.equipSlot = EquipSlot::WEAPON_MAIN;
            
            // Class requirements (some weapons)
            if (rng.random() > 0.7f) {
                std::vector<std::string> classes = {"Warrior", "Mage", "Rogue", "Cleric"};
                obj.requiredClass = classes[rng.randomInt(0, classes.size() - 1)];
            }
            
            // VLS reference
            obj.vlsFile = "generated_objects/weapons/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/weapons/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::WEAPONS]++;
        }
        
        std::cout << "✓ Generated " << count << " weapons" << std::endl;
    }
    
    void generateArmor(int count) {
        std::cout << "\nGenerating armor (" << count << ")..." << std::endl;
        
        std::vector<std::pair<std::string, EquipSlot>> types = {
            {"Helmet", EquipSlot::HEAD},
            {"Chestplate", EquipSlot::CHEST},
            {"Leggings", EquipSlot::LEGS},
            {"Boots", EquipSlot::FEET},
            {"Gauntlets", EquipSlot::HANDS},
            {"Pauldrons", EquipSlot::SHOULDERS},
            {"Belt", EquipSlot::WAIST}
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "armor_" + std::to_string(i + 1);
            obj.category = ObjectCategory::ARMOR;
            obj.rarity = rng.randomRarity();
            
            // Random type and prefix
            std::string prefix = armorPrefixes[rng.randomInt(0, armorPrefixes.size() - 1)];
            auto typePair = types[rng.randomInt(0, types.size() - 1)];
            obj.name = prefix + " " + typePair.first;
            obj.description = "Protective armor made from " + prefix;
            
            // Base stats by level
            obj.level = rng.randomInt(1, 100);
            obj.requiredLevel = std::max(1, obj.level - 5);
            
            // Rarity multipliers
            float rarityMult = getRarityMultiplier(obj.rarity);
            
            // Armor stats
            obj.defense = static_cast<int>(obj.level * 3 * rarityMult);
            obj.durability = rng.randomInt(100, 300);
            obj.price = static_cast<int>(obj.level * 8 * rarityMult);
            obj.weight = rng.randomInt(15, 80) / 10.0f;
            obj.stackSize = 1;
            
            // Stat bonuses
            obj.vitality = rng.randomInt(0, static_cast<int>(obj.level * rarityMult / 4));
            obj.strength = rng.randomInt(0, static_cast<int>(obj.level * rarityMult / 6));
            
            // Equipment slot
            obj.equipSlot = typePair.second;
            
            // VLS reference
            obj.vlsFile = "generated_objects/armor/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/armor/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::ARMOR]++;
        }
        
        std::cout << "✓ Generated " << count << " armor pieces" << std::endl;
    }
    
    void generateVehicles(int count) {
        std::cout << "\nGenerating vehicles (" << count << ")..." << std::endl;
        
        std::vector<std::string> types = {
            "Horse", "Cart", "Wagon", "Carriage", "Ship", "Boat", 
            "Raft", "Chariot", "Sled", "Airship"
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "vehicle_" + std::to_string(i + 1);
            obj.category = ObjectCategory::VEHICLES;
            obj.rarity = rng.randomRarity();
            
            // Random type and prefix
            std::string prefix = vehiclePrefixes[rng.randomInt(0, vehiclePrefixes.size() - 1)];
            std::string type = types[rng.randomInt(0, types.size() - 1)];
            obj.name = prefix + " " + type;
            obj.description = "A " + prefix + " " + type + " for travel";
            
            // Stats
            obj.level = rng.randomInt(1, 60);
            obj.requiredLevel = std::max(1, obj.level - 3);
            float rarityMult = getRarityMultiplier(obj.rarity);
            
            obj.price = static_cast<int>(obj.level * 100 * rarityMult);
            obj.weight = 0; // Vehicles aren't carried
            obj.stackSize = 1;
            
            // Speed bonus (represented as agility)
            obj.agility = rng.randomInt(10, 50);
            
            // Interaction
            obj.interactionType = "mount";
            obj.interactionTime = 2.0f;
            
            // VLS reference
            obj.vlsFile = "generated_objects/vehicles/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/vehicles/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::VEHICLES]++;
        }
        
        std::cout << "✓ Generated " << count << " vehicles" << std::endl;
    }
    
    void generateResources(int count) {
        std::cout << "\nGenerating resources (" << count << ")..." << std::endl;
        
        std::vector<std::string> types = {
            "Tree", "Rock", "Iron Vein", "Gold Vein", "Silver Vein",
            "Herb", "Plant", "Flower", "Mushroom", "Crystal",
            "Coal Deposit", "Copper Vein", "Bush", "Shrub"
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "resource_" + std::to_string(i + 1);
            obj.category = ObjectCategory::RESOURCES;
            obj.rarity = rng.randomRarity();
            
            // Random type and prefix
            std::string prefix = resourcePrefixes[rng.randomInt(0, resourcePrefixes.size() - 1)];
            std::string type = types[rng.randomInt(0, types.size() - 1)];
            obj.name = prefix + " " + type;
            obj.description = "A source of " + type + " materials";
            
            // Stats
            obj.level = rng.randomInt(1, 80);
            obj.requiredLevel = std::max(1, obj.level - 10);
            float rarityMult = getRarityMultiplier(obj.rarity);
            
            obj.price = 0; // Resources are harvested, not bought
            obj.weight = rng.randomInt(1, 20) / 10.0f;
            obj.stackSize = 1;
            
            // Gathering
            obj.interactionType = "gather";
            obj.interactionTime = rng.randomInt(30, 100) / 10.0f;
            obj.interactionYield = rng.randomInt(1, 10);
            
            // Respawn
            obj.respawnTime = rng.randomInt(60, 600); // 1-10 minutes
            
            // Biome spawning
            std::vector<std::string> biomes = {
                "forest", "plains", "mountains", "desert", "tundra", "swamp"
            };
            obj.biome = biomes[rng.randomInt(0, biomes.size() - 1)];
            obj.spawnChance = rng.random();
            
            // Skill requirement (optional)
            if (rng.random() > 0.5f) {
                std::vector<std::string> skills = {
                    "Mining", "Woodcutting", "Herbalism", "Fishing"
                };
                obj.requiredSkill = skills[rng.randomInt(0, skills.size() - 1)];
            }
            
            // VLS reference
            obj.vlsFile = "generated_objects/resources/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/resources/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::RESOURCES]++;
        }
        
        std::cout << "✓ Generated " << count << " resource nodes" << std::endl;
    }
    
    void generateDecorations(int count) {
        std::cout << "\nGenerating decorations (" << count << ")..." << std::endl;
        
        std::vector<std::string> types = {
            "Statue", "Vase", "Painting", "Rug", "Tapestry", "Candle",
            "Lantern", "Pot", "Basket", "Crate", "Barrel", "Sign",
            "Flag", "Banner", "Column", "Archway", "Fountain"
        };
        
        for (int i = 0; i < count; i++) {
            ObjectMetadata obj;
            obj.id = "decoration_" + std::to_string(i + 1);
            obj.category = ObjectCategory::DECORATIONS;
            obj.rarity = Rarity::COMMON;
            
            // Random type
            std::string type = types[rng.randomInt(0, types.size() - 1)];
            obj.name = type;
            obj.description = "A decorative " + type;
            
            // Stats
            obj.level = 1;
            obj.price = rng.randomInt(1, 100);
            obj.weight = rng.randomInt(1, 50) / 10.0f;
            obj.stackSize = rng.randomInt(1, 10);
            
            // Non-interactive
            obj.interactionType = "none";
            
            // VLS reference
            obj.vlsFile = "generated_objects/decorations/" + obj.id + ".vls";
            obj.textureFile = "generated_objects/decorations/" + obj.id + "_diffuse.png";
            
            objects.push_back(obj);
            categoryCounts[ObjectCategory::DECORATIONS]++;
        }
        
        std::cout << "✓ Generated " << count << " decorations" << std::endl;
    }
    
    float getRarityMultiplier(Rarity rarity) {
        switch (rarity) {
            case Rarity::COMMON: return 1.0f;
            case Rarity::UNCOMMON: return 1.5f;
            case Rarity::RARE: return 2.0f;
            case Rarity::EPIC: return 3.0f;
            case Rarity::LEGENDARY: return 5.0f;
            case Rarity::MYTHIC: return 10.0f;
            default: return 1.0f;
        }
    }
    
    std::string getRarityString(Rarity rarity) {
        switch (rarity) {
            case Rarity::COMMON: return "common";
            case Rarity::UNCOMMON: return "uncommon";
            case Rarity::RARE: return "rare";
            case Rarity::EPIC: return "epic";
            case Rarity::LEGENDARY: return "legendary";
            case Rarity::MYTHIC: return "mythic";
            default: return "common";
        }
    }
    
    std::string getCategoryString(ObjectCategory cat) {
        switch (cat) {
            case ObjectCategory::FURNITURE: return "furniture";
            case ObjectCategory::WEAPONS: return "weapons";
            case ObjectCategory::ARMOR: return "armor";
            case ObjectCategory::VEHICLES: return "vehicles";
            case ObjectCategory::RESOURCES: return "resources";
            case ObjectCategory::DECORATIONS: return "decorations";
            default: return "unknown";
        }
    }
    
    std::string getEquipSlotString(EquipSlot slot) {
        switch (slot) {
            case EquipSlot::HEAD: return "head";
            case EquipSlot::CHEST: return "chest";
            case EquipSlot::LEGS: return "legs";
            case EquipSlot::FEET: return "feet";
            case EquipSlot::WEAPON_MAIN: return "weapon_main";
            case EquipSlot::WEAPON_OFF: return "weapon_off";
            case EquipSlot::BACK: return "back";
            case EquipSlot::SHOULDERS: return "shoulders";
            case EquipSlot::HANDS: return "hands";
            case EquipSlot::WAIST: return "waist";
            case EquipSlot::NECK: return "neck";
            case EquipSlot::FINGER: return "finger";
            default: return "none";
        }
    }
    
    void exportToJSON(const std::string& filename) {
        std::cout << "\nExporting to JSON..." << std::endl;
        
        std::ofstream file(filename);
        file << "{\n";
        file << "  \"version\": \"1.0\",\n";
        file << "  \"generated\": \"" << std::time(nullptr) << "\",\n";
        file << "  \"totalObjects\": " << objects.size() << ",\n";
        file << "  \"objects\": [\n";
        
        for (size_t i = 0; i < objects.size(); i++) {
            const auto& obj = objects[i];
            file << "    {\n";
            file << "      \"id\": \"" << obj.id << "\",\n";
            file << "      \"name\": \"" << obj.name << "\",\n";
            file << "      \"description\": \"" << obj.description << "\",\n";
            file << "      \"category\": \"" << getCategoryString(obj.category) << "\",\n";
            file << "      \"rarity\": \"" << getRarityString(obj.rarity) << "\",\n";
            file << "      \"level\": " << obj.level << ",\n";
            file << "      \"price\": " << obj.price << ",\n";
            file << "      \"weight\": " << obj.weight << ",\n";
            file << "      \"stackSize\": " << obj.stackSize << ",\n";
            file << "      \"equipSlot\": \"" << getEquipSlotString(obj.equipSlot) << "\",\n";
            file << "      \"damage\": " << obj.damage << ",\n";
            file << "      \"defense\": " << obj.defense << ",\n";
            file << "      \"durability\": " << obj.durability << ",\n";
            file << "      \"strength\": " << obj.strength << ",\n";
            file << "      \"agility\": " << obj.agility << ",\n";
            file << "      \"intelligence\": " << obj.intelligence << ",\n";
            file << "      \"vitality\": " << obj.vitality << ",\n";
            file << "      \"requiredLevel\": " << obj.requiredLevel << ",\n";
            file << "      \"requiredClass\": \"" << obj.requiredClass << "\",\n";
            file << "      \"requiredSkill\": \"" << obj.requiredSkill << "\",\n";
            file << "      \"interactionType\": \"" << obj.interactionType << "\",\n";
            file << "      \"interactionTime\": " << obj.interactionTime << ",\n";
            file << "      \"interactionYield\": " << obj.interactionYield << ",\n";
            file << "      \"biome\": \"" << obj.biome << "\",\n";
            file << "      \"spawnChance\": " << obj.spawnChance << ",\n";
            file << "      \"respawnTime\": " << obj.respawnTime << ",\n";
            file << "      \"vlsFile\": \"" << obj.vlsFile << "\",\n";
            file << "      \"textureFile\": \"" << obj.textureFile << "\"\n";
            file << "    }" << (i < objects.size() - 1 ? "," : "") << "\n";
        }
        
        file << "  ]\n";
        file << "}\n";
        file.close();
        
        std::cout << "✓ Exported to " << filename << std::endl;
    }
    
    void printStatistics() {
        std::cout << "\n=== Object Statistics ===" << std::endl;
        
        // Category counts
        std::cout << "\nCategory Distribution:" << std::endl;
        for (const auto& pair : categoryCounts) {
            std::cout << "  " << getCategoryString(pair.first) << ": " 
                      << pair.second << std::endl;
        }
        
        // Rarity distribution
        std::map<Rarity, int> rarityCount;
        for (const auto& obj : objects) {
            rarityCount[obj.rarity]++;
        }
        
        std::cout << "\nRarity Distribution:" << std::endl;
        for (const auto& pair : rarityCount) {
            float percentage = (pair.second * 100.0f) / objects.size();
            std::cout << "  " << getRarityString(pair.first) << ": " 
                      << pair.second << " (" << std::fixed << std::setprecision(2) 
                      << percentage << "%)" << std::endl;
        }
        
        // Level distribution
        int avgLevel = 0;
        int minLevel = 999, maxLevel = 0;
        for (const auto& obj : objects) {
            avgLevel += obj.level;
            if (obj.level < minLevel) minLevel = obj.level;
            if (obj.level > maxLevel) maxLevel = obj.level;
        }
        avgLevel /= objects.size();
        
        std::cout << "\nLevel Range:" << std::endl;
        std::cout << "  Min: " << minLevel << std::endl;
        std::cout << "  Max: " << maxLevel << std::endl;
        std::cout << "  Average: " << avgLevel << std::endl;
        
        // Price statistics
        long long totalValue = 0;
        for (const auto& obj : objects) {
            totalValue += obj.price;
        }
        
        std::cout << "\nEconomy:" << std::endl;
        std::cout << "  Total item value: " << totalValue << " gold" << std::endl;
        std::cout << "  Average item value: " << (totalValue / objects.size()) << " gold" << std::endl;
    }
};

int main() {
    std::cout << "╔════════════════════════════════════════════╗" << std::endl;
    std::cout << "║   VLS Object Metadata Generator           ║" << std::endl;
    std::cout << "║   99,640 Objects → Gameplay Integration   ║" << std::endl;
    std::cout << "╚════════════════════════════════════════════╝" << std::endl;
    
    ObjectMetadataGenerator generator;
    
    // Generate all objects
    generator.generateAllObjects();
    
    // Print statistics
    generator.printStatistics();
    
    // Export to JSON
    generator.exportToJSON("object_metadata.json");
    
    std::cout << "\n✓ Object metadata generation complete!" << std::endl;
    std::cout << "Next step: Load metadata into gameplay systems" << std::endl;
    
    return 0;
}
