/* @flow */

import React, {Component, PropTypes} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'
import warning from 'warning'

import {pluginActions, pluginTypes} from 'redux-plugins-immutable'
const {LOADING, LOADED, NOT_LOADED} = pluginTypes
const {loadPlugin} = pluginActions

import {mapKey} from './util/propTypes'

type SkinProps = {
  loading?: boolean,
  pluginName?: string,
  loadError?: Error | string,
  children?: any
};

class DefaultSkin extends Component<void, SkinProps, void> {
  static propTypes = {
    children: PropTypes.any,
    loading: PropTypes.bool,
    loadError: PropTypes.any,
    pluginName: PropTypes.string.isRequired
  };
  render(): React.Element<any> {
    let {loading, pluginName, loadError, children} = this.props

    if (loading) {
      return <h1>Loading {pluginName} plugin...</h1>
    }
    if (loadError) {
      return <h1>Failed to load {pluginName || ''} plugin: {loadError.message || loadError}</h1>
    }
    if (!children) {
      return <h1>{`Couldn't find component for ${pluginName || ''} plugin`}</h1>
    }
    return children
  }
}

type Props = {
  pluginKey: string | Symbol,
  plugin?: Immutable.Map<any, any>,
  children?: (state: {
    loading: boolean,
    loadError?: Error,
    component?: any,
  }) => ?React.Element<any>,
  componentKey?: string | Symbol,
  getComponent?: (plugin: Immutable.Map<any, any>) => Component<any, any, any>,
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
class LoadPluginComponent extends Component<void, Props, void> {
  static contextTypes = {
    LoadPluginComponentSkin: PropTypes.any
  };
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    getComponent: PropTypes.func,
    children: PropTypes.func,
    componentKey: mapKey,
    componentProps: PropTypes.object,
    pluginKey: mapKey.isRequired,
    plugin: PropTypes.instanceOf(Immutable.Map)
  };
  componentWillMount() {
    this.loadPluginIfNecessary()
  }
  componentWillReceiveProps(nextProps: Props) {
    const {plugin, pluginKey, getComponent, componentKey} = nextProps
    warning(getComponent || componentKey, 'you must provide a getComponent or componentKey')
    if (pluginKey !== this.props.pluginKey ||
        getComponent !== this.props.getComponent ||
        componentKey !== this.props.componentKey ||
        (plugin && this.props.plugin && plugin !== this.props.plugin &&
          plugin.get('loadStatus') === NOT_LOADED &&
          this.props.plugin.get('loadStatus') === LOADED)) {
      this.loadPluginIfNecessary(nextProps)
    }
  }
  getComponent: (plugin: Immutable.Map<any, any>, props?: Props) => any = (plugin, props = this.props) => {
    let {getComponent, componentKey} = props
    if (getComponent) return getComponent(plugin)
    if (componentKey) return plugin.getIn(['components', componentKey])
  };
  loadPluginIfNecessary: (props?: Props) => void = (props = this.props) => {
    let {plugin, pluginKey, dispatch} = props
    if (plugin && plugin.get('loadStatus') === NOT_LOADED && !this.getComponent(plugin, props)) {
      dispatch(loadPlugin(pluginKey))
    }
  };
  render() {
    const {pluginKey, plugin, componentProps, children} = this.props
    const skin = this.context.LoadPluginComponentSkin || DefaultSkin

    let pluginName = pluginKey
    let component, loading, loadError

    if (plugin) {
      pluginName = plugin.get('name')
      component = this.getComponent(plugin)
      loadError = plugin.get('loadError')
      loading   = plugin.get('loadStatus') === LOADING ||
        (plugin.get('loadStatus') === NOT_LOADED && !component && !loadError)
    }
    else {
      loading = false
      loadError = new Error(`plugin ${pluginKey.toString()} not found`)
    }

    if (children) return children({loading, loadError, component})

    let finalChildren

    if (React.isValidElement(component)) {
      if (component && componentProps) finalChildren = React.cloneElement(component, componentProps)
    }
    else if (component) {
      finalChildren = React.createElement(component, componentProps || {})
    }

    return React.createElement(skin, {pluginName, loading, loadError, children: finalChildren})
  }
}

function select(state, props) {
  return {
    plugin: state.getIn(['plugins', props.pluginKey])
  }
}

export default connect(select)(LoadPluginComponent)
