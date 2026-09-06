import { Download, FileText, Presentation } from "lucide-react"
import { materials } from "../data/materials"
import "./MaterialsPage.css"
import { useState, useContext } from "react" 
import AuthContext from "../context/AuthContext" 

export default function MaterialsPage(){ 
    const { isInstructor } = useContext(AuthContext) 
    const [viewingAs, setViewingAs] = useState("aluno") 
    const visibleMaterials = materials  .map((material) => {    
        const key = material.formats ? "formats" : "resources"    
        const visibleItems = material[key].filter(      
            (item) => item.audience === viewingAs || item.audience === "ambos"    
        )    
        return { ...material, [key]: visibleItems }  
    })  
    .filter((material) => (material.formats ?? material.resources).length > 0) 
    const CATEGORY_ORDER = ["Geral", "Módulo 1", "Módulo 2", "Módulo 3", "Jogos"] 
    const grouped = visibleMaterials.reduce((acc, material) => {  
        if (!acc[material.category]) acc[material.category] = []  
        acc[material.category].push(material)  
        return acc 
    }, {})
} 

function getMaterialIcon(type){
    if (type === "PPTX"){
        return <Presentation size={28}/>
    }
    if (type === "PDF"){
        return <FileText size={28}/>
    }
}

export default function MaterialsPage(){
    {isInstructor && ( 
        <div className="materials-view-toggle"> 
            <button onClick={() => setViewingAs("aluno")}>Aluno</button> 
            <button onClick={() => setViewingAs("professor")}>Professor</button> 
        </div> 
    )} 
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
                        <article className="material-item"> 
                            <h3>{material.fileName}</h3> 
                            <div className="material-item__downloads"> 
                                {material.formats.map((f, i) => ( 
                                    f.type === "VIDEO" ? ( 
                                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"> Assistir no YouTube </a> 
                                    ) : ( 
                                        <a key={i} href={f.url} download>Baixar {f.type}</a> ) 
                                ))} 
                            </div> 
                        </article>
                        
                    ))}
                </div>
                
                <article className="material-kit"> 
                    <h4>{material.fileName}</h4> 
                    {material.resources.map((res, i) => ( 
                        <a key={i} className="material-kit__resource" href={res.url} 
                        download={res.label}> {res.label} </a> 
                    ))} 
                </article>

            </section>
        </main>
    )
}