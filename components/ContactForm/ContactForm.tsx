import { useState } from "react";
import classNames from "classnames/bind";
import { Formik, Form, Field } from "formik";
import Link from "../Link/Link";
import Captcha from "../Captcha/Captcha";
import { SendIcon, CheckOcticon, XOcticon } from "../Icons";
import type { FormikHelpers } from "formik";

import styles from "./ContactForm.module.css";
const cx = classNames.bind(styles);

type Values = {
  name: string;
  email: string;
  message: string;
  "h-captcha-response": string;
};

type ContactFormProps = {
  className?: string;
};

const ContactForm = ({ className }: ContactFormProps) => {
  // status/feedback:
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
    // once a user attempts a submission, this is true and stays true whether or not the next attempt(s) are successful
    setSubmitted(true);

    // if we've gotten here then all data is (or should be) valid and ready to post to API
    fetch("/api/contact/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success === true) {
          // handle successful submission
          // disable submissions, hide the send button, and let user know we were successful
          setSuccess(true);
          setFeedback("Thanks! You should hear from me soon.");
        } else {
          // pass on any error sent by the server to the catch block below
          throw new Error(data.message);
        }
      })
      .catch((error) => {
        setSuccess(false);

        if (error.message === "USER_MISSING_DATA") {
          // this should be validated client-side but it's also checked server-side just in case someone slipped past
          setFeedback("Please make sure that all fields are properly filled in.");
        } else if (error.message === "USER_INVALID_CAPTCHA") {
          // missing/invalid captcha
          setFeedback("Did you complete the CAPTCHA? (If you're human, that is...)");
        } else {
          // something else went wrong, and it's probably my fault...
          setFeedback("Internal server error... Try again later or shoot me an old-fashioned email?");
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={{
        name: "",
        email: "",
        message: "",
        "h-captcha-response": "",
      }}
      validate={(values: Values) => {
        const errors: { name?: boolean; email?: boolean; message?: boolean; "h-captcha-response"?: boolean } = {};

        errors.name = !values.name;
        errors.email = !values.email; // also loosely validated that it's email-like via browser (not foolproof)
        errors.message = !values.message;
        errors["h-captcha-response"] = !values["h-captcha-response"];

        if (!errors.name && !errors.email && !errors.message && !errors["h-captcha-response"]) {
          setFeedback("");
          return null;
        } else {
          setSuccess(false);
          setFeedback("Please make sure that all fields are properly filled in.");
        }

        return errors;
      }}
    >
      {({ setFieldValue, isSubmitting, touched, errors }) => (
        <Form className={className} name="contact">
          <Field
            className={cx({ input: true, missing: errors.name && touched.name })}
            name="name"
            type="text"
            placeholder="Name"
            disabled={success}
          />
          <Field
            className={cx({ input: true, missing: errors.email && touched.email })}
            name="email"
            type="email"
            inputMode="email"
            placeholder="Email"
            disabled={success}
          />
          <Field
            className={cx({ input: true, textarea: true, missing: errors.message && touched.message })}
            name="message"
            component="textarea"
            placeholder="Write something..."
            disabled={success}
          />

          <div className={styles.markdown_tip}>
            Basic{" "}
            <Link href="https://commonmark.org/help/" title="Markdown reference sheet" style={{ fontWeight: 600 }}>
              Markdown syntax
            </Link>{" "}
            is allowed here, e.g.: <strong>**bold**</strong>, <em>_italics_</em>, [
            <Link href="https://jarv.is" forceNewWindow>
              links
            </Link>
            ](https://jarv.is), and <code>`code`</code>.
          </div>

          <div className={styles.hcaptcha}>
            <Captcha onVerify={(token) => setFieldValue("h-captcha-response", token)} />
          </div>

          <div className={styles.action_row}>
            <button
              className={cx({ btn_submit: true, hidden: success })}
              type="submit"
              title="Send Message"
              aria-label="Send Message"
              onClick={() => setSubmitted(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <SendIcon className={classNames(styles.send_icon)} /> <span>Send</span>
                </>
              )}
            </button>

            <span
              className={cx({
                result_success: success,
                result_error: !success,
                hidden: !submitted || !feedback || isSubmitting,
              })}
            >
              {success ? (
                <CheckOcticon className={styles.result_icon} fill="CurrentColor" />
              ) : (
                <XOcticon className={styles.result_icon} fill="CurrentColor" />
              )}{" "}
              {feedback}
            </span>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ContactForm;
