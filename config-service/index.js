const express = require('express');
const app = express();
const port = 80;

let versions = {
    tenant1: 'v1',
    tenant2: 'v2'
};

app.get('/tenantVersion', (req, res) => {
    const tenant = req.query.tenant;
    if (tenant && versions[tenant]) {
        res.send(versions[tenant]);
    } else {
        res.send('v0');
    }
});

app.post('/tenantVersion', (req, res) => {
    const tenant = req.query.tenant;
    const version = req.query.version;
    if (tenant && version) {
        versions[tenant] = version;
        res.send(`Version for ${tenant} updated to ${version}`);
    } else {
        res.status(400).send('Missing tenant or version');
    }
});

app.listen(port, () => {
    console.log(`Config service listening at http://localhost:${port}`);
});
