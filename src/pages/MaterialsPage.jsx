import { Download, FileText, Presentation } from "lucide-react"
import { materials } from "../data/materials"
import "./MaterialsPage.css"

function getMaterialIcon(type){
    if (type === "PPTX"){
        return <Presentation size={28}/>
    }
    if (type === "PDF"){
        return <FileText size={28}/>
    }
}

export default function MaterialsPage(){
    return(
        <main className="materials-page">
            <section className="materials-hero">
                <p className="materials-eyebrow">MATERIAIS</p>
                <h1>Materiais de apoio</h1>
                <p>
                    Baixe os materiais de conteúdo.
                </p>
            </section>

            <section className="materials-card">
                <div className="materials-card__header">
                    <div>
                        <h2>
                            Arquivos disponíveis
                        </h2>
                        <p>
                            {materials.length} materiais cadastrados
                        </p>
                    </div>
                </div>

                <div className="materials-list">
                    {materials.map((material) => (
                        <article className="material-item" key={material.id}>
                            <div className="material-item__icon">
                                {getMaterialIcon(material.type)}
                            </div>

                            <div className="material-item__content">
                                <h3>{material.fileName}</h3>
                                <span>{material.type}</span>
                            </div>

                            <a 
                                className="material-item__download"
                                href={material.url}
                                download={material.fileName}
                            >
                                <Download size={18}/>
                                Baixar
                            </a>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}