import { useParams } from "react-router-dom";
import ClassroomService from "../services/ClassroomService";
import "./DashboardPage.css"
import { useEffect, useState } from "react";
import HeaderDashboard from "../components/Dashboards/HeaderDashboard";
import OverviewDashboard from "../components/Dashboards/OverviewDashboard";
import EngagementDashboard from "../components/Dashboards/EngagementDashboard";
import AppModal from "../components/UI/AppModal";
import RankingDashboard from "../components/Dashboards/RankingDashboard";

export default function DashboardPage() {
    const { id } = useParams();
    const classroomID = Number(id);
    const [classroom, setClassroom] = useState(null);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [filterApplied, setFilterApplied] = useState({ from: '', to: '' });
    const [modal, setModal] = useState({ open: false, message: '' });
    const [activeTab, setActiveTab] = useState("aprendizado");

    useEffect(() => {
        ClassroomService.findById(classroomID).then(data => {
            setClassroom(data);

            const fromDate = data.createdAt.slice(0, 10);
            const toDate = new Date().toISOString().slice(0,10);

            setFrom(fromDate);
            setTo(toDate);
            setFilterApplied({
                from: `${fromDate}T00:00:00`,
                to: `${toDate}T23:59:59`,
            });
        });  
    }, [classroomID]);

    const formatToISO = (dateStr, endOfDay = false) => {
        if (!dateStr) {
            return '';
        } 
        return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
    };

    const handleFilter = () => {
        if (!from || !to) {
            setModal({ open: true, message: 'Selecione ambas as datas.' });
            return;
        }

        if (new Date(from) > new Date(to)) {
            setModal({ open: true, message: 'A data de início não pode ser maior que a data de fim.' });
            return;
        }

        const fromISO = formatToISO(from);
        const toISO =formatToISO(to, true);

        setFilterApplied({from: fromISO, to: toISO});
    }

    if (!classroom) {
        return null;
    }

    return (
        <main className="page-dashboard-classroom">
            <AppModal
                open={modal.open}
                title="Atenção"
                variant="error"
                onClose={() => setModal({ open: false, message: '' })}
                primaryAction={{
                    label: 'Ok',
                    onClick: () => setModal({ open: false, message: '' })
                }}
            >
                <p>{modal.message}</p>
            </AppModal>

            <HeaderDashboard
                classroom={classroom}
                id={id}
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onFilter={handleFilter}
            />

            <OverviewDashboard 
                classroomID={classroomID}
                from={filterApplied.from}
                to={filterApplied.to}
            />
            

            {/*-- TABS --*/}
            <div className="tabs">
            <button className={`tab ${activeTab === 'aprendizado' ? 'tab--active' : ''}`} onClick={() => setActiveTab("aprendizado")}>
                <span className="tab-icon">📚</span> Aprendizado
            </button>
            <button className={`tab ${activeTab === 'ranking' ? 'tab--active' : ''}`} onClick={() => setActiveTab("ranking")}>
                <span className="tab-icon">🏆</span> Competição
            </button>
            </div>

            {activeTab === 'aprendizado' && (
                <EngagementDashboard
                    classroomID={classroomID}
                    from={filterApplied.from}
                    to={filterApplied.to}
                />
            )}

            {activeTab === 'ranking' && (
                <RankingDashboard 
                    classroomID={classroomID}
                />
            )}
        </main>
    );
}