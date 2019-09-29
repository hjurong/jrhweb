import { combineReducers } from 'redux'
import posts from './posts'
import map from './map'

export default combineReducers({
  posts,
  map,
})