import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { PlaceholderNode } from "@/components/placeholder-node";

function renderInFlow(ui: React.ReactElement) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
}

describe("PlaceholderNode (placeholder-node)", () => {
  it("renders children content", () => {
    renderInFlow(<PlaceholderNode>Click to add</PlaceholderNode>);
    expect(screen.getByText("Click to add")).toBeInTheDocument();
  });

  it("renders without children", () => {
    const { container } = renderInFlow(<PlaceholderNode />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies dashed border styling via BaseNode", () => {
    const { container } = renderInFlow(
      <PlaceholderNode>Test</PlaceholderNode>
    );
    const node = container.querySelector("[tabindex]") as HTMLElement;
    expect(node).toBeInTheDocument();
    expect(node.className).toContain("border-dashed");
  });

  it("has displayName set", () => {
    expect(PlaceholderNode.displayName).toBe("PlaceholderNode");
  });
});
