const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Yeni oyuncu:', socket.id);
    players[socket.id] = { score: 0 };

    // Kart Çekme Mantığı
    socket.on('draw', () => {
        const card = Math.floor(Math.random() * 10) + 2; // 2-11 arası
        players[socket.id].score += card;

        if (players[socket.id].score > 21) {
            socket.emit('result', 'PATLADIN! Skor: ' + players[socket.id].score);
            players[socket.id].score = 0;
        } else {
            socket.emit('result', 'Skorun: ' + players[socket.id].score);
        }
        
        // Herkese masanın güncel halini gönder
        io.emit('updateTable', players);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updateTable', players);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
