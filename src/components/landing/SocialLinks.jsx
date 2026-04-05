const links = [
  {
    id: 'discord-icon',
    label: 'Discord',
    href: 'https://discord.com',
  },
  {
    id: 'github-icon',
    label: 'GitHub',
    href: 'https://github.com',
  },
  {
    id: 'x-icon',
    label: 'X',
    href: 'https://x.com',
  },
]

function SocialLinks() {
  return (
    <ul className="social-list" aria-label="Réseaux communautaires">
      {links.map((link) => (
        <li key={link.id}>
          <a href={link.href} target="_blank" rel="noreferrer">
            <svg className="social-icon" aria-hidden="true">
              <use href={`/icons.svg#${link.id}`} />
            </svg>
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SocialLinks
