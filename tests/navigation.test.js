import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

describe("Advantage AI Solutions Navigation", () => {
  it("navigates across sections and pages", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: "https://advantageaisolutions.pro" });

    const assertLogo = await testdriver.assert("the Advantage AI Solutions headline or logo is visible");
    expect(assertLogo).toBeTruthy();

    await testdriver.find("Services link in navigation header").click();

    const assertServices = await testdriver.assert("the Services section with What we do heading is visible");
    expect(assertServices).toBeTruthy();

    await testdriver.find("Ask Advantage link in navigation bar").click();

    const assertAssistant = await testdriver.assert("the Advantage service assistant or Why teams call section is visible");
    expect(assertAssistant).toBeTruthy();
  });
});
