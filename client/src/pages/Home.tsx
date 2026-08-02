import { useState, useEffect } from "react";

// ⚠️ วาง URL ของ Google Apps Script Web App ที่คัดลอกมาตรงนี้
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtxSIU2XWLt1S6NXE-DFLaI-pHkSJUhuexLU4IFeqn7Zt9Srk6jevr8ttfkVDRa_k/exec";

const playClickSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) { console.log("Sound error"); }
};

export default function Home() {
  const customEmployees = [
    "Clarvienne Althea Laforteza",
    "Renley Koji",
    "Maxim Alexandrovich Morozov",
    "Berry Butcher",
  ];
  const employees = [...customEmployees];

const staticItems = [
  { id: 1001, category: "Food", name: { th: "The Ivy : Smoked Salmon" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/7G0XtFPG/1-Smoked-Salmon.png", price: 300 },
  { id: 1003, category: "Food", name: { th: "The Ivy : Wurstplatte" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/Vrn4Zxs4/2-Wurstplatte.png", price: 300 },
  { id: 1004, category: "Food", name: { th: "The Ivy : Kartoffelsuppe" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/G8GzgW3K/3-Kartoffelsuppe.png", price: 300 },
  { id: 1005, category: "Food", name: { th: "The Ivy : Black Forest Cake" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/9RZ1g6XY/4-Black-Forest-Cake.png", price: 300 },
  { id: 1007, category: "Food", name: { th: "The Ivy : Bienenstich" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/YGY8D52x/5-Bienenstich.png", price: 300 },
  { id: 1008, category: "Food", name: { th: "The Ivy : Green Apple Sorbe" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/V0wgxK5B/6-Green-Apple-Sorbe.png", price: 300 },
  { id: 1009, category: "Food", name: { th: "The Ivy : Schweinshaxe" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/xJMgpwjF/5-Schweinshaxe.png", price: 300 },
  { id: 1010, category: "Food", name: { th: "The Ivy : Sauerbraten" }, unit: "จาน", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/kRCs0TDv/6-Sauerbraten.png", price: 300 },
  { id: 1011, category: "Food", name: { th: "GERMANY DESSERTS SET" }, unit: "SET", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/5YLpKh9r/7-GERMANY-DESSERTS-SET.png", price: 600 },
  { id: 1012, category: "Food", name: { th: "CHILLING WITH YOU" }, unit: "SET", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/wRz2Cw3F/8-CHILLING-WITH-YOU.png", price: 1600 },
  { id: 1013, category: "Food", name: { th: "ALL SPECIAL GERMAN SET" }, unit: "SET", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/V0wgxK5K/9-ALL-SPECIAL-GERMAN-SET.png", price: 3500 },
  { id: 2001, category: "Beverage", name: { th: "The Ivy : Apfelschorle - non alc." }, unit: "แก้ว", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/N2tD3dLZ/10-Apfelschorle.png", price: 200 },
  { id: 2002, category: "Beverage", name: { th: "The Ivy : Weihenstephaner" }, unit: "แก้ว", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/sGzmkT1k/11-Weihenstephaner.png", price: 200 },
  { id: 2003, category: "Beverage", name: { th: "The Ivy : Riesling" }, unit: "แก้ว", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/7J49FKf8/12-Riesling.png", price: 200 },
  { id: 2004, category: "Beverage", name: { th: "The Ivy : Kirschwasser" }, unit: "แก้ว", imageUrl: "https://images.weserv.nl/?url=i.postimg.cc/2LYGs0VN/13-Kirschwasser.png", price: 200 },
];
  
  const [category, setCategory] = useState("Food");
  const [search, setSearch] = useState("");
  const [employee, setEmployee] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [popup, setPopup] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"order" | "list">("order");
  const [loading, setLoading] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(WEB_APP_URL);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data.reverse() : []);
    } catch (e) {
      console.log("Fetch error", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const add = (item: any) => {
    playClickSound();
    setCart((prev) => {
      const f = prev.find((p) => p.id == item.id);
      if (f) return prev.map((p) => p.id == item.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const minus = (id: number) => {
    playClickSound();
    setCart((prev) => prev.map((p) => (p.id == id ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0));
  };

  const filtered = staticItems
    .filter((item) => item.category === category)
    .filter((item) => item.name.th.toLowerCase().includes(search.toLowerCase()));

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  const confirmSubmit = async () => {
    if (!employee) { setPopup("เลือกผู้จัดออเดอร์"); setTimeout(() => setPopup(""), 3000); return; }
    if (cart.length === 0) { setPopup("เลือกรายการอาหาร"); setTimeout(() => setPopup(""), 3000); return; }
    if (!paymentMethod) { setPopup("กรุณาเลือกช่องทางการชำระเงิน"); setTimeout(() => setPopup(""), 3000); return; }
    
    const newOrder = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString('th-TH'),
      employee: employee,
      items: [...cart],
      totalQty: totalQty,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      note: note || "-"
    };

    setLoading(true);
    setPopup("กำลังบันทึก...");

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", order: newOrder })
      });
      await fetchOrders();
      setCart([]);
      setNote("");
      setPaymentMethod("");
      setShowConfirm(false);
      setShowCartModal(false);
      setActiveTab("list");
      setPopup("บันทึกสำเร็จ");
    } catch (e) {
      setPopup("เกิดข้อผิดพลาด");
    }
    setLoading(false);
    setTimeout(() => setPopup(""), 2000);
  };

  const deleteOrder = async (id: number) => {
    if (confirm("ต้องการลบรายการเบิกนี้ใช่หรือไม่?")) {
      setPopup("กำลังลบ...");
      try {
        await fetch(WEB_APP_URL, {
          method: "POST",
          body: JSON.stringify({ action: "delete", id: id })
        });
        await fetchOrders();
        setPopup("ลบเรียบร้อย");
      } catch (e) {
        setPopup("ลบไม่สำเร็จ");
      }
      setTimeout(() => setPopup(""), 2000);
    }
  };

  const saveNoteEdit = async (id: number) => {
    setPopup("กำลังบันทึกหมายเหตุ...");
    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateNote", id: id, note: tempNote || "-" })
      });
      await fetchOrders();
      setEditingOrderId(null);
      setPopup("อัปเดตหมายเหตุเรียบร้อย");
    } catch (e) {
      setPopup("อัปเดตไม่สำเร็จ");
    }
    setTimeout(() => setPopup(""), 2000);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", margin: 0, padding: 15, fontFamily: "Poppins, sans-serif", background: "#f8f9fa", position: "relative", paddingBottom: 80, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <h2 style={{ color: "#0d47a1", textAlign: "center", marginBottom: 15, fontSize: 22 }}>The Little Ivy House</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 15, width: "100%" }}>
        <button onClick={() => { setActiveTab("order"); playClickSound(); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: activeTab === "order" ? "#0d47a1" : "#e0e0e0", color: activeTab === "order" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>📝 หน้าจอเบิกสินค้า</button>
        <button onClick={() => { setActiveTab("list"); fetchOrders(); playClickSound(); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: activeTab === "list" ? "#0d47a1" : "#e0e0e0", color: activeTab === "list" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>📋 ประวัติการเบิก ({orders.length}) 🔄</button>
      </div>

      {activeTab === "order" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <select value={employee} onChange={(e) => setEmployee(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", fontSize: 15, background: "#fff", boxSizing: "border-box" }}>
            <option value="">👤 เลือกผู้เบิก</option>
            {employees.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button onClick={() => { setCategory("Food"); playClickSound(); }} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: category === "Food" ? "#0d47a1" : "#e8e8e8", color: category === "Food" ? "#fff" : "#333", fontWeight: "bold", cursor: 'pointer', fontSize: 13 }}>🍽️ Food</button>
            <button onClick={() => { setCategory("Beverage"); playClickSound(); }} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: category === "Beverage" ? "#0d47a1" : "#e8e8e8", color: category === "Beverage" ? "#fff" : "#333", fontWeight: "bold", cursor: 'pointer', fontSize: 13 }}>🥤 Beverage</button>
          </div>

          <input placeholder="🔍 ค้นหาเมนู..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", background: "#fff", boxSizing: "border-box" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, width: "100%" }}>
            {filtered.map((item) => (
              <div key={item.id} style={{ background: "#fff", padding: 12, borderRadius: 12, border: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.03)", boxSizing: "border-box", textAlign: "center" }}>
                <img src={item.imageUrl} style={{ width: 85, height: 85, objectFit: "cover", borderRadius: 8 }} alt={item.name.th} />
                <div style={{ flex: 1, width: "100%" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", height: 36, lineHeight: "18px" }}>{item.name.th}</div>
                  <div style={{ fontSize: 13, color: "#d32f2f", fontWeight: "bold", marginTop: 4 }}>{item.price} ฿</div>
                </div>
                <button onClick={() => add(item)} style={{ background: "#0d47a1", color: "#fff", border: "none", width: "100%", padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold" }}>
                  + เพิ่ม
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span style={{ color: "#666", fontSize: 13 }}>รายการเบิกทั้งหมด ({orders.length})</span>
            <button onClick={fetchOrders} style={{ background: "#0d47a1", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>🔄 รีเฟรชข้อมูล</button>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#666", background: "#fff", borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" }}>ยังไม่มีรายการเบิกในระบบ</div>
          ) : (
            orders.map((ord) => {
              const orderId = ord.ID || ord.id;
              const employeeName = ord.Employee || ord.employee;
              const orderDate = ord.Date || ord.date;
              const orderTime = ord.Time || ord.time;
              const payment = ord.PaymentMethod || ord.paymentMethod;
              const orderNote = ord.Note || ord.note;
              const totalQ = ord.TotalQty || ord.totalQty;
              const totalP = ord.TotalPrice || ord.totalPrice;
              let itemsList = ord.Items || ord.items;
              if (typeof itemsList === 'string') {
                try { itemsList = JSON.parse(itemsList); } catch (e) { itemsList = []; }
              }

              return (
                <div key={orderId || Math.random()} style={{ background: "#fff", padding: 12, borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderLeft: "4px solid #0d47a1", display: "flex", flexDirection: "column", gap: 6, width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#666" }}>👤 <strong>{employeeName || "ไม่ระบุชื่อ"}</strong></span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#666" }}>{orderDate} {orderTime}</span>
                      <button onClick={() => deleteOrder(orderId)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontSize: 10, fontWeight: "bold" }}>🗑️ ลบ</button>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#0d47a1", fontWeight: "bold" }}>
                    ชำระผ่าน: {payment || "ไม่ระบุ"}
                  </div>

                  <div style={{ borderTop: "1px solid #eee", paddingTop: 6 }}>
                    {Array.isArray(itemsList) && itemsList.length > 0 ? (
                      itemsList.map((it: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "1px 0" }}>
                          <span style={{ color: "#333" }}>• {it.name?.th || it.name || "สินค้า"}</span>
                          <span style={{ fontWeight: "bold" }}>x {it.qty || 1}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: "#888" }}>• ข้อมูลรายการสินค้า</div>
                    )}
                  </div>

                  <div style={{ fontSize: 11, color: "#555", background: "#f9f9f9", padding: 6, borderRadius: 6 }}>
                    {editingOrderId === orderId ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <input 
                          type="text" 
                          value={tempNote} 
                          onChange={(e) => setTempNote(e.target.value)} 
                          style={{ padding: 5, borderRadius: 4, border: "1px solid #ccc", fontSize: 11, width: "100%", boxSizing: "border-box" }} 
                        />
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button onClick={() => saveNoteEdit(orderId)} style={{ background: "#0d47a1", color: "#fff", border: "none", padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer" }}>บันทึก</button>
                          <button onClick={() => setEditingOrderId(null)} style={{ background: "#ccc", color: "#333", border: "none", padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer" }}>ยกเลิก</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>หมายเหตุ: {orderNote || "-"}</span>
                        <button onClick={() => { setEditingOrderId(orderId); setTempNote(orderNote === "-" ? "" : orderNote); }} style={{ background: "none", border: "none", color: "#0d47a1", cursor: "pointer", fontSize: 10, textDecoration: "underline" }}>✏️ แก้ไข</button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px dashed #eee", fontSize: 12, fontWeight: "bold" }}>
                    <span>รวม: {totalQ || 0} ชิ้น</span>
                    <span style={{ color: "#0d47a1" }}>{totalP || 0} ฿</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {cart.length > 0 && (
        <button 
          onClick={() => { setShowCartModal(true); playClickSound(); }}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#0d47a1",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 999
          }}
        >
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={{ fontSize: 10, fontWeight: "bold", background: "#d32f2f", padding: "1px 5px", borderRadius: 10, position: "absolute", top: 4, right: 4 }}>{totalQty}</span>
        </button>
      )}

      {showCartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', maxWidth: '1000px', maxHeight: '80vh', overflowY: 'auto', boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: "#0d47a1", fontSize: 16 }}>🛒 ตะกร้าสินค้า ({totalQty} ชิ้น)</h3>
              <button onClick={() => setShowCartModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#666" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cart.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.name.th}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{i.price * i.qty} ฿</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => minus(i.id)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #0d47a1", background: "#fff", color: "#0d47a1", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                    <span style={{ fontSize: 14, fontWeight: "bold", minWidth: 16, textAlign: "center" }}>{i.qty}</span>
                    <button onClick={() => add(i)} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#0d47a1", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 8, borderTop: "2px solid #ddd" }}>
              <span style={{ fontWeight: "bold", fontSize: 15 }}>รวมทั้งสิ้น</span>
              <span style={{ fontWeight: "bold", fontSize: 15, color: "#0d47a1" }}>{totalPrice} ฿</span>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, fontWeight: "bold", color: "#333", display: "block", marginBottom: 6 }}>💳 ช่องทางการชำระเงิน</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  type="button" 
                  onClick={() => { setPaymentMethod("เงินสด"); playClickSound(); }} 
                  style={{ flex: 1, padding: 8, borderRadius: 8, border: paymentMethod === "เงินสด" ? "2px solid #0d47a1" : "1px solid #ddd", background: paymentMethod === "เงินสด" ? "#e3f2fd" : "#fff", color: "#333", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}
                >
                  💵 เงินสด
                </button>
                <button 
                  type="button" 
                  onClick={() => { setPaymentMethod("เงินโอน"); playClickSound(); }} 
                  style={{ flex: 1, padding: 8, borderRadius: 8, border: paymentMethod === "เงินโอน" ? "2px solid #0d47a1" : "1px solid #ddd", background: paymentMethod === "เงินโอน" ? "#e3f2fd" : "#fff", color: "#333", fontWeight: "bold", cursor: "pointer", fontSize: 13 }}
                >
                  📱 เงินโอน
                </button>
              </div>
            </div>
            
            <textarea placeholder="📝 หมายเหตุ (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%", marginTop: 12, padding: 8, borderRadius: 8, border: "1px solid #ddd", boxSizing: "border-box", fontSize: 13 }} />
            <button onClick={() => setShowConfirm(true)} style={{ width: "100%", marginTop: 12, padding: 12, background: "#0d47a1", color: "#fff", border: "none", borderRadius: 20, fontSize: 15, fontWeight: "bold", cursor: 'pointer' }}>เบิกวัตถุดิบ</button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 15 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 16, width: '100%', maxWidth: 360, boxSizing: "border-box" }}>
            <h3 style={{ color: "#0d47a1", marginTop: 0, fontSize: 16 }}>ยืนยันการเบิก</h3>
            <p style={{ fontSize: 13, margin: "6px 0" }}>ผู้เบิก: <strong>{employee}</strong></p>
            <p style={{ fontSize: 13, margin: "6px 0" }}>การชำระเงิน: <strong style={{ color: "#0d47a1" }}>{paymentMethod}</strong></p>
            <p style={{ fontSize: 13, margin: "6px 0" }}>ราคารวม: <strong style={{ color: "#d32f2f" }}>{totalPrice} ฿</strong></p>
            <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
              <button onClick={confirmSubmit} style={{ flex: 1, padding: 10, background: '#0d47a1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: "bold", cursor: 'pointer', fontSize: 13 }}>ยืนยัน</button>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 10, background: '#999', color: '#fff', border: 'none', borderRadius: 8, fontWeight: "bold", cursor: 'pointer', fontSize: 13 }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, color: '#fff', fontWeight: 'bold' }}>กำลังประมวลผล...</div>}
      {popup && <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '8px 16px', borderRadius: 20, zIndex: 2000, fontSize: 12 }}>{popup}</div>}
    </div>
  );
}
