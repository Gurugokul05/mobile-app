# Fixes Done

## What was fixed

- Moved the buyer and seller taskbars from the bottom to the top using material top tabs.
- Fixed the Home screen "See all" action for "Explore by Place" by linking it to a new places overview screen.
- Fixed the Home screen "See all" action for "Top Trending" by linking it to the existing Trending tab.
- Fixed profile name updates so changes now persist in the auth state and on disk after saving.
- Made the place detail screen safe when route parameters are missing.

## Files Changed

- `mobile/src/navigation/AppNavigator.js`
- `mobile/src/screens/buyer/HomeScreen.js`
- `mobile/src/screens/buyer/ProfileScreen.js`
- `mobile/src/context/AuthContext.js`
- `mobile/src/screens/buyer/PlaceScreen.js`
- `mobile/src/screens/buyer/PlacesScreen.js`

## Dependency Updates

- Added `@react-navigation/material-top-tabs`
- Added `react-native-pager-view`
- Added `react-native-tab-view`

## Notes

- The new places overview screen lets users open a place and then jump into products for that place.
- Profile edits now update the visible username immediately after save.
