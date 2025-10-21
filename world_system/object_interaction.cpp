/**
 * Object Interaction System
 * High-performance C++ raycasting and collision detection for object interactions
 * Handles picking, proximity detection, and interaction validation
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <map>
#include <string>
#include <chrono>

// Vector3 structure
struct Vector3 {
    float x, y, z;
    
    Vector3() : x(0), y(0), z(0) {}
    Vector3(float x, float y, float z) : x(x), y(y), z(z) {}
    
    float length() const {
        return std::sqrt(x*x + y*y + z*z);
    }
    
    Vector3 normalize() const {
        float len = length();
        if (len > 0.0001f) {
            return Vector3(x/len, y/len, z/len);
        }
        return Vector3(0, 0, 0);
    }
    
    Vector3 operator+(const Vector3& v) const {
        return Vector3(x + v.x, y + v.y, z + v.z);
    }
    
    Vector3 operator-(const Vector3& v) const {
        return Vector3(x - v.x, y - v.y, z - v.z);
    }
    
    Vector3 operator*(float s) const {
        return Vector3(x * s, y * s, z * s);
    }
    
    float dot(const Vector3& v) const {
        return x * v.x + y * v.y + z * v.z;
    }
    
    Vector3 cross(const Vector3& v) const {
        return Vector3(
            y * v.z - z * v.y,
            z * v.x - x * v.z,
            x * v.y - y * v.x
        );
    }
};

// Ray structure
struct Ray {
    Vector3 origin;
    Vector3 direction;
    
    Ray(const Vector3& o, const Vector3& d) : origin(o), direction(d.normalize()) {}
    
    Vector3 pointAt(float t) const {
        return origin + direction * t;
    }
};

// Bounding box
struct BoundingBox {
    Vector3 min;
    Vector3 max;
    
    BoundingBox() {}
    BoundingBox(const Vector3& min, const Vector3& max) : min(min), max(max) {}
    
    Vector3 center() const {
        return Vector3(
            (min.x + max.x) * 0.5f,
            (min.y + max.y) * 0.5f,
            (min.z + max.z) * 0.5f
        );
    }
    
    Vector3 size() const {
        return max - min;
    }
    
    bool contains(const Vector3& point) const {
        return point.x >= min.x && point.x <= max.x &&
               point.y >= min.y && point.y <= max.y &&
               point.z >= min.z && point.z <= max.z;
    }
    
    bool intersects(const BoundingBox& other) const {
        return (min.x <= other.max.x && max.x >= other.min.x) &&
               (min.y <= other.max.y && max.y >= other.min.y) &&
               (min.z <= other.max.z && max.z >= other.min.z);
    }
};

// Sphere collider
struct SphereCollider {
    Vector3 center;
    float radius;
    
    SphereCollider(const Vector3& c, float r) : center(c), radius(r) {}
    
    bool contains(const Vector3& point) const {
        return (point - center).length() <= radius;
    }
};

// Object types
enum class ObjectType {
    RESOURCE,      // Trees, rocks, plants
    CONTAINER,     // Chests, barrels, crates
    FURNITURE,     // Chairs, tables, beds
    WEAPON,        // Swords, bows, staves
    ARMOR,         // Helmets, chestplates, boots
    VEHICLE,       // Horses, carts, ships
    NPC,           // Non-player characters
    DOOR,          // Doors, gates
    TRIGGER,       // Quest triggers, zone transitions
    DECORATION     // Non-interactive decorations
};

// Interaction type
enum class InteractionType {
    NONE,
    GATHER,        // E - Gather resources
    LOOT,          // F - Open container/loot
    USE,           // G - Use object (sit, open door)
    TALK,          // T - Talk to NPC
    MOUNT,         // M - Mount vehicle
    EXAMINE        // X - Examine object
};

// Interactive object
struct InteractiveObject {
    std::string id;
    ObjectType type;
    Vector3 position;
    Vector3 rotation;
    BoundingBox bounds;
    SphereCollider interactionRadius;
    InteractionType primaryInteraction;
    std::vector<InteractionType> secondaryInteractions;
    
    // State
    bool isInteractable;
    bool isHighlighted;
    bool isInRange;
    float lastInteractionTime;
    
    // Metadata
    std::string displayName;
    std::string description;
    int requiredLevel;
    std::string requiredItem;
    
    InteractiveObject(
        const std::string& id,
        ObjectType type,
        const Vector3& pos,
        const BoundingBox& bounds
    ) : id(id), type(type), position(pos), bounds(bounds),
        interactionRadius(pos, 3.0f), isInteractable(true), 
        isHighlighted(false), isInRange(false), lastInteractionTime(0),
        requiredLevel(1), primaryInteraction(InteractionType::NONE) {}
};

// Ray-box intersection
struct RayHit {
    bool hit;
    float distance;
    Vector3 point;
    Vector3 normal;
    InteractiveObject* object;
    
    RayHit() : hit(false), distance(INFINITY), object(nullptr) {}
};

// Spatial grid for optimization
class SpatialGrid {
private:
    float cellSize;
    std::map<std::string, std::vector<InteractiveObject*>> grid;
    
    std::string getCellKey(const Vector3& pos) const {
        int x = static_cast<int>(std::floor(pos.x / cellSize));
        int y = static_cast<int>(std::floor(pos.y / cellSize));
        int z = static_cast<int>(std::floor(pos.z / cellSize));
        return std::to_string(x) + "," + std::to_string(y) + "," + std::to_string(z);
    }
    
public:
    SpatialGrid(float cellSize = 10.0f) : cellSize(cellSize) {}
    
    void addObject(InteractiveObject* obj) {
        std::string key = getCellKey(obj->position);
        grid[key].push_back(obj);
    }
    
    void removeObject(InteractiveObject* obj) {
        std::string key = getCellKey(obj->position);
        auto& cell = grid[key];
        cell.erase(std::remove(cell.begin(), cell.end(), obj), cell.end());
    }
    
    std::vector<InteractiveObject*> getObjectsNear(const Vector3& pos, float radius) {
        std::vector<InteractiveObject*> result;
        
        // Check neighboring cells
        int cellRadius = static_cast<int>(std::ceil(radius / cellSize));
        for (int dx = -cellRadius; dx <= cellRadius; dx++) {
            for (int dy = -cellRadius; dy <= cellRadius; dy++) {
                for (int dz = -cellRadius; dz <= cellRadius; dz++) {
                    Vector3 cellPos = pos + Vector3(dx * cellSize, dy * cellSize, dz * cellSize);
                    std::string key = getCellKey(cellPos);
                    
                    if (grid.find(key) != grid.end()) {
                        for (auto* obj : grid[key]) {
                            float dist = (obj->position - pos).length();
                            if (dist <= radius) {
                                result.push_back(obj);
                            }
                        }
                    }
                }
            }
        }
        
        return result;
    }
};

// Object Interaction Manager
class ObjectInteractionManager {
private:
    std::vector<InteractiveObject> objects;
    SpatialGrid spatialGrid;
    Vector3 playerPosition;
    Vector3 playerForward;
    float maxInteractionDistance;
    float raycastDistance;
    InteractiveObject* hoveredObject;
    InteractiveObject* targetedObject;
    
    // Performance tracking
    int raycastCount;
    float lastRaycastTime;
    
public:
    ObjectInteractionManager() 
        : spatialGrid(10.0f), maxInteractionDistance(5.0f),
          raycastDistance(10.0f), hoveredObject(nullptr),
          targetedObject(nullptr), raycastCount(0), lastRaycastTime(0) {}
    
    // Add interactive object
    void addObject(const InteractiveObject& obj) {
        objects.push_back(obj);
        spatialGrid.addObject(&objects.back());
    }
    
    // Ray-AABB intersection test
    bool rayBoxIntersect(const Ray& ray, const BoundingBox& box, float& tMin, float& tMax) {
        Vector3 invDir(1.0f / ray.direction.x, 1.0f / ray.direction.y, 1.0f / ray.direction.z);
        
        float t1 = (box.min.x - ray.origin.x) * invDir.x;
        float t2 = (box.max.x - ray.origin.x) * invDir.x;
        float t3 = (box.min.y - ray.origin.y) * invDir.y;
        float t4 = (box.max.y - ray.origin.y) * invDir.y;
        float t5 = (box.min.z - ray.origin.z) * invDir.z;
        float t6 = (box.max.z - ray.origin.z) * invDir.z;
        
        tMin = std::max(std::max(std::min(t1, t2), std::min(t3, t4)), std::min(t5, t6));
        tMax = std::min(std::min(std::max(t1, t2), std::max(t3, t4)), std::max(t5, t6));
        
        if (tMax < 0 || tMin > tMax) {
            return false;
        }
        
        return true;
    }
    
    // Perform raycast to find object under crosshair
    RayHit raycast(const Vector3& origin, const Vector3& direction, float maxDistance) {
        auto start = std::chrono::high_resolution_clock::now();
        
        RayHit result;
        result.distance = maxDistance;
        
        Ray ray(origin, direction);
        
        // Get objects in range
        auto nearbyObjects = spatialGrid.getObjectsNear(origin, maxDistance);
        
        for (auto* obj : nearbyObjects) {
            if (!obj->isInteractable) continue;
            
            float tMin, tMax;
            if (rayBoxIntersect(ray, obj->bounds, tMin, tMax)) {
                if (tMin < result.distance && tMin > 0) {
                    result.hit = true;
                    result.distance = tMin;
                    result.point = ray.pointAt(tMin);
                    result.object = obj;
                    
                    // Calculate normal (simplified - assumes AABB)
                    Vector3 center = obj->bounds.center();
                    Vector3 toHit = result.point - center;
                    Vector3 size = obj->bounds.size() * 0.5f;
                    
                    if (std::abs(toHit.x) > std::abs(toHit.y) && std::abs(toHit.x) > std::abs(toHit.z)) {
                        result.normal = Vector3(toHit.x > 0 ? 1 : -1, 0, 0);
                    } else if (std::abs(toHit.y) > std::abs(toHit.z)) {
                        result.normal = Vector3(0, toHit.y > 0 ? 1 : -1, 0);
                    } else {
                        result.normal = Vector3(0, 0, toHit.z > 0 ? 1 : -1);
                    }
                }
            }
        }
        
        auto end = std::chrono::high_resolution_clock::now();
        lastRaycastTime = std::chrono::duration<float, std::milli>(end - start).count();
        raycastCount++;
        
        return result;
    }
    
    // Update player position and check for nearby objects
    void updatePlayerPosition(const Vector3& pos, const Vector3& forward) {
        playerPosition = pos;
        playerForward = forward.normalize();
        
        // Update proximity for all nearby objects
        auto nearbyObjects = spatialGrid.getObjectsNear(pos, maxInteractionDistance);
        
        // Reset all objects
        for (auto& obj : objects) {
            obj.isInRange = false;
            obj.isHighlighted = false;
        }
        
        // Mark nearby objects
        for (auto* obj : nearbyObjects) {
            float dist = (obj->position - pos).length();
            if (dist <= obj->interactionRadius.radius) {
                obj->isInRange = true;
            }
        }
        
        // Raycast to find hovered object
        RayHit hit = raycast(pos, forward, raycastDistance);
        
        if (hit.hit && hit.object && hit.object->isInRange) {
            hoveredObject = hit.object;
            hoveredObject->isHighlighted = true;
        } else {
            hoveredObject = nullptr;
        }
    }
    
    // Attempt interaction
    bool interact(InteractionType type) {
        if (!hoveredObject || !hoveredObject->isInRange) {
            return false;
        }
        
        // Check if interaction type is valid for this object
        if (hoveredObject->primaryInteraction != type) {
            bool found = false;
            for (auto& secondary : hoveredObject->secondaryInteractions) {
                if (secondary == type) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        
        // Record interaction time
        hoveredObject->lastInteractionTime = raycastCount * 0.016f; // Approximate time
        
        std::cout << "✓ Interacted with: " << hoveredObject->displayName 
                  << " (Type: " << static_cast<int>(type) << ")" << std::endl;
        
        return true;
    }
    
    // Get objects in radius
    std::vector<InteractiveObject*> getObjectsInRadius(const Vector3& center, float radius) {
        std::vector<InteractiveObject*> result;
        auto nearby = spatialGrid.getObjectsNear(center, radius);
        
        for (auto* obj : nearby) {
            float dist = (obj->position - center).length();
            if (dist <= radius) {
                result.push_back(obj);
            }
        }
        
        return result;
    }
    
    // Get currently hovered object
    InteractiveObject* getHoveredObject() const {
        return hoveredObject;
    }
    
    // Get all objects in interaction range
    std::vector<InteractiveObject*> getInteractableObjects() {
        std::vector<InteractiveObject*> result;
        for (auto& obj : objects) {
            if (obj.isInRange && obj.isInteractable) {
                result.push_back(&obj);
            }
        }
        return result;
    }
    
    // Performance stats
    void printStats() {
        std::cout << "=== Object Interaction Stats ===" << std::endl;
        std::cout << "Total Objects: " << objects.size() << std::endl;
        std::cout << "Raycast Count: " << raycastCount << std::endl;
        std::cout << "Last Raycast Time: " << lastRaycastTime << "ms" << std::endl;
        if (hoveredObject) {
            std::cout << "Hovered: " << hoveredObject->displayName << std::endl;
        }
    }
};

// Example usage and testing
int main() {
    std::cout << "=== Object Interaction System Test ===" << std::endl;
    
    ObjectInteractionManager manager;
    
    // Add test objects
    
    // Tree (resource gathering)
    InteractiveObject tree("tree_001", ObjectType::RESOURCE, 
                          Vector3(5, 0, 0),
                          BoundingBox(Vector3(4.5f, 0, -0.5f), Vector3(5.5f, 3, 0.5f)));
    tree.displayName = "Oak Tree";
    tree.description = "A sturdy oak tree ready for chopping";
    tree.primaryInteraction = InteractionType::GATHER;
    tree.interactionRadius = SphereCollider(tree.position, 3.0f);
    manager.addObject(tree);
    
    // Chest (looting)
    InteractiveObject chest("chest_001", ObjectType::CONTAINER,
                           Vector3(10, 0, 5),
                           BoundingBox(Vector3(9.5f, 0, 4.5f), Vector3(10.5f, 1, 5.5f)));
    chest.displayName = "Wooden Chest";
    chest.description = "A locked wooden chest";
    chest.primaryInteraction = InteractionType::LOOT;
    chest.interactionRadius = SphereCollider(chest.position, 2.5f);
    manager.addObject(chest);
    
    // Chair (furniture)
    InteractiveObject chair("chair_001", ObjectType::FURNITURE,
                           Vector3(3, 0, 8),
                           BoundingBox(Vector3(2.5f, 0, 7.5f), Vector3(3.5f, 1.2f, 8.5f)));
    chair.displayName = "Wooden Chair";
    chair.description = "A comfortable chair";
    chair.primaryInteraction = InteractionType::USE;
    chair.interactionRadius = SphereCollider(chair.position, 2.0f);
    manager.addObject(chair);
    
    // Door
    InteractiveObject door("door_001", ObjectType::DOOR,
                          Vector3(15, 0, 0),
                          BoundingBox(Vector3(14.5f, 0, -0.5f), Vector3(15.5f, 2.5f, 0.5f)));
    door.displayName = "Wooden Door";
    door.description = "A sturdy wooden door";
    door.primaryInteraction = InteractionType::USE;
    door.secondaryInteractions = {InteractionType::EXAMINE};
    door.interactionRadius = SphereCollider(door.position, 2.0f);
    manager.addObject(door);
    
    // Test scenarios
    std::cout << "\n=== Test 1: Player approaching tree ===" << std::endl;
    manager.updatePlayerPosition(Vector3(2, 1.5f, 0), Vector3(1, 0, 0));
    
    auto hovered = manager.getHoveredObject();
    if (hovered) {
        std::cout << "Hovering over: " << hovered->displayName << std::endl;
        std::cout << "Interaction: " << static_cast<int>(hovered->primaryInteraction) << std::endl;
    }
    
    std::cout << "\n=== Test 2: Interact with tree ===" << std::endl;
    bool success = manager.interact(InteractionType::GATHER);
    std::cout << "Interaction success: " << (success ? "YES" : "NO") << std::endl;
    
    std::cout << "\n=== Test 3: Move to chest ===" << std::endl;
    manager.updatePlayerPosition(Vector3(8, 1.5f, 5), Vector3(1, 0, 0));
    
    hovered = manager.getHoveredObject();
    if (hovered) {
        std::cout << "Hovering over: " << hovered->displayName << std::endl;
    }
    
    std::cout << "\n=== Test 4: Get all nearby objects ===" << std::endl;
    auto nearby = manager.getObjectsInRadius(Vector3(5, 0, 5), 10.0f);
    std::cout << "Found " << nearby.size() << " objects within 10m" << std::endl;
    for (auto* obj : nearby) {
        std::cout << "  - " << obj->displayName << std::endl;
    }
    
    std::cout << "\n=== Test 5: Performance test ===" << std::endl;
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < 1000; i++) {
        manager.updatePlayerPosition(
            Vector3(i % 20, 1.5f, (i / 20) % 20),
            Vector3(1, 0, 0)
        );
    }
    auto end = std::chrono::high_resolution_clock::now();
    float totalTime = std::chrono::duration<float, std::milli>(end - start).count();
    
    std::cout << "1000 updates in: " << totalTime << "ms" << std::endl;
    std::cout << "Average per update: " << (totalTime / 1000.0f) << "ms" << std::endl;
    
    manager.printStats();
    
    std::cout << "\n✓ Object interaction system test complete!" << std::endl;
    
    return 0;
}
