import { useEffect, useRef, useState, useCallback } from "react";
import UserService, { PROFILE } from "../services/UserService";
import AppModal from "../components/UI/AppModal";
import "./AdminUsersPage.css";

function extractApiError(err) {
  const status = err?.response?.status ?? err?.normalized?.status ?? 0;
  const data = err?.response?.data;
  const backendMsg = data?.error || data?.message;
  const normalizedMsg = err?.normalized?.message;
  const msg =
    backendMsg ||
    normalizedMsg ||
    (status === 0
      ? "Falha de conexão. Tente novamente."
      : "Erro na requisição.");
  return { status, message: msg };
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const closeModal = () => setModal((m) => ({ ...m, open: false }));
  const requestSeq = useRef(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const seq = ++requestSeq.current;
    try {
      const res = await UserService.search({ q, page, size });
      if (seq === requestSeq.current) setData(res);
    } catch (err) {
      const { status, message } = extractApiError(err);
      setModal({
        open: true,
        title: status === 0 ? "Falha de conexão" : "Erro ao carregar usuários",
        message,
        variant: "error",
      });
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [q, page, size]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleProfile = async (u) => {
    const next =
      u.profileType === PROFILE.INSTRUCTOR
        ? PROFILE.STUDENT
        : PROFILE.INSTRUCTOR;

    setSavingId(u.id);
    try {
      await UserService.updateProfile({ userId: u.id, type: next });
      setData((prev) => ({
        ...prev,
        content: prev.content.map((it) =>
          it.id === u.id ? { ...it, profileType: next } : it
        ),
      }));

      setModal({
        open: true,
        title: "Perfil atualizado",
        message: `O usuário ${u.name} agora é ${next}.`,
        variant: "success",
      });
    } catch (err) {
      const { status, message } = extractApiError(err);
      setModal({
        open: true,
        title:
          status === 404
            ? "Usuário não encontrado"
            : "Erro ao atualizar perfil",
        message,
        variant: "error",
      });
    } finally {
      setSavingId(null);
    }
  };

  const canPrev = data.number > 0;
  const canNext = data.number + 1 < (data.totalPages ?? 0);

  return (
    <div className="admin-users-page">
      <h2 className="admin-title">Gerenciar Usuários</h2>

      <div className="admin-controls">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar por nome ou e-mail"
          className="admin-input"
        />

        <select
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
          className="admin-select"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/página
            </option>
          ))}
        </select>

        <button
          className="admin-button-outline"
          onClick={() => {
            setQ("");
            setPage(0);
          }}
        >
          Limpar
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-loading">
                  Carregando...
                </td>
              </tr>
            ) : data.content?.length > 0 ? (
              data.content.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`tag ${
                        u.profileType === "INSTRUCTOR"
                          ? "tag-instructor"
                          : "tag-student"
                      }`}
                    >
                      {u.profileType}
                    </span>
                  </td>

                  <td>
                    <button
                      className={`admin-button ${
                        u.profileType === PROFILE.INSTRUCTOR
                          ? "demote"
                          : "promote"
                      }`}
                      onClick={() => handleToggleProfile(u)}
                      disabled={savingId === u.id}
                    >
                      {savingId === u.id
                        ? "Salvando..."
                        : u.profileType === PROFILE.INSTRUCTOR
                        ? "Tornar STUDENT"
                        : "Tornar INSTRUCTOR"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="admin-empty">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button
          disabled={!canPrev || loading}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="admin-button-outline"
        >
          Anterior
        </button>
        <span>
          Página {Number(data?.number ?? 0) + 1} de{" "}
          {Number(data?.totalPages ?? 1)}
        </span>
        <button
          disabled={!canNext || loading}
          onClick={() => setPage((p) => p + 1)}
          className="admin-button-outline"
        >
          Próxima
        </button>
      </div>

      <AppModal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        variant={modal.variant}
        primaryAction={{ id: "modal-ok", label: "Ok", onClick: closeModal }}
        initialFocus="modal-ok"
      >
        <p>{modal.message}</p>
      </AppModal>
    </div>
  );
}
