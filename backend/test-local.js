async function testLocalChat() {
    const url = `http://127.0.0.1:5009/api/chat`;
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
