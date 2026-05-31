import { useState, useEffect } from 'react';
import DashBoardService from '../../services/DashBoardService';
import { getApiError } from '../../utils/errors';
import "../../pages/DashboardPage.css";
import PropTypes from 'prop-types';

export default function MatchesDashboard({ classroomID }) {
    const [matches, setMatches] = useState(null);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        DashBoardService.getRecentMatches(classroomID, page).then(data => setMatches(data)).catch(err => setError(getApiError(err)));
    }, [classroomID, page])

    if (error) {
        return <p>{error}</p>;
    }
    if (!matches) {
        return null;
    }

    return (
        <div className="section-card">
            <div className="section-header">
                <div>
                    <p className="section-title">Partidas recentes</p>
                    <p className="section-subtitle">Entre membros da turma</p>
                </div>
            </div>
            {matches.content.length === 0 ? (
                <p style={{ padding: '16px 20px', color: 'var(--texto-muted)', fontSize: '0.85rem' }}>
                    Nenhuma partida registrada ainda.
                </p>
            ) : (
                matches.content.map(match => (
                    <div className="match-row" key={match.matchId}>
                        <span className="match-player">
                            {match.player1Name}
                        </span>
                        <span className="match-vs">vs</span>
                        <span className="match-player" style={{ textAlign: 'right' }}>
                            {match.player2Name}
                        </span>
                        <span className={`match-result ${match.winnerId === match.player1Id ? 'match-result--win' : 'match-result--loss'}`} style={{ marginLeft: '8px' }}>
                            {match.winnerId ? (match.winnerId === match.player1Id ? '1x0' : '0x1') : 'Empate'}
                        </span>
                    </div>
                ))
            )}
            {matches.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn-page"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Anterior
                    </button>
                    <span className="pagination-info">
                        {page + 1} / {matches.totalPages}
                    </span>
                    <button
                        className="btn-page"
                        disabled={page === matches.totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}

MatchesDashboard.propTypes = {
    classroomID: PropTypes.number.isRequired
}