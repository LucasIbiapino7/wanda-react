import { useNavigate, useParams } from "react-router-dom";
import ClassroomService from "../services/ClassroomService";
import "./DashboardPage.css"
import { useEffect, useState } from "react";
import HeaderDashboard from "../components/Dashboards/HeaderDashboard";


export default function DashboardPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const classroomID = Number(id);
    const [classroom, setClassroom] = useState(null);

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    useEffect(() => {
        ClassroomService.findById(classroomID).then(data => setClassroom(data));
    }, [id])

    const formatToISO = (dateStr, endOfDay = false) => {
        if (!dateStr) {
            return '';
        } 
        return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
    };

    const handleFilter = () => {
        if (!from || !to) {
            alert("Selecione ambas as datas."); //mudar alert para modal personalizado
            return;
        }

        if (new Date(from) > new Date(to)) {
            alert('A data de início não pode ser maior que a data de fim.'); // mudar alert para modal personalizado
            return;
        }

        const fromISO = formatToISO(from);
        const toISO =formatToISO(to);
        /*verificar api para chamar */
    }

    
 

    if (!classroom) {
        return null;
    }

    return (
        <main className="page-dashboard-classroom">

            <HeaderDashboard
                classroom={classroom}
                id={id}
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onFilter={handleFilter}
            />

        {/*-- KPI CARDS — sempre visíveis --*/}
        <div className="kpi-grid">
        <div className="kpi-card kpi-card--total">
            <span className="kpi-label">Total de alunos</span>
            <span className="kpi-value">24</span>
            <span className="kpi-sub">na turma</span>
            <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div className="kpi-card kpi-card--submit">
            <span className="kpi-label">Submeteram</span>
            <span className="kpi-value">18</span>
            <span className="kpi-sub"><strong>75%</strong> da turma</span>
            <div className="kpi-progress"><div className="kpi-progress-bar"><div className="kpi-progress-fill kpi-progress-fill--green" style={{width: "75%"}} ></div></div></div>
            <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="kpi-card kpi-card--active">
            <span className="kpi-label">Ativos no período</span>
            <span className="kpi-value">21</span>
            <span className="kpi-sub"><strong>3</strong> sem interação</span>
            <div className="kpi-progress"><div className="kpi-progress-bar"><div className="kpi-progress-fill kpi-progress-fill--blue" style={{width: "87.5%"}}></div></div></div>
            <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div className="kpi-card kpi-card--interact">
            <span className="kpi-label">Interações totais</span>
            <span className="kpi-value">342</span>
            <span className="kpi-sub"><strong>16.3</strong> por aluno (média)</span>
            <svg className="kpi-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        </div>

        {/*-- TABS --*/}
        <div className="tabs">
        <button className="tab tab--active" onClick="switchTab('aprendizado', this)">
            <span className="tab-icon">📚</span> Aprendizado
        </button>
        <button className="tab" onClick="switchTab('competicao', this)">
            <span className="tab-icon">🏆</span> Competição
        </button>
        </div>

        {/*── ABA APRENDIZADO ──*/}
        <div id="tab-aprendizado" className="tab-content active">

        {/*-- alerta --*/}
        <div className="inactive-alert">
            <span className="inactive-alert-icon">⚠️</span>
            <div>
            <p className="inactive-alert-title">3 alunos sem atividade no período</p>
            <p className="inactive-alert-text">Esses alunos não tiveram nenhuma interação com o agente desde o início do período selecionado.</p>
            <p className="inactive-alert-names">João Pereira · Rafael Ferreira · Lucas Mendes</p>
            </div>
        </div>

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
                    <th>Valid / Invalid</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">AM</div><span className="student-name">Ana Martins</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback">8</span><span className="ibar ibar--run">4</span><span className="ibar ibar--submit">2</span></div></td>
                    <td><span className="ratio-badge ratio-badge--high">85% valid</span></td>
                    <td><span className="status-pill status-pill--submitted">✓ Submeteu</span></td>
                </tr>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">CS</div><span className="student-name">Carlos Silva</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback">12</span><span className="ibar ibar--run">6</span><span className="ibar ibar--submit">3</span></div></td>
                    <td><span className="ratio-badge ratio-badge--high">78% valid</span></td>
                    <td><span className="status-pill status-pill--submitted">✓ Submeteu</span></td>
                </tr>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--warn">JP</div><span className="student-name">João Pereira</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback">18</span><span className="ibar ibar--run">2</span><span className="ibar ibar--submit" style={{opacity: 0.3}}>0</span></div></td>
                    <td><span className="ratio-badge ratio-badge--low">32% valid</span></td>
                    <td><span className="status-pill status-pill--pending">Travado</span></td>
                </tr>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">MO</div><span className="student-name">Marina Oliveira</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback">6</span><span className="ibar ibar--run">3</span><span className="ibar ibar--submit">1</span></div></td>
                    <td><span className="ratio-badge ratio-badge--high">90% valid</span></td>
                    <td><span className="status-pill status-pill--submitted">✓ Submeteu</span></td>
                </tr>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--alert">RF</div><span className="student-name">Rafael Ferreira</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback" style={{opacity: 0.3}}>0</span><span className="ibar ibar--run" style={{opacity: 0.3}}>0</span><span className="ibar ibar--submit" style={{opacity: 0.3}}>0</span></div></td>
                    <td><span className="ratio-badge ratio-badge--none">—</span></td>
                    <td><span className="status-pill status-pill--inactive">Sem atividade</span></td>
                </tr>
                <tr>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">LC</div><span className="student-name">Larissa Costa</span></div></td>
                    <td><div className="interaction-bars"><span className="ibar ibar--feedback">5</span><span className="ibar ibar--run">5</span><span className="ibar ibar--submit">2</span></div></td>
                    <td><span className="ratio-badge ratio-badge--mid">61% valid</span></td>
                    <td><span className="status-pill status-pill--submitted">✓ Submeteu</span></td>
                </tr>
                </tbody>
            </table>
            <div className="data-source-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Dados de <code style={{fontSize: "0.7rem"}}>tb_log_answers_agents</code> e <code style={{fontSize: "0.7rem"}}>tb_function</code>
            </div>
            </div>

            {/*-- erros frequentes --*/}
            <div className="right-col">
            <div className="section-card">
                <div className="section-header">
                <div>
                    <p className="section-title">Erros frequentes</p>
                    <p className="section-subtitle">Por tipo de exceção Python</p>
                </div>
                </div>
                <div className="error-row"><div><p className="error-name">Erro de nome</p><p className="error-type">NameError</p></div><div className="error-bar-wrap"><div className="error-bar"><div className="error-fill" style={{width: "80%"}}></div></div></div><span className="error-count">24</span></div>
                <div className="error-row"><div><p className="error-name">Erro de tipo</p><p className="error-type">TypeError</p></div><div className="error-bar-wrap"><div className="error-bar"><div className="error-fill" style={{width: "55%"}}></div></div></div><span className="error-count">16</span></div>
                <div className="error-row"><div><p className="error-name">Indentação</p><p className="error-type">IndentationError</p></div><div className="error-bar-wrap"><div className="error-bar"><div className="error-fill" style={{width: "40%"}}></div></div></div><span className="error-count">12</span></div>
                <div className="error-row"><div><p className="error-name">Sintaxe</p><p className="error-type">SyntaxError</p></div><div className="error-bar-wrap"><div className="error-bar"><div className="error-fill" style={{width: "25%"}}></div></div></div><span className="error-count">7</span></div>
                <div className="error-row"><div><p className="error-name">Outros</p><p className="error-type">OTHERS</p></div><div className="error-bar-wrap"><div className="error-bar"><div className="error-fill"style={{width: "15%"}}></div></div></div><span className="error-count">4</span></div>
                <div className="data-source-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Requer <code style={{fontSize: "0.7rem"}}>error_type</code> no Python service
                </div>
            </div>
            </div>

        </div>
        </div>

        {/*── ABA COMPETIÇÃO ──*/}
        <div id="tab-competicao" className="tab-content">
        <div className="comp-layout">

            {/*-- ranking interno -- */}
            <div className="section-card">
            <div className="section-header">
                <div>
                <p className="section-title">Ranking da turma</p>
                <p className="section-subtitle">Partidas entre membros no período selecionado</p>
                </div>
            </div>
            <table className="ranking-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Aluno</th>
                    <th>Vitórias</th>
                    <th>Derrotas</th>
                    <th>Partidas</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><span className="rank-pos rank-pos--1">🥇</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">MO</div><span className="student-name">Marina Oliveira</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill" style={{width: "100%"}}></div></div><span className="wins-count">12</span></div></td>
                    <td><span className="losses-count">2</span></td>
                    <td><span className="losses-count">14</span></td>
                </tr>
                <tr>
                    <td><span className="rank-pos rank-pos--2">🥈</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">AM</div><span className="student-name">Ana Martins</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill" style={{width: "83%"}}></div></div><span className="wins-count">10</span></div></td>
                    <td><span className="losses-count">3</span></td>
                    <td><span className="losses-count">13</span></td>
                </tr>
                <tr>
                    <td><span className="rank-pos rank-pos--3">🥉</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">CS</div><span className="student-name">Carlos Silva</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill" style={{width: "67%"}}></div></div><span className="wins-count">8</span></div></td>
                    <td><span className="losses-count">4</span></td>
                    <td><span className="losses-count">12</span></td>
                </tr>
                <tr>
                    <td><span className="rank-pos rank-pos--other">4</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--ok">LC</div><span className="student-name">Larissa Costa</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill"  style={{width: "50%"}}></div></div><span className="wins-count">6</span></div></td>
                    <td><span className="losses-count">6</span></td>
                    <td><span className="losses-count">12</span></td>
                </tr>
                <tr>
                    <td><span className="rank-pos rank-pos--other">5</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--warn">JP</div><span className="student-name">João Pereira</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill"  style={{width: "25%"}}></div></div><span className="wins-count">3</span></div></td>
                    <td><span className="losses-count">9</span></td>
                    <td><span className="losses-count">12</span></td>
                </tr>
                <tr>
                    <td><span className="rank-pos rank-pos--other" style={{color: "rgba(255,255,255,0.2)"}}>—</span></td>
                    <td><div className="student-name-cell"><div className="student-avatar avatar--alert">RF</div><span className="student-name">Rafael Ferreira</span></div></td>
                    <td><div className="wins-bar-wrap"><div className="wins-bar"><div className="wins-fill"  style={{width: "0%"}}></div></div><span className="wins-count" style={{color: "var(--texto-muted)"}}>0</span></div></td>
                    <td><span className="losses-count">—</span></td>
                    <td><span className="losses-count" style={{color: "rgba(255,255,255,0.5)"}}>Sem partidas</span></td>
                </tr>
                </tbody>
            </table>
            <div className="data-source-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Dados de <code style={{fontSize: "0.7rem"}}>tb_match</code> · partidas entre membros desta turma
            </div>
            </div>

            {/*-- coluna direita competição --*/}
            <div className="right-col">

            {/*-- torneios --*/}
            <div className="section-card">
                <div className="section-header">
                <div>
                    <p className="section-title">Torneios da turma</p>
                    <p className="section-subtitle">Criados para esta turma</p>
                </div>
                </div>
                <div className="tournament-row">
                <p className="tournament-name">Torneio #1 — Abril</p>
                <p className="tournament-meta">18 participantes · em andamento</p>
                <span className="t-badge t-badge--open">Aberto</span>
                </div>
                <div className="tournament-row">
                <p className="tournament-name">Torneio #0 — Março</p>
                <p className="tournament-meta">22 participantes · 🥇 Marina Oliveira</p>
                <span className="t-badge t-badge--finished">Encerrado</span>
                </div>
                <button className="btn-new-tournament">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Novo torneio
                </button>
            </div>

            {/*-- partidas recentes --*/}
            <div className="section-card">
                <div className="section-header">
                    <div>
                        <p className="section-title">Partidas recentes</p>
                        <p className="section-subtitle">Entre membros da turma</p>
                    </div>
                </div>
                <div className="match-row">
                    <span className="match-player">Marina O.</span>
                    <span className="match-vs">vs</span>
                    <span className="match-player" style={{textAlign: "right"}}>João P.</span>
                    <span className="match-result match-result--win" style={{marginLeft: "8px"}}>1×0</span>
                </div>
                <div className="match-row">
                    <span className="match-player">Ana M.</span>
                    <span className="match-vs">vs</span>
                    <span className="match-player" style={{textAlign: "right"}}>Larissa C.</span>
                    <span className="match-result match-result--win" style={{marginLeft: "8px"}}>2×1</span>
                </div>
                <div className="match-row">
                    <span className="match-player">Carlos S.</span>
                    <span className="match-vs">vs</span>
                    <span className="match-player" style={{textAlign: "right"}}>Marina O.</span>
                    <span className="match-result match-result--loss" style={{marginLeft: "8px"}}>0×1</span>
                </div>
                <div className="match-row">
                    <span className="match-player">Larissa C.</span>
                    <span className="match-vs">vs</span>
                    <span className="match-player" style={{textAlign: "right"}}>João P.</span>
                    <span className="match-result match-result--win" style={{marginLeft: "8px"}}>1×0</span>
                </div>
                <div className="data-source-note">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Dados de <code style={{fontSize: "0.7rem"}}>tb_match</code>
                </div>
            </div>

            </div>
        </div>
        </div>

        </main>
    );
}