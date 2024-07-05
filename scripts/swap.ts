import { Address, beginCell, toNano } from '@ton/core';
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

    const swapBody = beginCell()
        .storeUint(0xea06185d, 32)
        .storeUint(0, 64)
        .storeCoins(100000000)
        .storeAddress(Address.parse("EQDcm06RlreuMurm-yik9WbL6kI617B77OrSRF_ZjoCYFuny"))
        .storeUint(0, 1)
        .storeCoins(0)
        .storeMaybeRef(null)
        .storeRef(
            beginCell()
                .storeUint(Math.floor(Date.now() / 1000) + 60 * 10, 32)
                .storeAddress(Address.parse("UQCcgIOWXxRpCWmQ8n2QLC2crtysNNjIAXzfhuqmVJEBH7Dl"))
                .storeAddress(null)
                .storeMaybeRef(null)
                .storeMaybeRef(null)
                .endCell()
        )
        .endCell();

    const builder = beginCell();
    builder.storeUint(0x18, 6)
        .storeAddress(Address.parse("EQDa4VOnTYlLvDJ0gZjNYm5PXfSmmtL6Vs6A_CZEtXCNICq_"))
        .storeCoins(200000000)
        .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1)
        .storeMaybeRef(swapBody)

    await tonRouter.sendSwap(provider.sender(), {
        value: toNano('0.22'),
        body: builder.endCell()
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
