import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useStore } from "PlaceOrder/context";
import { QuestionTooltip } from "shared/components/QuestionTooltip/QuestionTooltip";
import { Switch } from "shared/components/Switch/Switch";
import { observer } from "mobx-react";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "./TakeProfit.module.scss";
import Error from "shared/components/Error/Error";

export const TakeProfit = observer(() => {
    const {
        isActiveTakeProfit,
        setIsActiveTakeProfit,
        activeOrderSide,
        takeProfitList,
        addProfit,
        deleteProfit,
        changeProfitProperties,
        projectedProfit,
    } = useStore();

    return (
        <div className={styles.root}>
            <div className={styles.take_profit_switcher}>
                <div className={styles.profit_header}>
                    <QuestionTooltip message="Take Profit description" /> Take Profit
                </div>
                <Switch checked={isActiveTakeProfit} onChange={() => setIsActiveTakeProfit(!isActiveTakeProfit)} />
            </div>
            {isActiveTakeProfit && takeProfitList.length && (
                <div className={styles.profits_list_wrapper}>
                    <div className={styles.profits_list_header}>
                        <p>Profit</p>
                        <p>Target Price</p>
                        <p>Amount to {activeOrderSide === "buy" ? "sell" : "buy"}</p>
                    </div>
                    <div className={styles.profits_list_add_btn}>
                        <ul className={styles.profits_list}>
                            {takeProfitList.map(({ id, profit, targetPrice, amount }) => {
                                return (
                                    <li key={id}>
                                        <div className={styles.profit}>
                                            <input
                                                type="text"
                                                className={styles.profit_input}
                                                value={profit}
                                                onChange={(e) => changeProfitProperties({ id, type: "profit", value: e.target.value })}
                                            />{" "}
                                            %
                                        </div>
                                        <div className={styles.target_price}>
                                            <input
                                                type="text"
                                                className={styles.profit_input}
                                                value={targetPrice}
                                                onChange={(e) => changeProfitProperties({ id, type: "targetPrice", value: e.target.value })}
                                            />{" "}
                                            USDT
                                        </div>
                                        <div className={styles.amount}>
                                            <input
                                                type="text"
                                                className={styles.profit_input}
                                                value={amount}
                                                onChange={(e) => changeProfitProperties({ id, type: "amount", value: e.target.value })}
                                            />{" "}
                                            %
                                            <button className={styles.delete_profit} onClick={() => deleteProfit({ id })} type="button">
                                                <ClearIcon className={styles.delete_icon} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <Error />
                        {takeProfitList.length < 5 && (
                            <button className={styles.add_profit_btn} onClick={addProfit} type="button">
                                <AddCircleIcon className={styles.add_profit_icon} />
                                <span>{`Add profit target ${takeProfitList.length}/5`}</span>
                            </button>
                        )}
                    </div>
                    <div className={styles.projected_profit_wrapper}>
                        <p>Projected profit</p>
                        <p>
                            <span>{projectedProfit}</span> USDT
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
});
