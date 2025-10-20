import React, { useState, useEffect, useMemo } from "react";
import {
  Users as UsersIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { apiService } from "../services/api";
import type { Department, User } from "../types";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const PAGE_SIZES = [10, 20, 50];

const chipBase =
  "px-3 py-1.5 rounded-full text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
const chipOn = `${chipBase} bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
const chipOff = `${chipBase} bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-indigo-500`;
const selectBase =
  "mt-1 block w-full rounded-md border-slate-300 bg-white text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentIdFilter, setDepartmentIdFilter] = useState<number | "all">("all");
  const [isActiveFilter, setIsActiveFilter] = useState<"true" | "false" | "all">("true"); // default active

  // departments
  const [departments, setDepartments] = useState<Department[]>([]);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // load departments once
  useEffect(() => {
    (async () => {
      try {
        const list = await apiService.getDepartments();
        setDepartments(list);
      } catch {
        toast.error("Failed to load departments");
      }
    })();
  }, []);

  // fetch users whenever filters/pagination change
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUsers({
          page,
          pageSize,
          sortBy: "id",
          desc: true,
          isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "true",
          role: roleFilter === "all" ? undefined : roleFilter,
          departmentId: departmentIdFilter === "all" ? undefined : departmentIdFilter,
        });
        setUsers(data.items);
        setTotal(data.total);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, pageSize, isActiveFilter, roleFilter, departmentIdFilter]);

  // currently all server-filtered; keep as a single reference
  const displayedUsers = useMemo(() => users, [users]);

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "EMPLOYEE", label: "EMPLOYEE" },
    { value: "MANAGER", label: "MANAGER" },
    { value: "HR", label: "HR" },
  ];

  // pagination helpers
  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);
  const onPageSizeChange = (n: number) => {
    setPageSize(n);
    setPage(1);
  };

  const selectedDept =
    departmentIdFilter === "all"
      ? null
      : departments.find((d) => d.id === departmentIdFilter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Top banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 p-[1px] shadow">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
              <p className="text-sm text-slate-600">
                Showing <strong>{displayedUsers.length}</strong> on this page • Total (server):{" "}
                <strong>{total}</strong> • Page <strong>{page}</strong> of <strong>{totalPages}</strong>{" "}
                —{" "}
                {isActiveFilter === "all"
                  ? "Active + Inactive"
                  : isActiveFilter === "true"
                  ? "Active only"
                  : "Inactive only"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-slate-600">Rows:</label>
              <select
                className="rounded-md border-slate-300 bg-white text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status chips */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={isActiveFilter === "true" ? chipOn : chipOff}
                  onClick={() => {
                    setIsActiveFilter("true");
                    setPage(1);
                  }}
                >
                  Active
                </button>
                <button
                  className={isActiveFilter === "false" ? chipOn : chipOff}
                  onClick={() => {
                    setIsActiveFilter("false");
                    setPage(1);
                  }}
                >
                  Inactive
                </button>
                <button
                  className={isActiveFilter === "all" ? chipOn : chipOff}
                  onClick={() => {
                    setIsActiveFilter("all");
                    setPage(1);
                  }}
                >
                  All
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="roleFilter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Role
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className={selectBase}
              >
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department (server-driven) */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="departmentFilter"
                  className="block text-sm font-medium text-slate-700"
                >
                  Department
                </label>
                {selectedDept && typeof selectedDept.usersCount === "number" && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {selectedDept.usersCount} users
                  </span>
                )}
              </div>

              <select
                id="departmentFilter"
                value={departmentIdFilter === "all" ? "all" : String(departmentIdFilter)}
                onChange={(e) => {
                  const val = e.target.value;
                  setDepartmentIdFilter(val === "all" ? "all" : Number(val));
                  setPage(1);
                }}
                className={selectBase}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {typeof d.usersCount === "number" ? ` (${d.usersCount})` : ""}
                    {d.managerName ? ` — Manager: ${d.managerName}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {displayedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No users found</h3>
            <p className="mt-1 text-sm text-slate-600">Try changing filters or page size.</p>
          </div>
        ) : (
          <>
            <div className="max-h-[62vh] overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm">
                  <tr className="text-left text-slate-600">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Department</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50/60 hover:bg-slate-100"
                      }
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.username}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-800">{u.email}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            u.role === "HR"
                              ? "bg-fuchsia-100 text-fuchsia-800"
                              : u.role === "MANAGER"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-emerald-100 text-emerald-800",
                          ].join(" ")}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-800">{u.departmentName ?? "N/A"}</span>
                      </td>
                      <td className="px-6 py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3">
              <div className="text-sm text-slate-600">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={goFirst}
                  disabled={page <= 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  First
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={goPrev}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={goNext}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={goLast}
                  disabled={page >= totalPages}
                >
                  Last
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
