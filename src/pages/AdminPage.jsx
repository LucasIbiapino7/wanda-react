import { useNavigate } from 'react-router-dom'
import './AdminPage.css'

const CARDS = [{
    icon: '👥',
    title: 'Usuários',
    description: 'Gerencie perfis e promova instrutores',
    route: '/admin/users',
  },
  {
    icon: '📊',
    title: 'Auditoria',
    description: 'Visualize registros de uso por período',
    route: '/admin/auditoria',
  },
  {
    icon: '📊',
    title: 'Pesquisa',
    description: 'Dashboard de uso dos agentes e interações',
    route: '/admin/research',
  },
]

export default function AdminPage() {
  const navigate = useNavigate()

  return (
    <div className="admin-hub">
      <div className="admin-hub__header">
        <h1 className="admin-hub__title">Administração</h1>
        <p className="admin-hub__subtitle">Selecione uma área para gerenciar</p>
      </div>

      <div className="admin-hub__grid">
        {CARDS.map((card) => (
          <button
            key={card.route}
            className="admin-hub__card"
            onClick={() => navigate(card.route)}
          >
            <span className="admin-hub__card-icon">{card.icon}</span>
            <span className="admin-hub__card-title">{card.title}</span>
            <span className="admin-hub__card-desc">{card.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}