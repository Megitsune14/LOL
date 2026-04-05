# LOL — Règles de code

## Architecture

- **Moteur** dans `src/game/core/` (World, GameEngine, Quadtree, CurveUtils, constants)
- **Entités** dans `src/game/entities/` — héritent toutes de `BaseEntity` → `SteeringAgent`
- **UI React** dans `src/pages/` et `src/components/` (`.jsx`)
- p5.js en **instance mode** : toujours passer `p` en premier argument des constructeurs

## Style

- ES modules (`import`/`export`), pas de CommonJS
- Pas de point-virgule
- Single quotes pour les strings
- `??` pour les valeurs par défaut, pas `||`
- Classes avec `constructor(p, config = {})` pattern

## Steering Behaviors (Craig Reynolds)

- Les comportements retournent un vecteur force, jamais d'effet de bord
- Combinaison via `applyForce()` puis `integrate()` en fin de `update()`
- `maxSpeed` et `maxForce` contrôlent le véhicule, ne pas les contourner
- Collision rigide (`resolveObstacleCollisions`) séparée du steering

## Game loop

- `World.update()` : physique, IA, collisions — jamais de rendu ici
- `World.render()` : dessin uniquement — jamais de logique ici
- Les entités détruites (`isDestroyed`) sont filtrées en fin d'update

## Lanes

- `laneGuides` = points de contrôle (rendu avec `splineVertex`)
- `lanes` = chemins interpolés Catmull-Rom (path following des minions)
- Toujours garder les deux en sync via `smoothLanes()`
