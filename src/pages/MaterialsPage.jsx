import { Download, FileText, Presentation } from "lucide-react"
import { materials } from "../data/materials"
import "./MaterialsPage.css"
import { useState, useContext } from "react"
import AuthContext from "../context/AuthContext"

const CATEGORY_ORDER = ["Geral", "Módulo 1", "Módulo 2", "Módulo 3", "Jogos"]

function getMaterialIcon(type) {
  if (type === "PPTX") {
    return <Presentation aria-hidden="true" size={28} />
  }

  return <FileText aria-hidden="true" size={28} />
}

export default function MaterialsPage() {
  const { isInstructor } = useContext(AuthContext)
  const [viewingAs, setViewingAs] = useState("professor")
  const selectedView = isInstructor ? viewingAs : "aluno"

  const visibleMaterials = materials
    .map((material) => {
      const key = material.formats ? "formats" : "resources"
      const visibleItems = material[key].filter(
        (item) => item.audience === selectedView || item.audience === "ambos",
      )

      return { ...material, [key]: visibleItems }
    })
    .filter((material) => (material.formats ?? material.resources).length > 0)

  const grouped = visibleMaterials.reduce((acc, material) => {
    if (!acc[material.category]) acc[material.category] = []
    acc[material.category].push(material)
    return acc
  }, {})

  const availableFileCount = visibleMaterials.reduce(
    (total, material) => total + (material.formats ?? material.resources).length,
    0,
  )

  return (
    <main className="materials-page">
      <section className="materials-hero">
        <p className="materials-eyebrow">MATERIAIS</p>
        <h1>Materiais de apoio</h1>
        <p>Baixe os materiais de conteúdo e acompanhe as videoaulas.</p>
      </section>

      <section className="materials-card" aria-labelledby="materials-title">
        <div className="materials-card__header">
          <div>
            <h2 id="materials-title">Arquivos disponíveis</h2>
            <p>{availableFileCount} {availableFileCount === 1 ? "arquivo disponível" : "arquivos disponíveis"}</p>
          </div>

          {isInstructor && (
            <div className="materials-view-toggle" aria-label="Visualizar materiais como">
              <button className={viewingAs === "aluno" ? "is-active" : ""} type="button"
                aria-pressed={viewingAs === "aluno"} onClick={() => setViewingAs("aluno")}>
                Aluno
              </button>
              <button className={viewingAs === "professor" ? "is-active" : ""} type="button"
                aria-pressed={viewingAs === "professor"} onClick={() => setViewingAs("professor")}>
                Professor
              </button>
            </div>
          )}
        </div>

        <div className="materials-groups">
          {CATEGORY_ORDER.map((category) => grouped[category] && (
            <section className="materials-group" key={category}>
              <h3>{category}</h3>
              <div className="materials-list">
                {grouped[category].map((material) => (
                  <article className="material-item" key={material.id}>
                    <div className="material-item__content">
                      <h4>{material.fileName}</h4>
                      <span>{(material.formats ?? material.resources).length} recursos</span>
                    </div>
                    <div className="material-item__downloads">
                      {material.formats?.map((format) => (
                        <a className="material-item__download" href={format.url}
                          key={`${material.id}-${format.type}`}
                          target={format.type === "VIDEO" ? "_blank" : undefined}
                          rel={format.type === "VIDEO" ? "noopener noreferrer" : undefined}
                          download={format.type === "VIDEO" ? undefined : true}>
                          {getMaterialIcon(format.type)}
                          <span>{format.type === "VIDEO" ? "Assistir no YouTube" : `Baixar ${format.type}`}</span>
                          {format.type === "VIDEO" ? null : <Download aria-hidden="true" size={18} />}
                        </a>
                      ))}

                      {material.resources?.map((resource) => (
                        <a className="material-item__download" href={resource.url}
                          key={`${material.id}-${resource.type}-${resource.label}`} download>
                          {getMaterialIcon(resource.type)}
                          <span>{resource.label}</span>
                          <Download aria-hidden="true" size={18} />
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}