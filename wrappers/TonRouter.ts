import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

//global slice owner;
// global slice withdrawer;
// global slice bridger;
// global slice bridge_token_address;
export type TonRouterConfig = {
    id: number;
    counter: number;
    order_id: number;
    owner: Address;
    withdrawer: Address;
    bridger: Address;
    bridge_token_address: Address;
};

export function tonRouterConfigToCell(config: TonRouterConfig): Cell {
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
    withdraw: 0x9cd685eb,
    withdrawJetton: 0x24edca2a,
    swap: 0xca2663c4,
    updateAddress: 0x26c64b3c,
};

export class TonRouter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TonRouter(address);
    }

    static createFromConfig(config: TonRouterConfig, code: Cell, workchain = 0) {
        const data = tonRouterConfigToCell(config);
        const init = { code, data };
        return new TonRouter(contractAddress(workchain, init), init);
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
                .storeUint(Opcodes.swap, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdraw, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async sendWithdrawJetton(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            jettonWallet: Address;
            amount: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdrawJetton, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.jettonWallet)
                .storeCoins(opts.amount)
                .storeMaybeRef(null)
                .endCell(),
        });
    }

    async sendUpdateAddress(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            withdrawer: Address;
            bridger: Address;
            bridge_token_address: Address;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.updateAddress, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.withdrawer)
                .storeAddress(opts.bridger)
                .storeAddress(opts.bridge_token_address)
                .endCell(),
        });
    }

    async sendSwap(
        provider: ContractProvider,
        via: Sender,
        opts: {
            body: Cell;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.swap, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeRef(opts.body)
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
