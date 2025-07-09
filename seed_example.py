import random

def generate_world(seed: str) -> dict:
    # Set the seed for the random number generator
    random.seed(seed)

    # Generate various aspects of the world using the random numbers
    terrain_height = random.randint(50, 100)
    biome = random.choice(['forest', 'desert', 'ocean'])
    resources = [random.choice(['wood', 'stone', 'ore']) for _ in range(10)]

    # Return the generated world data
    return {
        'terrain_height': terrain_height,
        'biome': biome,
        'resources': resources
    }

# Example usage
seed = 'abcd'
for _ in range(10):
  world = generate_world(seed)
  print(world)

