using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// PIXELVERSE CRAFTING SYSTEM (C#)
/// Unity-ready component for managing crafting recipes, stations, and queues.
/// Mirrors the roadmap requirement for resource → object conversion.
/// </summary>
namespace PixelVerse.Gameplay
{
    public enum CraftingStationType
    {
        Workbench,
        Forge,
        AlchemyLab,
        Fabricator,
        SkyRelicStation
    }

    public record ResourceStack(string Id, int Amount);

    public record CraftingRecipe(
        string RecipeId,
        string ResultItemId,
        int ResultAmount,
        CraftingStationType Station,
        IReadOnlyList<ResourceStack> Inputs,
        TimeSpan CraftTime);

    public class CraftingJob
    {
        public CraftingRecipe Recipe { get; }
        public DateTime StartedAt { get; }
        public DateTime FinishesAt { get; }
        public bool Completed => DateTime.UtcNow >= FinishesAt;

        public CraftingJob(CraftingRecipe recipe)
        {
            Recipe = recipe;
            StartedAt = DateTime.UtcNow;
            FinishesAt = StartedAt + recipe.CraftTime;
        }
    }

    public class Inventory
    {
        private readonly Dictionary<string, int> _items = new();

        public bool HasResources(IEnumerable<ResourceStack> stacks) =>
            stacks.All(stack => _items.TryGetValue(stack.Id, out var amount) && amount >= stack.Amount);

        public void Add(ResourceStack stack)
        {
            if (_items.ContainsKey(stack.Id))
                _items[stack.Id] += stack.Amount;
            else
                _items[stack.Id] = stack.Amount;
        }

        public void Remove(ResourceStack stack)
        {
            if (!_items.TryGetValue(stack.Id, out var amount) || amount < stack.Amount)
                throw new InvalidOperationException($"Inventory missing {stack.Id}");

            _items[stack.Id] -= stack.Amount;
            if (_items[stack.Id] <= 0)
                _items.Remove(stack.Id);
        }

        public override string ToString()
        {
            return string.Join(", ", _items.Select(kv => $"{kv.Key}:{kv.Value}"));
        }
    }

    public class CraftingSystem
    {
        private readonly Dictionary<string, CraftingRecipe> _recipes = new();
        private readonly List<CraftingJob> _activeJobs = new();
        private readonly Inventory _inventory;

        public CraftingSystem(Inventory inventory)
        {
            _inventory = inventory;
            SeedCoreRecipes();
        }

        public IReadOnlyCollection<CraftingJob> ActiveJobs => _activeJobs.AsReadOnly();

        public bool TryStartCraft(string recipeId)
        {
            if (!_recipes.TryGetValue(recipeId, out var recipe))
            {
                Console.WriteLine($"[Crafting] Unknown recipe: {recipeId}");
                return false;
            }

            if (!_inventory.HasResources(recipe.Inputs))
            {
                Console.WriteLine($"[Crafting] Missing resources for {recipeId}");
                return false;
            }

            foreach (var input in recipe.Inputs)
                _inventory.Remove(input);

            var job = new CraftingJob(recipe);
            _activeJobs.Add(job);

            Console.WriteLine($"[Crafting] Started {recipeId}, completes at {job.FinishesAt:u}");
            return true;
        }

        public void Update()
        {
            for (int i = _activeJobs.Count - 1; i >= 0; i--)
            {
                var job = _activeJobs[i];
                if (!job.Completed) continue;

                _inventory.Add(new ResourceStack(job.Recipe.ResultItemId, job.Recipe.ResultAmount));
                Console.WriteLine($"[Crafting] Completed {job.Recipe.RecipeId}, awarded {job.Recipe.ResultAmount}x {job.Recipe.ResultItemId}");
                _activeJobs.RemoveAt(i);
            }
        }

        private void SeedCoreRecipes()
        {
            Register(new CraftingRecipe(
                "wood_wall",
                "structure_wall_wood",
                1,
                CraftingStationType.Workbench,
                new[] { new ResourceStack("wood", 10) },
                TimeSpan.FromSeconds(6)));

            Register(new CraftingRecipe(
                "stone_wall",
                "structure_wall_stone",
                1,
                CraftingStationType.Forge,
                new[] {
                    new ResourceStack("stone", 15),
                    new ResourceStack("ore", 5)
                },
                TimeSpan.FromSeconds(12)));

            Register(new CraftingRecipe(
                "sky_torch",
                "light_torch_sky",
                4,
                CraftingStationType.AlchemyLab,
                new[] {
                    new ResourceStack("wood", 2),
                    new ResourceStack("crystal", 1),
                    new ResourceStack("essence", 1)
                },
                TimeSpan.FromSeconds(10)));
        }

        private void Register(CraftingRecipe recipe)
        {
            _recipes[recipe.RecipeId] = recipe;
            Console.WriteLine($"[Crafting] Registered recipe {recipe.RecipeId}");
        }
    }

    /// <summary>
    /// Quick demo harness. Compile this file separately or wrap in UNITY_EDITOR tests.
    /// </summary>
    public static class CraftingDemo
    {
        public static void Run()
        {
            var inventory = new Inventory();
            inventory.Add(new ResourceStack("wood", 50));
            inventory.Add(new ResourceStack("stone", 40));
            inventory.Add(new ResourceStack("crystal", 5));
            inventory.Add(new ResourceStack("essence", 3));

            var system = new CraftingSystem(inventory);
            system.TryStartCraft("wood_wall");
            system.TryStartCraft("sky_torch");

            // simulate time passing, e.g., in Unity Update
            for (int i = 0; i < 20; i++)
            {
                System.Threading.Thread.Sleep(500);
                system.Update();
            }

            Console.WriteLine($"Inventory after crafting: {inventory}");
        }
    }
}

#if PIXELVERSE_CRAFTING_DEMO
public class Program
{
    public static void Main()
    {
        PixelVerse.Gameplay.CraftingDemo.Run();
    }
}
#endif
