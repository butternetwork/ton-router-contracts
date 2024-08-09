import { Address, toNano } from '@ton/core';
import { TonRouterV2 } from '../wrappers/TonRouterV2';
import { compile, NetworkProvider } from '@ton/blueprint';

const BRIDGER = 'EQB_F8131p3mGIFvEK-faA4fUPnRNyyuRnbbvv8W82pFdxge';
const WITHDRAWER = 'EQBOrNji7_U-kafCZ8O4jopGaeCItRyYxWiqmbdvPx1sT1I-';
export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address;
    if (!sender) {
        return;
    }

    const tonRouterV2 = provider.open(
        TonRouterV2.createFromConfig(
            {
                order_id: 100000000000,
                owner: sender,
                // withdrawer: Address.parse(WITHDRAWER),
                withdrawer: sender,
                bridger: Address.parse(BRIDGER),
                bridge_token_address: sender,
            },
            await compile('TonRouterV2'),
        ),
    );

    await tonRouterV2.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonRouterV2.address);

    console.log('ID', await tonRouterV2.getID());
}
