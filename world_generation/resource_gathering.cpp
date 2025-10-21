#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <random>
#include <ctime>
#include <algorithm>
#include <chrono>
#include <cmath>

/**
 * PIXELVERSE RESOURCE GATHERING CORE
 * Language: C++17
 *
 * Purpose:
 *  - Simulate gathering cycles with physics-aware depletion
 *  - Coordinate regeneration timers via chrono clock
 *  - Provide native performance for large scale simulations
 *
 * Usage:
 *  ResourceManager manager(seed);
 *  manager.addResourceNode({"forest_oak", ResourceType::Wood, 100, 12.0f, 45.0f});
 *  manager.update(deltaSeconds);
 *  manager.harvest("player_001", "forest_oak", 15);
 */

namespace pixelverse {

enum class ResourceType {
    Wood,
    Stone,
    Fiber,
    Crystal,
    Ore,
    Essence
};

struct ResourceNode {
    std::string id;               // unique identifier in world grid
    ResourceType type;            // wood, stone, etc.
    int capacity;                 // total remaining units
    float regenerationRate;       // units per minute
    float hardness;               // affects tool efficiency
    bool depleted = false;
    float cooldownTimer = 0.0f;   // seconds until available again
    float position[3];            // world coordinates
};

struct HarvestEvent {
    std::string playerId;
    std::string nodeId;
    ResourceType type;
    int amount;
    std::chrono::steady_clock::time_point timestamp;
};

class ResourceManager {
public:
    explicit ResourceManager(uint32_t seed = std::random_device{}())
        : randomEngine(seed) {
        std::cout << "[ResourceManager] Initialized with seed: " << seed << std::endl;
    }

    void addResourceNode(const ResourceNode& node) {
        nodes.emplace(node.id, node);
        std::cout << "  → Added node " << node.id << " (capacity: " << node.capacity << ")" << std::endl;
    }

    bool harvest(const std::string& playerId, const std::string& nodeId, int requestedAmount) {
        auto it = nodes.find(nodeId);
        if (it == nodes.end()) {
            std::cerr << "[Harvest] Node not found: " << nodeId << std::endl;
            return false;
        }

        ResourceNode& node = it->second;
        if (node.depleted || node.capacity <= 0) {
            std::cout << "[Harvest] Node " << nodeId << " is depleted." << std::endl;
            return false;
        }

        int gathered = computeHarvestAmount(node, requestedAmount);
        node.capacity -= gathered;

        if (node.capacity <= 0) {
            node.capacity = 0;
            node.depleted = true;
            node.cooldownTimer = baseCooldown(node.type);
            std::cout << "[Harvest] Node " << nodeId << " depleted. Cooldown: " << node.cooldownTimer << "s" << std::endl;
        }

        HarvestEvent evt{playerId, nodeId, node.type, gathered, std::chrono::steady_clock::now()};
        events.push_back(evt);

        std::cout << "[Harvest] Player " << playerId << " gathered " << gathered << " units from " << nodeId << std::endl;
        return gathered > 0;
    }

    void update(float deltaSeconds) {
        for (auto& [id, node] : nodes) {
            if (node.depleted) {
                node.cooldownTimer -= deltaSeconds;
                if (node.cooldownTimer <= 0.0f) {
                    node.depleted = false;
                    node.cooldownTimer = 0.0f;
                    node.capacity = static_cast<int>(node.regenerationRate * regenWindowMinutes);
                    std::cout << "[ResourceManager] Node " << id << " regenerated to " << node.capacity << std::endl;
                }
            } else {
                float regen = node.regenerationRate * (deltaSeconds / 60.0f);
                node.capacity = std::min(node.capacity + static_cast<int>(regen), maxCapacity(node.type));
            }
        }
    }

    const std::vector<HarvestEvent>& history() const { return events; }

private:
    std::unordered_map<std::string, ResourceNode> nodes;
    std::vector<HarvestEvent> events;
    std::mt19937 randomEngine;

    static constexpr float regenWindowMinutes = 5.0f;

    int computeHarvestAmount(const ResourceNode& node, int requested) {
        float efficiency = toolEfficiency(node.type, node.hardness);
        float randomness = distribution(randomEngine);
        int result = static_cast<int>(requested * efficiency * randomness);
        return std::clamp(result, 1, node.capacity);
    }

    float toolEfficiency(ResourceType type, float hardness) const {
        float base = 1.0f - std::min(hardness / 100.0f, 0.9f);
        switch (type) {
            case ResourceType::Wood: return base + 0.1f;
            case ResourceType::Stone: return base * 0.8f;
            case ResourceType::Ore: return base * 0.6f;
            case ResourceType::Crystal: return base * 0.5f;
            default: return base;
        }
    }

    int maxCapacity(ResourceType type) const {
        switch (type) {
            case ResourceType::Wood: return 500;
            case ResourceType::Stone: return 350;
            case ResourceType::Ore: return 200;
            case ResourceType::Crystal: return 120;
            default: return 250;
        }
    }

    float baseCooldown(ResourceType type) const {
        switch (type) {
            case ResourceType::Wood: return 60.0f;     // 1 minute
            case ResourceType::Stone: return 120.0f;   // 2 minutes
            case ResourceType::Ore: return 180.0f;     // 3 minutes
            case ResourceType::Crystal: return 240.0f; // 4 minutes
            default: return 90.0f;
        }
    }

    std::uniform_real_distribution<float> distribution{0.75f, 1.25f};
};

} // namespace pixelverse

#ifdef PIXELVERSE_RESOURCE_GATHERING_DEMO
int main() {
    using namespace pixelverse;

    ResourceManager manager;
    manager.addResourceNode({"forest_oak_001", ResourceType::Wood, 300, 24.0f, 20.0f, false, 0.0f, {1000.0f, 0.0f, 2000.0f}});
    manager.addResourceNode({"mountain_vein_01", ResourceType::Ore, 150, 8.0f, 65.0f, false, 0.0f, {500.0f, 50.0f, 800.0f}});

    manager.harvest("player_alpha", "forest_oak_001", 40);
    manager.update(30.0f); // half a minute
    manager.harvest("player_alpha", "mountain_vein_01", 25);

    return 0;
}
#endif
