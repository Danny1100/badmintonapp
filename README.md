# Badmintonapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

## Purpose

To automate the competitive matchmaking system at badminton socials

## Functionality

- Ability to add and remove courts
- Ability to add and remove players with their name and skill level
- Ability to automatically matchmake the list of waiting players into groups of 4 based on their skill level as well as who has waited the longest
- Ability to lock in custom groups when running the matchmaking algorithm

## How the matchmaking algorithm works:

### Ignoring the custom courts and linked players functionality:

1. Organise players into groups of skill level. e.g. [cracked1, cracked2, strong1, strong2, strong3, good1, good2, amateur1, etc.]
2. Shuffle the players within each skill level (this is to ensure players do not play with the same people all the time). e.g. [cracked2, cracked1, strong1, strong3, strong2, good1, good2, amateur1, etc.]
3. Iterate through the list in order and make every four people chosen a court. e.g in the above example the next court would be [cracked2, cracked1, strong1, strong3]
4. Groups are then organised in play order based on whoever in the group has been waiting the longest. e.g. if the two queued courts are [cracked2, cracked1, strong1, strong3] and [strong2, good1, good2, amateur1] if amateur 1 has been waiting the longest, their group will be first in the queue, followed by the other group.

### Including the custom courts functionality

1. Players in a custom court are excluded from steps 1 and 2 above.
2. After step 3 above, the custom groups are added to the groups calculated in group 3 and then the rest of the algorithm is run as normal

### Including the linked players functionality

1. Linked players are excluded from steps 1 and 2 above (they are not added to the list of players arranged by skill level)
2. Before performing step 3 above, the algorithm loops through all linked players and compares them to the created list, and finds the people closest in skill level to the linked players and generates a group.
3. After all linked players are in a group then the algorithm above will run as normal. The linked player groups and custom groups are added in and organised by wait time as normal.

### Note

The matchmaking algorithm is called when:

- a player is added or removed
- a custom court is added or removed
- a linked player group is added or removed
- you press the next players button on a court

## Flaws in the matchmaking algorithm:

- When the number of players isn't divisible by 4, the players left over at the end will not see game time. Test this by having 4 cracked players and 1 strong player. The strong player does not see play. This does not happen if you have enough players (4+) in each skill group.
