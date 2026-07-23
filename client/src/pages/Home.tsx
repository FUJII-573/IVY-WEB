/*
ระบบเบิกวัตถุดิบร้านอาหาร (The Little Ivy House) - เวอร์ชันสมบูรณ์ (URL ใหม่ + ชื่อคนเบิกเข้าชีท + ราคา + ไม่จำกัดสต็อก)
*/

import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Settings } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

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
  const { user } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const [, setLocation] = useLocation();
  
  // ลิงก์ Google Sheets ล่าสุดของพี่ครับ
  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyY4jos4ntuj4fA9X1CRM3vvx0nZ29xqU6aKXs3N6jU05Q8y_TcPKFXu4ew7EorhUX7/exec";

  // 1. รายชื่อพนักงาน (พี่แก้ชื่อพนักงานตรงนี้ได้เลยครับ)
  const { data: employeesData } = trpc.employees.list.useQuery();
  const customEmployees = [
    "Clarvienne Althea Laforteza",
    "Renley Koji",
  ];
  const employees = [...customEmployees, ...(employeesData?.map(emp => emp.name) || [])];

  // 2. รายการอาหาร (พี่แก้ชื่อ ราคา และรูปตรงนี้ได้เลยครับ)
  const staticItems = [
    { id: 1001, category: "Food", name: { th: "The Ivy : Smoked Salmon" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467840543985664/file_000000007f987207adf35a8aa53d9693.png?ex=6a627439&is=6a6122b9&hm=3c62a4bb4b7e7351c1286fc5308d95dc349212eb6c34325e91dc59f0459113e4&", price: 300 },
       { id: 1003, category: "Food", name: { th: "The Ivy : Wurstplatte" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467249457762314/file_0000000050c871fabcfa7f2a928a2b2e.png?ex=6a6273ac&is=6a61222c&hm=8ca3c432ec6b35a3051d82a442d1776bef2992f23222453aa6f4b5323c1b512d&", price: 300 },
        { id: 1004, category: "Food", name: { th: "The Ivy : Kartoffelsuppe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365054933205153/file_000000006ab071f8b3c7ec73bbf7acdb.png?ex=6a627277&is=6a6120f7&hm=8d44536d1bf45eed4f4efe7f9c2ed6751cbe9abd059898a5983de9e77b96a801&", price: 300 },
         { id: 1005, category: "Food", name: { th: "The Ivy : Black Forest Cake" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466740130713770/file_000000003d707207b39c63a08180d886.png?ex=6a627333&is=6a6121b3&hm=5384cd635f0eb217ac76337e5a3841786c59d5990a0e21b67fc30c042b113130&", price: 300 },
          { id: 1007, category: "Food", name: { th: "The Ivy : Bienenstich" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509466502640959578/file_00000000488871fa98cb208c6d268889.png?ex=6a6272fa&is=6a61217a&hm=4a1eb4f71aac683948c816e76a32a8bf648c788fb1e208c64861ee68c39cbaa2&", price: 300 },
          { id: 1008, category: "Food", name: { th: "The Ivy : Green Apple Sorbe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1512365206183870474/file_00000000de28720896b2f556c8a55d54.png?ex=6a62729b&is=6a61211b&hm=335da528ff4d7398c88e79f9141f336d0a03e8267d521a098d930ec7a7dc4883&", price: 300 },
          { id: 1009, category: "Food", name: { th: "The Ivy : Schweinshaxe" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509468203368058920/file_0000000010b071fa87ffb057f107f275.png?ex=6a627490&is=6a612310&hm=7b20c7b2055f2758cac5ae3210e0a6088a87370c4c0a8bf3bd6daf5ed9de2299&", price: 300 },
          { id: 1010, category: "Food", name: { th: "The Ivy : Sauerbraten" }, unit: "จาน", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509467862149103656/file_00000000edd071fa81a922e0c254cc4a.png?ex=6a62743e&is=6a6122be&hm=c857d03813f3033034fe78ffb6ee8032d1e2e27d74f5bf5e6520abbaeca64565&", price: 300 },

          { id: 1011, category: "Food", name: { th: "ALL SPECIAL GERMAN SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646764527976488/image.png?ex=6a62b210&is=6a616090&hm=7967e5670cbe858d610ca660dd3c4ab3d9b86fc79dbb10a851f7e094109602f7&=&format=webp&quality=lossless", price: 3500 },
          { id: 1012, category: "Food", name: { th: "GERMANY DESSERTS SET" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646661930848346/image.png?ex=6a62b1f7&is=6a616077&hm=6de1b6d4b21c31a6726b047f097ad7ee611343124f2aaf4e86b6ab2b10cd76cd&=&format=webp&quality=lossless", price: 600 },
          { id: 1013, category: "Food", name: { th: "CHILLING WITH YOU" }, unit: "SET", imageUrl: "https://media.discordapp.net/attachments/904634942091296788/1529646692763308042/image.png?ex=6a62b1ff&is=6a61607f&hm=9c00cc902007819147a9e7feba50e91e51a9785a15d97e63d16dbad2238910ea&=&format=webp&quality=lossless", price: 1600 },
         
    
          { id: 2001, category: "Beverage", name: { th: "The Ivy : Apfelschorle - non alc." }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464600700260382/file_00000000cd8071fabb238c57accca43f.png?ex=6a627135&is=6a611fb5&hm=c2a8e4e332edfb7c72f65fd401d28cc41533b9aee73c6fe1ecc5632defa1c207&", price: 200 },
           { id: 2002, category: "Beverage", name: { th: "The Ivy : Weihenstephaner" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509464973594722485/file_000000008f2871faaebd533f73fecd72.png?ex=6a62718e&is=6a61200e&hm=a6d9c736b0f63925a639434b11b18605a2e7d7e094841d4cec2ae16cc362e8ad&", price: 200 },
            { id: 2003, category: "Beverage", name: { th: "The Ivy : Riesling" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509465809368649839/file_00000000c29871faaf954033d95700f3.png?ex=6a627255&is=6a6120d5&hm=8a063c8dd55417212f36eefb0922c61ea309e8683679fd00ec8b247649b324a8&", price: 200 },
             { id: 2004, category: "Beverage", name: { th: "The Ivy : Kirschwasser" }, unit: "แก้ว", imageUrl: "https://cdn.discordapp.com/attachments/1470053127410683924/1509465932001710091/file_00000000fd1872078bd413f8015dcab4.png?ex=6a627272&is=6a6120f2&hm=282cd0cc0b9700c29f19ca4cb9747deb6b84a6906b598f6eb381b1e5e35fe698&", price: 200 },
    
    
   
    
  ];

  const [category, setCategory] = useState("Food");
  const [search, setSearch] = useState("");
  const [employee, setEmployee] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [popup, setPopup] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [note, setNote] = useState("");

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
    if (!employee) { setPopup("กรุณาเลือกชื่อผู้เบิก"); return; }
    setSending(true);
    
    // รูปแบบรายการอาหาร: "เมนู A x 1, เมนู B x 2"
    const orderStr = cart.map((i) => `${i.name.th} x ${i.qty}`).join(", ");
    
    try {
      // ส่งข้อมูลไป Google Sheets
      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          action: "addRequisition",
          employee: employee, // NAME
          order: orderStr,   // ORDER
          note: note,        // NOTE
          total: totalPrice.toString() // TOTAL
        }),
      });

      setSubmitted(true);
      setCart([]);
      setEmployee("");
      setNote("");
    } catch (e) { 
      setPopup("เกิดข้อผิดพลาดในการเชื่อมต่อ"); 
    }
    setSending(false);
    setShowConfirm(false);
  };

  if (submitted) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <h1 style={{ color: "#0d47a1" }}>✔️ เบิกสำเร็จ!</h1>
        <p>ข้อมูลถูกส่งไปยัง Google Sheets แล้ว</p>
        <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 20, border: "none", background: "#0d47a1", color: "#fff", cursor: "pointer" }}>กลับหน้าแรก</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Poppins, sans-serif", background: "var(--background)", color: "var(--foreground)" }}>
      <h2 style={{ color: "#0d47a1", textAlign: "center", marginBottom: 20 }}>The Little Ivy House</h2>
      
      <select value={employee} onChange={(e) => setEmployee(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", marginBottom: 15, fontSize: 16 }}>
        <option value="">👤 เลือกผู้เบิก</option>
        {employees.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>

      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={() => { setCategory("Food"); playClickSound(); }} style={{ flex: 1, padding: 12, borderRadius: 25, border: "none", background: category === "Food" ? "#0d47a1" : "#e8e8e8", color: category === "Food" ? "#fff" : "#333", fontWeight: "bold", cursor: 'pointer' }}>🍽️ Food</button>
        <button onClick={() => { setCategory("Beverage"); playClickSound(); }} style={{ flex: 1, padding: 12, borderRadius: 25, border: "none", background: category === "Beverage" ? "#0d47a1" : "#e8e8e8", color: category === "Beverage" ? "#fff" : "#333", fontWeight: "bold", cursor: 'pointer' }}>🥤 Beverage</button>
      </div>
            {cart.length > 0 && (
        <div style={{ marginTop: 30, padding: 20, background: "#f9f9f9", borderRadius: 15 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>🛒 รายการที่เลือก ({totalQty})</h3>
          {cart.map((i) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>{i.name.th}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{i.price * i.qty} ฿</div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => minus(i.id)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #0d47a1", background: "#fff", color: "#0d47a1", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                <span style={{ fontSize: 16, fontWeight: "bold", minWidth: 20, textAlign: "center" }}>{i.qty}</span>
                <button onClick={() => add(i)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "#0d47a1", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, paddingTop: 10, borderTop: "2px solid #ddd" }}>
            <span style={{ fontWeight: "bold", fontSize: 18 }}>รวมทั้งสิ้น</span>
            <span style={{ fontWeight: "bold", fontSize: 18, color: "#0d47a1" }}>{totalPrice} ฿</span>
          </div>
          
          <textarea placeholder="📝 หมายเหตุ (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%", marginTop: 15, padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <button onClick={() => setShowConfirm(true)} style={{ width: "100%", marginTop: 15, padding: 15, background: "#0d47a1", color: "#fff", border: "none", borderRadius: 30, fontSize: 18, fontWeight: "bold", cursor: 'pointer' }}>เบิกวัตถุดิบ</button>
        </div>
      )}


      <input placeholder="🔍 ค้นหาเมนู..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", marginBottom: 20 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 15 }}>
        {filtered.map((item) => (
          <div key={item.id} style={{ background: "#fff", padding: 15, borderRadius: 15, border: "1px solid #eee", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <img src={item.imageUrl} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10 }} alt={item.name.th} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{item.name.th}</div>
              <div style={{ fontSize: 13, color: "#d32f2f", fontWeight: "bold" }}>{item.price} ฿</div>
              <button onClick={() => add(item)} style={{ background: "#0d47a1", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 15, marginTop: 10, width: "100%", cursor: "pointer" }}>
                เพิ่ม
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: 30, padding: 20, background: "#f9f9f9", borderRadius: 15 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>🛒 รายการที่เลือก ({totalQty})</h3>
          {cart.map((i) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span style={{ fontSize: 14, color: "#333" }}>{i.name.th} (x{i.qty})</span>
              <span style={{ fontWeight: "bold" }}>{i.price * i.qty} ฿</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, paddingTop: 10, borderTop: "2px solid #ddd" }}>
            <span style={{ fontWeight: "bold", fontSize: 18 }}>รวมทั้งสิ้น</span>
            <span style={{ fontWeight: "bold", fontSize: 18, color: "#0d47a1" }}>{totalPrice} ฿</span>
          </div>
          <textarea placeholder="📝 หมายเหตุ (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%", marginTop: 15, padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <button onClick={() => setShowConfirm(true)} style={{ width: "100%", marginTop: 15, padding: 15, background: "#0d47a1", color: "#fff", border: "none", borderRadius: 30, fontSize: 18, fontWeight: "bold", cursor: 'pointer' }}>เบิกวัตถุดิบ</button>
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 25, borderRadius: 20, width: '90%', maxWidth: 400 }}>
            <h3 style={{ color: "#0d47a1", marginTop: 0 }}>ยืนยันการเบิก</h3>
            <p>ผู้เบิก: <strong>{employee}</strong></p>
            <p>ราคารวม: <strong style={{ color: "#d32f2f" }}>{totalPrice} ฿</strong></p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={confirmSubmit} disabled={sending} style={{ flex: 1, padding: 12, background: '#0d47a1', color: '#fff', border: 'none', borderRadius: 10, fontWeight: "bold", cursor: 'pointer' }}>{sending ? "กำลังส่ง..." : "ยืนยัน"}</button>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, background: '#999', color: '#fff', border: 'none', borderRadius: 10, fontWeight: "bold", cursor: 'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
      {popup && <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '10px 20px', borderRadius: 20, zIndex: 2000 }}>{popup}</div>}
    </div>
  );
}
