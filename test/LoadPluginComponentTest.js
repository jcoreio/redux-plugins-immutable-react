import * as Immutable from 'immutable'
import React, {Component} from 'react'
import {pluginReducer, pluginMiddleware, pluginActions} from 'redux-plugins-immutable'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'

import LoadPluginComponent from '../src/lib/LoadPluginComponent'


class TestView extends Component {
  render() {
    return <h1>It works!</h1>
  }
}

describe('LoadPluginComponent', () => {
  it('loads a plugin component', () => {
    const PLUGIN_KEY = 'plugin1'
    const initialState = Immutable.fromJS({
      plugins: { }
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
      </Provider>,
      () => {
        expect(spies.children.calls.allArgs()).toEqual([
          [{
            loading: true,
            loadError: undefined,
            component: undefined
          }],
          [{
            loading: false,
            loadError: undefined,
            component: TestView
          }]
        ])
      }
    )
  })
})
