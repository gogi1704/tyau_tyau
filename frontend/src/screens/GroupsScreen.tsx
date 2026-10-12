import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { api } from "../lib/api";
import GroupJoinButton from "../components/GroupJoinButton";
import CreateGroupModal from "../components/CreateGroupModal";
import EmptyState from "../components/EmptyState";

export default function GroupsScreen() {
  const [creating, setCreating] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["groups"], queryFn: api.getGroups });
  const groups = data?.groups ?? [];

  return (
    <div className="pb-6">
      <Link to="/" className="mb-2 inline-flex items-center gap-1.5 px-5 pt-4 text-sm font-medium text-ink-500 dark:text-ink-300">
        <ArrowLeft size={16} /> Назад
      </Link>

      <div className="flex items-start justify-between px-5 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">Группы</h1>
          <p className="mt-0.5 text-sm text-ink-400">Сообщества собачников Ростова</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-white shadow-soft active:scale-90 transition-transform"
          aria-label="Создать группу"
        >
          <Plus size={20} />
        </button>
      </div>

      {isLoading ? (
        <p className="mt-6 text-center text-sm text-ink-400">Загружаем…</p>
      ) : groups.length === 0 ? (
        <EmptyState
          title="Групп пока нет"
          subtitle="Создайте первую — соберите вокруг себя соседей-собачников"
          action={
            <button
              onClick={() => setCreating(true)}
              className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Создать группу
            </button>
          }
        />
      ) : (
        <div className="mt-4 space-y-2.5 px-5">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft dark:bg-ink-800">
              <Link to={`/groups/${g.id}`} className="flex flex-1 items-center gap-3">
                {g.photoUrl ? (
                  <img src={g.photoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300">
                    <Users size={20} />
                  </span>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 dark:text-white">{g.name}</p>
                  <p className="text-xs text-ink-400">{g.membersCount} участников</p>
                </div>
              </Link>
              <GroupJoinButton groupId={g.id} isMember={g.isMember} />
            </div>
          ))}
        </div>
      )}

      {creating && <CreateGroupModal onClose={() => setCreating(false)} />}
    </div>
  );
}
