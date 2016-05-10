import * as Immutable from 'immutable'
import React from 'react'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'

import PluginComponents from '../src/lib/PluginComponents'

describe('PluginComponents', () => {
  describe('with children function', () => {
    it('renders a mix of components, elements, and arrays with props', () => {
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: 'plugin1',
        name: 'Plugin 1',
        components: Immutable.Map({
          Test: <span>hello </span>
        })
      })))
      const World = () => <span>world</span>
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: 'plugin2',
        name: 'Plugin 2',
        components: Immutable.Map({
          Test: [
            <span key="hello">beautiful </span>,
            World
          ]
        })
      })))

      const comp = mount(
        <Provider store={store}>
          <PluginComponents componentKey="Test">
            {pluginComponents => <div>
              well, {pluginComponents}
            </div>}
          </PluginComponents>
        </Provider>
      )

      expect(comp.text()).toBe('well, hello beautiful world')
    })
  })
  describe('without children function', () => {
    it('renders a mix of components, elements, and arrays with props', () => {
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: 'plugin1',
        name: 'Plugin 1',
        components: Immutable.Map({
          Test: <span>hello </span>
        })
      })))
      const World = () => <span>world</span>
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: 'plugin2',
        name: 'Plugin 2',
        components: Immutable.Map({
          Test: [
            <span key="hello">beautiful </span>,
            World
          ]
        })
      })))

      const comp = mount(
        <Provider store={store}>
          <PluginComponents componentKey="Test" />
        </Provider>
      )

      expect(comp.text()).toBe('hello beautiful world')
    })
  })
})
