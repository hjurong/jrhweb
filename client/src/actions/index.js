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

export const mapLoaded = data => ({
  type: 'MAP_LOADED',
  data
})

export const mapPlacenameChanged = data => ({
  type: 'MAP_PLACENAME_CHANGED',
  data
})

export const mapCenterChanged = data => ({
  type: 'MAP_CENTER_CHANGED',
  data
})

export const mapMarkerClicked = data => ({
  type: 'MAP_MARKER_CLICKED',
  data
})

export const mapThumbnailClicked = data => ({
  type: 'MAP_THUMBNAIL_CLICKED',
  data
})

export const blogFormSubmitted = data => ({
  type: 'BLOG_FORM_SUBMITTED',
  data
})

export const blogFormCancelled = data => ({
  type: 'BLOG_FORM_CANCELLED',
  data
})

export const blogPostEditClicked = data => ({
  type: 'BLOG_POST_EDIT_CLICKED',
  data
})

export const blogPostLoaded = data => ({
  type: 'BLOG_POST_LOADED',
  data
})
