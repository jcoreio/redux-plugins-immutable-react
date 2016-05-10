/* @flow */

import React, {Component, PropTypes} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'
import warning from 'warning'

import {pluginActions, pluginTypes} from 'redux-plugins-immutable'
const {LOADING, NOT_LOADED} = pluginTypes
const {loadPlugin} = pluginActions

import {mapKey} from './util/propTypes'

type SkinProps = {
  loading?: boolean,
  pluginName?: string,
  loadError?: Error | string,
  children?: any
};

class DefaultSkin extends Component<void, SkinProps, void> {
  render(): React.Element {
    let {loading, pluginName, loadError, children} = this.props

    if (loading) {
      return <h1>Loading {pluginName} plugin...</h1>
    }
    if (loadError) {
      return <h1>Failed to load {pluginName} plugin: {loadError.message || loadError}</h1>
    }
    if (!children) {
      return <h1>{`Couldn't find component for ${pluginName} plugin`}</h1>
    }
    return children
  }
}

type Props = {
  pluginKey: string,
  plugin?: Immutable.Map,
  componentKey?: string,
  getComponent?: (plugin: Immutable.Map) => Component<any, any, any>,
  componentProps?: Object,
  dispatch: Function,
};

/**
 * Renders a Component from a plugin that may not be loaded.  If it is not loaded,
 * this will show a loading alert and dispatch an action to load the plugin, rendering
 * the Component when the plugin finishes loading.
 *
 * All you have to do is provide the pluginKey prop, and one of the following two props
 * that specify what Component from the plugin to use:
 * * componentKey prop - use plugin.getIn(['components', componentKey])
 * * getComponent prop - use getComponent(plugin)
 */
class AutoloadedPluginComponent extends Component<void, Props, void> {
  static contextTypes = {
    AutoloadedPluginComponentSkin: PropTypes.any
  };
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    getComponent: PropTypes.func,
    componentKey: mapKey,
    componentProps: PropTypes.object,
    pluginKey: mapKey.isRequired,
    plugin: PropTypes.instanceOf(Immutable.Map)
  };
  getComponent: (plugin: Immutable.Map) => any = plugin => {
    let {getComponent, componentKey} = this.props
    if (getComponent) {
      return getComponent(plugin)
    }
    if (componentKey) {
      return plugin.getIn(['components', componentKey])
    }
  };
  componentWillReceiveProps(nextProps: Props) {
    let {getComponent, componentKey} = this.props
    warning(getComponent || componentKey, 'you must provide a getComponent or componentKey')
  }
  componentWillMount() {
    let {plugin, pluginKey, dispatch} = this.props
    if (plugin && plugin.get('loadStatus') === NOT_LOADED && !this.getComponent(plugin)) {
      dispatch(loadPlugin(pluginKey))
    }
  }
  render() {
    let {pluginKey, plugin, componentKey, componentProps} = this.props
    let skin = this.context.AutoloadedPluginComponentSkin || DefaultSkin

    let pluginName = pluginKey
    let component, loading, loadError

    if (plugin) {
      pluginName = plugin.get('name')
      component = this.getComponent(plugin)
      loading   = plugin.get('loadStatus') === LOADING
      loadError = plugin.get('loadError')

      if (React.isValidElement(component) && component) {
        if (componentProps) {
          component = React.cloneElement(component, componentProps)
        }
      }
      else if (component) {
        component = React.createElement(component, componentProps || {})
      }
    }
    else {
      loadError = `plugin ${pluginKey} not found`
    }

    return React.createElement(skin, {pluginName, loading, loadError, children: component})
  }
}

function select(state, props) {
  return {
    plugin: state.getIn(['plugins', props.pluginKey])
  }
}

export default connect(select)(AutoloadedPluginComponent)
