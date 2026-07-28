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
    { id: 1001, category: "Food", name: { th: "The Ivy : Smoked Salmon" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467840543985664/file_000000007f987207adf35a8aa53d9693.png?ex=6a69b479&is=6a6862f9&hm=92a377e94ce9bc737244e257ab31217991485e1f8d21c8488560bde52949c4bd&", price: 300 },
    { id: 1003, category: "Food", name: { th: "The Ivy : Wurstplatte" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467249457762314/file_0000000050c871fabcfa7f2a928a2b2e.png?ex=6a69b3ec&is=6a68626c&hm=f3d996c57941574aba82d211c4e646ca3fb14ccdf35f1ebeaf7159e8a18b4172&", price: 300 },
    { id: 1004, category: "Food", name: { th: "The Ivy : Kartoffelsuppe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365054933205153/file_000000006ab071f8b3c7ec73bbf7acdb.png?ex=6a69b2b7&is=6a686137&hm=9c26b9d09a2f9a051a68e705e7cea18b8028a9c0065029bae8e52fbb9eff022b&", price: 300 },
    { id: 1005, category: "Food", name: { th: "The Ivy : Black Forest Cake" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466740130713770/file_000000003d707207b39c63a08180d886.png?ex=6a69b373&is=6a6861f3&hm=6e8660694d969ca175d7563a33fca7c4f2b9fb7d82e3f5afd0c072a870a5a172&", price: 300 },
    { id: 1007, category: "Food", name: { th: "The Ivy : Bienenstich" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466502640959578/file_00000000488871fa98cb208c6d268889.png?ex=6a69b33a&is=6a6861ba&hm=3e4237d8dcd7926b43227679fc150200615e11aaaa258155b5888d26c2b85285&", price: 300 },
    { id: 1008, category: "Food", name: { th: "The Ivy : Green Apple Sorbe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365206183870474/file_00000000de28720896b2f556c8a55d54.png?ex=6a69b2db&is=6a68615b&hm=bdc1dfec6e783afa1d82b4bcab2e2b9cb520eb2e34ba4018de2a8b1cd7342976&", price: 300 },
    { id: 1009, category: "Food", name: { th: "The Ivy : Schweinshaxe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509468203368058920/file_0000000010b071fa87ffb057f107f275.png?ex=6a69b4d0&is=6a686350&hm=d70f38e6fdc25fe3fb8e25324f8d2277b1bb46331329367ff50723653d94580c&", price: 300 },
    { id: 1010, category: "Food", name: { th: "The Ivy : Sauerbraten" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467862149103656/file_00000000edd071fa81a922e0c254cc4a.png?ex=6a69b47e&is=6a6862fe&hm=1ec8b275a98efba3486d085a667dfef031033d8cffa8607de06cd186fceef6a2&", price: 300 },
    { id: 1011, category: "Food", name: { th: "GERMANY DESSERTS SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646661930848346/image.png?ex=6a694977&is=6a67f7f7&hm=e26f138dcd1c5070bb5411b669c9871f69d69c546ada213f184d388ab60704a9&=&format=webp&quality=lossless", price: 600 },
    { id: 1012, category: "Food", name: { th: "CHILLING WITH YOU" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646692763308042/image.png?ex=6a69497f&is=6a67f7ff&hm=a5ff8703c80006af21edc0dae3086e3fb8e375d9bd93f3bb0d583693ab323f10&=&format=webp&quality=lossless", price: 1600 },
    { id: 1013, category: "Food", name: { th: "ALL SPECIAL GERMAN SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646764527976488/image.png?ex=6a694990&is=6a67f810&hm=b64f95daaaf86cc5530a6750199fdf8b5db620c4cff2304cb4f8d6686fe522d0&=&format=webp&quality=lossless", price: 3500 },
    { id: 2001, category: "Beverage", name: { th: "The Ivy : Apfelschorle - non alc." }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464600700260382/file_00000000cd8071fabb238c57accca43f.png?ex=6a69b175&is=6a685ff5&hm=335c118b8e13f10b04e5557b59b7cf8b1828931cd642dea081f0d9431e5671d8&", price: 200 },
    { id: 2002, category: "Beverage", name: { th: "The Ivy : Weihenstephaner" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464973594722485/file_000000008f2871faaebd533f73fecd72.png?ex=6a69b1ce&is=6a68604e&hm=3f8004323aebcd474f3a2fd5b95d8886b5d365c6140b100b592e3ed2d9836c50&", price: 200 },
    { id: 2003, category: "Beverage", name: { th: "The Ivy : Riesling" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509465809368649839/file_00000000c29871faaf954033d95700f3.png?ex=6a69b295&is=6a686115&hm=a19dac493d04a131df08298df523ddb3c314b79e42aa2113206b5e5527a549f4&", price: 200 },
    { id: 2004, category: "Beverage", name: { th: "The Ivy : Kirschwasser" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509465932001710091/file_00000000fd1872078bd413f8015dcab4.png?ex=6a69b2b2&is=6a686132&hm=45da1117524260fdff5063ec705a5b8f3f8e50afc6f793209a893e96841622ed&", price: 200 },
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
