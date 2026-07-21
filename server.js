const express = require('express');
const app = express();
app.use(express.json());

const urls = new Map();
let nextId = 1;

function generateCode() {
    return Buffer.from(String(nextId++)).toString('base64url');
}

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/shorten', (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Érvényes "url" mező szükséges' });
    }
    const code = generateCode();
    urls.set(code, url);
    res.status(201).json({ code, shortUrl: `/r/${code}` });
});

app.get('/r/:code', (req, res) => {
    const original = urls.get(req.params.code);
    if (!original) {
        return res.status(404).json({ error: 'A rövidített URL nem található' });
    }
    res.redirect(original);
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`URL shortener fut a ${PORT} porton`));
}

module.exports = app;