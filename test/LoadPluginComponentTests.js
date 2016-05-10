import * as Immutable from 'immutable'
import React, {Component} from 'react'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'

import LoadPluginComponent from '../src/lib/LoadPluginComponent'


class TestView extends Component {
  render() {
    return <h1>TestView</h1>
  }
}

describe('LoadPluginComponent', () => {
  describe('with children function', () => {
    it('loads a plugin component', done => {
      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        load: (store, cb) => cb(null, Immutable.fromJS({
          components: {
            TestView
          }
        }))
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="TestView">
            {spies.children}
          </LoadPluginComponent>
        </Provider>
      )

      setTimeout(() => {
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: true,
          loadError: undefined,
          component: undefined
        }))
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: false,
          loadError: undefined,
          component: TestView
        }))
        done()
      }, 100)
    })
    it('handles load error properly', done => {
      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      const LOAD_ERROR = new Error('Failed to load!')
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        load: (store, cb) => cb(LOAD_ERROR)
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="TestView">
            {spies.children}
          </LoadPluginComponent>
        </Provider>
      )
      setTimeout(() => {
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: true,
          loadError: undefined,
          component: undefined
        }))
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: false,
          loadError: LOAD_ERROR,
          component: undefined
        }))
        done()
      }, 100)
    })
    it('calls getComponent when provided', done => {
      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        load: (store, cb) => cb(null, Immutable.fromJS({
          TestView
        }))
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="should be ignored"
              getComponent={plugin => plugin.get('TestView')}
          >
            {spies.children}
          </LoadPluginComponent>
        </Provider>
      )
      setTimeout(() => {
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: true,
          loadError: undefined,
          component: undefined
        }))
        expect(spies.children).toHaveBeenCalledWith(jasmine.objectContaining({
          loading: false,
          loadError: undefined,
          component: TestView
        }))
        done()
      }, 100)
    })
    it('renders output of children function', () => {
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)

      const TestHeader = () => <h1>TEST</h1>
      const spies = {
        children: TestHeader
      }
      spyOn(spies, 'children').and.callThrough()

      const comp = mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey="nonexistent" componentKey="nonexistent">
            {spies.children}
          </LoadPluginComponent>
        </Provider>
      )
      expect(comp.text()).toBe('TEST')
    })
  })
  describe('without children function', () => {
    it('renders component with componentProps', done => {
      const PLUGIN_KEY = 'plugin1'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: 'Plugin 1',
        load: (store, cb) => cb(null, Immutable.fromJS({
          components: {
            TestView
          }
        }))
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      const comp = mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="TestView" componentProps={{className: 'test'}} />
        </Provider>
      )
      setTimeout(() => {
        expect(comp.text()).toBe('TestView')
        expect(comp.find(TestView).prop('className')).toBe('test')
        done()
      }, 100)
    })
    it('renders loading message if plugin is loading', done => {
      const PLUGIN_KEY = 'plugin1'
      const PLUGIN_NAME = 'slow plugin'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: PLUGIN_NAME,
        load: (store, cb) => {
          setTimeout(() => cb(null, TestView), 1000)
        }
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      const comp = mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="TestView" />
        </Provider>
      )
      setTimeout(() => {
        expect(comp.text()).toBe(`Loading ${PLUGIN_NAME} plugin...`)
        done()
      }, 100)
    })
    it('renders error if plugin failed to load', done => {
      const PLUGIN_KEY = 'plugin1'
      const PLUGIN_NAME = 'buggy plugin'
      const initialState = Immutable.fromJS({
        plugins: {}
      })
      const errorMessage = 'all hell broke loose'
      const store = applyMiddleware(pluginMiddleware)(createStore)(pluginReducer, initialState)
      store.dispatch(pluginActions.addPlugin(Immutable.fromJS({
        key: PLUGIN_KEY,
        name: PLUGIN_NAME,
        load: (store, cb) => cb(new Error(errorMessage))
      })))

      const spies = {
        children: () => null
      }
      spyOn(spies, 'children').and.callThrough()

      const comp =mount(
        <Provider store={store}>
          <LoadPluginComponent pluginKey={PLUGIN_KEY} componentKey="TestView" />
        </Provider>
      )
      setTimeout(() => {
        expect(comp.text()).toBe(`Failed to load ${PLUGIN_NAME} plugin: ${errorMessage}`)
        done()
      }, 100)
    })
  })
})
