'use client';

import { useEffect, useState } from "react";
import { BiPlusCircle, BiSearch } from "react-icons/bi";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { useAdminProfile } from "@/components/admin/use-admin-profile";
import {
  Member, Perk, Role,
  createRole, deleteRole, getMembers, getPerks, getRoles, setMemberRoles, updateRole,
} from "@/app/api/roles";

const emptyForm = { name: '', description: '', perks: [] as string[] };

function errorText(err: any, fallback: string) {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return fallback;
  return Object.values(data).flat().join(' ') || fallback;
}

export default function RolesPage() {
  const { profile, loading } = useAdminProfile();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [memberMessage, setMemberMessage] = useState('');

  const perkLabel = (code: string) => perks.find((p) => p.code === code)?.label ?? code;

  const loadRoles = () => getRoles().then((res) => setRoles(res.data));
  const loadMembers = (term: string) =>
    getMembers(term ? { search: term } : { with_roles: '1' }).then((res) => setMembers(res.data));

  useEffect(() => {
    if (!profile?.is_superuser) return;
    getPerks().then((res) => setPerks(res.data));
    loadRoles();
  }, [profile]);

  // Search members as you type (short pause so we don't query on every keystroke)
  useEffect(() => {
    if (!profile?.is_superuser) return;
    const timer = setTimeout(() => loadMembers(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [profile, search]);

  if (loading) return null;
  if (!profile?.is_superuser) {
    return <p className="text-gray-600">Only super admins can manage roles and perks.</p>;
  }

  const togglePerk = (code: string) =>
    setForm((f) => ({
      ...f,
      perks: f.perks.includes(code) ? f.perks.filter((p) => p !== code) : [...f.perks, code],
    }));

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await updateRole(editingId, form);
      else await createRole(form);
      setForm(emptyForm);
      setEditingId(null);
      loadRoles();
    } catch (err) {
      setError(errorText(err, 'Could not save the role.'));
    }
  };

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setForm({ name: role.name, description: role.description, perks: role.perks });
  };

  const removeRole = async (role: Role) => {
    if (!confirm(`Delete the "${role.name}" role? ${role.member_count} member(s) will lose its perks.`)) return;
    await deleteRole(role.id);
    loadRoles();
    loadMembers(search);
  };

  const toggleMemberRole = async (member: Member, roleId: number) => {
    const next = member.roles.includes(roleId)
      ? member.roles.filter((id) => id !== roleId)
      : [...member.roles, roleId];
    try {
      const res = await setMemberRoles(member.id, next);
      setMembers((list) => list.map((m) => (m.id === member.id ? res.data : m)));
      setMemberMessage(`Updated roles for ${member.username}.`);
      loadRoles();
    } catch (err) {
      setMemberMessage(errorText(err, 'Could not update roles.'));
    }
  };

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold text-blue-950 mb-1">Roles &amp; Perks</h1>
        <p className="text-gray-600 mb-6">
          Bundle perks into a role, then give the role to members. Members with a role can sign in to this dashboard
          and only see what their perks allow.
        </p>

        <form onSubmit={saveRole} className="bg-white border border-gray-300 rounded p-4 space-y-4 max-w-2xl">
          <h2 className="font-semibold">{editingId ? 'Edit role' : 'New role'}</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="Role name, e.g. Secretary"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">Perks</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {perks.map((perk) => (
                <label key={perk.code} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.perks.includes(perk.code)} onChange={() => togglePerk(perk.code)} />
                  {perk.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <BiPlusCircle size={20} className="inline-block mr-1" />
              {editingId ? 'Save role' : 'Create role'}
            </button>
            {editingId && (
              <button
                type="button"
                className="py-2 px-4 rounded border border-gray-300"
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Role</th>
                <th className="py-2 px-4 border-b text-start">Perks</th>
                <th className="py-2 px-4 border-b text-start">Members</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 && (
                <tr><td colSpan={4} className="py-4 px-4 text-gray-500">No roles yet. Create one above.</td></tr>
              )}
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">{role.name}</div>
                    {role.description && <div className="text-xs text-gray-500">{role.description}</div>}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-wrap gap-1">
                      {role.perks.map((code) => (
                        <span key={code} className="text-xs bg-sky-100 text-blue-700 rounded px-2 py-0.5">{perkLabel(code)}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">{role.member_count}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => startEdit(role)} className="text-blue-600 mr-3" aria-label="Edit role"><BsPencilSquare /></button>
                    <button onClick={() => removeRole(role)} className="text-red-600" aria-label="Delete role"><BsTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-blue-950 mb-1">Give roles to members</h2>
        <p className="text-gray-600 mb-4">Search for a member by name or email, then tick the roles they should have.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); loadMembers(search.trim()); }}
          className="flex items-center border-b border-blue-500 py-2 max-w-md mb-4"
        >
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Search members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Search"><BiSearch size={24} /></button>
        </form>
        {memberMessage && <p className="text-sm text-gray-600 mb-2">{memberMessage}</p>}
        {!search && <p className="text-sm text-gray-500 mb-2">Showing members who already have a role.</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Member</th>
                {roles.map((role) => (
                  <th key={role.id} className="py-2 px-4 border-b text-start">{role.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={roles.length + 1} className="py-4 px-4 text-gray-500">No members found.</td></tr>
              )}
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="py-2 px-4 border-b">
                    <div className="font-medium">
                      {member.username}
                      {member.is_superuser && <span className="ml-2 text-xs text-amber-700">super admin</span>}
                    </div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        aria-label={`${role.name} for ${member.username}`}
                        checked={member.roles.includes(role.id)}
                        onChange={() => toggleMemberRole(member, role.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
