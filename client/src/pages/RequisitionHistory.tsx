import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RequisitionHistory() {
  const [selectedRequisition, setSelectedRequisition] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  // ดึงรายการเบิก
  const { data: requisitions, isLoading } = trpc.requisitions.list.useQuery({
    limit: 100,
    offset: 0,
  });

  // ฟิลเตอร์รายการเบิก
  const filtered = requisitions?.filter((req: any) => {
    if (filter === "all") return true;
    return req.status === filter;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#fff3cd", text: "#856404" },
      approved: { bg: "#d1ecf1", text: "#0c5460" },
      completed: { bg: "#d4edda", text: "#155724" },
      cancelled: { bg: "#f8d7da", text: "#721c24" },
    };
    const style = statusMap[status] || statusMap.pending;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "12px",
          background: style.bg,
          color: style.text,
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {status}
      </span>
    );
  };

  const parseItems = (itemsJson: string) => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ color: "#0d47a1", marginBottom: "20px" }}>ประวัติการเบิกของ</h1>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", "pending", "approved", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? "#0d47a1" : "#e8e8e8",
              color: filter === status ? "#fff" : "#333",
              border: "none",
              padding: "8px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: filter === status ? "600" : "400",
            }}
          >
            {status === "all" ? "ทั้งหมด" : status}
          </Button>
        ))}
      </div>

      {/* Requisitions List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "18px", color: "#999" }}>กำลังโหลด...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "18px", color: "#999" }}>ไม่มีรายการเบิก</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {filtered.map((req: any) => (
            <Card
              key={req.id}
              onClick={() => setSelectedRequisition(req)}
              style={{
                padding: "16px",
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: selectedRequisition?.id === req.id ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                if (selectedRequisition?.id !== req.id) {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    เบิกโดย: {req.employeeName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    {new Date(req.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    จำนวนรายการ: {parseItems(req.items).length}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0d47a1", marginTop: "4px" }}>
                    รวม: {req.totalAmount} ฿
                  </div>
                </div>
                <Button
                  style={{
                    background: "#0d47a1",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ดูรายละเอียด
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequisition && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRequisition(null)}
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#0d47a1", margin: 0 }}>รายละเอียดการเบิก #{selectedRequisition.id}</h2>
              <button
                onClick={() => setSelectedRequisition(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>ผู้เบิก</div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>{selectedRequisition.employeeName}</div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>วันที่เบิก</div>
              <div style={{ fontSize: "14px" }}>
                {new Date(selectedRequisition.createdAt).toLocaleString("th-TH")}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>สถานะ</div>
              <div>{getStatusBadge(selectedRequisition.status)}</div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>รายการเบิก</div>
              <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px" }}>
                {parseItems(selectedRequisition.items).map((item: any, idx: number) => (
                  <div key={idx} style={{ padding: "8px 0", borderBottom: idx < parseItems(selectedRequisition.items).length - 1 ? "1px solid #e0e0e0" : "none" }}>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>{item.name} x {item.qty}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{item.price} ฿ = {item.price * item.qty} ฿</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedRequisition.note && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>หมายเหตุ</div>
                <div style={{ fontSize: "14px", background: "#fff3cd", padding: "12px", borderRadius: "8px", color: "#333" }}>
                  {selectedRequisition.note}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "16px", paddingTop: "16px", borderTop: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>รวมทั้งสิ้น</div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: "#0d47a1" }}>
                {selectedRequisition.totalAmount} ฿
              </div>
            </div>

            <Button
              onClick={() => setSelectedRequisition(null)}
              style={{
                width: "100%",
                background: "#0d47a1",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              ปิด
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
