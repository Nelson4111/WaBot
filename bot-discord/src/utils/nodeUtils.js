
// Shoukaku Constants.State: CONNECTING: 0, CONNECTED: 1, DISCONNECTING: 2, DISCONNECTED: 3

async function waitForNodeConnection(manager, maxWaitTime = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
        if (manager?.shoukaku) {
            const connectedNodes = [...manager.shoukaku.nodes.values()].filter(node => node.state === 1);
            if (connectedNodes.length > 0) {
                return true;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

function hasAvailableNodes(manager) {
    if (!manager?.shoukaku) return false;
    const availableNodes = [...manager.shoukaku.nodes.values()].filter(
        node => node.state === 1 || node.state === 0
    );
    return availableNodes.length > 0;
}

function getAvailableNode(manager) {
    if (!manager?.shoukaku) return null;
    const nodes = [...manager.shoukaku.nodes.values()].filter(
        node => node.state === 1 || node.state === 0
    );
    return nodes.length > 0 ? nodes[0] : null;
}

function getBestNode(manager) {
    if (!manager?.shoukaku) return null;
    const connectedNodes = [...manager.shoukaku.nodes.values()].filter(
        node => node.state === 1
    );

    if (connectedNodes.length === 0) {
        return getAvailableNode(manager);
    }

    // Sort berdasarkan jumlah player terkecil dan penalti paling rendah
    return connectedNodes.sort((a, b) => {
        const loadA = (a.stats?.players || 0) + (a.penalties || 0);
        const loadB = (b.stats?.players || 0) + (b.penalties || 0);
        return loadA - loadB;
    })[0];
}

module.exports = {
    waitForNodeConnection,
    hasAvailableNodes,
    getAvailableNode,
    getBestNode
};
