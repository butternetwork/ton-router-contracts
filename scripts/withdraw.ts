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

    await tonRouter.sendWithdraw(provider.sender(), {
        value: toNano('0.01'),
    });
}
