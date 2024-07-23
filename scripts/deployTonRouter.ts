import { Address, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { compile, NetworkProvider } from '@ton/blueprint';

const BRIDGER = 'EQB_F8131p3mGIFvEK-faA4fUPnRNyyuRnbbvv8W82pFdxge';
const WITHDRAWER = 'EQBOrNji7_U-kafCZ8O4jopGaeCItRyYxWiqmbdvPx1sT1I-';
export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address;
    if (!sender) {
        return;
    }

    const tonRouter = provider.open(
        TonRouter.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
                order_id: 100000000000,
                owner: sender,
                // withdrawer: Address.parse(WITHDRAWER),
                withdrawer: sender,
                bridger: Address.parse(BRIDGER),
                bridge_token_address: sender,
            },
            await compile('TonRouter'),
        ),
    );

    await tonRouter.sendDeploy(provider.sender(), toNano('0.045'));

    await provider.waitForDeploy(tonRouter.address, 200);

    console.log(await tonRouter.getCounter());

    console.log('ID', await tonRouter.getID());
}
