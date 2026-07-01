import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUsers, setLoading, removeUser } from "@/features/userSlice";
import * as userService from "@/services/userService";
import DataTable from "@/components/DataTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserFormDialog from "./UserFormDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { User, Column } from "@/types";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list, pagination, loading } = useAppSelector((s) => s.users);
  const { toast } = useToast();
  const [params, setParams] = useState({ page: 1, search: "", sort: "" });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const { data } = await userService.getUsers({ page: params.page, search: params.search || undefined, limit: 10 });
      dispatch(setUsers(data));
    } catch {
      dispatch(setLoading(false));
    }
  }, [dispatch, params.page, params.search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deleteId);
      dispatch(removeUser(deleteId));
      toast({ title: "Deleted", description: "User deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<User>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", render: (row) => <span className="capitalize">{row.role}</span> },
    { key: "isVerified", label: "Verified", render: (row) => row.isVerified ? "✓" : "✗" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setEditUser(row); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row._id)}><Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => { setEditUser(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>
      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onParamsChange={setParams} searchPlaceholder="Search users..." />
      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editUser} onSuccess={load} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} description="This will permanently delete this user." />
    </div>
  );
}
