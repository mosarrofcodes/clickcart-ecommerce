import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "@/components/product/Pagination";

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders numbered pages and disables Prev on the first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={jest.fn()} />);

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("collapses the middle window with ellipses for many pages", () => {
    render(<Pagination page={10} totalPages={20} onPageChange={jest.fn()} />);

    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Prev" })).not.toBeDisabled();
  });

  it("calls onPageChange when a page or nav button is clicked", () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});