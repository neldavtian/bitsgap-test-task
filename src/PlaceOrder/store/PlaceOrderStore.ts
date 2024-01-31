import { observable, computed, action, makeObservable } from "mobx";
import { v4 as uuid } from "uuid";
import type { OrderSide } from "../model";

interface TakeProfitListTypes {
    id: string;
    profit: string;
    targetPrice: string;
    amount: string;
}

export class PlaceOrderStore {
    constructor() {
        makeObservable(this);
    }

    @observable activeOrderSide: OrderSide = "buy";
    @observable price = 0;
    @observable amount = 0;
    @observable isActiveTakeProfit: boolean = false;
    @observable takeProfitList: TakeProfitListTypes[] = [];
    @observable errorMessage: string = "";
    @observable projectedProfit: number = 0;

    @computed get total(): number {
        return this.price * this.amount;
    }

    @action
    public setOrderSide = (side: OrderSide) => {
        this.activeOrderSide = side;
        this.isActiveTakeProfit = false;
        this.takeProfitList = [];
    };

    @action
    public setPrice = (price: number) => {
        this.price = price;
        this.isActiveTakeProfit = false;
        this.takeProfitList = [];
    };

    @action
    public setAmount = (amount: number) => {
        this.amount = amount;
        this.isActiveTakeProfit = false;
        this.takeProfitList = [];
    };

    @action
    public setTotal = (total: number) => {
        this.amount = this.price > 0 ? total / this.price : 0;
        this.isActiveTakeProfit = false;
        this.takeProfitList = [];
    };

    @action
    public setIsActiveTakeProfit = (takeProfitStatus: boolean) => {
        this.isActiveTakeProfit = takeProfitStatus;
        if (this.isActiveTakeProfit && !this.takeProfitList.length) {
            this.addProfit();
            this.projectedProfit =
                this.activeOrderSide === "buy"
                    ? this.amount * (parseFloat(this.takeProfitList[0].targetPrice) - this.price)
                    : this.amount * (this.price - parseFloat(this.takeProfitList[0].targetPrice));
        } else if (!this.isActiveTakeProfit) {
            this.clearProfit();
            this.projectedProfit = 0;
        }
    };

    @action
    public addProfit = () => {
        const totalAmounts: number = this.takeProfitList.reduce((accumulator, currentItem) => accumulator + parseFloat(currentItem.amount), 0);

        const newProfit: TakeProfitListTypes = {
            id: uuid(),
            profit: (this.takeProfitList.length ? parseFloat(this.takeProfitList[this.takeProfitList.length - 1].profit) + 2 : 2).toString(),
            targetPrice: "0",
            amount: totalAmounts <= 80 ? "20" : (100 - totalAmounts).toString(),
        };

        newProfit.targetPrice = (
            this.activeOrderSide === "buy"
                ? this.price * (1 + parseFloat(newProfit.profit) / 100)
                : this.price * (1 - parseFloat(newProfit.profit) / 100)
        ).toString();

        this.takeProfitList.push(newProfit);

        this.projectedProfit =
            this.activeOrderSide === "buy"
                ? this.takeProfitList.reduce(
                      (accumulator, currentItem) => accumulator + this.amount * (parseFloat(currentItem.targetPrice) - this.price),
                      0
                  )
                : this.takeProfitList.reduce(
                      (accumulator, currentItem) => accumulator + this.amount * (this.price - parseFloat(currentItem.targetPrice)),
                      0
                  );
    };

    @action
    public clearProfit = () => {
        this.takeProfitList = [];
    };

    @action
    public deleteProfit = ({ id }: { id: string }) => {
        this.takeProfitList = this.takeProfitList.filter((item) => item.id !== id);
        if (!this.takeProfitList.length) this.isActiveTakeProfit = false;
        this.projectedProfit =
            this.activeOrderSide === "buy"
                ? this.takeProfitList.reduce(
                      (accumulator, currentItem) => accumulator + this.amount * (parseFloat(currentItem.targetPrice) - this.price),
                      0
                  )
                : this.takeProfitList.reduce(
                      (accumulator, currentItem) => accumulator + this.amount * (this.price - parseFloat(currentItem.targetPrice)),
                      0
                  );
    };

    @action
    public changeProfitProperties = ({ id, type, value }: { id: string; type: "profit" | "targetPrice" | "amount"; value: string }) => {
        const foundItem = this.takeProfitList.find((item) => item.id === id);
        const foundItemIndex: number = this.takeProfitList.findIndex((item) => item.id === id);
        if (foundItem) {
            if (type === "profit") {
                foundItem[type] = value;
                foundItem.targetPrice = (
                    this.activeOrderSide === "buy"
                        ? this.price * (1 + parseFloat(foundItem.profit) / 100)
                        : this.price * (1 - parseFloat(foundItem.profit) / 100)
                ).toString();
            } else if (type === "targetPrice") {
                foundItem[type] = value;
                foundItem.profit = (
                    this.activeOrderSide === "buy" ? (parseFloat(value) - this.price) / 100 : (parseFloat(value) + this.price) / 100
                ).toString();
            } else if (type === "amount") {
                foundItem[type] = value;
            }

            if (foundItemIndex) {
                this.takeProfitList[foundItemIndex].profit = foundItem.profit;
                this.takeProfitList[foundItemIndex].targetPrice = foundItem.targetPrice;
                this.takeProfitList[foundItemIndex].amount = foundItem.amount;
            }

            const totalAmounts: number = this.takeProfitList.reduce((accumulator, currentItem) => accumulator + parseFloat(currentItem.amount), 0);

            if (parseFloat(foundItem.profit) < 0.01) {
                this.errorMessage = "Minimum value is 0.01%";
            } else if (parseFloat(foundItem.profit) > 500) {
                this.errorMessage = "Maximum profit sum is 500%";
            } else if (!parseFloat(foundItem.targetPrice)) {
                this.errorMessage = "Price must be greater than 0";
            } else if (
                this.takeProfitList[foundItemIndex - 1] &&
                parseFloat(foundItem.profit) <= parseFloat(this.takeProfitList[foundItemIndex - 1].profit)
            ) {
                this.errorMessage = "Each target's profit should be greater than the previous one";
            } else if (!parseFloat(foundItem.amount)) {
                this.errorMessage = "Amount should e a positive number";
            } else if (totalAmounts > 100) {
                this.errorMessage = `${totalAmounts} out of 100% selected. Please decrease by ${totalAmounts - 100}`;
            } else {
                this.errorMessage = "";
            }
        }
    };
}
