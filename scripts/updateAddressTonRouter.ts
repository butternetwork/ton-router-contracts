import { Address, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { NetworkProvider, sleep } from '@ton/blueprint';

const BRIDGER = 'UQAiqP-qy6O3Fbe8aGNTMz_aubZDMBqTqE0Nwf7qfyj1nB9c';
const WITHDRAWER = 'EQBOrNji7_U-kafCZ8O4jopGaeCItRyYxWiqmbdvPx1sT1I-';
const BRIDGE_TOKEN_ADDRESS = 'EQBJ6gTeenCQ0cWtDyKHu3uT1gDEBLKusc8vbQfL8Nyp3qWG';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('TonRouter address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const tonRouter = provider.open(TonRouter.createFromAddress(address));

    await tonRouter.sendUpdateAddress(provider.sender(), {
        withdrawer: Address.parse(WITHDRAWER),
        bridger: Address.parse(BRIDGER),
        bridge_token_address: Address.parse(BRIDGE_TOKEN_ADDRESS),
        value: toNano('0.03'),
    });

    ui.write('Waiting for counter to increase...');

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
