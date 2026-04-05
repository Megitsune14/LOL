import { createElement } from 'react'

function Reveal({ as = 'div', className = '', delay = 0, children, ...props }) {
  return createElement(
    as,
    {
      ...props,
      className: `reveal ${className}`.trim(),
      style: { ...(props.style || {}), animationDelay: `${delay}ms` },
    },
    children,
  )
}

export default Reveal
