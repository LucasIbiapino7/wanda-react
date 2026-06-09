import { useNavigate } from "react-router-dom";
import "../../pages/DashboardPage.css"
import PropTypes from "prop-types";

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

HeaderDashboard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    classroom: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        course: PropTypes.string,
        institution: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        gameName: PropTypes.string,
        instructorName: PropTypes.string,
        createdAt: PropTypes.string
    }).isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    onFromChange: PropTypes.func.isRequired,
    onToChange: PropTypes.func.isRequired,
    onFilter: PropTypes.func.isRequired
}