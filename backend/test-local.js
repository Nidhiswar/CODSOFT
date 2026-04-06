async function testLocalChat() {
    const apiBase = (process.env.API_BASE_URL || "https://your-backend.onrender.com").replace(/\/$/, "");
    const url = `${apiBase}/api/chat`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Tell me about your curry leaves",
                history: []
            })
        });
        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

testLocalChat();
