import styles from "./Error.module.scss";
import { useStore } from "PlaceOrder/context";

const Error = () => {
    const { errorMessage } = useStore();

    if (!errorMessage) return null;

    return <p className={styles.error}>{errorMessage}</p>;
};

export default Error;
