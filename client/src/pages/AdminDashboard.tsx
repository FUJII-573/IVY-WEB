import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, BarChart3, Download, Users, ClipboardList, Wallet } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch employees list
  const { data: employees = [], refetch: refetchEmployees } = trpc.employees.list.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.requisitions.getStats.useQuery();
  const { data: allRequisitions = [] } = trpc.requisitions.list.useQuery({ limit: 1000 });

  // Add employee mutation
  const addEmployeeMutation = trpc.employees.add.useMutation({
    onSuccess: () => {
      setNewEmployeeName("");
      refetchEmployees();
    },
    onError: (error) => {
      alert(`Error adding employee: ${error.message}`);
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      refetchEmployees();
    },
    onError: (error) => {
      alert(`Error deleting employee: ${error.message}`);
    },
  });

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      alert("Please enter an employee name");
      return;
    }

    setLoading(true);
    try {
      await addEmployeeMutation.mutateAsync({ name: newEmployeeName });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteEmployeeMutation.mutateAsync({ id });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (allRequisitions.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Employee Name", "Items", "Total Amount", "Status", "Created At"];
    const rows = allRequisitions.map((r: any) => [
      r.id,
      r.employeeName,
      r.items.replace(/"/g, '""'), // Escape quotes for CSV
      r.totalAmount,
      r.status,
      new Date(r.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `requisition_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
          fontSize: "18px",
        }}
      >
        You do not have permission to access this page
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        background: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginTop: 0, color: "#0d47a1" }}>Admin Dashboard</h1>
      <p>Overview and management for the requisition system</p>

      {/* Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <Card style={{ padding: "15px", background: theme === "dark" ? "#1e1e1e" : "#fff", border: "1px solid #ddd", display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ padding: "10px", background: "rgba(13, 71, 161, 0.1)", borderRadius: "10px", color: "#0d47a1" }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999" }}>Total Requisitions</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{stats?.totalRequisitions || 0}</div>
          </div>
        </Card>
        <Card style={{ padding: "15px", background: theme === "dark" ? "#1e1e1e" : "#fff", border: "1px solid #ddd", display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ padding: "10px", background: "rgba(76, 175, 80, 0.1)", borderRadius: "10px", color: "#4caf50" }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999" }}>Total Amount</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>฿{(stats?.totalAmount || 0).toLocaleString()}</div>
          </div>
        </Card>
        <Card style={{ padding: "15px", background: theme === "dark" ? "#1e1e1e" : "#fff", border: "1px solid #ddd", display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ padding: "10px", background: "rgba(255, 152, 0, 0.1)", borderRadius: "10px", color: "#ff9800" }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999" }}>Total Employees</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>{employees.length}</div>
          </div>
        </Card>
      </div>

      {/* Export & Quick Actions */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Button
          onClick={handleExportExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          <Download size={18} />
          Export to CSV (Excel)
        </Button>
      </div>

      {/* Add Employee Section */}
      <Card
        style={{
          padding: "20px",
          marginBottom: "20px",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
          border: "1px solid #ddd",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add New Employee</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            type="text"
            placeholder="Enter employee name"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddEmployee();
              }
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#333",
            }}
          />
          <Button
            onClick={handleAddEmployee}
            disabled={loading || addEmployeeMutation.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "#0d47a1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.1s ease-out",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.95)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            <Plus size={18} />
            Add
          </Button>
        </div>
      </Card>

      {/* Employees List */}
      <Card
        style={{
          padding: "20px",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
          border: "1px solid #ddd",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Employees ({employees.length})</h2>
        {employees.length === 0 ? (
          <p style={{ color: "#999" }}>No employees yet. Add one to get started.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {employees.map((employee: any) => (
              <div
                key={employee.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: theme === "dark" ? "#2a2a2a" : "#f9f9f9",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600" }}>{employee.name}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    Added: {new Date(employee.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  disabled={loading || deleteEmployeeMutation.isPending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.1s ease-out",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(0.95)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1)";
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
