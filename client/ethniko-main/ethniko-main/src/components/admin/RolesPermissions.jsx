import React, { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

const PAGE_SIZE = 50;

// Roles that can be given from the dropdown. CUSTOMER means "no admin access".
const ASSIGNABLE = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CONTENT_MANAGER', label: 'Content Manager' },
  { value: 'ORDER_MANAGER', label: 'Order Manager' },
  { value: 'CUSTOMER', label: 'Customer (no admin access)' },
];

// "an Admin", "an Order Manager", "a Content Manager"
const withArticle = (label) => `${/^[aeiou]/i.test(label) ? 'an' : 'a'} ${label}`;

const roleBadgeClass = (role) =>
  role === 'ADMIN'
    ? 'bg-[#181818] text-[#D4AF37]'
    : role === 'CONTENT_MANAGER' || role === 'ORDER_MANAGER'
    ? 'bg-[#B68D40] text-white'
    : 'bg-neutral-100 text-neutral-500';

/**
 * Admin tab: shows what each role can do and lets an admin give team members a role.
 * Roles and permissions are defined on the server; this screen only displays and assigns them.
 */
export default function RolesPermissions() {
  const [definitions, setDefinitions] = useState(null); // { roles, permissions }
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | team | customers
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [defs, team] = await Promise.all([adminService.getRoleDefinitions(), adminService.getTeamUsers()]);
        if (cancelled) return;
        setDefinitions(defs);
        setUsers(team);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError(err?.message || 'Could not load roles.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === 'team' && !u.isStaff) return false;
      if (filter === 'customers' && u.isStaff) return false;
      if (!term) return true;
      return `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(term);
    });
  }, [users, search, filter]);

  const counts = useMemo(() => {
    const result = {};
    users.forEach((u) => { result[u.role] = (result[u.role] || 0) + 1; });
    return result;
  }, [users]);

  const handleRoleChange = async (member, role) => {
    if (role === member.role) return;
    const target = ASSIGNABLE.find((r) => r.value === role);
    const message = role === 'CUSTOMER'
      ? `Remove ${member.name}'s admin access? They will become a regular customer.`
      : `Make ${member.name} ${withArticle(target.label)}? They will get this role's access the next time they open the admin area.`;
    if (!window.confirm(message)) return;

    setSavingId(member.id);
    try {
      const updated = await adminService.updateUserRole(member.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`${member.name} is now ${role === 'CUSTOMER' ? 'a customer' : withArticle(target.label)}.`);
    } catch (err) {
      console.error(err);
      toast.error(err?.errors?.[0]?.message || err?.message || 'Could not change the role.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p className="py-16 text-center font-serif italic text-[#B68D40] animate-pulse">Loading roles...</p>;
  }
  if (loadError || !definitions) {
    return <p className="py-16 text-center text-sm text-red-500 font-sans">{loadError || 'Could not load roles.'}</p>;
  }

  return (
    <div className="space-y-10 text-left font-sans">
      <div className="flex items-center gap-3 border-b pb-3">
        <ShieldCheck className="w-5 h-5 text-[#B68D40]" />
        <div>
          <h3 className="font-serif text-lg tracking-wider uppercase">Roles & Permissions</h3>
          <p className="text-[11px] text-neutral-400">Decide who on your team can see and change what.</p>
        </div>
      </div>

      {/* What each role can do */}
      <section className="space-y-4">
        <h4 className="text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase">What each role can do</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {definitions.roles.map((role) => (
            <div key={role.key} className="border border-[#E6DCCF] bg-white p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-sm font-semibold">{role.label}</span>
                <span className="text-[9px] text-neutral-400">
                  {counts[role.key] || 0} {(counts[role.key] || 0) === 1 ? 'person' : 'people'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto border border-[#E6DCCF] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-[#E6DCCF] text-[9px] uppercase tracking-wider text-[#B68D40]">
                <th className="p-3 font-semibold">Area</th>
                {definitions.roles.map((role) => (
                  <th key={role.key} className="p-3 font-semibold text-center">{role.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {definitions.permissions.map((permission) => (
                <tr key={permission.key} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3 align-top">
                    <span className="font-semibold text-neutral-800 block">{permission.label}</span>
                    <span className="text-[10px] text-neutral-400 block leading-relaxed">{permission.description}</span>
                  </td>
                  {definitions.roles.map((role) => {
                    const allowed = role.permissions.includes(permission.key);
                    return (
                      <td key={role.key} className="p-3 text-center align-middle">
                        {allowed ? (
                          <Check className="w-4 h-4 text-green-600 inline" aria-label="Allowed" />
                        ) : (
                          <Minus className="w-4 h-4 text-neutral-300 inline" aria-label="Not allowed" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Team members */}
      <section className="space-y-4">
        <div>
          <h4 className="text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase">Team & access</h4>
          <p className="text-[11px] text-neutral-400 mt-1">
            Team members need to create an account on the website first. Then find them here and choose their role.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
              placeholder="Search by name, email or phone"
              className="w-full bg-white border border-neutral-300 pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#B68D40]"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setVisible(PAGE_SIZE); }}
            className="bg-white border border-neutral-300 px-3 py-2.5 text-xs focus:outline-none focus:border-[#B68D40]"
            aria-label="Filter users"
          >
            <option value="all">Everyone</option>
            <option value="team">Team members only</option>
            <option value="customers">Customers only</option>
          </select>
        </div>

        <div className="overflow-x-auto border border-[#E6DCCF] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-[#E6DCCF] text-[9px] uppercase tracking-wider text-[#B68D40]">
                <th className="p-3 font-semibold">Person</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold hidden md:table-cell">Last changed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, visible).map((member) => {
                const locked = member.isYou || member.isOwner;
                const lockReason = member.isYou
                  ? "You can't change your own role."
                  : member.isOwner
                  ? "This account is set as an owner in the server settings, so its role can't change."
                  : '';
                return (
                  <tr key={member.id} className="border-b border-neutral-100 last:border-0 align-middle">
                    <td className="p-3">
                      <span className="font-semibold text-neutral-800 block">
                        {member.name}
                        {member.isYou && <span className="ml-2 text-[9px] font-bold text-[#B68D40]">YOU</span>}
                        {member.isOwner && <span className="ml-2 text-[9px] font-bold text-neutral-400">OWNER</span>}
                      </span>
                      <span className="text-[10px] text-neutral-400 block break-all">{member.email}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap ${roleBadgeClass(member.role)}`}>
                          {member.roleLabel}
                        </span>
                        <select
                          value={ASSIGNABLE.some((r) => r.value === member.role) ? member.role : ''}
                          disabled={locked || savingId === member.id}
                          title={lockReason}
                          onChange={(e) => handleRoleChange(member, e.target.value)}
                          className="bg-white border border-neutral-300 px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#B68D40] disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Role for ${member.name}`}
                        >
                          {!ASSIGNABLE.some((r) => r.value === member.role) && <option value="">Change role…</option>}
                          {ASSIGNABLE.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        {savingId === member.id && <span className="text-[10px] text-neutral-400">Saving…</span>}
                      </div>
                      {lockReason && <p className="text-[9px] text-neutral-400 mt-1">{lockReason}</p>}
                    </td>
                    <td className="p-3 hidden md:table-cell text-[10px] text-neutral-400">
                      {member.roleChangedAt
                        ? `${new Date(member.roleChangedAt).toLocaleDateString()} by ${member.roleChangedBy || 'an admin'}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-neutral-400">No one matches that search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > visible && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="text-[10px] uppercase tracking-widest font-bold text-[#B68D40] hover:text-black"
            >
              Show more ({filtered.length - visible} more)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
