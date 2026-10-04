import { describe, expect, it } from "vitest";
import { API_ERROR_CODES, apiProblemToView, parseApiProblem } from "@/lib/api-errors";

const problem = (code: (typeof API_ERROR_CODES)[number]) => ({
  type: `https://api.aula.test/problems/${code.toLowerCase()}`,
  title: "Mensaje seguro",
  status: 403,
  code,
  request_id: "9b191d15-c7f7-4b2a-97a0-190681a74fa8",
});

describe("api errors", () => {
  it("reconoce todos los códigos definidos", () => {
    for (const code of API_ERROR_CODES) {
      expect(parseApiProblem(problem(code))?.code).toBe(code);
      expect(apiProblemToView(problem(code)).title.length).toBeGreaterThan(0);
    }
  });

  it("distingue vencimiento, suspensión y revocación", () => {
    expect(apiProblemToView(problem("ACCESS_EXPIRED")).state).toBe("expired");
    expect(apiProblemToView(problem("ACCOUNT_SUSPENDED")).state).toBe("suspended");
    expect(apiProblemToView(problem("ACCOUNT_REVOKED")).state).toBe("revoked");
  });

  it("mantiene el request_id para soporte sin mostrar detalles internos", () => {
    const view = apiProblemToView(problem("INTERNAL_ERROR"));
    expect(view.requestId).toBe("9b191d15-c7f7-4b2a-97a0-190681a74fa8");
    expect(view.message).not.toContain("stack");
  });

  it("usa una respuesta segura ante cuerpos desconocidos", () => {
    expect(parseApiProblem({ message: "database connection failed" })).toBeNull();
    const view = apiProblemToView({ message: "database connection failed" });
    expect(view).toMatchObject({
      state: "error",
      retryable: true,
    });
    expect("requestId" in view).toBe(false);
  });
});
