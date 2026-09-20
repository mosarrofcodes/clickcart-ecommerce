import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders a link when asChild is set (no nested interactive elements)", () => {
    render(
      <Button asChild>
        <a href="/products">Browse</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Browse" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("merges caller classes with the button variants", () => {
    render(
      <Button asChild variant="outline" className="custom-class">
        <a href="/offers">Offers</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Offers" });
    expect(link.className).toContain("custom-class");
    expect(link.className).toContain("border-border");
  });
});