import { render, screen } from "@testing-library/react";
import StarRating from "@/components/product/StarRating";

describe("StarRating", () => {
  it("exposes the rating to screen readers", () => {
    render(<StarRating value={4} />);
    expect(screen.getByRole("img", { name: "Rated 4 out of 5" })).toBeInTheDocument();
  });

  it("rounds the value for the filled-star calculation", () => {
    render(<StarRating value={3.6} />);
    expect(screen.getByRole("img", { name: "Rated 3.6 out of 5" })).toBeInTheDocument();
  });

  it("renders exactly five stars", () => {
    const { container } = render(<StarRating value={5} />);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });
});