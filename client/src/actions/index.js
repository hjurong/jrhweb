let nextPostId = 0
export const addPost = text => ({
  type: 'ADD_POST',
  id: nextPostId++,
  text
})

export const setVisibilityFilter = filter => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_ARCHIVED: 'SHOW_ARCHIVED',
  SHOW_LATEST: 'SHOW_LATEST'
}