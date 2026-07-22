/*
ระบบเบิกวัตถุดิบร้านอาหาร
Requisition System for Restaurant
*/

import { trpc } from "@/lib/trpc";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
};

// ฟังก์ชันเล่นเสียง
const playClickSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800; // ความถี่เสียง
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Settings } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { InventoryItem } from "@/types"; // Assuming you'll create a types.ts for this
import { useLocation } from "wouter";

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading: authLoading, error, isAuthenticated, logout } = useAuth();

  const { theme, toggleTheme, switchable } = useTheme();
  const [, setLocation] = useLocation();
  
  /* employee */

    const { data: employeesData, isLoading: employeesLoading } = trpc.employees.list.useQuery();
  const employees = employeesData?.map(emp => emp.name) || [];

    const { data: inventoryData, isLoading: inventoryLoading } = trpc.inventory.list.useQuery();
  const inventoryItems = inventoryData || [];

  const stockMap = inventoryItems.reduce((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {} as Record<number, number>);

  useEffect(() => {
    if (inventoryData) {
      setStock(stockMap);
    }
  }, [inventoryData]);

  const [employee, setEmployee] = useState("");

  const [note, setNote] = useState("");

  /* product */

  const [category, setCategory] = useState("custom");

  const [search, setSearch] = useState("");

  /* cart */

  const [cart, setCart] = useState<any[]>([]);
    const [stock, setStock] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  


  /* status */

  const [popup, setPopup] = useState("");

  const [sending, setSending] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  /* auto reset */

  useEffect(() => {
    if (!submitted) return;

    const t = setTimeout(() => {
      setSubmitted(false);

      setSending(false);

      setCart([]);

      setNote("");

      setEmployee("");
    }, 2000);

    return () => clearTimeout(t);
  }, [submitted]);

  /* popup auto hide */

  useEffect(() => {
    if (!popup) return;

    const t = setTimeout(() => setPopup(""), 2000);

    return () => clearTimeout(t);
  }, [popup]);

    const menuData: InventoryItem[] = inventoryItems.map(item => ({
    id: item.id,
    category: item.category,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    imageUrl: item.imageUrl,
  }));
  /* cart */

  const add = (item: any) => {
    const current = cart.find((i) => i.id === item.id)?.qty || 0;

    const max = stock[item.id] || 0;

    if (current >= max) {
      setPopup("ของไม่พอ");
      playClickSound();
      return;
    }
    playClickSound();
    setCart((prev) => {
      const f = prev.find((p) => p.id == item.id);

      if (f)
        return prev.map((p) =>
          p.id == item.id ? { ...p, qty: Math.min(p.qty + 1, 999) } : p
        );

      return [...prev, { ...item, qty: 1 }];
    });
  };

  const minus = (id: number) => {
    playClickSound();
    setCart((prev) =>
      prev

        .map((p) => (p.id == id ? { ...p, qty: p.qty - 1 } : p))

        .filter((p) => p.qty > 0)
    );
  };

  const changeQty = (id: number, val: number) => {
    const max = stock[id] || 0;

    if (val < 1) val = 1;

    if (val > max) val = max;

    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty: val } : p)));
  };

  /* filter */

  const filtered = menuData

    .filter((item) => item.category === category)

    .filter((item) =>
      item.name.th

        .toLowerCase()

        .includes(search.toLowerCase())
    );

    /* total */

  const total = cart.reduce(
    (s, i) => s + i.quantity,

    0
  );

  /* submit */

  const handleSubmitClick = () => {
    console.log("handleSubmitClick called, employee:", employee, "cart:", cart.length);
    if (!employee) {
      setPopup("เลือกชื่อผู้เบิก");
      playClickSound();
      return;
    }

    if (cart.length == 0) {
      setPopup("ไม่มีสินค้า");
      playClickSound();
      return;
    }

    console.log("Setting showConfirm to true");
    playClickSound();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    playClickSound();
    setShowConfirm(false);
    setSending(true);

    const order = cart.map((i) => `${i.name.th} x ${i.qty}`).join(", ");

    try {
      // บันทึกลงฐานข้อมูล
            const response = await trpc.requisitions.create.mutate({
        employeeName: employee,
        items: cart.map((i) => ({
          inventoryId: i.id,
          name: i.name,
          quantity: i.qty,
          unit: i.unit,
        })),
        note: note || undefined,
      });

      // ส่งไปยัง Google Sheets
      await fetch(
        "https://script.google.com/macros/s/AKfycbyiDOq89bHfEiip0TZS08RnqBvAn71XKvthICWiUbBMtCB9_TOD85MTVV38Bv7J1PpQUA/exec",
        {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams({
            employee: employee,
            order: order,
            note: note,
            total: total.toString(),
            cart: JSON.stringify(
              cart.map((i) => ({
                id: i.id,
                qty: i.qty,
              }))
            ),
          }),
        }
      );

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting requisition:", error);
      setPopup("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSending(false);
    }
  };

  const cancelSubmit = () => {
    playClickSound();
    setShowConfirm(false);
  };

  /* success */

  if (submitted) return <div style={successBox}>เบิกสำเร็จ</div>;

  /* UI */

  return (
    <div style={page}>
      {loading && (
        <div style={loadingOverlay}>
          <div className="spinner" style={spinner} />
        </div>
      )}

      {/* Theme Toggle Button */}
      {switchable && toggleTheme && (
        <button
          onClick={toggleTheme}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: theme === 'dark' ? '#FFD700' : '#333',
            color: theme === 'dark' ? '#333' : '#FFD700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          title={theme === 'dark' ? 'โหมดกลางวัน' : 'โหมดกลางคืน'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              Light
            </>
          ) : (
            <>
              <Moon size={18} />
              Dark
            </>
          )}
        </button>
      )}

      {/* History Button */}
      <button
        onClick={() => setLocation('/history')}
        style={{
          position: 'fixed',
          top: '20px',
          right: user?.role === 'admin' ? (switchable && toggleTheme ? '220px' : '120px') : (switchable && toggleTheme ? '120px' : '20px'),
          zIndex: 1000,
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          background: '#e53935',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
        title="ประวัติการเบิก"
      >
        📋 ประวัติ
      </button>

      {/* Admin Button */}
      {user?.role === 'admin' && (
        <button
          onClick={() => setLocation('/admin')}
          style={{
            position: 'fixed',
            top: '20px',
            right: switchable && toggleTheme ? '120px' : '20px',
            zIndex: 1000,
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: '#0d47a1',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          title="Admin Dashboard"
        >
          <Settings size={18} />
          Admin
        </button>
      )}

      <h2 style={title}>The Little Ivy House</h2>
      <h2 style={title}>เลือกวัตถุดิบที่ต้องการเบิก</h2>
      <select
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
        style={input}
      >
        <option>เลือกผู้เบิก</option>

        {employees.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <div style={tabs}>
        <button
          onClick={() => setCategory("custom")}
          style={tab(category == "custom")}
        >
          Customs
        </button>

        <button
          onClick={() => setCategory("Core Parts")}
          style={tab(category == "Core Parts")}
        >
          Core Parts
        </button>

        <button
          onClick={() => setCategory("Service")}
          style={tab(category == "Service")}
        >
          Service
        </button>
      </div>

      <input
        placeholder="ค้นหา"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={input}
      />

      <div style={cardContainer}>
        {filtered.map((item) => (
          <div key={item.id} style={card}>
            <img src={item.img} style={img} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name.th}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{item.price} ฿</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>คงเหลือ {stock[item.id] ?? 0} {item.unit}</div>
              <button
              onClick={() => add(item)}
              disabled={(stock[item.id] || 0) === 0}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              style={{
                ...addBtn,
                opacity: (stock[item.id] || 0) === 0 ? 0.5 : 1,
              }}
            >
              {(stock[item.id] || 0) === 0 ? "หมด" : "เพิ่ม"}
            </button>
            </div>
          </div>
        ))}
      </div>

      <h3>รายการ</h3>

      {cart.map((i) => (
        <div key={i.id} style={cartRow}>
          {i.name.th}

          <div>
            <button 
              onClick={() => minus(i.id)}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              style={{
                ...addBtn,
                padding: "4px 10px",
              }}
            >
              -
            </button>

            <input
              type="number"
              value={i.qty}
              min={1}
              max={999}
              onChange={(e) =>
                changeQty(
                  i.id,

                  Number(e.target.value)
                )
              }
              style={{
                width: "50px",
                padding: "4px",
                marginLeft: "4px",
                marginRight: "4px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                textAlign: "center",
              }}
            />

            <button 
              onClick={() => add(i)}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              style={{
                ...addBtn,
                padding: "4px 10px",
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <h2>รวม {total}</h2>

      <textarea
        placeholder="Note ใส่หรือไม่ใส่ก็ได้"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={input}
      />

      <button 
        onClick={handleSubmitClick} 
        disabled={sending} 
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
        style={submitBtn}
      >
        {sending ? "กำลังส่ง..." : "เบิก"}
      </button>

      {popup && (
        <div style={popupBg}>
          <div style={popupBox}>{popup}</div>
        </div>
      )}

      {showConfirm && (
        <div style={{...popupBg, background: "rgba(0,0,0,0.7)"}}>
          <div style={confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "#0d47a1" }}>ยืนยันการเบิก</h3>
            <p style={{ marginBottom: 20, color: "#333" }}>ผู้เบิก: <strong>{employee}</strong></p>
            <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: 20, background: "#f9f9f9", padding: 12, borderRadius: 8 }}>
              {cart.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #e0e0e0", color: "#333" }}>
                  <span>{i.name.th}</span>
                  <span><strong>x{i.qty}</strong> = {i.price * i.qty} ฿</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: 12, fontWeight: "bold", color: "#0d47a1", fontSize: 16 }}>
                <span>รวมทั้งสิ้น:</span>
                <span>{total} ฿</span>
              </div>
            </div>
            {note && (
              <div style={{ marginBottom: 20, padding: 10, background: "#fff3cd", borderRadius: 8, color: "#333" }}>
                <strong>หมายเหตุ:</strong> {note}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={confirmSubmit}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                style={{
                  ...confirmBtn,
                  background: "#0d47a1",
                  flex: 1,
                }}
              >
                ยืนยัน
              </button>
              <button
                onClick={cancelSubmit}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                style={{
                  ...confirmBtn,
                  background: "#999",
                  flex: 1,
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* style */
const loadingOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(255,255,255,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  pointerEvents: "none",
};

const spinner: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "4px solid rgba(0,0,0,0.15)",
  borderTop: "4px solid #1565c0",
  borderRadius: "50%",
  animation: "spin 0.5s linear infinite",
  pointerEvents: "auto",
};

const page = {
  maxWidth: "100%",
  margin: "auto",
  padding: 20,
  background: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "Poppins",
  transition: "background-color 0.3s ease, color 0.3s ease",
};

const title = {
  color: "#0d47a1",
  marginTop: 0,
};

const input = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#333",
};

const tabs = {
  display: "flex",
  gap: 10,
  marginTop: 15,
};

const tab = (active: boolean) => ({
  background: active ? "#0d47a1" : "#e8e8e8",
  color: active ? "#fff" : "#333",
  border: "none",
  padding: "8px 14px",
  borderRadius: 20,
  cursor: "pointer",
  fontWeight: active ? "600" : "400",
});

const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 12,
  marginTop: 12,
};

const card = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  textAlign: "center" as const,
  background: "#fff",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #e0e0e0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const img: React.CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 10,
  objectFit: "cover",
};

const addBtn = {
  background: "#e53935",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 20,
  cursor: "pointer",
  fontWeight: "500",
  transition: "all 0.1s ease-out",
  transform: "scale(1)",
};

const cartRow = {
  display: "flex",
  justifyContent: "space-between",
  background: "#fff",
  padding: 10,
  marginTop: 8,
  borderRadius: 10,
  border: "1px solid #e0e0e0",
  color: "#333",
};

const submitBtn = {
  width: "100%",
  marginTop: 15,
  padding: 14,
  background: "#0d47a1",
  color: "white",
  border: "none",
  borderRadius: 25,
  fontSize: 16,
  transition: "all 0.1s ease-out",
  transform: "scale(1)",
  cursor: "pointer",
};

const popupBg: React.CSSProperties = {
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
};

const popupBox = {
  background: "#fff",
  padding: 25,
  borderRadius: 15,
  color: "#333",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const confirmBox = {
  background: "#fff",
  padding: 25,
  borderRadius: 15,
  color: "#333",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  maxWidth: "500px",
  width: "90%",
  zIndex: 1001,
  position: "relative" as any,
};

const confirmBtn = {
  padding: 12,
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "600",
  fontSize: 14,
  transition: "all 0.1s ease-out",
  transform: "scale(1)",
} as any;

const successBox = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  color: "#0d47a1",
  background: "#f5f5f5",
};
