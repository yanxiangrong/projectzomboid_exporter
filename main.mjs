import express from 'express';
import { GameDig } from 'gamedig';

const app = express();
const PORT = process.env.PORT || 9100;

const SERVER = {
    type: process.env.PZ_TYPE || 'projectzomboid',
    host: process.env.PZ_HOST || 't8.sjcmc.cn',
    port: process.env.PZ_PORT ? parseInt(process.env.PZ_PORT) : 25480
};

function sanitizeLabelValue(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

app.get('/metrics', async (req, res) => {
    try {
        const state = await GameDig.query(SERVER);

        let metrics = '';
        metrics += `pz_server_up 1\n`;
        metrics += `pz_server_players ${state.players.length}\n`;
        metrics += `pz_server_maxplayers ${state.maxplayers}\n`;
        metrics += `pz_server_ping ${state.ping}\n`;
        metrics += `pz_server_info{name="${sanitizeLabelValue(state.name)}",map="${sanitizeLabelValue(state.map)}"} 1\n`;

        for (const [idx, player] of state.players.entries()) {
            let playerName = player.name ? sanitizeLabelValue(player.name) : `unknown_${idx}`;
            const onlineTime = player.raw && typeof player.raw.time === 'number' ? player.raw.time : 0;
            metrics += `pz_player_online_time{name="${playerName}"} ${onlineTime}\n`;
        }

        res.set('Content-Type', 'text/plain; version=0.0.4');
        res.send(metrics);
    } catch (e) {
        res.set('Content-Type', 'text/plain; version=0.0.4');
        res.send('pz_server_up 0\n');
    }
});

app.listen(PORT, () => {
    console.log(`Gamedig exporter listening on port ${PORT}`);
});
