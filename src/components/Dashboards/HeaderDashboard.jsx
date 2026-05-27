import { useNavigate } from "react-router-dom";
import "../../pages/DashboardPage.css"

export default function HeaderDashboard({id, classroom, from, to, onFromChange, onToChange, onFilter}) {
    const navigate = useNavigate();
    return (
        <>
        <nav className="dashboard-details-breadcrumb"  aria-label="Navegação da turma">
            <button onClick={() => navigate(`/classrooms`)}>
                Turmas
            </button>
            <span className="dashboard-details-breadcrumb__sep">
                {">"}
            </span>
            <button onClick={() => navigate(`/classrooms/${id}`)}>
                {classroom.name}
            </button>
            <span className="dashboard-details-breadcrumb__sep">
                {">"}
            </span>
            <span className="dashboard-details-breadcrumb__current">Dashboard</span>
        </nav>

        {/*-- PAGE HEADER + FILTRO --*/}
        <div className="page-header">
            <div className="page-title-group">
                <span className="page-eyebrow">{classroom.name} · {classroom.gameName}</span>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">{classroom.course} {classroom.institution && `· ${classroom.institution}`} {classroom.city && `· ${classroom.city}`} {classroom.state && `, ${classroom.state}`}</p>
            </div>
            <div className="filter-bar">
                <span className="filter-label">Período</span>
                <input className="filter-input" type="date" value={from} onChange={(e) => onFromChange(e.target.value)}/>
                <span className="filter-sep">até</span>
                <input className="filter-input" type="date" value={to} onChange={(e) => onToChange(e.target.value)}/>
                <button className="btn-filter" onClick={() => onFilter()}>Aplicar</button>
            </div>
        </div>
        </>
    );
}