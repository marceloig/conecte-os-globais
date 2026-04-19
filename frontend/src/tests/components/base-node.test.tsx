import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "@/components/base-node";

describe("BaseNode", () => {
  it("renders children", () => {
    render(<BaseNode>Node content</BaseNode>);
    expect(screen.getByText("Node content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(<BaseNode>Test</BaseNode>);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain("rounded-md");
    expect(node.className).toContain("border");
    expect(node.className).toContain("bg-card");
  });

  it("merges custom className", () => {
    const { container } = render(<BaseNode className="custom-class">Test</BaseNode>);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain("custom-class");
    expect(node.className).toContain("rounded-md");
  });

  it("is focusable with tabIndex 0", () => {
    const { container } = render(<BaseNode>Test</BaseNode>);
    const node = container.firstChild as HTMLElement;
    expect(node.tabIndex).toBe(0);
  });

  it("forwards ref", () => {
    let ref: HTMLDivElement | null = null;
    render(<BaseNode ref={(el) => { ref = el; }}>Test</BaseNode>);
    expect(ref).toBeInstanceOf(HTMLDivElement);
  });

  it("has displayName set", () => {
    expect(BaseNode.displayName).toBe("BaseNode");
  });
});

describe("BaseNodeHeader", () => {
  it("renders as a header element", () => {
    render(<BaseNodeHeader>Header</BaseNodeHeader>);
    expect(screen.getByText("Header").tagName).toBe("HEADER");
  });

  it("applies flex layout classes", () => {
    render(<BaseNodeHeader>Header</BaseNodeHeader>);
    const header = screen.getByText("Header");
    expect(header.className).toContain("flex");
    expect(header.className).toContain("flex-row");
  });

  it("has displayName set", () => {
    expect(BaseNodeHeader.displayName).toBe("BaseNodeHeader");
  });
});

describe("BaseNodeHeaderTitle", () => {
  it("renders as an h3 element", () => {
    render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>);
    expect(screen.getByText("Title").tagName).toBe("H3");
  });

  it("has the correct data-slot attribute", () => {
    render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>);
    expect(screen.getByText("Title")).toHaveAttribute(
      "data-slot",
      "base-node-title"
    );
  });

  it("has displayName set", () => {
    expect(BaseNodeHeaderTitle.displayName).toBe("BaseNodeHeaderTitle");
  });
});

describe("BaseNodeContent", () => {
  it("renders children", () => {
    render(<BaseNodeContent>Content here</BaseNodeContent>);
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("has the correct data-slot attribute", () => {
    render(<BaseNodeContent>Content</BaseNodeContent>);
    expect(screen.getByText("Content")).toHaveAttribute(
      "data-slot",
      "base-node-content"
    );
  });

  it("has displayName set", () => {
    expect(BaseNodeContent.displayName).toBe("BaseNodeContent");
  });
});

describe("BaseNodeFooter", () => {
  it("renders children", () => {
    render(<BaseNodeFooter>Footer</BaseNodeFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("has the correct data-slot attribute", () => {
    render(<BaseNodeFooter>Footer</BaseNodeFooter>);
    expect(screen.getByText("Footer")).toHaveAttribute(
      "data-slot",
      "base-node-footer"
    );
  });

  it("applies border-t class", () => {
    render(<BaseNodeFooter>Footer</BaseNodeFooter>);
    expect(screen.getByText("Footer").className).toContain("border-t");
  });

  it("has displayName set", () => {
    expect(BaseNodeFooter.displayName).toBe("BaseNodeFooter");
  });
});
