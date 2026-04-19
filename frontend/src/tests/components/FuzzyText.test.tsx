import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import FuzzyText from "@/components/FuzzyText";

describe("FuzzyText", () => {
  it("renders a canvas element", () => {
    const { container } = render(
      <FuzzyText>Hello</FuzzyText>
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders with custom fontSize as number", () => {
    const { container } = render(
      <FuzzyText fontSize={48}>Title</FuzzyText>
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders with custom props without crashing", () => {
    const { container } = render(
      <FuzzyText
        fontSize="2rem"
        fontWeight={700}
        color="#ff0000"
        enableHover={false}
        baseIntensity={0.3}
        hoverIntensity={0.8}
      >
        Styled Text
      </FuzzyText>
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders with default props", () => {
    const { container } = render(
      <FuzzyText>Default</FuzzyText>
    );
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
