import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TonRouterV2Config = {
    order_id: number;
    owner: Address;
    withdrawer: Address;
    bridger: Address;
    bridge_token_address: Address;
};

export function tonRouterV2ConfigToCell(config: TonRouterV2Config): Cell {
    return beginCell()
        .storeUint(config.order_id, 64)
        .storeAddress(config.owner)
        .storeRef(
            beginCell()
                .storeAddress(config.withdrawer)
                .storeAddress(config.bridge_token_address)
                .storeAddress(config.bridger)
                .endCell(),
        )
        .endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class TonRouterV2 implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TonRouterV2(address);
    }

    static createFromConfig(config: TonRouterV2Config, code: Cell, workchain = 0) {
        const data = tonRouterV2ConfigToCell(config);
        const init = { code, data };
        return new TonRouterV2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
