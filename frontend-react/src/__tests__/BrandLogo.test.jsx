import { render, screen } from "@testing-library/react";
import BrandLogo from "../components/BrandLogo";

describe("BrandLogo", () => {
  it("renders an accessible link with brand name", () => {
    render(<BrandLogo />);
    const link = screen.getByRole("link", { name: /livesurgery/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders Live and Surgery text spans", () => {
    render(<BrandLogo />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Surgery")).toBeInTheDocument();
  });
});
