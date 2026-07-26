import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UiState } from "@/components/ui-state";

describe("UiState", () => {
  it("muestra la acción de reintento en un error", () => {
    const retry = vi.fn();
    render(<UiState kind="error" onRetry={retry}/>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("muestra información de acceso vencido", () => {
    render(<UiState kind="expired"/>);
    expect(screen.getByText("Tu período de acceso finalizó")).toBeInTheDocument();
  });
});
