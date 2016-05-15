# redux-plugins-immutable-react

React helper components for [redux-plugins-immutable](http://github.com/jcoreio/redux-plugins-immutable]

## Introduction

```
npm install redux-plugins-immutable-react
```

These components help you inject other components from plugins into your UI.  There are two helpers:
- `LoadPluginComponent`: renders a component from a plugin, loading the plugin if necessary
- `PluginComponents`: renders multiple components from multiple plugins

## API

### `LoadPluginComponent`

Renders a component from a plugin, loading the plugin if necessary.  It will also render loading and load error messages
depending on the plugin status.

#### `propTypes`
- `pluginKey` *(string|Symbol)*: the key of the plugin to load the component from
- `componentKey` *(?string|Symbol)*: if given, will get the component/element at
`store.getState().getIn(['plugins', pluginKey, 'components', componentKey])`
- `getComponent` *((plugin: Immutable.Map) => any)*: (overrides `componentKey`) if given, gets the component/element
from the `plugin` from the redux state.
- `componentProps` *(Object)*: if given, the component/element will be created/cloned with these props
- `children`: *((state: {loading: boolean, loadError?: Error, component?: any)*: if given, `LoadPluginComponent` will
return the result of this function from its `render()` instead of its default behavior.

#### `contextTypes`
- `LoadPluginComponentSkin` *(React.Component)*: component to render the plugin status or component.  It will be created
with the following props:
  - `pluginName` *(string)*: the plugin name
  - `loading` *(boolean)*: whether the plugin is loading
  - `loadError` *(Error)*: the error if the plugin failed to load
  - `children` *(?React.Element)*: the plugin component if found

### `PluginComponents`

Renders multiple components from multiple plugins.  It will not load any plugins that are not loaded.

#### `propTypes`
- `componentKey` *(?string|Symbol)*: if given, will get `plugin.getIn(['components', componentKey])` for each `plugin`
in `store.getState().get('plugins')`.  The value at these locations must be a React component, element, or an
`Array|Immutable.List` of components/elements.
- `getComponent` *((plugin: Immutable.Map) => any)*: (overrides `componentKey`) if given, gets the component/element
from the `plugin` from the redux state.  It may return a React component, element, or an `Array|Immutable.List` of
components/elements.
- `componentProps` *(Object)*: if given, each component/element will be created/cloned with these props
- `children` *((pluginComponents: any[]) => ?React.Element)*: if given, `PluginComponents` will return the result of
this function from its `render()` instead of rendering `pluginComponents` inside a `<div>`.
