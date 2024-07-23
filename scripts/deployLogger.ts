import { toNano } from '@ton/core';
import { Logger } from '../wrappers/Logger';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address;
    if (!sender) return;
    const logger = provider.open(
        Logger.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
                owner: sender,
            },
            await compile('Logger'),
        ),
    );

    await logger.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(logger.address);

    console.log('ID', await logger.getID());
}
