import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  FORGOT_PASSWORD_GENERIC_ERROR,
  forgotPasswordUserMessage,
  isTechnicalForgotPasswordError,
} from "./authApiHelpers.js";

describe("forgotPasswordUserMessage", () => {
  test("EMAIL_SEND_FAILED devuelve mensaje genérico", () => {
    assert.equal(
      forgotPasswordUserMessage(
        {
          error: "Invalid login: 535-5.7.8 Username and Password not accepted",
          code: "EMAIL_SEND_FAILED",
        },
        500,
      ),
      FORGOT_PASSWORD_GENERIC_ERROR,
    );
  });

  test("mensaje crudo de Gmail SMTP devuelve mensaje genérico", () => {
    assert.equal(
      forgotPasswordUserMessage(
        {
          error:
            "Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to https://support.google.com/mail/?p=BadCredentials",
        },
        500,
      ),
      FORGOT_PASSWORD_GENERIC_ERROR,
    );
  });

  test("EMAIL_CONFIG_ERROR devuelve mensaje genérico", () => {
    assert.equal(
      forgotPasswordUserMessage({ error: "Servicio de correo no configurado", code: "EMAIL_CONFIG_ERROR" }, 500),
      FORGOT_PASSWORD_GENERIC_ERROR,
    );
  });

  test("error 400 de validación conserva mensaje legible", () => {
    assert.equal(
      forgotPasswordUserMessage({ error: "Email inválido", code: "VALIDATION_ERROR" }, 400),
      "Email inválido",
    );
  });
});

describe("isTechnicalForgotPasswordError", () => {
  test("detecta patrones SMTP técnicos", () => {
    assert.equal(isTechnicalForgotPasswordError("Invalid login: 535"), true);
    assert.equal(isTechnicalForgotPasswordError("AUTH PLAIN failed"), true);
    assert.equal(isTechnicalForgotPasswordError("support.google.com/mail"), true);
    assert.equal(isTechnicalForgotPasswordError("Email inválido"), false);
  });
});
