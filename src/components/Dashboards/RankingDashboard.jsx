import { useState, useEffect } from 'react';
import DashBoardService from '../../services/DashBoardService';
import { getApiError } from '../../utils/errors';
import "../../pages/DashboardPage.css";
import MatchesDashboard from './MatchesDashboard';
import PropTypes from 'prop-types';

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getRankPosClass(position) {
  if (position === 1) return 'rank-pos--1';
  if (position === 2) return 'rank-pos--2';
  if (position === 3) return 'rank-pos--3';
  return 'rank-pos--other';
}

function getRankPosLabel(position) {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return position;
}

function getWinsPercent(wins, ranking) {
  const max = Math.max(...ranking.map(a => a.wins));
  if (max === 0) return 0;
  return Math.round((wins / max) * 100);
}

export default function RankingDashboard({ classroomID }) { 
    const [ranking, setRanking] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        DashBoardService.getRanking(classroomID).then(data => setRanking(data)).catch(err => setError(getApiError(err)));
    }, [classroomID])

    if (error) {
        return <p>{error}</p>;
    }
    if (!ranking) {
        return null;
    }

    return (
        <div>
            <div className="comp-layout">
            {/*-- ranking interno -- */}
            <div className="section-card">
                <div className="section-header">
                    <div>
                    <p className="section-title">Ranking da turma</p>
                    <p className="section-subtitle">Vitórias acumuladas em partidas da turma</p>
                    </div>
                </div>
                <table className="ranking-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Aluno</th>
                        <th>Vitórias</th>
                    </tr>
                    </thead>
                    <tbody>
                        {ranking.map(aluno => (
                        <tr key={aluno.userId}>
                            <td>
                                <span className={`rank-pos ${getRankPosClass(aluno.position)}`}>
                                    {getRankPosLabel(aluno.position)}
                                </span>
                            </td>
                            <td>
                                <div className="student-name-cell">
                                    <div className="student-avatar avatar--ok">{getInitials(aluno.userName)}</div>
                                    <span className="student-name">{aluno.userName}</span></div>
                            </td>
                            <td>
                                <div className="wins-bar-wrap">
                                    <div className="wins-bar"><div className="wins-fill" style={{ width: `${getWinsPercent(aluno.wins, ranking)}%` }}></div>
                                    </div>
                                    <span className="wins-count">{aluno.wins}</span>
                                </div></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

                {/*-- coluna direita competição --*/}
                <div className="right-col">

                    {/*-- torneios da turma coloca aqui --*/}
                

                    {/*-- partidas recentes --*/}
                    <MatchesDashboard 
                        classroomID={classroomID}
                    />

                </div>
            </div>
        </div>
    );
}

RankingDashboard.propTypes = {
    classroomID: PropTypes.number.isRequired
}