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

    await tonRouter.sendWithdrawJetton(provider.sender(), {
        value: toNano('0.01'),
        jettonWallet: Address.parse('EQD44EzIhC_eEOOSGnrORLn71pbUbW-sds4zuPk7Icr-REUJ'),
        amount: 1n * 1000_000n,
    });

    ui.clearActionPrompt();
    ui.write('Withdraw jetton tx sent successfully!');
}
