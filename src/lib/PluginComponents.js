/* @flow */

import React, {Component, PropTypes} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import warning from 'warning'

import createOrCloneElement from './util/createOrCloneElement'
import {mapKey} from './util/propTypes'

type Props = {
  plugins?: Immutable.Map<any, any>,
  sortPlugins?: (plugins: Immutable.Map<any, any>) => Immutable.Map<any, any>,
  componentKey?: string | Symbol,
  getComponent?: (plugin: Immutable.Map<any, any>) => Component<any, any, any>,
  componentProps?: Object,
  children?: (pluginComponents: ?Array<?React.Element<any>>) => ?React.Element<any>
};

/**
 * A shell into which plugins can inject components.  For example if you had:
 *
 * import PluginComponents from './PluginComponents';
 *
 * const Menu = ({children}) => <ul>
 *   <li><a>Input Settings</a></li>
 *   <li><a>Output Settings</a></li>
 *   <li divider/>
 *   {children}
 * </ul>;
 *
 * <Dropdown component="div">
 *   <Button caret>Settings</Button>
 *   <PluginComponents componentKey="SettingsMenuItems">{Menu}</PluginComponents>
 * </Dropdown>
 *
 * Then anything at the path ['components', 'SettingsMenuItems'] in any plugin will
 * be passed in the children to the created <Menu> element.  This way it's easy for
 * plugins to extend the UI in arbitrary places.
 *
 * There are two ways of specifying what component to get from each plugin:
 * * componentKey prop - use plugin.getIn(['components', componentKey])
 * * getComponent prop - use getComponent(plugin)
 *
 * You can specify a sortPlugins prop to control the order in which plugin components
 * show.
 */
class PluginComponents extends Component<void, Props, void> {
  static propTypes = {
    children: PropTypes.func,
    componentKey: mapKey,
    componentProps: PropTypes.object,
    getComponent: PropTypes.func,
    plugins: PropTypes.instanceOf(Immutable.Map),
    sortPlugins: PropTypes.func
  };
  componentWillReceiveProps(nextProps: Props) {
    let {getComponent, componentKey} = nextProps
    warning(getComponent || componentKey, "you must provide either getComponent or componentKey")
  }
  selectPluginComponents: (props: Props) => ?Array<?React.Element<any>> = createSelector(
    props => props.plugins,
    props => props.sortPlugins,
    ({getComponent, componentKey}) => {
      if (getComponent) return getComponent
      if (componentKey) return plugin => plugin.getIn(['components', componentKey])
      return () => undefined
    },
    props => props.componentProps || {},
    (plugins, sortPlugins, getComponent, componentProps) => {
      if (plugins) {
        if (sortPlugins) plugins = sortPlugins(plugins)

        return plugins.map((plugin, key) => {
          let component = plugin && getComponent(plugin)
          if (Array.isArray(component) || component instanceof Immutable.Iterable) {
            return component.map((comp, index) => comp && createOrCloneElement(
              comp, {...componentProps, key: `${key}-${index}`}))
          }
          return component && createOrCloneElement(component, {...componentProps, key})
        }).toList().flatten().toArray()
      }
    }
  );
  render() {
    let {children} = this.props
    let pluginComponents = this.selectPluginComponents(this.props)

    if (children) return children(pluginComponents)

    const props = {...this.props}
    delete props.componentKey
    delete props.componentProps
    delete props.getComponent
    delete props.plugins
    delete props.sortPlugins

    return (
      <div {...props}>
        {pluginComponents}
      </div>
    )
  }
}

function select(state) {
  return {
    plugins: state.get('plugins')
  }
}

export default connect(select)(PluginComponents)
