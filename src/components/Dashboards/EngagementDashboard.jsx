import "../../pages/DashboardPage.css"
import { getApiError } from "../../utils/errors";
import DashBoardService from "../../services/DashBoardService";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarClass(status) {
  const map = {
    SUBMITTED: 'avatar--ok',
    ACTIVE: 'avatar--ok',
    STUCK: 'avatar--warn',
    INACTIVE: 'avatar--alert',
  };
  return map[status] ?? 'avatar--neutral';
}

function getRatioBadgeClass(valid, invalid) {
  const total = valid + invalid;
  if (total === 0) { return 'ratio-badge--none'; }
  const pct = (valid / total) * 100;
  if (pct >= 70) { return 'ratio-badge--high'; }
  if (pct >= 40) { return 'ratio-badge--mid'; }
  return 'ratio-badge--low';
}

function getRatioText(valid, invalid) {
  const total = valid + invalid;
  if (total === 0) return '—';
  return `${Math.round((valid / total) * 100)}% válidos`;
}

function getStatusPillClass(status) {
  const map = {
    SUBMITTED: 'status-pill--submitted',
    ACTIVE:    'status-pill--pending',
    STUCK:     'status-pill--pending',
    INACTIVE:  'status-pill--inactive',
  };
  return map[status] ?? '';
}

function getStatusLabel(status) {
  const map = {
    SUBMITTED: '✓ Submeteu',
    ACTIVE:    'Ativo',
    STUCK:     'Travado',
    INACTIVE:  'Sem atividade',
  };
  return map[status] ?? status;
}

export default function EngagementDashboard({classroomID, from, to}) {
    const [engagement, setEngagement] = useState(null);
    const [error, setError] = useState(null); 
    const [page, setPage] = useState(0);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [loading, setLoading] = useState(false);

    //Paginada para a tabela
    useEffect(() => {
        if (!from || !to) { 
            return; 
        }

        const fetchEngagement = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await DashBoardService.getEngagement(classroomID, from, to, page);
                setEngagement(data);
            } catch (error) {
                setError(getApiError(error));
            } finally {
                setLoading(false);
            }
        };
        fetchEngagement();
    }, [classroomID, from, to, page]);

    useEffect(() => {
        setPage(0);
    }, [from, to]);

    //Chamada para o alerta de inativos
    useEffect(() => {
        if (!from || !to || !engagement) { return; }
        DashBoardService.getEngagement(classroomID, from, to, 0, engagement.totalElements).then(data => setTodosAlunos(data.content)).catch(err => setError(getApiError(err)));
    }, [classroomID, from, to, engagement, engagement?.totalElements]);

    const inativos = todosAlunos.filter(a => a.status === 'INACTIVE');

    if (error) {
        return <p>{error}</p>; //alterar posteriormente
    }
    if (loading) {
        return <p className="dashboard-loading">Carregando engajamento...</p>;
    }
    if (!engagement || !engagement.content || engagement.content.length === 0) {
        return (
            <div className="section-card">
                <div className="section-header">
                    <div>
                    <p className="section-title">Engajamento por aluno</p>
                    <p className="section-subtitle">Interações com o agente no período selecionado</p>
                    </div>
                </div>

                <p className="dashboard-empty">
                    Nenhum dado de engajamento encontrado para o período selecionado.
                </p>
            </div>
        );
    }

    return (
        <>
        {/*── ABA APRENDIZADO ──*/}
        <div>
            {/*-- alerta --*/}
            {inativos.length > 0 && (
                <div className="inactive-alert">
                    <span className="inactive-alert-icon">⚠️</span>
                    <div>
                    <p className="inactive-alert-title">
                        {inativos.length} {inativos.length === 1 ? "aluno" : "alunos"} sem atividade no período
                    </p>
                    <p className="inactive-alert-text">Esses alunos não tiveram nenhuma interação com o agente desde o início do período selecionado.</p>
                    <p className="inactive-alert-names">
                        {inativos.map(a => a.userName).join(' · ')}
                    </p>
                </div>
            </div>
            )}
            
            <div className="dashboard-layout">
                {/*-- tabela --*/}
                <div className="section-card">
                <div className="section-header">
                    <div>
                    <p className="section-title">Engajamento por aluno</p>
                    <p className="section-subtitle">Interações com o agente no período selecionado</p>
                    </div>
                    <div className="legend">
                    <span className="legend-item"><span className="legend-dot legend-dot--feedback"></span>Feedback</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--run"></span>Run</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--submit"></span>Submit</span>
                    </div>
                </div>
                <table className="dash-table">
                    <thead>
                    <tr>
                        <th>Aluno</th>
                        <th>Interações</th>
                        <th>Válidos / Inválidos</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {engagement.content.map(alunos => (
                        <tr key={alunos.userId}>
                        <td>
                            <div className="student-name-cell">
                                <div className={`student-avatar ${getAvatarClass(alunos.status)}`}>{getInitials(alunos.userName)}</div>

                                <span className="student-name">{alunos.userName}</span>
                            </div>
                        </td>
                        <td>
                            <div className="interaction-bars">
                                <span className="ibar ibar--feedback">{alunos.feedback}</span>
                                <span className="ibar ibar--run">{alunos.run}</span>
                                <span className="ibar ibar--submit">{alunos.submit}</span>
                            </div>
                        </td>
                        <td>
                            <span className={`ratio-badge ${getRatioBadgeClass(alunos.validCount, alunos.invalidCount)}`}>{getRatioText(alunos.validCount, alunos.invalidCount)}</span>
                        </td>
                        <td>
                            <span className={`status-pill ${getStatusPillClass(alunos.status)}`}>
                                {getStatusLabel(alunos.status)}
                            </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {engagement.totalPages > 1 && (
                    <div className="pagination">
                        <button
                        className="btn-page"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">
                        {page + 1} / {engagement.totalPages}
                        </span>
                        <button
                        className="btn-page"
                        disabled={page === engagement.totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        >
                            Próxima
                        </button>
                    </div>
                )}
                </div>

            </div>
        </div>
        </>
    );
}

EngagementDashboard.propTypes = {
    classroomID: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
}