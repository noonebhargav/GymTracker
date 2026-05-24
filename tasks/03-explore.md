# Phase 3: Explore Tab

**Status:** done

## Goal
Browse/search all exercises by body part or equipment. Two collapsible sections with a search bar.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)

## Acceptance Criteria
- [x] Search bar filters across body parts and equipment
- [x] Two collapsible sections: Body Parts (8 groups) and Equipment
- [x] Grid of categories — tap one to see exercises in that category
- [x] Exercise images displayed
- [x] Search updates results in real-time

## Technical Notes
- Uses 8 gold standard body part groups
- Images from assets/exercises/images/
- Exercise data from SQLite exercises table

## Redesign Follow-up

See [Phase 14: Explore Tab Restyling](./14-explore.md) for redesign changes:
- Replace collapsible sections with always-visible 2-column grids
- Add section headers with counts
- Enhance exercise detail with hero illustration and numbered instructions
