import classNames from "classnames";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { Loader } from "../../components/loader";
import { subDomainState } from "../../state";
import commonStyles from "../../styles/common.module.css";
import styles from "./login.module.css";
import { FAILURE_MESSAGES } from "./messages";

const API = process.env.REACT_APP_API;

const LoginPage = () => {
  const navigate = useNavigate();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [subDomain, setSubDomain] = useState("");
  const [failureMessage, setFailureMessage] = useState(null);

  const setSubDomainState = useSetRecoilState(subDomainState);

  const onLoginFailed = (message) => {
    setLoginFailed(true);
    setFailureMessage(message);
    setIsLoggingIn(false);
  };

  const onLoginStart = () => {
    setIsLoggingIn(true);
    setFailureMessage("");
    setLoginFailed(false);
  };

  const disableLoginButton = useMemo(() => isLoggingIn, [isLoggingIn]);

  const handleLogin = async () => {
    try {
      onLoginStart();

      setSubDomainState(subDomain);

      const result = await fetch(`${API}/auth`, {
        method: "get",
        credentials: "include",
      });

      if (result.status === 200) {
        const data = await result.json();

        if (data.authenticated) {
          navigate("/home");
        } else {
          onLoginFailed(FAILURE_MESSAGES.AUTHENTICATION_FAILED);
        }

        setIsLoggingIn(false);
      } else {
        onLoginFailed(FAILURE_MESSAGES.SERVER_DOWN);
      }
    } catch (error) {
      onLoginFailed(FAILURE_MESSAGES.SERVER_DOWN);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1>Welcome to NexHealth Appointment Booking</h1>

      <p>Please login to your account to book an appointment</p>

      <button
        onClick={handleLogin}
        disabled={disableLoginButton}
        className={classNames(
          commonStyles.button,
          disableLoginButton ? commonStyles.disabled : null
        )}
      >
        Login
      </button>

      <div className={styles.loader_wrapper}>
        {isLoggingIn ? <Loader /> : null}
      </div>

      {loginFailed && (
        <div className={styles.error_wrapper}>
          <div role="alert" className={commonStyles.error_message}>
            {failureMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export { LoginPage };
