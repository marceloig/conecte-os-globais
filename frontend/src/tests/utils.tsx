import { render, type RenderOptions } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { Theme } from "@radix-ui/themes";
import type { ReactElement, ReactNode } from "react";

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <Theme appearance="dark">
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </Theme>
  );
}

function ThemeOnly({ children }: { children: ReactNode }) {
  return <Theme appearance="dark">{children}</Theme>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: ThemeOnly, ...options });
}
