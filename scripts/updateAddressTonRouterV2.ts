import { Address, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { TonRouterV2 } from '../wrappers/TonRouterV2';

const BRIDGER = 'UQAwiDTVBdNb8PBwxKGzwF-ZkKWNkwgw1nX_f3K3CXhZgzOg';
const WITHDRAWER = 'EQBOrNji7_U-kafCZ8O4jopGaeCItRyYxWiqmbdvPx1sT1I-';
const BRIDGE_TOKEN_ADDRESS = 'EQDEkKtpNp6U8VLfntp7TM3jUhIl9sSvq0cFXY5f4utGJtPn';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('TonRouter address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const tonRouterV2 = provider.open(TonRouterV2.createFromAddress(address));

    await tonRouterV2.sendUpdateAddress(provider.sender(), {
        withdrawer: Address.parse(WITHDRAWER),
        bridger: Address.parse(BRIDGER),
        bridge_token_address: Address.parse(BRIDGE_TOKEN_ADDRESS),
        value: toNano('0.03'),
    });

    ui.write('Waiting for counter to increase...');

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
