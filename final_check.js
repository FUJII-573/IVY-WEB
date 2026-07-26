const url = "https://script.google.com/macros/s/AKfycbwzxbm39vdshiMSNr1RiEuuSdjkQ60xe6vjqJzpcfzL2QEWDjiJeyX5183-XCfAd2_lJA/exec";

async function check() {
  console.log("🔍 ตรวจสอบ URL:", url);
  
  // ทดสอบแบบ GET ก่อน (ง่ายที่สุด)
  const testUrl = `${url}?name=FinalTest&order=Coffee&note=Check`;
  
  try {
    const res = await fetch(testUrl, { redirect: "follow" });
    const text = await res.text();
    console.log("📡 ผลการทดสอบ (GET):", text);
    
    // ทดสอบแบบ POST (เหมือนที่ App ใช้)
    const params = new URLSearchParams();
    params.append("name", "ServerTest");
    params.append("order", "Bread x 1");
    
    const postRes = await fetch(url, {
      method: "POST",
      body: params,
      redirect: "follow"
    });
    const postText = await postRes.text();
    console.log("📡 ผลการทดสอบ (POST):", postText);
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

check();
