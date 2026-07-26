import { useState, useEffect } from "react";

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
    { id: 1001, category: "Food", name: { th: "The Ivy : Smoked Salmon" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467840543985664/file_000000007f987207adf35a8aa53d9693.png?ex=6a67ba39&is=6a6668b9&hm=eba95cbeb83f1a33210d04886f1f8c60ad70f6c7d49223d157b0b5f4bd77d3f5&", price: 300 },
    { id: 1003, category: "Food", name: { th: "The Ivy : Wurstplatte" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467249457762314/file_0000000050c871fabcfa7f2a928a2b2e.png?ex=6a67b9ac&is=6a66682c&hm=01bdd48dd3715cc4de33557058484e27f166d367c6026a86111bd807efc6b39d&", price: 300 },
    { id: 1004, category: "Food", name: { th: "The Ivy : Kartoffelsuppe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365054933205153/file_000000006ab071f8b3c7ec73bbf7acdb.png?ex=6a67b877&is=6a6666f7&hm=51784d4baffea65515311d3aabf2c346e08b3bee93a90c10ede569195ff2ae23&", price: 300 },
    { id: 1005, category: "Food", name: { th: "The Ivy : Black Forest Cake" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466740130713770/file_000000003d707207b39c63a08180d886.png?ex=6a67b933&is=6a6667b3&hm=f7f62883a9a9263368b7f7de358f6e46438cfa65fc66277ddf294baf5a1c8f4b&", price: 300 },
    { id: 1007, category: "Food", name: { th: "The Ivy : Bienenstich" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466502640959578/file_00000000488871fa98cb208c6d268889.png?ex=6a67b8fa&is=6a66677a&hm=909e8e361fbae8f060f2257d811b3d954619fcfbdbfdda54ca831235f0eff8aa&", price: 300 },
    { id: 1008, category: "Food", name: { th: "The Ivy : Green Apple Sorbe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365206183870474/file_00000000de28720896b2f556c8a55d54.png?ex=6a67b89b&is=6a66671b&hm=9a133dfdb159b98b7187399c62fe563b2030f60c7346c52fdbd85538fc253a80&", price: 300 },
    { id: 1009, category: "Food", name: { th: "The Ivy : Schweinshaxe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509468203368058920/file_0000000010b071fa87ffb057f107f275.png?ex=6a67ba90&is=6a666910&hm=c28e70d04eee105f6098ad08b202a56a2026f3ec66f205a5b4a6fdf2a00ce0c2&", price: 300 },
    { id: 1010, category: "Food", name: { th: "The Ivy : Sauerbraten" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467862149103656/file_00000000edd071fa81a922e0c254cc4a.png?ex=6a67ba3e&is=6a6668be&hm=a2921f165bfddd0c8a2f3a2413996b02c3dc980cf31128e4164ac7cc5096939b&", price: 300 },
    { id: 1011, category: "Food", name: { th: "GERMANY DESSERTS SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646661930848346/image.png?ex=6a674f37&is=6a65fdb7&hm=181d27da260d1b50150c45aef979d8dfc27af5634477ec5f17db42e149c9db36&=&format=webp&quality=lossless", price: 600 },
    { id: 1012, category: "Food", name: { th: "CHILLING WITH YOU" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646692763308042/image.png?ex=6a674f3f&is=6a65fdbf&hm=7dc520dff24e5c52f7336c020fd53bd390186df6ff705cbf564ae822b113df8c&=&format=webp&quality=lossless", price: 1600 },
    { id: 1013, category: "Food", name: { th: "ALL SPECIAL GERMAN SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646764527976488/image.png?ex=6a674f50&is=6a65fdd0&hm=d38c2a145b6c37d09fa0958b4962d717ddbe13249499da038345c8b449e5e2f1&=&format=webp&quality=lossless", price: 3500 },
    { id: 2001, category: "Beverage", name: { th: "The Ivy : Apfelschorle - non alc." }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464600700260382/file_00000000cd8071fabb238c57accca43f.png?ex=6a67b735&is=6a6665b5&hm=d77911540b911ac0e65fa8a19c6e94f84eabe3e7aeacadd106de81f59c34dd91&", price: 200 },
    { id: 2002, category: "Beverage", name: { th: "The Ivy : Weihenstephaner" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464973594722485/file_000000008f2871faaebd533f73fecd72.png?ex=6a67b78e&is=6a66660e&hm=210ba33931e7c9f9c25309168f91b62803dbf43e82cc669964c53316e86c8896&", price: 200 },
    { id: 2003, category: "Beverage", name: { th: "The Ivy : Riesling" }, unit: "แก้ว", imageUrl: "https://media.discordapp.net/attachments/1470053127410683924/1509465809368649839/file_00000000c29871faaf954033d95700f3.png?ex=6a67b855&is=6a6666d5&hm=fbfb5966991868f0d868174e0a045c1b0eb29510ae7e07389eebf392eec6d1c8&=&format=webp&quality=lossless&width=968&height=968", price: 200 },
    { id: 2004, category: "Beverage", name: { th: "The Ivy : Kirschwasser" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509465932001710091/file_00000000fd1872078bd413f8015dcab4.png?ex=6a67b872&is=6a6666f2&hm=183235ce460086ad064e679589e9fb76a1969cb028f1e5c55a92555fcbcc3925&", price: 200 },
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

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ivy_orders");
    if (saved) {
      try { setOrders(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveOrdersToStorage = (updatedOrders: any[]) => {
    setOrders(updatedOrders);
    localStorage.setItem("ivy_orders", JSON.stringify(updatedOrders));
  };

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

  const confirmSubmit = () => {
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

    saveOrdersToStorage([newOrder, ...orders]);
    setCart([]);
    setNote("");
    setPaymentMethod("");
    setShowConfirm(false);
    setShowCartModal(false);
    setActiveTab("list");
  };

  const deleteOrder = (id: number) => {
    if (confirm("ต้องการลบรายการเบิกนี้ใช่หรือไม่?")) {
      const updated = orders.filter((o) => o.id !== id);
      saveOrdersToStorage(updated);
      setPopup("ลบรายการเรียบร้อย");
      setTimeout(() => setPopup(""), 2000);
    }
  };

  const saveNoteEdit = (id: number) => {
    const updated = orders.map((o) => o.id === id ? { ...o, note: tempNote || "-" } : o);
    saveOrdersToStorage(updated);
    setEditingOrderId(null);
    setPopup("อัปเดตหมายเหตุเรียบร้อย");
    setTimeout(() => setPopup(""), 2000);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", margin: 0, padding: 15, fontFamily: "Poppins, sans-serif", background: "#f8f9fa", position: "relative", paddingBottom: 80, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <h2 style={{ color: "#0d47a1", textAlign: "center", marginBottom: 15, fontSize: 22 }}>The Little Ivy House</h2>
      
      {/* Tab เต็มความกว้าง */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 15, width: "100%" }}>
        <button onClick={() => { setActiveTab("order"); playClickSound(); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: activeTab === "order" ? "#0d47a1" : "#e0e0e0", color: activeTab === "order" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>📝 หน้าจอเบิกสินค้า</button>
        <button onClick={() => { setActiveTab("list"); playClickSound(); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: activeTab === "list" ? "#0d47a1" : "#e0e0e0", color: activeTab === "list" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>📋 ประวัติการเบิก ({orders.length})</button>
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

          {/* รายการสินค้าแบบ Grid สี่เหลี่ยมหลายๆ ช่อง */}
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
            {orders.length > 0 && (
              <button onClick={() => { if(confirm("ต้องการล้างประวัติทั้งหมด?")) { saveOrdersToStorage([]); } }} style={{ background: "#d32f2f", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>ล้างประวัติทั้งหมด</button>
            )}
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "#666", background: "#fff", borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" }}>ยังไม่มีรายการเบิกในระบบ</div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} style={{ background: "#fff", padding: 12, borderRadius: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderLeft: "4px solid #0d47a1", display: "flex", flexDirection: "column", gap: 6, width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#666" }}>👤 <strong>{ord.employee}</strong></span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#666" }}>{ord.date} {ord.time}</span>
                    <button onClick={() => deleteOrder(ord.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontSize: 10, fontWeight: "bold" }}>🗑️ ลบ</button>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#0d47a1", fontWeight: "bold" }}>
                  ชำระผ่าน: {ord.paymentMethod || "ไม่ระบุ"}
                </div>

                <div style={{ borderTop: "1px solid #eee", paddingTop: 6 }}>
                  {ord.items.map((it: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "1px 0" }}>
                      <span style={{ color: "#333" }}>• {it.name.th}</span>
                      <span style={{ fontWeight: "bold" }}>x {it.qty}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: "#555", background: "#f9f9f9", padding: 6, borderRadius: 6 }}>
                  {editingOrderId === ord.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input 
                        type="text" 
                        value={tempNote} 
                        onChange={(e) => setTempNote(e.target.value)} 
                        style={{ padding: 5, borderRadius: 4, border: "1px solid #ccc", fontSize: 11, width: "100%", boxSizing: "border-box" }} 
                      />
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button onClick={() => saveNoteEdit(ord.id)} style={{ background: "#0d47a1", color: "#fff", border: "none", padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer" }}>บันทึก</button>
                        <button onClick={() => setEditingOrderId(null)} style={{ background: "#ccc", color: "#333", border: "none", padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer" }}>ยกเลิก</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>หมายเหตุ: {ord.note}</span>
                      <button onClick={() => { setEditingOrderId(ord.id); setTempNote(ord.note === "-" ? "" : ord.note); }} style={{ background: "none", border: "none", color: "#0d47a1", cursor: "pointer", fontSize: 10, textDecoration: "underline" }}>✏️ แก้ไข</button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px dashed #eee", fontSize: 12, fontWeight: "bold" }}>
                  <span>รวม: {ord.totalQty} ชิ้น</span>
                  <span style={{ color: "#0d47a1" }}>{ord.totalPrice} ฿</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating Cart Button */}
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

      {/* Modal ตะกร้าสินค้า */}
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

      {popup && <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '8px 16px', borderRadius: 20, zIndex: 2000, fontSize: 12 }}>{popup}</div>}
    </div>
  );
}
