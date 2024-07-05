import { toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonRouter = provider.open(
        TonRouter.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TonRouter')
        )
    );

    await tonRouter.sendDeploy(provider.sender(), toNano('0.08'));

    await provider.waitForDeploy(tonRouter.address);

    console.log('ID', await tonRouter.getID());
}
