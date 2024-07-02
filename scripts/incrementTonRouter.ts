import { Address, toNano } from '@ton/core';
import { TonRouter } from '../wrappers/TonRouter';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('TonRouter address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const tonRouter = provider.open(TonRouter.createFromAddress(address));

    const counterBefore = await tonRouter.getCounter();

    await tonRouter.sendIncrease(provider.sender(), {
        increaseBy: 1,
        value: toNano('0.42'),
    });

    ui.write('Waiting for counter to increase...');

    let counterAfter = await tonRouter.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await tonRouter.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
