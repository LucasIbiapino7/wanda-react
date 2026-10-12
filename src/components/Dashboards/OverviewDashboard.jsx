import { useEffect, useState } from "react";
import DashBoardService from "../../services/DashBoardService";
import { getApiError } from "../../utils/errors";
import PropTypes from "prop-types";

export default function OverviewDashboard({classroomID, from, to}) {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        if (!from || !to) { 
            return; 
        }

        const fetchOverview = async () => {
            setLoading(true)
            setError(false)

            try{
                const data = await DashBoardService.getOverview(classroomID, from, to)
                setOverview(data)
            } catch(error){
                setError(getApiError(error))
            } finally{
                setLoading(false)
            }
        }
        fetchOverview()
    }, [classroomID, from, to]);

    if (error) {
        return <p>{error}</p>; //alterar posteriormente
    }
    if (loading) {
        return <p className="dashboard-loading">Carregando visão geral...</p>;
    }
    if (!overview) {
       return <p className="dashboard-empty">Nenhum dado encontrado para o período.</p>;
    }

    return (
        <>
            {/*-- KPI CARDS — sempre visíveis --*/}
            {/*Melhoria futura -> usar react components para padronizar os cards*/}
            <div className="kpi-grid">
                <div className="kpi-card kpi-card--total">
                    <span className="kpi-label">Total de alunos</span>
                    <span className="kpi-value">{overview.totalAlunos}</span>
                    <span className="kpi-sub">na turma</span>
                    <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>

                <div className="kpi-card kpi-card--submit">
                    <span className="kpi-label">Submeteram</span>
                    <span className="kpi-value">{overview.totalSubmeteram}</span>
                    <span className="kpi-sub">
                        <strong>
                            {(Number.isNaN(overview.totalSubmeteram / overview.totalAlunos) ? 0 : Math.round((overview.totalSubmeteram / overview.totalAlunos) * 100))}%
                        </strong> da turma
                    </span>
                    <div className="kpi-progress">
                        <div className="kpi-progress-bar">
                            <div className="kpi-progress-fill kpi-progress-fill--green" style={{width: `${(Number.isNaN(overview.totalSubmeteram / overview.totalAlunos) ? 0 : Math.round((overview.totalSubmeteram / overview.totalAlunos) * 100))}%`}} ></div>
                        </div>
                    </div>
                    <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>

                <div className="kpi-card kpi-card--active">
                    <span className="kpi-label">Ativos no período</span>
                    <span className="kpi-value">{overview.totalAtivos}</span>
                    <span className="kpi-sub"><strong>{overview.totalAlunos - overview.totalAtivos}</strong> sem interação</span>
                    <div className="kpi-progress">
                        <div className="kpi-progress-bar">
                            <div className="kpi-progress-fill kpi-progress-fill--blue" style={{width: `${(Number.isNaN(overview.totalAtivos / overview.totalAlunos) ? 0 : Math.round((overview.totalAtivos / overview.totalAlunos) * 100))}%`}}></div>
                        </div>
                    </div>
                    <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>

                <div className="kpi-card kpi-card--interact">
                    <span className="kpi-label">Interações totais</span>
                    <span className="kpi-value">{overview.totalInteracoes}</span>
                    <span className="kpi-sub">
                        <strong>
                            {(Number.isNaN(overview.totalInteracoes / overview.totalAlunos) ? 0 : (overview.totalInteracoes / overview.totalAlunos).toFixed(1))}
                        </strong> por aluno (média)
                    </span>
                    <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
            </div>
        </>
    );
}

OverviewDashboard.propTypes = {
    classroomID: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
}