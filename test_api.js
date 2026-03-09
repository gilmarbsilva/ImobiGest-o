import dotenv from "dotenv";

dotenv.config();

async function check() {
    try {
        const res = await fetch("http://localhost:3000/api/owners");
        console.log("OWNERS STATUS:", res.status);
        const text = await res.text();
        console.log("OWNERS BODY:", text.substring(0, 100));
    } catch (e) {
        console.error("ERRO", e);
    }
}

check();
