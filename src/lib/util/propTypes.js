import {PropTypes} from 'react'

export const mapKey = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.instanceOf(Symbol)
])
