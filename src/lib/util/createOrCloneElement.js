/* @flow */

import React from 'react'

export default function createOrCloneElement(element: any, props: Object): ?React.Element {
  if (element) {
    return React.isValidElement(element)
      ? React.cloneElement(element, props)
      : React.createElement(element, props)
  }
}
