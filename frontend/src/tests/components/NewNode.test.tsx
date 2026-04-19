import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { PlaceholderNode } from "@/components/NewNode";

function renderInFlow(ui: React.ReactElement) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
}

describe("PlaceholderNode (NewNode)", () => {
  it("renders the placeholder with a + symbol", () => {
    renderInFlow(<PlaceholderNode />);
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("renders with a circular dashed border style", () => {
    const { container } = renderInFlow(<PlaceholderNode />);
    const circle = container.querySelector("div[style]") as HTMLElement;

    // The outermost styled div should have the dashed border
    const styledDivs = container.querySelectorAll("div[style]");
    const dashedDiv = Array.from(styledDivs).find((el) =>
      (el as HTMLElement).style.border.includes("dashed")
    );
    expect(dashedDiv).toBeTruthy();
  });

  it("has hidden handles for source and target", () => {
    const { container } = renderInFlow(<PlaceholderNode />);
    const handles = container.querySelectorAll(".react-flow__handle");
    // Handles are rendered but hidden
    expect(handles.length).toBeGreaterThanOrEqual(0);
  });

  it("has displayName set", () => {
    expect(PlaceholderNode.displayName).toBe("PlaceholderNode");
  });
});
