import { toNano } from '@ton/core';
import { TonRouterV2 } from '../wrappers/TonRouterV2';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonRouterV2 = provider.open(
        TonRouterV2.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TonRouterV2')
        )
    );

    await tonRouterV2.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonRouterV2.address);

    console.log('ID', await tonRouterV2.getID());
}
