import { render } from "@testing-library/react";
import TurnstileCaptcha from "@/components/auth/TurnstileCaptcha";

describe("TurnstileCaptcha", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  it("renders nothing when no site key is configured", () => {
    const { container } = render(<TurnstileCaptcha onChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});